import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Lock, CheckCircle2, Crown, Swords } from 'lucide-react'
import { CHAPTERS, CERT_GATES, gateAfter } from '../data/chapters'
import { useGame } from '../context/GameContext'

function CertGateNode({ gate }) {
  const { certGateState } = useGame()
  const navigate = useNavigate()
  const state = certGateState(gate)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative my-2 mx-auto w-full max-w-lg rounded-xl border-2 p-4 text-center cursor-pointer transition-all ${
        state.passed
          ? 'border-neon-green/60 bg-neon-green/5'
          : state.available
            ? 'border-neon-amber/60 bg-neon-amber/5 shadow-glow-amber hover:scale-[1.01]'
            : 'border-edge bg-panel opacity-60'
      }`}
      onClick={() => state.available && !state.passed && navigate(`/trial/${gate.id}`)}
    >
      <div className="flex items-center justify-center gap-2 font-display font-bold tracking-widest text-sm">
        <Crown size={16} className={state.passed ? 'text-neon-green' : 'text-neon-amber'} />
        <span className={state.passed ? 'text-neon-green' : state.available ? 'text-neon-amber' : 'text-slate-500'}>
          CERT GATE — {gate.name.toUpperCase()}
        </span>
      </div>
      <div className="text-[11px] font-mono text-slate-500 mt-1">
        {gate.questions} questions · {gate.durationMin} min · pass ≥ {gate.passPct}%
      </div>
      {state.passed && <div className="text-xs font-display text-neon-green mt-1">PASSED — {gate.badge} BADGE EARNED</div>}
      {!state.passed && state.available && <div className="text-xs font-display text-neon-amber mt-1 animate-pulseline">TRIAL AVAILABLE — CLICK TO ENTER</div>}
      {!state.passed && !state.available && <div className="text-xs font-mono text-slate-600 mt-1">complete all prior chapters to unlock</div>}
      {state.attempts > 0 && !state.passed && (
        <div className="text-[10px] font-mono text-neon-red mt-1">{state.attempts} failed attempt{state.attempts > 1 ? 's' : ''} — clear injected side quests, then retry</div>
      )}
    </motion.div>
  )
}

function ChapterNode({ chapter, index }) {
  const { chapterUnlocked, chapterStats } = useGame()
  const navigate = useNavigate()
  const unlocked = chapterUnlocked(chapter.id)
  const stats = chapterStats(chapter.id)
  const Icon = Icons[chapter.icon] || Swords
  const left = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, x: left ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex ${left ? 'justify-start' : 'justify-end'} w-full`}
    >
      <button
        onClick={() => unlocked && navigate(`/chapter/${chapter.id}`)}
        disabled={!unlocked}
        className={`group relative w-full sm:w-[26rem] text-left rounded-xl border p-4 transition-all ${
          stats.complete
            ? 'border-neon-green/50 bg-neon-green/5'
            : unlocked
              ? `border-neon-cyan/40 bg-panel hover:shadow-glow hover:border-neon-cyan/70 ${chapter.prestige ? 'border-neon-pink/50' : ''}`
              : 'border-edge bg-panel/50 opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg border shrink-0 ${
            stats.complete
              ? 'border-neon-green/50 bg-neon-green/10 text-neon-green'
              : unlocked
                ? chapter.prestige
                  ? 'border-neon-pink/50 bg-neon-pink/10 text-neon-pink'
                  : 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                : 'border-edge text-slate-600'
          }`}>
            {unlocked ? <Icon size={20} /> : <Lock size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">CH {String(chapter.id).padStart(2, '0')}</span>
              <span className={`chip ${chapter.prestige ? 'border-neon-pink/40 text-neon-pink' : 'border-edge text-slate-500'}`}>
                {chapter.cert}
              </span>
              {chapter.prestige && <span className="chip border-neon-pink/40 text-neon-pink">PRESTIGE</span>}
            </div>
            <div className="font-display font-bold text-base mt-0.5 text-slate-100">{chapter.title}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-snug">{chapter.subtitle}</div>
            {unlocked && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
                  <div
                    className={`h-full ${stats.complete ? 'bg-neon-green' : 'bg-neon-cyan'}`}
                    style={{ width: `${stats.total ? Math.round(((stats.done + (stats.bossDone ? 1 : 0)) / (stats.total + 1)) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {stats.done}/{stats.total} {stats.bossDone && <CheckCircle2 size={10} className="inline text-neon-green" />}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  )
}

export default function WorldMap() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100">WORLD MAP</h1>
        <p className="text-sm text-slate-500">The main questline. Defeat every chapter boss, survive three cert trials, reach the AI Frontier.</p>
      </div>

      <div className="relative space-y-4">
        {/* spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/30 via-neon-violet/30 to-neon-pink/30 hidden sm:block" />

        {CHAPTERS.map((ch, i) => {
          const gate = gateAfter(ch.id)
          return (
            <div key={ch.id} className="relative space-y-4">
              <ChapterNode chapter={ch} index={i} />
              {gate && <CertGateNode gate={gate} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
