import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { levelProgress, titleForLevel } from '../lib/xp'
import { Zap } from 'lucide-react'

export default function XPBar() {
  const { profile } = useGame()
  if (!profile) return null
  const { level, current, needed, pct } = levelProgress(profile.xp || 0)

  const fillClass = pct > 50 ? 'fill-green' : pct > 25 ? 'fill-amber' : 'fill-red'

  return (
    <div className="flex items-center gap-3">
      {/* Level badge */}
      <div className="stat-badge w-9 h-9 shrink-0 text-sm rounded-lg">{level}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className="text-[11px] font-display font-bold text-ink-400 truncate tracking-wide uppercase">
            {titleForLevel(level)}
          </span>
          <span className="text-[11px] font-mono text-neon-amber shrink-0 flex items-center gap-0.5">
            <Zap size={9} />{current}<span className="text-ink-500">/{needed}</span>
          </span>
        </div>

        <div className="progress-bar-track">
          <motion.div
            className={`progress-bar-fill ${fillClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    </div>
  )
}
