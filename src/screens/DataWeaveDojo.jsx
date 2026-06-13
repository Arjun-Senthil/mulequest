import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Code2, ExternalLink, Eye, EyeOff, CheckCircle2, ChevronRight, ChevronLeft,
  Zap, Trophy, Filter, BookOpen, Lightbulb, Copy, Check
} from 'lucide-react'
import { DOJO_CHALLENGES, DOJO_TOPICS, DOJO_DIFFICULTIES } from '../data/dojoChallenge'
import { useGame } from '../context/GameContext'

const DIFF_COLOR = {
  beginner:     'text-neon-green  border-neon-green/40',
  intermediate: 'text-neon-amber  border-neon-amber/40',
  advanced:     'text-neon-red    border-neon-red/40',
}

const PLAYGROUND_URL = 'https://dataweave.mulesoft.com/learn/playground'

function ChallengeList({ challenges, selected, onSelect, completed }) {
  return (
    <div className="space-y-1.5">
      {challenges.map((c) => {
        const done = completed.includes(c.id)
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
              selected?.id === c.id
                ? 'border-neon-cyan/60 bg-neon-cyan/5 text-slate-100'
                : done
                  ? 'border-neon-green/30 bg-neon-green/5 text-slate-400 hover:border-neon-green/50'
                  : 'border-edge text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {done
                ? <CheckCircle2 size={13} className="text-neon-green shrink-0" />
                : <div className={`w-3 h-3 rounded-full border shrink-0 ${DIFF_COLOR[c.difficulty].split(' ')[1]}`} />
              }
              <span className="truncate font-mono text-xs">{c.id}</span>
              <span className={`chip text-[10px] ml-auto ${DIFF_COLOR[c.difficulty]}`}>{c.difficulty}</span>
            </div>
            <div className="text-xs mt-0.5 truncate pl-5">{c.title}</div>
          </button>
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
  const [script, setScript] = useState(DOJO_CHALLENGES[0].solution.replace(/^[\s\S]*?---\n/, '%dw 2.0\noutput application/json\n---\n// Write your DataWeave here\n'))
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
    // Pre-fill editor with a starter (header only, no solution)
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
    // Copy input payload to clipboard and open playground
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

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)] overflow-hidden">

      {/* ── Sidebar ── */}
      <div className="w-64 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
        {/* Stats */}
        <div className="panel p-3 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-neon-cyan font-bold text-lg">{completedCount}</span>
            <span className="text-slate-500">/{DOJO_CHALLENGES.length}</span>
            <div className="text-slate-500">solved</div>
          </div>
          <div className="text-right">
            <span className="text-neon-amber font-bold text-lg">{totalXp}</span>
            <div className="text-slate-500">XP earned</div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase">
            <Filter size={10} /> Topic
          </div>
          <div className="flex flex-wrap gap-1">
            {['All', ...DOJO_TOPICS].map(t => (
              <button
                key={t}
                onClick={() => setFilterTopic(t)}
                className={`chip text-[10px] transition-all ${filterTopic === t ? 'border-neon-cyan/60 text-neon-cyan' : 'border-edge text-slate-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {['All', ...DOJO_DIFFICULTIES].map(d => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                className={`chip text-[10px] transition-all ${filterDiff === d ? 'border-neon-cyan/60 text-neon-cyan' : 'border-edge text-slate-500'}`}
              >
                {d}
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

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-w-0">

        {/* Challenge header */}
        <div className="panel p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-500">{selected.id}</span>
                <span className={`chip text-[10px] ${DIFF_COLOR[selected.difficulty]}`}>{selected.difficulty}</span>
                <span className="chip text-[10px] border-edge text-slate-500">{selected.topic}</span>
                <span className="chip text-[10px] border-neon-amber/40 text-neon-amber">{selected.xp} XP</span>
                {isDone && <span className="chip text-[10px] border-neon-green/50 text-neon-green">SOLVED ✓</span>}
              </div>
              <h1 className="font-display text-lg font-bold text-slate-100">{selected.title}</h1>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{selected.description}</p>
            </div>
          </div>

          {/* Hints */}
          <div className="mt-3">
            <button
              onClick={() => setShowHints(h => !h)}
              className="flex items-center gap-1.5 text-xs text-neon-amber hover:text-neon-amber/80 transition-colors font-mono"
            >
              <Lightbulb size={13} />
              {showHints ? 'Hide hints' : `Show hints (${selected.hints.length})`}
            </button>
            <AnimatePresence>
              {showHints && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1 overflow-hidden"
                >
                  {selected.hints.map((h, i) => (
                    <li key={i} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-neon-amber shrink-0">{i + 1}.</span> {h}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input payload */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
              <BookOpen size={11} /> Input Payload
              <span className="chip text-[10px] border-edge text-slate-600 ml-1">{selected.inputMimeType}</span>
              <span className="mx-1 text-slate-600">→</span>
              <span className="chip text-[10px] border-edge text-slate-600">{selected.outputMimeType}</span>
            </div>
            <button
              onClick={copyInput}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 bg-raised rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-40">
            {selected.inputPayload}
          </pre>
        </div>

        {/* Editor */}
        <div className="panel p-4 flex-1 min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
              <Code2 size={11} /> Your DataWeave Script
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExpected(e => !e)}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 border border-edge rounded px-2 py-1 transition-colors"
              >
                {showExpected ? <EyeOff size={12} /> : <Eye size={12} />}
                Expected output
              </button>
              <button
                onClick={() => setShowSolution(s => !s)}
                className={`flex items-center gap-1.5 text-xs font-mono border rounded px-2 py-1 transition-colors ${
                  showSolution
                    ? 'border-neon-violet/50 text-neon-violet'
                    : 'border-edge text-slate-500 hover:text-slate-300'
                }`}
              >
                <Eye size={12} />
                {showSolution ? 'Hide solution' : 'Reveal solution'}
              </button>
            </div>
          </div>

          {/* Monaco editor */}
          <div className="rounded-lg overflow-hidden border border-edge" style={{ height: '220px' }}>
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
              }}
            />
          </div>

          {/* Expected output */}
          <AnimatePresence>
            {showExpected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Expected Output</div>
                <pre className="text-xs font-mono text-neon-green/80 bg-raised rounded-lg p-3 overflow-x-auto max-h-40 whitespace-pre-wrap">
                  {selected.expectedOutput}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action bar */}
        <div className="panel p-3 flex items-center justify-between gap-3">
          <button
            onClick={openPlayground}
            className="flex items-center gap-2 text-sm font-mono text-neon-cyan border border-neon-cyan/40 rounded-lg px-4 py-2 hover:bg-neon-cyan/5 transition-all"
          >
            <ExternalLink size={14} />
            Open in MuleSoft Playground
            <span className="text-[10px] text-slate-500">(input copied to clipboard)</span>
          </button>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {xpEarned && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-neon-green font-mono text-sm"
                >
                  <Zap size={14} /> +{xpEarned} XP
                </motion.div>
              )}
            </AnimatePresence>

            {isDone ? (
              <div className="flex items-center gap-1.5 text-neon-green text-sm font-mono">
                <Trophy size={14} /> Solved
              </div>
            ) : (
              <button
                onClick={markDone}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                Mark as Solved (+{selected.xp} XP)
              </button>
            )}
          </div>
        </div>

        {/* Nav between challenges */}
        <div className="flex justify-between pb-2">
          <button
            onClick={() => {
              const idx = filtered.findIndex(c => c.id === selected.id)
              if (idx > 0) selectChallenge(filtered[idx - 1])
            }}
            disabled={filtered.findIndex(c => c.id === selected.id) === 0}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-[10px] font-mono text-slate-600">
            {filtered.findIndex(c => c.id === selected.id) + 1} / {filtered.length}
          </span>
          <button
            onClick={() => {
              const idx = filtered.findIndex(c => c.id === selected.id)
              if (idx < filtered.length - 1) selectChallenge(filtered[idx + 1])
            }}
            disabled={filtered.findIndex(c => c.id === selected.id) === filtered.length - 1}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
