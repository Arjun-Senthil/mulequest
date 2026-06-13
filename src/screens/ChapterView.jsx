import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Swords, Star, FlaskConical } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import { KNOWLEDGE } from '../data/knowledge'
import { useGame } from '../context/GameContext'

export default function ChapterView() {
  const { chapterId } = useParams()
  const id = Number(chapterId)
  const navigate = useNavigate()
  const { questStatus, chapterStats, chapterUnlocked, completeSideQuest } = useGame()

  const meta = CHAPTERS.find((c) => c.id === id)
  const content = KNOWLEDGE[id]
  if (!meta || !content) return <div className="text-slate-500">Chapter not found.</div>
  if (!chapterUnlocked(id)) return (
    <div className="max-w-xl mx-auto text-center mt-20">
      <div className="font-display text-xl text-slate-400">This chapter is still locked.</div>
      <Link to="/map" className="btn-primary inline-block mt-4">Back to map</Link>
    </div>
  )

  const stats = chapterStats(id)

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/map')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4">
        <ArrowLeft size={15} /> World Map
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500">CH {String(id).padStart(2, '0')}</span>
          <span className="chip border-edge text-slate-500">{meta.cert}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-100">{meta.title}</h1>
        <p className="text-slate-500 mt-1">{meta.subtitle}</p>
      </div>

      {/* Main quests (concepts) */}
      <div className="space-y-2 mb-8">
        <div className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
          <BookOpen size={12} className="text-neon-cyan" /> Main quests — complete all to face the boss
        </div>
        {content.concepts.map((c, i) => {
          const done = questStatus(c.concept_id) === 'completed'
          const labDone = questStatus(`${c.concept_id}-lab`) === 'completed'
          return (
            <motion.button
              key={c.concept_id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/chapter/${id}/concept/${c.concept_id}`)}
              className={`w-full text-left panel p-4 flex items-center gap-3 transition-all hover:border-neon-cyan/50 ${done ? 'border-neon-green/40' : ''}`}
            >
              {done
                ? <CheckCircle2 size={18} className="text-neon-green shrink-0" />
                : <Circle size={18} className="text-slate-600 shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold text-slate-200">{c.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-slate-500">{c.concept_id}</span>
                  <span className={`chip border-edge ${
                    c.difficulty === 'advanced' ? 'text-neon-red' : c.difficulty === 'intermediate' ? 'text-neon-amber' : 'text-neon-green'
                  }`}>{c.difficulty}</span>
                  {labDone && <span className="chip border-neon-green/40 text-neon-green"><FlaskConical size={9} /> lab done</span>}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-600 shrink-0">+30 quiz · +50 lab</span>
            </motion.button>
          )
        })}
      </div>

      {/* Side quests */}
      {content.side_quests?.length > 0 && (
        <div className="space-y-2 mb-8">
          <div className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
            <Star size={12} className="text-neon-violet" /> Side quests — optional, XP-heavy
          </div>
          {content.side_quests.map((sq) => {
            const done = questStatus(sq.quest_id) === 'completed'
            return (
              <div key={sq.quest_id} className={`panel p-4 ${done ? 'border-neon-violet/40' : ''}`}>
                <div className="flex items-center gap-2">
                  {done ? <CheckCircle2 size={16} className="text-neon-violet" /> : <Star size={16} className="text-slate-600" />}
                  <span className="font-display font-semibold text-slate-200">{sq.title}</span>
                  <span className="ml-auto chip border-neon-violet/40 text-neon-violet">+{sq.xp} XP</span>
                </div>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{sq.description}</p>
                {!done && (
                  <button
                    onClick={() => completeSideQuest({ chapterId: id, questId: sq.quest_id, xp: sq.xp })}
                    className="btn-ghost mt-3 text-xs"
                  >
                    I built it — claim XP
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Boss */}
      <div className={`panel p-5 border-2 ${stats.bossDone ? 'border-neon-green/50' : stats.done === stats.total ? 'border-neon-red/60' : 'border-edge opacity-70'}`}>
        <div className="flex items-center gap-3">
          <Swords size={22} className={stats.bossDone ? 'text-neon-green' : 'text-neon-red'} />
          <div className="flex-1">
            <div className="font-display font-bold text-lg text-slate-100">BOSS FIGHT — {content.boss.title}</div>
            <div className="text-xs text-slate-500">
              {content.boss.mcq.length} timed questions + scenario task · pass ≥ 70% · +500 XP
            </div>
          </div>
          {stats.bossDone ? (
            <span className="chip border-neon-green/50 text-neon-green">DEFEATED</span>
          ) : (
            <button
              onClick={() => navigate(`/chapter/${id}/boss`)}
              disabled={stats.done < stats.total}
              className="btn-danger"
            >
              {stats.done < stats.total ? `${stats.total - stats.done} quests left` : 'Engage'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
