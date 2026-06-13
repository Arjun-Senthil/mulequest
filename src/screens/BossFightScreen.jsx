import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Swords, Skull, Trophy, Bot, CheckSquare, Square } from 'lucide-react'
import QuizEngine from '../components/QuizEngine'
import { KNOWLEDGE } from '../data/knowledge'
import { useGame } from '../context/GameContext'

export default function BossFightScreen() {
  const { chapterId } = useParams()
  const id = Number(chapterId)
  const navigate = useNavigate()
  const { completeBoss, chapterStats } = useGame()

  const content = KNOWLEDGE[id]
  const boss = content?.boss
  const [phase, setPhase] = useState('intro') // intro | mcq | scenario | done
  const [mcqResult, setMcqResult] = useState(null)
  const [checked, setChecked] = useState([])
  const [finalResult, setFinalResult] = useState(null)
  const [round, setRound] = useState(0)

  if (!boss) return <div className="text-slate-500">Boss not found.</div>
  const stats = chapterStats(id)

  const onMcqFinish = (res) => {
    setMcqResult(res)
    setPhase('scenario')
  }

  const submitScenario = async () => {
    const checklistScore = boss.scenario.checklist.length
      ? checked.length / boss.scenario.checklist.length
      : 1
    // Weighted: 70% MCQ, 30% scenario self-verification
    const score = mcqResult.score * 0.7 + checklistScore * 0.3
    const passed = score >= 0.7
    await completeBoss({
      chapterId: id,
      bossId: boss.boss_id,
      score,
      passed,
      timeSpent: mcqResult.timeSpent,
      failedQuestionIds: mcqResult.failedQuestionIds,
      weakTags: content.concepts.flatMap((c) => c.ai_tags).slice(0, 6)
    })
    setFinalResult({ score, passed })
    setPhase('done')
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <button onClick={() => navigate(`/chapter/${id}`)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4">
          <ArrowLeft size={15} /> Retreat
        </button>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="panel p-8 text-center border-2 border-neon-red/50"
        >
          <Skull size={52} className="mx-auto text-neon-red" />
          <h1 className="font-display text-3xl font-bold text-neon-red mt-3 tracking-wide">{boss.title}</h1>
          <p className="text-slate-400 mt-3 leading-relaxed text-sm">{boss.intro}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="panel-raised p-3">
              <div className="font-mono text-xl text-slate-100">{boss.mcq.length}</div>
              <div className="text-[10px] font-mono text-slate-500">QUESTIONS</div>
            </div>
            <div className="panel-raised p-3">
              <div className="font-mono text-xl text-slate-100">45s</div>
              <div className="text-[10px] font-mono text-slate-500">PER QUESTION</div>
            </div>
            <div className="panel-raised p-3">
              <div className="font-mono text-xl text-neon-amber">500</div>
              <div className="text-[10px] font-mono text-slate-500">XP REWARD</div>
            </div>
          </div>
          <button
            onClick={() => setPhase('mcq')}
            disabled={stats.done < stats.total}
            className="btn-danger mt-6 w-full flex items-center justify-center gap-2"
          >
            <Swords size={16} /> {stats.done < stats.total ? 'Complete all main quests first' : 'BEGIN THE FIGHT'}
          </button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'mcq') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="panel p-6 border-neon-red/40">
          <div className="flex items-center gap-2 mb-4">
            <Skull size={18} className="text-neon-red" />
            <h1 className="font-display text-lg font-bold text-neon-red">{boss.title} — PHASE 1: KNOWLEDGE</h1>
          </div>
          <QuizEngine key={round} questions={boss.mcq} secondsPerQuestion={45} onFinish={onMcqFinish} mode="boss" />
        </div>
      </div>
    )
  }

  if (phase === 'scenario') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="panel p-6 border-neon-red/40">
          <div className="flex items-center gap-2 mb-1">
            <Swords size={18} className="text-neon-red" />
            <h1 className="font-display text-lg font-bold text-neon-red">PHASE 2: BUILD SCENARIO</h1>
          </div>
          <p className="text-xs font-mono text-slate-500 mb-4">
            MCQ phase: {mcqResult.correctCount}/{mcqResult.total}. Build the scenario, then verify honestly — the AI engine calibrates off this.
          </p>
          <div className="panel-raised p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {boss.scenario.prompt}
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-mono text-slate-500 uppercase">Verification checklist</div>
            {boss.scenario.checklist.map((item, i) => {
              const on = checked.includes(i)
              return (
                <button
                  key={i}
                  onClick={() => setChecked((prev) => on ? prev.filter((x) => x !== i) : [...prev, i])}
                  className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    on ? 'border-neon-green/50 bg-neon-green/5 text-slate-200' : 'border-edge text-slate-400'
                  }`}
                >
                  {on ? <CheckSquare size={16} className="text-neon-green shrink-0 mt-0.5" /> : <Square size={16} className="shrink-0 mt-0.5 text-slate-600" />}
                  {item}
                </button>
              )
            })}
          </div>
          <button onClick={submitScenario} className="btn-danger w-full mt-5">
            SUBMIT BATTLE RESULT
          </button>
        </div>
      </div>
    )
  }

  // done
  return (
    <div className="max-w-xl mx-auto mt-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="panel p-8 text-center">
        {finalResult.passed ? (
          <>
            <Trophy size={48} className="mx-auto text-neon-green" />
            <h2 className="font-display text-3xl font-bold text-neon-green mt-3">BOSS DEFEATED</h2>
            <p className="text-slate-400 mt-2 text-sm">+500 XP · Chapter {id} Conqueror badge · next chapter unlocked on the map.</p>
          </>
        ) : (
          <>
            <Skull size={48} className="mx-auto text-neon-red" />
            <h2 className="font-display text-3xl font-bold text-neon-red mt-3">DEFEATED…</h2>
            <p className="text-slate-400 mt-2 text-sm">
              Score {(finalResult.score * 100).toFixed(0)}% — pass mark 70%. The AI Advisor has diagnosed the fight and may have injected remedial micro quests.
            </p>
          </>
        )}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-neon-violet text-xs font-display">
          <Bot size={13} /> ADVISOR UPDATED
        </div>
        <div className="flex gap-3 justify-center mt-6">
          {!finalResult.passed && (
            <button onClick={() => { setPhase('mcq'); setChecked([]); setMcqResult(null); setFinalResult(null); setRound((r) => r + 1) }} className="btn-danger">
              Rematch
            </button>
          )}
          <button onClick={() => navigate('/map')} className="btn-ghost">World map</button>
        </div>
      </motion.div>
    </div>
  )
}
