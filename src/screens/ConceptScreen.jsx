import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, AlertTriangle, FlaskConical, ChevronDown, ChevronUp,
  Lightbulb, Cog, CheckCircle2, Swords
} from 'lucide-react'
import { KNOWLEDGE } from '../data/knowledge'
import { useGame } from '../context/GameContext'

function Section({ icon: Icon, label, color, children }) {
  return (
    <div>
      <div className={`flex items-center gap-1.5 text-[11px] font-mono uppercase mb-2 ${color}`}>
        <Icon size={12} /> {label}
      </div>
      {children}
    </div>
  )
}

export default function ConceptScreen() {
  const { chapterId, conceptId } = useParams()
  const id = Number(chapterId)
  const navigate = useNavigate()
  const { questStatus, completeLab } = useGame()
  const [deepDive, setDeepDive] = useState(false)

  const content = KNOWLEDGE[id]
  const concept = content?.concepts.find((c) => c.concept_id === conceptId)
  if (!concept) return <div className="text-slate-500">Concept not found.</div>

  const quizDone = questStatus(concept.concept_id) === 'completed'
  const labDone = questStatus(`${concept.concept_id}-lab`) === 'completed'

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(`/chapter/${id}`)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4">
        <ArrowLeft size={15} /> Chapter {id}
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span>{concept.concept_id}</span>
              <span className={`chip border-edge ${
                concept.difficulty === 'advanced' ? 'text-neon-red' : concept.difficulty === 'intermediate' ? 'text-neon-amber' : 'text-neon-green'
              }`}>{concept.difficulty}</span>
              {concept.prerequisites?.length > 0 && (
                <span className="hidden sm:inline">requires: {concept.prerequisites.join(', ')}</span>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 mt-1">{concept.title}</h1>
          </div>
          {quizDone && <CheckCircle2 className="text-neon-green shrink-0" size={22} />}
        </div>

        <div className="space-y-6">
          <Section icon={Lightbulb} label="What it is" color="text-neon-cyan">
            <p className="text-slate-300 leading-relaxed text-[15px]">{concept.card.what}</p>
          </Section>

          <Section icon={Cog} label="How it works" color="text-neon-violet">
            <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-line">{concept.card.how}</p>
          </Section>

          <Section icon={AlertTriangle} label="Exam traps" color="text-neon-amber">
            <div className="space-y-2">
              {concept.card.exam_traps.map((trap, i) => (
                <div key={i} className="trap-box flex gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-neon-amber" />
                  <span>{trap}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={FlaskConical} label="Hands-on task — +50 XP" color="text-neon-green">
            <div className="panel-raised p-4">
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{concept.card.hands_on}</p>
              <button
                onClick={() => completeLab({ chapterId: id, conceptId: concept.concept_id })}
                disabled={labDone}
                className="btn-primary mt-3 text-xs"
              >
                {labDone ? 'Lab completed ✓' : 'I completed this in Studio/ACB (+50 XP)'}
              </button>
            </div>
          </Section>

          {/* Deep dive */}
          {concept.card.deep_dive && (
            <div className="border-t border-edge pt-4">
              <button
                onClick={() => setDeepDive((v) => !v)}
                className="flex items-center gap-2 font-display font-semibold text-sm text-slate-300 hover:text-neon-cyan transition-colors"
              >
                {deepDive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                DEEP DIVE — full detail
              </button>
              <AnimatePresence>
                {deepDive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 text-sm text-slate-400 leading-relaxed whitespace-pre-line panel-raised p-4">
                      {concept.card.deep_dive}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-edge flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/chapter/${id}/quiz/${concept.concept_id}`)}
            className="btn-primary flex items-center gap-2"
          >
            <Swords size={14} /> {quizDone ? 'Re-take quiz' : 'Take the quiz (+30 XP)'}
          </button>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {concept.ai_tags.map((t) => (
              <span key={t} className="chip border-edge text-slate-500">#{t}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
