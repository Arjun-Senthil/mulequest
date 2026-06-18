import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Map, Flame, Trophy, Swords, ChevronRight, Timer, Crown } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { CHAPTERS, CERT_GATES } from '../data/chapters'
import { KNOWLEDGE } from '../data/knowledge'
import { todaysChallenge } from '../data/dailyChallenges'
import { titleForLevel } from '../lib/xp'

function todayKey() {
  return 'DAILY-' + new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const { profile, chapterUnlocked, chapterStats, questStatus, certGateState, awardXp, setQuest } = useGame()
  const navigate = useNavigate()

  // Active chapter = first unlocked, incomplete chapter
  const activeChapter = CHAPTERS.find((c) => chapterUnlocked(c.id) && !chapterStats(c.id).complete)
    || CHAPTERS[CHAPTERS.length - 1]
  const stats = chapterStats(activeChapter.id)
  const content = KNOWLEDGE[activeChapter.id]
  const nextConcept = content?.concepts.find((c) => questStatus(c.concept_id) !== 'completed')

  // Pending cert gate?
  const pendingGate = CERT_GATES.map((g) => ({ gate: g, state: certGateState(g) }))
    .find(({ state }) => state.available && !state.passed)

  const daily = todaysChallenge()
  const dailyDone = questStatus(todayKey()) === 'completed'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100">
          Welcome back, <span className="neon-text">{profile?.name || 'Dev'}</span>
        </h1>
        <p className="text-sm text-slate-500 font-mono">
          Level {profile?.level} · {titleForLevel(profile?.level || 1)} · {profile?.xp || 0} XP lifetime
        </p>
      </div>

      {/* Cert gate alert */}
      {pendingGate && (
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/trial/${pendingGate.gate.id}`)}
          className="w-full panel p-4 border-neon-amber/60 shadow-glow-amber text-left flex items-center gap-3 hover:scale-[1.005] transition-transform"
        >
          <Crown className="text-neon-amber shrink-0" size={22} />
          <div className="flex-1">
            <div className="font-display font-bold text-neon-amber tracking-wide">{pendingGate.gate.name.toUpperCase()} IS OPEN</div>
            <div className="text-xs text-slate-400">{pendingGate.gate.questions} questions · {pendingGate.gate.durationMin} minutes · exam conditions. Pass to earn the {pendingGate.gate.badge} badge.</div>
          </div>
          <ChevronRight className="text-neon-amber" />
        </motion.button>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Active quest */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 panel p-5"
        >
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-3">
            <Swords size={13} className="text-neon-cyan" /> Active quest
          </div>
          <div className="font-display text-xl font-bold text-slate-100">
            CH {String(activeChapter.id).padStart(2, '0')} — {activeChapter.title}
          </div>
          <p className="text-sm text-slate-500 mt-1">{activeChapter.subtitle}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-raised border border-edge overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet"
                style={{ width: `${stats.total ? Math.round(((stats.done + (stats.bossDone ? 1 : 0)) / (stats.total + 1)) * 100) : 0}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-500">{stats.done}/{stats.total} concepts{stats.bossDone ? ' + boss' : ''}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {nextConcept ? (
              <button
                onClick={() => navigate(`/chapter/${activeChapter.id}/concept/${nextConcept.concept_id}`)}
                className="btn-primary flex items-center gap-2"
              >
                Continue: {nextConcept.title} <ChevronRight size={14} />
              </button>
            ) : !stats.bossDone ? (
              <button
                onClick={() => navigate(`/chapter/${activeChapter.id}/boss`)}
                className="btn-danger flex items-center gap-2"
              >
                <Swords size={14} /> Face the boss
              </button>
            ) : (
              <button onClick={() => navigate('/map')} className="btn-primary">View world map</button>
            )}
            <button onClick={() => navigate(`/chapter/${activeChapter.id}`)} className="btn-ghost">
              Chapter overview
            </button>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="panel p-5 flex flex-col"
        >
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-3">
            <Flame size={13} className="text-neon-amber" /> Streak
          </div>
          <div className="font-display text-4xl font-bold text-neon-amber">{profile?.streak || 0}<span className="text-lg text-slate-500"> days</span></div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            XP multiplier scales to 2× at 14 days. Complete any quest or the daily challenge to keep it alive.
          </p>
          <div className="mt-auto pt-3">
            <div className="h-1.5 rounded-full bg-raised overflow-hidden">
              <div className="h-full bg-neon-amber" style={{ width: `${Math.min(100, ((profile?.streak || 0) / 14) * 100)}%` }} />
            </div>
            <div className="text-[10px] font-mono text-slate-600 mt-1">{Math.min(14, profile?.streak || 0)}/14 to max multiplier</div>
          </div>
        </motion.div>
      </div>

      {/* Daily challenge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="panel p-5"
      >
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-2">
          <Timer size={13} className="text-neon-green" /> Daily challenge — 15 min
        </div>
        <div className="font-display font-bold text-slate-100">{daily.title}</div>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">{daily.task}</p>
        <button
          onClick={async () => {
            await setQuest(0, todayKey(), 'completed')
            await awardXp(40, 'Daily challenge')
          }}
          disabled={dailyDone}
          className="btn-primary mt-3 text-xs"
        >
          {dailyDone ? 'Completed today ✓' : 'Mark complete (+40 XP)'}
        </button>
      </motion.div>

      {/* Badges strip */}
      {profile?.badges?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="panel p-5"
        >
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-3">
            <Trophy size={13} className="text-neon-violet" /> Badges
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b) => (
              <span key={b} className="chip border-neon-violet/40 text-neon-violet bg-neon-violet/5 !text-sm !px-3 !py-1">{b}</span>
            ))}
          </div>
        </motion.div>
      )}

      <button onClick={() => navigate('/map')} className="w-full panel p-4 flex items-center gap-3 hover:border-neon-cyan/40 transition-colors">
        <Map size={18} className="text-neon-cyan" />
        <span className="font-display font-semibold text-sm text-slate-300">Open the World Map — 13 chapters, 3 cert gates, 1 prestige frontier</span>
        <ChevronRight size={16} className="ml-auto text-slate-500" />
      </button>
    </div>
  )
}
