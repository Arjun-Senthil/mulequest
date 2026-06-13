import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Code2, ExternalLink, Eye, EyeOff, CheckCircle2, ChevronRight, ChevronLeft,
  Zap, Trophy, Filter, BookOpen, Lightbulb, Copy, Check, Swords
} from 'lucide-react'
import { DOJO_CHALLENGES, DOJO_TOPICS } from '../data/dojoChallenge'
import { useGame } from '../context/GameContext'

const DIFF_CLASS = {
  beginner:     'diff-beginner',
  intermediate: 'diff-intermediate',
  advanced:     'diff-advanced',
}

const TOPIC_COLORS = {
  'Basics':       'bg-blue-900/40   text-blue-300   border-blue-700/40',
  'Collections':  'bg-green-900/40  text-green-300  border-green-700/40',
  'Multi-Format': 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  'Patterns':     'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
}

const PLAYGROUND_URL = 'https://dataweave.mulesoft.com/learn/playground'

function ChallengeList({ challenges, selected, onSelect, completed }) {
  return (
    <div className="space-y-1">
      {challenges.map((c) => {
        const done = completed.includes(c.id)
        const isActive = selected?.id === c.id
        return (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all text-sm ${
              isActive
                ? 'border-neon-cyan/60 bg-neon-cyan/10 text-ink-50 shadow-glow'
                : done
                  ? 'border-neon-green/30 bg-neon-green/5 text-ink-300 hover:border-neon-green/50'
                  : 'border-edge text-ink-400 hover:border-ink-500/50 hover:text-ink-200 hover:bg-raised/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {done
                ? <CheckCircle2 size={12} className="text-neon-green shrink-0" />
                : <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    c.difficulty === 'advanced' ? 'bg-neon-red/60' :
                    c.difficulty === 'intermediate' ? 'bg-neon-amber/60' : 'bg-neon-green/60'
                  }`} />
              }
              <span className="font-mono text-[10px] text-ink-400">{c.id}</span>
              <span className={`chip ml-auto text-[9px] ${DIFF_CLASS[c.difficulty]}`}>{c.difficulty[0].toUpperCase()}</span>
            </div>
            <div className={`text-[11px] mt-0.5 truncate pl-4 font-bold ${isActive ? 'text-neon-cyan' : ''}`}>
              {c.title}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default function DataWeaveDojo() {
  const { awardXp, questStatus, setQuest } = useGame()

  const [filterTopic, setFilterTopic] = useState('All')
  const [filterDiff, setFilterDiff] = useState('All')
  const [selected, setSelected] = useState(DOJO_CHALLENGES[0])
  const [script, setScript] = useState('%dw 2.0\noutput application/json\n---\n// Write your DataWeave here\n')
  const [showSolution, setShowSolution] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [showExpected, setShowExpected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [xpEarned, setXpEarned] = useState(null)

  const completed = DOJO_CHALLENGES
    .map(c => c.id)
    .filter(id => questStatus(`DOJO-${id}`) === 'completed')

  const filtered = DOJO_CHALLENGES.filter(c => {
    if (filterTopic !== 'All' && c.topic !== filterTopic) return false
    if (filterDiff !== 'All' && c.difficulty !== filterDiff) return false
    return true
  })

  const selectChallenge = (c) => {
    setSelected(c)
    setScript('%dw 2.0\noutput application/json\n---\n// Write your DataWeave here\n')
    setShowSolution(false)
    setShowHints(false)
    setShowExpected(false)
    setXpEarned(null)
  }

  const markDone = useCallback(async () => {
    const key = `DOJO-${selected.id}`
    if (questStatus(key) === 'completed') return
    await setQuest(0, key, 'completed')
    await awardXp(selected.xp, `DataWeave Dojo: ${selected.title}`)
    setXpEarned(selected.xp)
  }, [selected, questStatus, setQuest, awardXp])

  const openPlayground = () => {
    navigator.clipboard?.writeText(selected.inputPayload).catch(() => {})
    window.open(PLAYGROUND_URL, '_blank', 'noopener')
  }

  const copyInput = async () => {
    await navigator.clipboard?.writeText(selected.inputPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isDone = completed.includes(selected.id)
  const completedCount = completed.length
  const totalXp = DOJO_CHALLENGES
    .filter(c => completed.includes(c.id))
    .reduce((s, c) => s + c.xp, 0)

  const filteredIdx = filtered.findIndex(c => c.id === selected.id)

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <div className="w-60 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">

        {/* Stats header */}
        <div className="panel p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Swords size={13} className="text-neon-amber" />
              <span className="text-[10px] font-bold text-ink-300 uppercase tracking-widest">DW Dojo</span>
            </div>
            <span className="text-[10px] font-mono text-ink-500">{completedCount}/{DOJO_CHALLENGES.length}</span>
          </div>
          {/* Progress */}
          <div className="progress-bar-track mb-1">
            <motion.div
              className="progress-bar-fill fill-amber"
              animate={{ width: `${(completedCount / DOJO_CHALLENGES.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 60 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-ink-500">
            <span>{completedCount} solved</span>
            <span className="text-neon-amber">+{totalXp} XP</span>
          </div>
        </div>

        {/* Filters */}
        <div className="panel p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink-400 uppercase tracking-wider">
            <Filter size={10} /> Filters
          </div>
          <div className="flex flex-wrap gap-1">
            {['All', ...DOJO_TOPICS].map(t => (
              <button
                key={t}
                onClick={() => setFilterTopic(t)}
                className={`chip text-[9px] transition-all ${
                  filterTopic === t
                    ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/50'
                    : 'text-ink-400 border-edge hover:border-ink-500/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {['All', 'beginner', 'intermediate', 'advanced'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                className={`chip text-[9px] transition-all ${
                  filterDiff === d
                    ? (d === 'beginner' ? 'diff-beginner' : d === 'intermediate' ? 'diff-intermediate' : d === 'advanced' ? 'diff-advanced' : 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/50')
                    : 'text-ink-400 border-edge hover:border-ink-500/50'
                }`}
              >
                {d === 'All' ? 'All' : d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge list */}
        <ChallengeList
          challenges={filtered}
          selected={selected}
          onSelect={selectChallenge}
          completed={completed}
        />
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-w-0">

        {/* Challenge header */}
        <div className="panel p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[10px] text-ink-500">{selected.id}</span>
                <span className={`chip ${DIFF_CLASS[selected.difficulty]}`}>{selected.difficulty}</span>
                <span className={`chip ${TOPIC_COLORS[selected.topic] || 'border-edge text-ink-400'}`}>{selected.topic}</span>
                <span className="chip bg-neon-amber/15 text-neon-amber border-neon-amber/40 flex items-center gap-1">
                  <Zap size={9} />{selected.xp} XP
                </span>
                {isDone && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="chip bg-neon-green/15 text-neon-green border-neon-green/40"
                  >
                    ✓ SOLVED
                  </motion.span>
                )}
              </div>
              <h1 className="font-display font-black text-lg text-ink-50 leading-tight">{selected.title}</h1>
              <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">{selected.description}</p>
            </div>
          </div>

          {/* Hints */}
          <div className="mt-3">
            <button
              onClick={() => setShowHints(h => !h)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                showHints ? 'text-neon-amber' : 'text-ink-400 hover:text-neon-amber'
              }`}
            >
              <Lightbulb size={13} className={showHints ? 'text-neon-amber' : ''} />
              {showHints ? 'Hide hints' : `Hints (${selected.hints.length})`}
            </button>
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                >
                  <ul className="mt-2 space-y-1.5">
                    {selected.hints.map((h, i) => (
                      <li key={i} className="text-xs text-ink-300 flex gap-2 items-start">
                        <span className="text-neon-amber font-bold shrink-0 mt-0.5">{i + 1}.</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input payload */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen size={12} className="text-neon-violet" />
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Input Payload</span>
              <span className={`chip text-[9px] ${TOPIC_COLORS['Multi-Format'] || 'border-edge text-ink-500'}`}>{selected.inputMimeType}</span>
              <span className="text-ink-600 text-xs">→</span>
              <span className={`chip text-[9px] ${TOPIC_COLORS['Patterns'] || 'border-edge text-ink-500'}`}>{selected.outputMimeType}</span>
            </div>
            <button
              onClick={copyInput}
              className="flex items-center gap-1 text-[11px] font-bold text-ink-400 hover:text-neon-cyan transition-colors"
            >
              {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre className="code-block max-h-36 overflow-y-auto text-[11px]">{selected.inputPayload}</pre>
        </div>

        {/* Editor */}
        <div className="panel p-4">
          {/* Toolbar — all buttons in one row, no overlap possible */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Code2 size={13} className="text-neon-cyan" />
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Your Script</span>
              {showSolution && (
                <span className="chip diff-intermediate text-[9px]">Solution shown</span>
              )}
            </div>
            {/* All toolbar buttons together — no separate action bar below */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setShowExpected(e => !e)}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                  showExpected
                    ? 'border-neon-green/50 bg-neon-green/10 text-neon-green'
                    : 'border-edge text-ink-400 hover:border-neon-green/40 hover:text-neon-green'
                }`}
              >
                {showExpected ? <EyeOff size={11} /> : <Eye size={11} />}
                Expected
              </button>
              <button
                onClick={() => setShowSolution(s => !s)}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                  showSolution
                    ? 'border-neon-violet/50 bg-neon-violet/10 text-neon-violet'
                    : 'border-edge text-ink-400 hover:border-neon-violet/40 hover:text-neon-violet'
                }`}
              >
                <Eye size={11} />
                {showSolution ? 'Hide' : 'Solution'}
              </button>
              <button
                onClick={openPlayground}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border-2 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/60 transition-all"
              >
                <ExternalLink size={11} />
                Playground
              </button>
            </div>
          </div>

          {/* Monaco editor */}
          <div className="rounded-xl overflow-hidden border-2 border-edge" style={{ height: '220px' }}>
            <Editor
              height="220px"
              language="javascript"
              theme="vs-dark"
              value={showSolution ? selected.solution : script}
              onChange={v => { if (!showSolution) setScript(v || '') }}
              options={{
                readOnly: showSolution,
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                tabSize: 2,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                renderLineHighlight: 'gutter',
              }}
            />
          </div>

          {/* Expected output — expands INSIDE editor panel, below editor */}
          <AnimatePresence>
            {showExpected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
              >
                <div className="mt-3">
                  <div className="text-[10px] font-bold text-neon-green uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={10} /> Expected Output
                  </div>
                  <pre className="code-block text-[11px] text-neon-green/90 max-h-40 overflow-y-auto">
                    {selected.expectedOutput}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mark complete bar */}
        <div className="panel p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {xpEarned && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-neon-amber font-bold text-sm"
                >
                  <Zap size={14} className="animate-bounce2" /> +{xpEarned} XP
                </motion.div>
              )}
            </AnimatePresence>
            <div className="text-[10px] font-mono text-ink-500">
              Solved in Playground? Mark it done to earn XP.
            </div>
          </div>

          {isDone ? (
            <div className="flex items-center gap-2 text-neon-green font-bold text-sm">
              <Trophy size={16} className="animate-float" /> Completed!
            </div>
          ) : (
            <button onClick={markDone} className="btn-primary flex items-center gap-2 py-2 text-xs">
              <CheckCircle2 size={13} />
              Mark Solved +{selected.xp} XP
            </button>
          )}
        </div>

        {/* Prev / Next nav */}
        <div className="flex justify-between items-center pb-2 px-1">
          <button
            onClick={() => filteredIdx > 0 && selectChallenge(filtered[filteredIdx - 1])}
            disabled={filteredIdx <= 0}
            className="flex items-center gap-1.5 text-xs font-bold text-ink-400 hover:text-neon-cyan disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-[10px] font-mono text-ink-600">
            {filteredIdx + 1} / {filtered.length}
          </span>
          <button
            onClick={() => filteredIdx < filtered.length - 1 && selectChallenge(filtered[filteredIdx + 1])}
            disabled={filteredIdx >= filtered.length - 1}
            className="flex items-center gap-1.5 text-xs font-bold text-ink-400 hover:text-neon-cyan disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  )
}
