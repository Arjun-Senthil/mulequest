import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Map, Package, User, Swords, Menu, X, LogOut, Bot, Code2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import AIAdvisorPanel from './AIAdvisorPanel'
import XPBar from '../XPBar'
import StreakBadge from '../StreakBadge'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/map', label: 'World Map', icon: Map },
  { to: '/dojo', label: 'DW Dojo', icon: Code2 },
  { to: '/dungeons', label: 'Dungeons', icon: Swords },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/profile', label: 'Profile', icon: User }
]

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 32, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="toast-popup"
        >
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AppLayout() {
  const { signOut, demoMode } = useAuth()
  const { profile, toast } = useGame()
  const [navOpen, setNavOpen] = useState(false)
  const [advisorOpen, setAdvisorOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ===== Left nav (desktop) ===== */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r-2 border-edge bg-panel/90 backdrop-blur overflow-y-auto">
        <div className="px-5 py-6">
          <div className="logo-text">MULEQUEST</div>
          <div className="text-[9px] font-mono text-ink-400 mt-2 tracking-widest uppercase">zero → MCIA · v1.0</div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t-2 border-edge">
          {!demoMode && (
            <button onClick={signOut} className="flex items-center gap-2 text-ink-400 hover:text-ink-100 text-sm font-display font-bold transition-colors">
              <LogOut size={15} /> Sign out
            </button>
          )}
          {demoMode && <div className="text-[9px] font-mono text-neon-amber/70 tracking-widest uppercase">Demo Mode</div>}
        </div>
      </aside>

      {/* ===== Main column ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 lg:px-6 py-3 border-b-2 border-edge glass">
          <button className="lg:hidden text-ink-300 hover:text-ink-100 transition-colors" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div className="lg:hidden logo-text" style={{fontSize:'9px'}}>MULEQUEST</div>
          <div className="flex-1 max-w-md hidden sm:block">
            <XPBar />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <StreakBadge streak={profile?.streak || 0} />
            <button
              onClick={() => setAdvisorOpen((v) => !v)}
              className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-violet/40 text-neon-violet text-xs font-display font-semibold"
            >
              <Bot size={14} /> ADVISOR
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
            <div className="sm:hidden mb-4"><XPBar /></div>
            <Outlet />
          </main>

          {/* ===== AI Advisor (desktop persistent) ===== */}
          <aside className="hidden xl:block w-80 shrink-0 border-l border-edge bg-panel/50 p-4 overflow-y-auto">
            <AIAdvisorPanel />
          </aside>
        </div>
      </div>

      {/* ===== Mobile nav drawer ===== */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-panel border-r border-edge p-4 lg:hidden"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="logo-text" style={{fontSize:'9px'}}>MULEQUEST</div>
                <button onClick={() => setNavOpen(false)} className="text-ink-400 hover:text-ink-100"><X size={18} /></button>
              </div>
              <nav className="space-y-1">
                {NAV.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to} to={to} end={end} onClick={() => setNavOpen(false)}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    <Icon size={16} /> {label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== Mobile advisor drawer ===== */}
      <AnimatePresence>
        {advisorOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 xl:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAdvisorOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm z-50 bg-panel border-l border-edge p-4 overflow-y-auto xl:hidden"
              initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <div className="flex justify-end mb-2">
                <button onClick={() => setAdvisorOpen(false)} className="text-slate-400"><X size={18} /></button>
              </div>
              <AIAdvisorPanel />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Toast toast={toast} />
    </div>
  )
}
