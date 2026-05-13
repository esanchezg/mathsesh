export const LEVELS = [
  { level: 1, xp: 0,    title: 'Beginner' },
  { level: 2, xp: 200,  title: 'Poser' },
  { level: 3, xp: 500,  title: 'Street Rat' },
  { level: 4, xp: 1000, title: 'Park Regular' },
  { level: 5, xp: 2000, title: 'Tech Skater' },
  { level: 6, xp: 3500, title: 'Sponsored' },
  { level: 7, xp: 5500, title: 'Pro' },
  { level: 8, xp: 8000, title: 'Legend' },
]

export const COMBOS = [
  { streak: 10, name: '900',      multiplier: 3.0 },
  { streak: 6,  name: 'Heelflip', multiplier: 2.0 },
  { streak: 3,  name: 'Kickflip', multiplier: 1.5 },
]

export function getLevelInfo(totalXp) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xp) {
      current = LEVELS[i]
      next = LEVELS[i + 1] ?? null
      break
    }
  }
  return { current, next }
}

export function getCombo(streak) {
  return COMBOS.find(c => streak >= c.streak) ?? null
}

export function calcXP(correct, responseTimeMs, streak) {
  if (!correct) return 0
  let base = 10
  let speedBonus = 0
  if (responseTimeMs < 3000) speedBonus = 5
  else if (responseTimeMs < 5000) speedBonus = 2

  const combo = getCombo(streak)
  const multiplier = combo ? combo.multiplier : 1

  return Math.round((base + speedBonus) * multiplier)
}
