import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Crown, ShieldCheck, ShieldX, Bot, AlertTriangle } from 'lucide-react'
import QuizEngine from '../components/QuizEngine'
import { CERT_GATES } from '../data/chapters'
import { CERT_TRIAL_BANKS, drawTrialQuestions } from '../data/certTrials'
import { useGame } from '../context/GameContext'

export default function CertTrialScreen() {
  const { certId } = useParams()
  const navigate = useNavigate()
  const { certGateState, recordCertTrial } = useGame()
  const gate = CERT_GATES.find((g) => g.id === certId)
  const bank = CERT_TRIAL_BANKS[certId]
  const [phase, setPhase] = useState('briefing') // briefing | exam | result
  const [result, setResult] = useState(null)
  const [attemptKey, setAttemptKey] = useState(0)

  const questions = useMemo(
    () => (gate ? drawTrialQuestions(certId, gate.questions) : []),
    [certId, gate, attemptKey]
  )

  if (!gate || !bank) return <div className="text-slate-500">Trial not found.</div>
  const state = certGateState(gate)

  const onFinish = async ({ score, correctCount, total, failedQuestionIds, perCategory }) => {
    const passed = score >= gate.passPct / 100
    const weakCategories = Object.entries(perCategory)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.7)
      .map(([k]) => k)
    await recordCertTrial({
      certId: gate.id,
      score: Math.round(score * 100),
      passed,
      weakCategories,
      badge: gate.badge
    })
    setResult({ score, correctCount, total, passed, weakCategories })
    setPhase('result')
  }

  if (phase === 'briefing') {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <button onClick={() => navigate('/map')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4">
          <ArrowLeft size={15} /> World map
        </button>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="panel p-8 border-2 border-neon-amber/50 text-center">
          <Crown size={48} className="mx-auto text-neon-amber" />
          <h1 className="font-display text-2xl font-bold text-neon-amber mt-3 tracking-wide">{gate.name.toUpperCase()}</h1>
          <p className="text-sm text-slate-400 mt-2">{bank.description}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="panel-raised p-3">
              <div className="font-mono text-xl text-slate-100">{questions.length}</div>
              <div className="text-[10px] font-mono text-slate-500">QUESTIONS</div>
            </div>
            <div className="panel-raised p-3">
              <div className="font-mono text-xl text-slate-100">{gate.durationMin}m</div>
              <div className="text-[10px] font-mono text-slate-500">TIME LIMIT</div>
            </div>
            <div className="panel-raised p-3">
              <div className="font-mono text-xl text-slate-100">{gate.passPct}%</div>
              <div className="text-[10px] font-mono text-slate-500">PASS MARK</div>
            </div>
          </div>

          <div className="trap-box mt-5 text-left flex gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>Exam conditions: no explanations until the end, no going back, hard timer. Categories are tracked — fail and the AI diagnoses your weak domains and assigns targeted side quests before retry.</span>
          </div>

          {!state.available && !state.passed && (
            <p className="text-neon-red text-xs font-mono mt-4">Complete all required chapters to unlock this trial.</p>
          )}
          {state.passed && <p className="text-neon-green text-xs font-mono mt-4">Already passed — badge earned. You can re-sit for practice.</p>}

          <button
            onClick={() => setPhase('exam')}
            disabled={!state.available && !state.passed}
            className="btn-primary mt-6 w-full !border-neon-amber/50 !text-neon-amber !bg-neon-amber/10 hover:!bg-neon-amber/20"
          >
            ENTER EXAM CONDITIONS
          </button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'exam') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="panel p-6 border-neon-amber/40">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={18} className="text-neon-amber" />
            <h1 className="font-display text-lg font-bold text-neon-amber">{gate.name.toUpperCase()} — LIVE</h1>
          </div>
          <QuizEngine
            key={attemptKey}
            questions={questions}
            totalSeconds={gate.durationMin * 60}
            onFinish={onFinish}
            mode="trial"
            showExplanations={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="panel p-8 text-center">
        {result.passed ? (
          <>
            <ShieldCheck size={52} className="mx-auto text-neon-green" />
            <h2 className="font-display text-3xl font-bold text-neon-green mt-3">{gate.badge} EARNED</h2>
            <p className="text-slate-400 text-sm mt-2">+1000 XP · The next arc of the questline is unlocked.</p>
          </>
        ) : (
          <>
            <ShieldX size={52} className="mx-auto text-neon-red" />
            <h2 className="font-display text-3xl font-bold text-neon-red mt-3">TRIAL FAILED</h2>
            <p className="text-slate-400 text-sm mt-2">
              The AI has diagnosed your weak domains{result.weakCategories.length ? `: ${result.weakCategories.join(', ')}` : ''}. Complete the injected remediation, then retry.
            </p>
          </>
        )}
        <div className="font-mono text-4xl mt-4 text-slate-100">
          {result.correctCount}<span className="text-slate-500 text-xl">/{result.total}</span>
          <span className="text-sm text-slate-500 ml-2">({Math.round(result.score * 100)}%)</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-neon-violet text-xs font-display">
          <Bot size={13} /> ADVISOR UPDATED
        </div>
        <div className="flex gap-3 justify-center mt-6">
          {!result.passed && (
            <button onClick={() => { setResult(null); setAttemptKey((k) => k + 1); setPhase('briefing') }} className="btn-primary">
              Retry trial
            </button>
          )}
          <button onClick={() => navigate('/map')} className="btn-ghost">World map</button>
        </div>
      </motion.div>
    </div>
  )
}
