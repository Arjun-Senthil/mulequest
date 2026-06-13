import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

/**
 * Reusable timed quiz engine.
 * questions: [{ id, q, options[], answer (index), explanation, category? }]
 * onFinish({ score, correctCount, total, failedQuestionIds, timeSpent, perCategory })
 * mode: 'quiz' | 'boss' | 'trial'
 */
export default function QuizEngine({ questions, secondsPerQuestion = 60, totalSeconds, onFinish, mode = 'quiz', showExplanations = true }) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [answers, setAnswers] = useState([]) // {id, correct, category}
  const startRef = useRef(Date.now())
  const deadline = useMemo(
    () => Date.now() + (totalSeconds ?? questions.length * secondsPerQuestion) * 1000,
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const [timeLeft, setTimeLeft] = useState(Math.round((deadline - Date.now()) / 1000))
  const [finished, setFinished] = useState(false)

  const finish = useCallback((finalAnswers) => {
    if (finished) return
    setFinished(true)
    const total = questions.length
    const correctCount = finalAnswers.filter((a) => a.correct).length
    const failedQuestionIds = finalAnswers.filter((a) => !a.correct).map((a) => a.id)
    // Unanswered count as failed
    const answeredIds = new Set(finalAnswers.map((a) => a.id))
    questions.forEach((q) => { if (!answeredIds.has(q.id)) failedQuestionIds.push(q.id) })
    const perCategory = {}
    finalAnswers.forEach((a) => {
      if (!a.category) return
      perCategory[a.category] = perCategory[a.category] || { correct: 0, total: 0 }
      perCategory[a.category].total++
      if (a.correct) perCategory[a.category].correct++
    })
    onFinish({
      score: total ? correctCount / total : 0,
      correctCount,
      total,
      failedQuestionIds,
      timeSpent: Math.round((Date.now() - startRef.current) / 1000),
      perCategory
    })
  }, [finished, questions, onFinish])

  // countdown
  useEffect(() => {
    const t = setInterval(() => {
      const left = Math.round((deadline - Date.now()) / 1000)
      setTimeLeft(left)
      if (left <= 0) {
        clearInterval(t)
        finish(answers)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [deadline, answers, finish])

  const q = questions[idx]
  if (!q) return null

  const pick = (i) => {
    if (locked) return
    setSelected(i)
    if (showExplanations) {
      setLocked(true)
      const entry = { id: q.id, correct: i === q.answer, category: q.category }
      setAnswers((prev) => [...prev, entry])
    }
  }

  const next = () => {
    let updated = answers
    if (!showExplanations) {
      // trial mode: record on advance
      updated = [...answers, { id: q.id, correct: selected === q.answer, category: q.category }]
      setAnswers(updated)
    }
    setSelected(null)
    setLocked(false)
    if (idx + 1 >= questions.length) {
      finish(updated)
    } else {
      setIdx(idx + 1)
    }
  }

  const mins = Math.max(0, Math.floor(timeLeft / 60))
  const secs = Math.max(0, timeLeft % 60)
  const urgent = timeLeft < 60

  return (
    <div>
      {/* HUD */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono text-slate-500">
          QUESTION <span className="text-slate-200">{idx + 1}</span> / {questions.length}
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-sm ${urgent ? 'text-neon-red animate-pulseline' : 'text-slate-400'}`}>
          <Timer size={14} /> {mins}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      <div className="h-1 rounded-full bg-raised mb-5 overflow-hidden">
        <div
          className={`h-full transition-all ${mode === 'boss' ? 'bg-neon-red' : mode === 'trial' ? 'bg-neon-amber' : 'bg-neon-cyan'}`}
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
        >
          {q.category && <div className="chip border-edge text-slate-500 mb-2">{q.category}</div>}
          <h2 className="text-lg text-slate-100 leading-relaxed font-medium whitespace-pre-line">{q.q}</h2>
          {q.code && <pre className="code-block mt-3">{q.code}</pre>}

          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer
              const isSelected = i === selected
              let cls = 'border-edge hover:border-slate-500 text-slate-300'
              if (locked && showExplanations) {
                if (isAnswer) cls = 'border-neon-green/60 bg-neon-green/5 text-neon-green'
                else if (isSelected) cls = 'border-neon-red/60 bg-neon-red/5 text-neon-red'
                else cls = 'border-edge text-slate-500 opacity-60'
              } else if (isSelected) {
                cls = 'border-neon-cyan/60 bg-neon-cyan/5 text-neon-cyan'
              }
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={locked && showExplanations}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-start gap-3 ${cls}`}
                >
                  <span className="font-mono text-xs mt-0.5 opacity-60">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1 whitespace-pre-line">{opt}</span>
                  {locked && showExplanations && isAnswer && <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
                  {locked && showExplanations && isSelected && !isAnswer && <XCircle size={16} className="shrink-0 mt-0.5" />}
                </button>
              )
            })}
          </div>

          {locked && showExplanations && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 panel-raised p-4 text-sm text-slate-400 leading-relaxed"
            >
              <span className="text-neon-cyan font-semibold">Why: </span>{q.explanation}
            </motion.div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={next}
              disabled={selected === null}
              className="btn-primary flex items-center gap-2"
            >
              {idx + 1 >= questions.length ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
