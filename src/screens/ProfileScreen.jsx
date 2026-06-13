import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Trophy, Medal, History, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { db } from '../lib/db'
import { titleForLevel } from '../lib/xp'

export default function ProfileScreen() {
  const { user } = useAuth()
  const { profile, certTrials } = useGame()
  const [perf, setPerf] = useState([])

  useEffect(() => {
    if (!user) return
    db.getPerformance(user.id, 200).then(setPerf).catch(console.error)
  }, [user])

  // Build cumulative activity chart from performance log (proxy for XP history)
  const byDay = {}
  ;[...perf].reverse().forEach((p) => {
    const day = (p.logged_at || '').slice(0, 10)
    if (!day) return
    byDay[day] = (byDay[day] || 0) + 1
  })
  let cum = 0
  const chartData = Object.entries(byDay).map(([day, count]) => {
    cum += count
    return { day: day.slice(5), activity: count, total: cum }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="panel p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-neon-cyan/10 border-2 border-neon-cyan/50 flex items-center justify-center font-display font-bold text-2xl text-neon-cyan shadow-glow">
          {profile?.level || 1}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">{profile?.name || 'Dev'}</h1>
          <p className="text-sm font-mono text-slate-500">
            {titleForLevel(profile?.level || 1)} · {profile?.xp || 0} XP · {profile?.streak || 0}-day streak
          </p>
        </div>
      </div>

      {/* XP / activity chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-3">
          <TrendingUp size={13} className="text-neon-cyan" /> Activity history
        </div>
        {chartData.length > 1 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2a3a" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid #1f2a3a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="total" stroke="#22d3ee" fill="url(#xpGrad)" strokeWidth={2} name="cumulative quests" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Complete quizzes and bosses to populate your activity chart.</p>
        )}
      </motion.div>

      {/* Badges */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-3">
          <Medal size={13} className="text-neon-violet" /> Badges ({profile?.badges?.length || 0})
        </div>
        {profile?.badges?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b) => (
              <div key={b} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neon-violet/40 bg-neon-violet/5">
                <Trophy size={14} className="text-neon-violet" />
                <span className="text-sm font-display font-semibold text-neon-violet">{b}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No badges yet. Defeat a chapter boss to earn your first.</p>
        )}
      </div>

      {/* Cert trial history */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 uppercase mb-3">
          <History size={13} className="text-neon-amber" /> Cert trial history
        </div>
        {certTrials.length ? (
          <div className="space-y-2">
            {certTrials.map((t, i) => (
              <div key={i} className="flex items-center gap-3 panel-raised px-4 py-2.5 text-sm">
                <span className={`chip ${t.passed ? 'border-neon-green/50 text-neon-green' : 'border-neon-red/50 text-neon-red'}`}>
                  {t.passed ? 'PASS' : 'FAIL'}
                </span>
                <span className="font-display font-semibold text-slate-200">{t.cert_level}</span>
                <span className="font-mono text-slate-400">{t.score}%</span>
                <span className="ml-auto text-[10px] font-mono text-slate-600">
                  {(t.attempted_at || '').slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No trial attempts yet. Clear Chapters 1–5 to unlock the MCD L1 trial.</p>
        )}
      </div>
    </div>
  )
}
