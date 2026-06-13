import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Lock, Copy, Check, Code2, GitBranch, ShieldAlert, FileCode } from 'lucide-react'
import { INVENTORY_ITEMS } from '../data/inventory'
import { useGame } from '../context/GameContext'

const TYPE_META = {
  'dw-snippet': { label: 'DataWeave', icon: Code2, color: 'text-neon-cyan border-neon-cyan/40' },
  'flow-template': { label: 'Flow Template', icon: GitBranch, color: 'text-neon-violet border-neon-violet/40' },
  'error-pattern': { label: 'Error Pattern', icon: ShieldAlert, color: 'text-neon-red border-neon-red/40' },
  'raml-fragment': { label: 'RAML Fragment', icon: FileCode, color: 'text-neon-green border-neon-green/40' }
}

function ItemCard({ item, unlocked }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const meta = TYPE_META[item.item_type] || TYPE_META['dw-snippet']
  const Icon = meta.icon

  const copy = async () => {
    await navigator.clipboard.writeText(item.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`panel p-4 ${unlocked ? '' : 'opacity-50'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg border shrink-0 ${unlocked ? meta.color : 'border-edge text-slate-600'} bg-void`}>
          {unlocked ? <Icon size={18} /> : <Lock size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-slate-200">{item.title}</span>
            <span className={`chip border-edge text-slate-500`}>{meta.label}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
          {!unlocked && (
            <p className="text-[10px] font-mono text-neon-amber/70 mt-1.5">🔒 unlock: {item.unlock_hint}</p>
          )}
        </div>
        {unlocked && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setOpen((v) => !v)} className="btn-ghost !px-3 !py-1.5 text-[11px]">
              {open ? 'Hide' : 'View'}
            </button>
            <button onClick={copy} className="btn-primary !px-3 !py-1.5 text-[11px] flex items-center gap-1">
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
      {unlocked && open && <pre className="code-block mt-3">{item.content}</pre>}
    </motion.div>
  )
}

export default function InventoryScreen() {
  const { inventory } = useGame()
  const [filter, setFilter] = useState('all')
  const unlockedIds = new Set(inventory.map((i) => i.item_id))

  const types = ['all', ...Object.keys(TYPE_META)]
  const items = INVENTORY_ITEMS.filter((i) => filter === 'all' || i.item_type === filter)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <Package className="text-neon-cyan" size={22} /> INVENTORY
        </h1>
        <p className="text-sm text-slate-500">
          Production-grade reusable assets. Unlock them by clearing quests, bosses, and dungeons — {unlockedIds.size}/{INVENTORY_ITEMS.length} collected.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`chip !px-3 !py-1.5 cursor-pointer transition-all ${
              filter === t ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5' : 'border-edge text-slate-500'
            }`}
          >
            {t === 'all' ? 'All' : TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ItemCard key={item.item_id} item={item} unlocked={unlockedIds.has(item.item_id)} />
        ))}
      </div>
    </div>
  )
}
