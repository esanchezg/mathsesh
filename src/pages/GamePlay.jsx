import { useEffect, useReducer, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSessionData } from '../hooks/useSessionData'
import { generateSession } from '../utils/questions'
import { calcXP, getCombo } from '../utils/xp'
import NumberPad from '../components/NumberPad'
import TimerBar from '../components/TimerBar'
import ComboPopup from '../components/ComboPopup'

const QUESTION_TIME_MS = 20000
const SESSION_SIZE = 20

const initialState = {
  questions: [],
  currentIndex: 0,
  input: '',
  results: [],
  streak: 0,
  sessionXP: 0,
  phase: 'loading', // loading | playing | feedback | done
  feedbackCorrect: null,
  correctAnswer: null,
  startedAt: null,
  questionStartedAt: null,
  comboPopup: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        questions: action.questions,
        phase: 'playing',
        startedAt: action.now,
        questionStartedAt: action.now,
      }
    case 'KEY': {
      if (state.phase !== 'playing') return state
      const next = state.input.length < 4 ? state.input + action.digit : state.input
      return { ...state, input: next }
    }
    case 'BACKSPACE':
      return { ...state, input: state.input.slice(0, -1) }
    case 'SUBMIT': {
      const q = state.questions[state.currentIndex]
      const responseMs = action.now - state.questionStartedAt
      const correct = parseInt(state.input, 10) === q.answer
      const newStreak = correct ? state.streak + 1 : 0
      const xp = calcXP(correct, responseMs, newStreak)
      const combo = correct ? getCombo(newStreak) : null

      const result = {
        operandA: q.operandA,
        operandB: q.operandB,
        correct,
        responseTimeMs: responseMs,
        answeredAt: new Date(action.now).toISOString(),
      }

      return {
        ...state,
        results: [...state.results, result],
        streak: newStreak,
        sessionXP: state.sessionXP + xp,
        phase: 'feedback',
        feedbackCorrect: correct,
        correctAnswer: q.answer,
        comboPopup: combo,
        input: '',
      }
    }
    case 'TIMEOUT': {
      const q = state.questions[state.currentIndex]
      const result = {
        operandA: q.operandA,
        operandB: q.operandB,
        correct: false,
        responseTimeMs: QUESTION_TIME_MS,
        answeredAt: new Date(action.now).toISOString(),
      }
      return {
        ...state,
        results: [...state.results, result],
        streak: 0,
        phase: 'feedback',
        feedbackCorrect: false,
        correctAnswer: q.answer,
        comboPopup: null,
        input: '',
      }
    }
    case 'NEXT': {
      const nextIndex = state.currentIndex + 1
      if (nextIndex >= SESSION_SIZE) {
        return { ...state, phase: 'done' }
      }
      return {
        ...state,
        currentIndex: nextIndex,
        phase: 'playing',
        feedbackCorrect: null,
        correctAnswer: null,
        comboPopup: null,
        questionStartedAt: action.now,
      }
    }
    default:
      return state
  }
}

