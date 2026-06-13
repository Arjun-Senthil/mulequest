import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Lock, CheckCircle2, CheckSquare, Square, Layers } from 'lucide-react'
import { DUNGEONS } from '../data/dungeons'
import { useGame } from '../context/GameContext'

function DungeonCard({ dungeon }) {
  const { questStatus, chapterStats, completeDungeon } = useGame()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState([])

  const done = questStatus(dungeon.dungeon_id) === 'completed'
  const unlocked = dungeon.requires_chapters.every((ch) => chapterStats(ch).complete)
  const allChecked = checked.length === dungeon.objectives.length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`panel p-5 ${done ? 'border-neon-green/40' : unlocked ? 'border-neon-violet/40' : 'opacity-50'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg border shrink-0 ${
          done ? 'border-neon-green/50 text-neon-green' : unlocked ? 'border-neon-violet/50 text-neon-violet' : 'border-edge text-slate-600'
        } bg-void`}>
          {done ? <CheckCircle2 size={20} /> : unlocked ? <Swords size={20} /> : <Lock size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-lg text-slate-100">{dungeon.title}</span>
            <span className="chip border-neon-violet/40 text-neon-violet">+{dungeon.xp} XP</span>
            <span className="chip border-edge text-slate-500 flex items-center gap-1">
              <Layers size={9} /> CH {dungeon.requires_chapters.join(' + ')}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{dungeon.brief}</p>
          {!unlocked && (
            <p className="text-[10px] font-mono text-neon-amber/70 mt-2">
              🔒 complete chapters {dungeon.requires_chapters.join(', ')} to enter
            </p>
          )}
          {unlocked && !done && (
            <button onClick={() => setOpen((v) => !v)} className="btn-ghost mt-3 text-xs">
              {open ? 'Close dungeon' : 'Enter dungeon'}
            </button>
          )}
          {done && <p className="text-xs font-display text-neon-green mt-2">CLEARED</p>}
        </div>
      </div>

      {open && unlocked && !done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 border-t border-edge pt-4">
          <div className="panel-raised p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {dungeon.scenario}
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-mono text-slate-500 uppercase">Objectives — verify each honestly</div>
            {dungeon.objectives.map((obj, i) => {
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
                  {obj}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => completeDungeon({ dungeonId: dungeon.dungeon_id, xp: dungeon.xp })}
            disabled={!allChecked}
            className="btn-primary w-full mt-4"
          >
            {allChecked ? `CLAIM VICTORY (+${dungeon.xp} XP)` : `${dungeon.objectives.length - checked.length} objectives remaining`}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function DungeonsScreen() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <Swords className="text-neon-violet" size={22} /> DUNGEONS
        </h1>
        <p className="text-sm text-slate-500">
          Multi-concept raids crossing 2–3 chapters. Real builds, real architecture decisions. High XP, no hand-holding.
        </p>
      </div>
      <div className="space-y-4">
        {DUNGEONS.map((d) => <DungeonCard key={d.dungeon_id} dungeon={d} />)}
      </div>
    </div>
  )
}
