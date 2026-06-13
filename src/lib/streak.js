// Streak logic. A streak survives if user was active today or yesterday.

function dayString(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function computeStreakUpdate(lastActive, currentStreak) {
  const today = dayString()
  if (lastActive === today) {
    return { streak: currentStreak || 1, last_active: today, changed: false }
  }
  const yesterday = dayString(new Date(Date.now() - 86400000))
  if (lastActive === yesterday) {
    return { streak: (currentStreak || 0) + 1, last_active: today, changed: true }
  }
  // Streak broken (or first ever activity)
  return { streak: 1, last_active: today, changed: true }
}
