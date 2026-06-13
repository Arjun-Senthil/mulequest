import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { levelProgress, titleForLevel } from '../lib/xp'
import { Zap } from 'lucide-react'

export default function XPBar() {
  const { profile } = useGame()
  if (!profile) return null
  const { level, current, needed, pct } = levelProgress(profile.xp || 0)

  const hpColor = pct > 50 ? 'fill-green' : pct > 25 ? 'fill-amber' : 'fill-red'

  return (
    <div className="flex items-center gap-3">
      {/* Level badge — pixel font */}
      <div className="stat-badge w-10 h-10 shrink-0 text-xs">{level}</div>

      <div className="flex-1 min-w-0">
        {/* Title + XP count */}
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className="text-[10px] font-bold text-ink-200 truncate uppercase tracking-wider">
            {titleForLevel(level)}
          </span>
          <span className="text-[10px] font-mono text-neon-amber shrink-0 flex items-center gap-0.5">
            <Zap size={9} className="text-neon-amber" />{current}<span className="text-ink-400">/{needed}</span>
          </span>
        </div>

        {/* HP-style bar */}
        <div className="hp-bar-track">
          <motion.div
            className={`progress-bar-fill ${hpColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 55, damping: 12 }}
          />
        </div>
      </div>
    </div>
  )
}
