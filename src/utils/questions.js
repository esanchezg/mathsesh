const MAX_FACT_REPEATS = 2

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function multiplyRange(level) {
  if (level <= 1) return [5, 9]
  if (level <= 2) return [7, 7]
  if (level <= 3) return [9, 9]
  if (level <= 4) return [10, 10]
  return [12, 12]
}

function factKey(a, b) {
  return `${a}:${b}`
}

function generateRaw(operation, level = 1) {
  if (operation === 'multiply') {
    const [maxA, maxB] = multiplyRange(level)
    const a = randInt(1, maxA)
    const b = randInt(1, maxB)
    return { a, b, answer: a * b }
  }
  if (operation === 'divide') {
    const [maxA, maxB] = multiplyRange(level)
    const b = randInt(1, maxB)
    const answer = randInt(1, maxA)
    return { a: answer * b, b, answer }
  }
  if (operation === 'add') {
    const a = randInt(1, 20)
    const b = randInt(1, 20)
    return { a, b, answer: a + b }
  }
  const a = randInt(1, 20)
  const b = randInt(1, a)
  return { a, b, answer: a - b }
}

function operationSymbol(op) {
  return { multiply: '×', divide: '÷', add: '+', subtract: '−' }[op]
}

function buildQuestion(operation, level = 1) {
  const { a, b, answer } = generateRaw(operation, level)
  return { operandA: a, operandB: b, answer, operation, symbol: operationSymbol(operation) }
}

function buildWeightedQuestion(operation, weakFacts, level = 1) {
  const weakSet = weakFacts.filter(f => f.operation === operation)
  if (weakSet.length === 0 || Math.random() > 0.6) {
    return buildQuestion(operation, level)
  }
  const fact = weakSet[Math.floor(Math.random() * weakSet.length)]
  return {
    operandA: fact.operand_a,
    operandB: fact.operand_b,
    answer: fact.answer,
    operation,
    symbol: operationSymbol(operation),
  }
}

export function generateSession(operation, weakFacts = [], level = 1, count = 20) {
  const questions = []
  const factCounts = {}   // how many times each fact has appeared
  let lastKey = null
  let attempts = 0
  const maxAttempts = count * 10

  while (questions.length < count && attempts < maxAttempts) {
    attempts++
    const q = buildWeightedQuestion(operation, weakFacts, level)
    const key = factKey(q.operandA, q.operandB)

    // Skip if same as previous question
    if (key === lastKey) continue

    // Skip if this fact has already hit the repeat cap
    if ((factCounts[key] ?? 0) >= MAX_FACT_REPEATS) continue

    factCounts[key] = (factCounts[key] ?? 0) + 1
    lastKey = key
    questions.push(q)
  }

  // If we exhausted attempts (very small fact pool), fill remaining without caps
  while (questions.length < count) {
    const q = buildQuestion(operation, level)
    const key = factKey(q.operandA, q.operandB)
    if (key !== lastKey) {
      lastKey = key
      questions.push(q)
    }
  }

  return questions
}

export function difficultyLabel(level) {
  if (level <= 1) return 'up to ×5'
  if (level <= 2) return 'up to ×7'
  if (level <= 3) return 'up to ×9'
  if (level <= 4) return 'up to ×10'
  return 'up to ×12'
}
