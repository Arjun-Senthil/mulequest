import { motion } from 'framer-motion'
import { Bot, AlertTriangle, ArrowRight, Loader2, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'

export default function AIAdvisorPanel() {
  const { diagnosis, aiBusy, questStatus, completeMicroQuest } = useGame()
  const navigate = useNavigate()

  const injected = (diagnosis?.injected_quests || []).filter(
    (q) => questStatus(q.quest_id) !== 'completed'
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-neon-violet/10 border border-neon-violet/40">
          <Bot size={16} className="text-neon-violet" />
        </div>
        <div>
          <div className="font-display font-bold tracking-wide text-sm text-neon-violet">AI ADVISOR</div>
          <div className="text-[10px] font-mono text-slate-500">claude adaptive engine</div>
        </div>
        {aiBusy && <Loader2 size={14} className="ml-auto animate-spin text-neon-violet" />}
      </div>

      {/* Diagnosis */}
      <div className="panel p-3">
        <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5">Current diagnosis</div>
        {diagnosis ? (
          <p className="text-sm text-slate-300 leading-relaxed">{diagnosis.diagnosis}</p>
        ) : (
          <p className="text-sm text-slate-500">
            No diagnosis yet. The engine activates after your first quiz attempts, boss fights, and cert trials.
          </p>
        )}
      </div>

      {/* Weakness zones */}
      {diagnosis?.weak_tags?.length > 0 && (
        <div className="panel p-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase mb-2 flex items-center gap-1">
            <AlertTriangle size={11} className="text-neon-amber" /> Weakness zones
          </div>
          <div className="flex flex-wrap gap-1.5">
            {diagnosis.weak_tags.map((tag) => (
              <span key={tag} className="chip border-neon-amber/40 text-neon-amber bg-neon-amber/5">{tag}</span>
            ))}
          </div>
          {diagnosis.difficulty_adjustment && diagnosis.difficulty_adjustment !== 'none' && (
            <div className="mt-2 text-xs font-mono text-slate-400">
              difficulty → <span className="text-neon-amber">{diagnosis.difficulty_adjustment}</span>
            </div>
          )}
        </div>
      )}

      {/* Recommended action */}
      {diagnosis?.recommended_action && (
        <div className="panel p-3 border-neon-cyan/30">
          <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 flex items-center gap-1">
            <ArrowRight size={11} className="text-neon-cyan" /> Next action
          </div>
          <p className="text-sm text-neon-cyan/90">{diagnosis.recommended_action}</p>
        </div>
      )}

      {/* Injected micro quests */}
      {injected.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Injected micro quests</div>
          {injected.map((q) => (
            <motion.div
              key={q.quest_id}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="panel-raised p-3 border-neon-violet/40"
            >
              <div className="flex items-center gap-1.5 text-xs font-display font-bold text-neon-violet">
                <Zap size={12} /> {q.title}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{q.description}</p>
              <button
                onClick={() => completeMicroQuest({ questId: q.quest_id })}
                className="mt-2 text-[11px] font-display font-semibold text-neon-green hover:underline"
              >
                MARK COMPLETE (+{q.xp || 60} XP)
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {diagnosis && (
        <button
          onClick={() => navigate('/map')}
          className="w-full btn-ghost text-xs"
        >
          View quest map
        </button>
      )}
    </div>
  )
}
