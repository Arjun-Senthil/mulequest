import { Flame } from 'lucide-react'
import { streakMultiplier } from '../lib/xp'

export default function StreakBadge({ streak }) {
  const mult = streakMultiplier(streak)
  const hot = streak >= 7
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-display font-bold text-sm ${
        hot
          ? 'border-neon-amber/50 text-neon-amber bg-neon-amber/5 shadow-glow-amber'
          : 'border-edge text-slate-400'
      }`}
      title={`Streak multiplier: ${mult.toFixed(2)}x`}
    >
      <Flame size={15} className={hot ? 'text-neon-amber' : 'text-slate-500'} />
      {streak}
      <span className="text-[10px] font-mono opacity-70">×{mult.toFixed(1)}</span>
    </div>
  )
}
