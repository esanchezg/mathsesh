function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Returns [maxA, maxB] for multiply/divide based on current level
function multiplyRange(level) {
  if (level <= 1) return [5, 9]   // max answer 45
  if (level <= 2) return [7, 7]   // max answer 49
  if (level <= 3) return [9, 9]   // max answer 81
  if (level <= 4) return [10, 10] // max answer 100
  return [12, 12]                 // max answer 144
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
  // subtract — no negatives
  const a = randInt(1, 20)
  const b = randInt(1, a)
  return { a, b, answer: a - b }
}

function operationSymbol(op) {
  return { multiply: '×', divide: '÷', add: '+', subtract: '−' }[op]
}

export function buildQuestion(operation, level = 1) {
  const { a, b, answer } = generateRaw(operation, level)
  return { operandA: a, operandB: b, answer, operation, symbol: operationSymbol(operation) }
}

export function buildWeightedQuestion(operation, weakFacts, level = 1) {
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
  for (let i = 0; i < count; i++) {
    questions.push(buildWeightedQuestion(operation, weakFacts, level))
  }
  return questions
}

export const DIFFICULTY_LABEL = {
  1: 'up to ×5',
  2: 'up to ×7',
  3: 'up to ×9',
  4: 'up to ×10',
  5: 'up to ×12',
}

export function difficultyLabel(level) {
  if (level <= 1) return 'up to ×5'
  if (level <= 2) return 'up to ×7'
  if (level <= 3) return 'up to ×9'
  if (level <= 4) return 'up to ×10'
  return 'up to ×12'
}
