export function computeNewStreak(lastSessionDate, currentStreakDays) {
  const today = new Date().toISOString().slice(0, 10)
  if (!lastSessionDate) return 1

  const last = new Date(lastSessionDate)
  const now = new Date(today)
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return currentStreakDays      // already played today
  if (diffDays === 1) return currentStreakDays + 1  // consecutive day
  return 1                                          // streak broken
}