export default function GamePlay() {
  const location = useLocation()
  const navigate = useNavigate()
  const { fetchWeakFacts, saveSession } = useSessionData()
  const operation = location.state?.operation ?? 'multiply'
  const level = location.state?.level ?? 1

  const [state, dispatch] = useReducer(reducer, initialState)
  const timerRef = useRef(null)
  const feedbackTimerRef = useRef(null)

  const clearTimers = useCallback(() => {
    clearTimeout(timerRef.current)
    clearTimeout(feedbackTimerRef.current)
  }, [])

  // Initialize session
  useEffect(() => {
    async function init() {
      const weakFacts = await fetchWeakFacts(operation)
      const questions = generateSession(operation, weakFacts, level, SESSION_SIZE)
      dispatch({ type: 'START', questions, now: Date.now() })
    }
    init()
    return clearTimers
  }, [])

  // Question timer
  useEffect(() => {
    if (state.phase !== 'playing') return
    timerRef.current = setTimeout(() => {
      dispatch({ type: 'TIMEOUT', now: Date.now() })
    }, QUESTION_TIME_MS)
    return () => clearTimeout(timerRef.current)
  }, [state.phase, state.currentIndex])

  // Auto-advance after feedback
  useEffect(() => {
    if (state.phase !== 'feedback') return
    const delay = state.feedbackCorrect ? 700 : 1200
    feedbackTimerRef.current = setTimeout(() => {
      dispatch({ type: 'NEXT', now: Date.now() })
    }, delay)
    return () => clearTimeout(feedbackTimerRef.current)
  }, [state.phase, state.currentIndex])

  // Session complete → save and navigate
  useEffect(() => {
    if (state.phase !== 'done') return
    async function finish() {
      let coinsEarned = 0
      try {
        const saved = await saveSession({
          operation,
          startedAt: new Date(state.startedAt).toISOString(),
          endedAt: new Date().toISOString(),
          results: state.results,
          xpEarned: state.sessionXP,
        })
        coinsEarned = saved.coinsEarned
      } catch (e) {
        console.error('Failed to save session', e)
      }
      navigate('/game/results', {
        state: {
          operation,
          results: state.results,
          coinsEarned,
          sessionXP: state.sessionXP,
        },
      })
    }
    finish()
  }, [state.phase])

  function handleKey(digit) {
    dispatch({ type: 'KEY', digit })
  }

  function handleBackspace() {
    dispatch({ type: 'BACKSPACE' })
  }

  function handleSubmit() {
    if (state.input === '' || state.phase !== 'playing') return
    clearTimeout(timerRef.current)
    dispatch({ type: 'SUBMIT', now: Date.now() })
  }

  if (state.phase === 'loading') {
    return <div className="flex items-center justify-center h-screen bg-[#0d0d0d] text-[#FF5F1F]">Generating…</div>
  }

  const q = state.questions[state.currentIndex]
  const correct = state.results.filter(r => r.correct).length
  const total = state.results.length

  const feedbackClass = state.phase === 'feedback'
    ? state.feedbackCorrect
      ? 'animate-bounce'
      : 'animate-[shake_0.3s_ease-in-out]'
    : ''

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-['Space_Mono'] text-[#888] text-xs">{state.currentIndex + 1}/{SESSION_SIZE}</span>
        <span className="font-['Space_Mono'] text-[#FFE600] text-sm">{correct}/{total} correct</span>
        {state.streak >= 3 && (
          <span className="font-['Barlow_Condensed'] font-black text-[#FF5F1F] text-sm uppercase">
            {state.streak}× STREAK
          </span>
        )}
      </div>

      <TimerBar active={state.phase === 'playing'} durationMs={QUESTION_TIME_MS} key={`${state.currentIndex}-${state.phase}`} />

      {/* Question */}
      <div className={`flex-1 flex flex-col items-center justify-center ${feedbackClass}`}>
        <div className="font-['Barlow_Condensed'] font-black text-white text-center leading-none">
          <span className="text-[80px] block">{q.operandA} {q.symbol} {q.operandB}</span>
          <span className="text-[60px] block mt-2">=</span>
        </div>

        {/* Input display */}
        <div className="mt-4 min-h-[72px] flex items-center justify-center">
          {state.phase === 'feedback' ? (
            <div className={`font-['Space_Mono'] font-bold text-5xl ${state.feedbackCorrect ? 'text-green-400' : 'text-red-500'}`}>
              {state.feedbackCorrect ? '✓' : `✗ ${state.correctAnswer}`}
            </div>
          ) : (
            <div className="font-['Space_Mono'] font-bold text-5xl text-[#FFE600] min-w-[2ch] text-center border-b-2 border-[#FFE600] px-2">
              {state.input || '\u00A0'}
            </div>
          )}
        </div>

        {state.comboPopup && (
          <ComboPopup combo={state.comboPopup} />
        )}
      </div>

      {/* Number pad */}
      <div className="px-2 pb-4">
        <NumberPad onKey={handleKey} onBackspace={handleBackspace} onSubmit={handleSubmit} disabled={state.phase !== 'playing'} />
      </div>
    </div>
  )
}
