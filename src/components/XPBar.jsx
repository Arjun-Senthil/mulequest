import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { levelProgress, titleForLevel } from '../lib/xp'

export default function XPBar() {
  const { profile } = useGame()
  if (!profile) return null
  const { level, current, needed, pct } = levelProgress(profile.xp || 0)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/40 font-display font-bold text-neon-cyan text-sm shrink-0">
        {level}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span className="truncate">{titleForLevel(level)}</span>
          <span>{current}/{needed} XP</span>
        </div>
        <div className="h-2 rounded-full bg-raised border border-edge overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 60 }}
          />
        </div>
      </div>
    </div>
  )
}
