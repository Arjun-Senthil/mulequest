import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, DEMO_MODE } from '../lib/supabase'

const AuthContext = createContext(null)

const DEMO_USER = { id: 'demo-user', email: 'demo@mulequest.dev', user_metadata: { name: 'Demo Dev' } }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      // No backend configured — run as local demo user.
      setUser(DEMO_USER)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (DEMO_MODE) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, demoMode: DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
