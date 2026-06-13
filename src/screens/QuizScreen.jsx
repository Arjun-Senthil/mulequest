import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, RotateCcw, Bot } from 'lucide-react'
import QuizEngine from '../components/QuizEngine'
import { KNOWLEDGE } from '../data/knowledge'
import { useGame } from '../context/GameContext'

export default function QuizScreen() {
  const { chapterId, conceptId } = useParams()
  const id = Number(chapterId)
  const navigate = useNavigate()
  const { completeQuiz } = useGame()
  const [result, setResult] = useState(null)
  const [round, setRound] = useState(0)
  const attemptsRef = useRef(0)

  const content = KNOWLEDGE[id]
  const concept = content?.concepts.find((c) => c.concept_id === conceptId)
  if (!concept) return <div className="text-slate-500">Quiz not found.</div>

  const onFinish = async ({ score, correctCount, total, failedQuestionIds, timeSpent }) => {
    attemptsRef.current += 1
    const passed = await completeQuiz({
      chapterId: id,
      conceptId: concept.concept_id,
      quizId: `${concept.concept_id}-quiz`,
      score,
      attempts: attemptsRef.current,
      timeSpent,
      failedQuestionIds,
      aiTags: concept.ai_tags
    })
    setResult({ score, correctCount, total, passed, attempts: attemptsRef.current })
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="panel p-8 text-center">
          {result.passed ? (
            <>
              <Trophy size={44} className="mx-auto text-neon-green" />
              <h2 className="font-display text-2xl font-bold text-neon-green mt-3">QUIZ CLEARED</h2>
            </>
          ) : (
            <>
              <RotateCcw size={44} className="mx-auto text-neon-red" />
              <h2 className="font-display text-2xl font-bold text-neon-red mt-3">NOT YET</h2>
            </>
          )}
          <div className="font-mono text-4xl mt-4 text-slate-100">
            {result.correctCount}<span className="text-slate-500 text-xl">/{result.total}</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {result.passed
              ? `${concept.title} mastered. +30 XP (streak multiplied).`
              : result.attempts >= 2
                ? 'Two misses on this concept — the AI Advisor has analyzed your pattern and updated its diagnosis.'
                : 'Pass mark is 70%. Review the exam traps and try again.'}
          </p>
          {!result.passed && result.attempts >= 2 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-neon-violet text-xs font-display">
              <Bot size={13} /> ADVISOR UPDATED — check the panel
            </div>
          )}
          <div className="flex gap-3 justify-center mt-6">
            {!result.passed && (
              <button onClick={() => { setResult(null); setRound((r) => r + 1) }} className="btn-primary">
                Retry
              </button>
            )}
            <button onClick={() => navigate(`/chapter/${id}`)} className="btn-ghost">Back to chapter</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(`/chapter/${id}/concept/${conceptId}`)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4">
        <ArrowLeft size={15} /> {concept.title}
      </button>
      <div className="panel p-6">
        <div className="mb-4">
          <h1 className="font-display text-xl font-bold text-slate-100">CONCEPT QUIZ — {concept.title}</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">60s per question · pass ≥ 70% · explanations shown after each answer</p>
        </div>
        <QuizEngine key={round} questions={concept.quiz} secondsPerQuestion={60} onFinish={onFinish} mode="quiz" />
      </div>
    </div>
  )
}
