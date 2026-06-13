// XP rules and leveling math — single source of truth.

export const XP_RULES = {
  lab: 50,
  quiz: 30,
  side_quest_min: 100,
  side_quest_max: 200,
  boss_fight: 500,
  cert_trial: 1000,
  daily_challenge: 40,
  micro_quest: 60,
  dungeon: 300
}

// Streak multiplier: linear ramp 1.0x → 2.0x over 14 days, capped.
export function streakMultiplier(streakDays) {
  if (!streakDays || streakDays < 1) return 1
  return Math.min(2, 1 + (streakDays / 14))
}

export function applyStreak(baseXp, streakDays) {
  return Math.round(baseXp * streakMultiplier(streakDays))
}

// Level curve: level n requires 500 * n^1.5 cumulative XP (steepens with mastery).
export function levelForXp(xp) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

export function xpForLevel(level) {
  if (level <= 1) return 0
  return Math.round(500 * Math.pow(level - 1, 1.5))
}

export function levelProgress(xp) {
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  return {
    level,
    current: xp - floor,
    needed: ceil - floor,
    pct: Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100))
  }
}

export const LEVEL_TITLES = [
  'Initiate', 'Apprentice', 'Flow Adept', 'Weave Caster', 'Connector Smith',
  'Error Slayer', 'Security Warden', 'Gateway Keeper', 'Runtime Ranger', 'Pipeline Marshal',
  'Pattern Architect', 'Telemetry Sage', 'Integration Oracle', 'Mule Lord', 'Ascended Architect'
]

export function titleForLevel(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}
