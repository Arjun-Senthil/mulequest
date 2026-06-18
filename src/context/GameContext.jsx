import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { db } from '../lib/db'
import { useAuth } from './AuthContext'
import { applyStreak, levelForXp } from '../lib/xp'
import { computeStreakUpdate } from '../lib/streak'
import { requestDiagnosis, heuristicDiagnosis } from '../lib/api'
import { CHAPTERS, CERT_GATES, gateBefore } from '../data/chapters'
import { KNOWLEDGE } from '../data/knowledge'
import { INVENTORY_ITEMS } from '../data/inventory'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState([])
  const [inventory, setInventory] = useState([])
  const [diagnosis, setDiagnosis] = useState(null)
  const [certTrials, setCertTrials] = useState([])
  const [aiBusy, setAiBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [ready, setReady] = useState(false)

  // ---------- bootstrap ----------
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const [p, prog, inv, diag, trials] = await Promise.all([
        db.getProfile(user.id),
        db.getProgress(user.id),
        db.getInventory(user.id),
        db.getLatestDiagnosis(user.id),
        db.getCertTrials(user.id)
      ])
      if (cancelled) return
      setProfile(p)
      setProgress(prog)
      setInventory(inv)
      setDiagnosis(diag)
      setCertTrials(trials)
      setReady(true)
    })().catch(console.error)
    return () => { cancelled = true }
  }, [user])

  const notify = useCallback((msg, kind = 'xp') => {
    setToast({ msg, kind, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ---------- streak ----------
  const touchStreak = useCallback(async () => {
    if (!profile || !user) return profile
    const upd = computeStreakUpdate(profile.last_active, profile.streak)
    if (!upd.changed && profile.last_active === upd.last_active) return profile
    const next = await db.updateProfile(user.id, { streak: upd.streak, last_active: upd.last_active })
    setProfile(next)
    if (upd.changed && upd.streak > 1) notify(`🔥 ${upd.streak}-day streak!`, 'streak')
    return next
  }, [profile, user, notify])

  // ---------- XP ----------
  const awardXp = useCallback(async (baseXp, label) => {
    if (!user) return
    const current = await touchStreak()
    const gained = applyStreak(baseXp, current?.streak || 0)
    const newXp = (current?.xp || 0) + gained
    const newLevel = levelForXp(newXp)
    const leveledUp = newLevel > (current?.level || 1)
    const next = await db.updateProfile(user.id, { xp: newXp, level: newLevel })
    setProfile(next)
    notify(`+${gained} XP${label ? ` — ${label}` : ''}${leveledUp ? ` · LEVEL ${newLevel}!` : ''}`)
    return gained
  }, [user, touchStreak, notify])

  const grantBadge = useCallback(async (badge) => {
    if (!user || !profile) return
    if ((profile.badges || []).includes(badge)) return
    const badges = [...(profile.badges || []), badge]
    const next = await db.updateProfile(user.id, { badges })
    setProfile(next)
    notify(`🏅 Badge earned: ${badge}`, 'badge')
  }, [user, profile, notify])

  // ---------- progress ----------
  const questStatus = useCallback((questId) => {
    return progress.find((p) => p.quest_id === questId)?.status || null
  }, [progress])

  const setQuest = useCallback(async (chapterId, questId, status) => {
    if (!user) return
    const row = await db.upsertProgress(user.id, { chapter_id: chapterId, quest_id: questId, status })
    setProgress((prev) => [...prev.filter((p) => p.quest_id !== questId), row])
    return row
  }, [user])

  // ---------- chapter completion / unlock ----------
  const chapterStats = useCallback((chapterId) => {
    const ch = KNOWLEDGE[chapterId]
    if (!ch) return { total: 0, done: 0, bossDone: false, complete: false }
    const conceptIds = ch.concepts.map((c) => c.concept_id)
    const done = conceptIds.filter((id) => questStatus(id) === 'completed').length
    const bossDone = questStatus(ch.boss.boss_id) === 'completed'
    return {
      total: conceptIds.length,
      done,
      bossDone,
      complete: done === conceptIds.length && bossDone
    }
  }, [questStatus])

  const certPassed = useCallback((certId) => {
    return certTrials.some((t) => t.cert_level === certId && t.passed)
  }, [certTrials])

  const chapterUnlocked = useCallback((chapterId) => {
    if (chapterId === 1) return true
    const gate = gateBefore(chapterId)
    if (gate && !certPassed(gate.id)) return false
    return chapterStats(chapterId - 1).complete
  }, [chapterStats, certPassed])

  const certGateState = useCallback((gate) => {
    // Available when all chapters up to gate.afterChapter are complete
    const chaptersDone = CHAPTERS
      .filter((c) => c.id <= gate.afterChapter)
      .every((c) => chapterStats(c.id).complete)
    const passed = certPassed(gate.id)
    const attempts = certTrials.filter((t) => t.cert_level === gate.id)
    return { available: chaptersDone, passed, attempts: attempts.length }
  }, [chapterStats, certPassed, certTrials])

  // ---------- inventory ----------
  const checkUnlocks = useCallback(async (questId) => {
    if (!user) return
    const newly = INVENTORY_ITEMS.filter(
      (item) => item.unlocked_by === questId &&
        !inventory.some((i) => i.item_id === item.item_id)
    )
    for (const item of newly) {
      const row = await db.unlockItem(user.id, item.item_id, item.item_type)
      setInventory((prev) => [...prev, row])
      notify(`📦 Inventory unlocked: ${item.title}`, 'item')
    }
  }, [user, inventory, notify])

  // ---------- AI adaptive engine ----------
  const triggerAI = useCallback(async ({ trigger, chapterId, failedQuestionIds = [], weakTags = [] }) => {
    if (!user) return
    setAiBusy(true)
    try {
      const performance = await db.getPerformance(user.id, 60)
      const payload = {
        trigger,
        chapterId,
        failedQuestionIds,
        weakTags,
        performance: performance.map((p) => ({
          concept_id: p.concept_id, quiz_id: p.quiz_id, attempts: p.attempts,
          score: p.score, time_spent: p.time_spent, failed_question_ids: p.failed_question_ids
        })),
        profile: {
          level: profile?.level, xp: profile?.xp, streak: profile?.streak,
          badges: profile?.badges
        }
      }
      let result
      try {
        result = await requestDiagnosis(payload)
      } catch {
        result = heuristicDiagnosis(payload)
      }
      const saved = await db.saveDiagnosis(user.id, {
        chapter_id: chapterId ?? null,
        diagnosis: result.diagnosis,
        weak_tags: result.weak_tags || [],
        injected_quests: result.injected_quests || [],
        recommended_action: result.recommended_action || null,
        difficulty_adjustment: result.difficulty_adjustment || 'none'
      })
      setDiagnosis(saved)
      return saved
    } finally {
      setAiBusy(false)
    }
  }, [user, profile])

  // ---------- high-level actions ----------
  const completeQuiz = useCallback(async ({ chapterId, conceptId, quizId, score, attempts, timeSpent, failedQuestionIds, aiTags }) => {
    if (!user) return
    await db.logPerformance(user.id, {
      concept_id: conceptId, quiz_id: quizId, attempts,
      score, time_spent: timeSpent, failed_question_ids: failedQuestionIds
    })
    const passed = score >= 0.7
    if (passed) {
      await setQuest(chapterId, conceptId, 'completed')
      await awardXp(30, 'Quiz passed')
      await checkUnlocks(conceptId)
    } else if (attempts >= 2) {
      await triggerAI({ trigger: 'quiz_failed_2x', chapterId, failedQuestionIds, weakTags: aiTags })
    }
    return passed
  }, [user, setQuest, awardXp, checkUnlocks, triggerAI])

  const completeLab = useCallback(async ({ chapterId, conceptId }) => {
    await setQuest(chapterId, `${conceptId}-lab`, 'completed')
    await awardXp(50, 'Hands-on lab')
  }, [setQuest, awardXp])

  const completeSideQuest = useCallback(async ({ chapterId, questId, xp }) => {
    await setQuest(chapterId, questId, 'completed')
    await awardXp(xp, 'Side quest')
    await checkUnlocks(questId)
  }, [setQuest, awardXp, checkUnlocks])

  const completeBoss = useCallback(async ({ chapterId, bossId, score, passed, timeSpent, failedQuestionIds, weakTags }) => {
    if (!user) return
    await db.logPerformance(user.id, {
      concept_id: bossId, quiz_id: bossId, attempts: 1,
      score, time_spent: timeSpent, failed_question_ids: failedQuestionIds
    })
    if (passed) {
      await setQuest(chapterId, bossId, 'completed')
      await awardXp(500, 'Boss defeated')
      await grantBadge(`Chapter ${chapterId} Conqueror`)
      await checkUnlocks(bossId)
    }
    await triggerAI({ trigger: passed ? 'boss_passed' : 'boss_failed', chapterId, failedQuestionIds, weakTags })
    return passed
  }, [user, setQuest, awardXp, grantBadge, checkUnlocks, triggerAI])

  const recordCertTrial = useCallback(async ({ certId, score, passed, weakCategories, badge }) => {
    if (!user) return
    const row = await db.saveCertTrial(user.id, {
      cert_level: certId, score, passed, weak_categories: weakCategories
    })
    setCertTrials((prev) => [row, ...prev])
    if (passed) {
      await awardXp(1000, `${certId} trial passed`)
      await grantBadge(badge)
    }
    await triggerAI({
      trigger: passed ? 'cert_passed' : 'cert_failed',
      chapterId: null,
      weakTags: weakCategories
    })
    return row
  }, [user, awardXp, grantBadge, triggerAI])

  const completeMicroQuest = useCallback(async ({ questId }) => {
    await setQuest(0, questId, 'completed')
    await awardXp(60, 'Micro quest')
  }, [setQuest, awardXp])

  const completeDungeon = useCallback(async ({ dungeonId, xp }) => {
    await setQuest(0, dungeonId, 'completed')
    await awardXp(xp, 'Dungeon cleared')
    await grantBadge('Dungeon Delver')
    await checkUnlocks(dungeonId)
  }, [setQuest, awardXp, grantBadge, checkUnlocks])

  const value = useMemo(() => ({
    ready, profile, progress, inventory, diagnosis, certTrials, aiBusy, toast,
    questStatus, chapterStats, chapterUnlocked, certGateState, certPassed,
    awardXp, setQuest, completeQuiz, completeLab, completeSideQuest, completeBoss,
    recordCertTrial, completeMicroQuest, completeDungeon, triggerAI, touchStreak
  }), [
    ready, profile, progress, inventory, diagnosis, certTrials, aiBusy, toast,
    questStatus, chapterStats, chapterUnlocked, certGateState, certPassed,
    awardXp, setQuest, completeQuiz, completeLab, completeSideQuest, completeBoss,
    recordCertTrial, completeMicroQuest, completeDungeon, triggerAI, touchStreak
  ])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => useContext(GameContext)
