import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode: app runs fully client-side with localStorage persistence when
// Supabase env vars are absent. Lets anyone clone + run without a backend.
export const DEMO_MODE = !url || !anonKey

export const supabase = DEMO_MODE ? null : createClient(url, anonKey)
