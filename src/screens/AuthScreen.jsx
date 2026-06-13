import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setInfo(null); setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, name)
        setInfo('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold tracking-[0.25em] neon-text">MULEQUEST</h1>
          <p className="text-slate-500 font-mono text-xs mt-2">zero → MCIA · gamified MuleSoft mastery</p>
        </div>

        <div className="panel p-6">
          <div className="flex gap-2 mb-6">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg font-display font-semibold text-sm uppercase tracking-wide transition-all ${
                  mode === m
                    ? 'bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan'
                    : 'border border-edge text-slate-500'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="text-xs font-mono text-slate-500">NAME</span>
                <div className="relative mt-1">
                  <User size={15} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full bg-void border border-edge rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-neon-cyan/60 focus:outline-none"
                    placeholder="Integration Dev"
                  />
                </div>
              </label>
            )}
            <label className="block">
              <span className="text-xs font-mono text-slate-500">EMAIL</span>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-void border border-edge rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-neon-cyan/60 focus:outline-none"
                  placeholder="you@company.com"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-mono text-slate-500">PASSWORD</span>
              <div className="relative mt-1">
                <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  className="w-full bg-void border border-edge rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-neon-cyan/60 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && <div className="text-neon-red text-xs font-mono">{error}</div>}
            {info && <div className="text-neon-green text-xs font-mono">{info}</div>}

            <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {mode === 'signin' ? 'Enter the quest' : 'Begin your journey'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-edge" />
            <span className="text-[10px] font-mono text-slate-600">OR</span>
            <div className="flex-1 h-px bg-edge" />
          </div>

          <button onClick={signInWithGoogle} className="btn-ghost w-full">
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  )
}
