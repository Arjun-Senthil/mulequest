// Data access layer. Real implementation uses Supabase; DEMO_MODE falls back
// to localStorage so the app is runnable without a backend.
import { supabase, DEMO_MODE } from './supabase'

const LS_KEY = 'mulequest_demo_state'

function demoState() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {}
  } catch {
    return {}
  }
}
function saveDemo(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}
function demoDefaults() {
  return {
    profile: { name: 'Demo Dev', level: 1, xp: 0, streak: 0, last_active: null, badges: [] },
    progress: [],
    performance_log: [],
    ai_diagnoses: [],
    inventory: [],
    cert_trials: []
  }
}

export const db = {
  // ---------- profile ----------
  async getProfile(userId) {
    if (DEMO_MODE) {
      const s = demoState()
      if (!s.profile) {
        const d = demoDefaults()
        saveDemo(d)
        return d.profile
      }
      return s.profile
    }
    const { data, error } = await supabase
      .from('profiles').select('*').eq('user_id', userId).single()
    if (error) throw error
    return data
  },

  async updateProfile(userId, patch) {
    if (DEMO_MODE) {
      const s = { ...demoDefaults(), ...demoState() }
      s.profile = { ...s.profile, ...patch }
      saveDemo(s)
      return s.profile
    }
    const { data, error } = await supabase
      .from('profiles').update(patch).eq('user_id', userId).select().single()
    if (error) throw error
    return data
  },

  // ---------- progress ----------
  async getProgress(userId) {
    if (DEMO_MODE) return demoState().progress || []
    const { data, error } = await supabase
      .from('progress').select('*').eq('user_id', userId)
    if (error) throw error
    return data
  },

  async upsertProgress(userId, { chapter_id, quest_id, status }) {
    const row = {
      user_id: userId, chapter_id, quest_id, status,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }
    if (DEMO_MODE) {
      const s = { ...demoDefaults(), ...demoState() }
      s.progress = (s.progress || []).filter((p) => p.quest_id !== quest_id)
      s.progress.push(row)
      saveDemo(s)
      return row
    }
    const { data, error } = await supabase
      .from('progress').upsert(row, { onConflict: 'user_id,quest_id' }).select().single()
    if (error) throw error
    return data
  },

  // ---------- performance ----------
  async logPerformance(userId, entry) {
    const row = { user_id: userId, ...entry, logged_at: new Date().toISOString() }
    if (DEMO_MODE) {
      const s = { ...demoDefaults(), ...demoState() }
      s.performance_log = [...(s.performance_log || []), row].slice(-500)
      saveDemo(s)
      return row
    }
    const { data, error } = await supabase
      .from('performance_log').insert(row).select().single()
    if (error) throw error
    return data
  },

  async getPerformance(userId, limit = 100) {
    if (DEMO_MODE) return (demoState().performance_log || []).slice(-limit).reverse()
    const { data, error } = await supabase
      .from('performance_log').select('*')
      .eq('user_id', userId).order('logged_at', { ascending: false }).limit(limit)
    if (error) throw error
    return data
  },

  // ---------- AI diagnoses ----------
  async saveDiagnosis(userId, diag) {
    const row = { user_id: userId, ...diag, created_at: new Date().toISOString() }
    if (DEMO_MODE) {
      const s = { ...demoDefaults(), ...demoState() }
      s.ai_diagnoses = [...(s.ai_diagnoses || []), row].slice(-50)
      saveDemo(s)
      return row
    }
    const { data, error } = await supabase
      .from('ai_diagnoses').insert(row).select().single()
    if (error) throw error
    return data
  },

  async getLatestDiagnosis(userId) {
    if (DEMO_MODE) {
      const list = demoState().ai_diagnoses || []
      return list[list.length - 1] || null
    }
    const { data, error } = await supabase
      .from('ai_diagnoses').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  // ---------- inventory ----------
  async getInventory(userId) {
    if (DEMO_MODE) return demoState().inventory || []
    const { data, error } = await supabase
      .from('inventory').select('*').eq('user_id', userId)
    if (error) throw error
    return data
  },

  async unlockItem(userId, item_id, item_type) {
    const row = { user_id: userId, item_id, item_type, unlocked_at: new Date().toISOString() }
    if (DEMO_MODE) {
      const s = { ...demoDefaults(), ...demoState() }
      if (!(s.inventory || []).some((i) => i.item_id === item_id)) {
        s.inventory = [...(s.inventory || []), row]
        saveDemo(s)
      }
      return row
    }
    const { data, error } = await supabase
      .from('inventory').upsert(row, { onConflict: 'user_id,item_id' }).select().single()
    if (error) throw error
    return data
  },

  // ---------- cert trials ----------
  async saveCertTrial(userId, trial) {
    const row = { user_id: userId, ...trial, attempted_at: new Date().toISOString() }
    if (DEMO_MODE) {
      const s = { ...demoDefaults(), ...demoState() }
      s.cert_trials = [...(s.cert_trials || []), row]
      saveDemo(s)
      return row
    }
    const { data, error } = await supabase
      .from('cert_trials').insert(row).select().single()
    if (error) throw error
    return data
  },

  async getCertTrials(userId) {
    if (DEMO_MODE) return demoState().cert_trials || []
    const { data, error } = await supabase
      .from('cert_trials').select('*')
      .eq('user_id', userId).order('attempted_at', { ascending: false })
    if (error) throw error
    return data
  }
}
