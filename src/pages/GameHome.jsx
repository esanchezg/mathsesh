import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useKidProfile } from '../hooks/useKidProfile'
import { getLevelInfo } from '../utils/xp'
import { difficultyLabel } from '../utils/questions'
import XPBar from '../components/XPBar'
import DeckDisplay from '../components/DeckDisplay'

const OPERATIONS = [
  { id: 'multiply', symbol: '×', label: 'Multiply' },
  { id: 'divide',   symbol: '÷', label: 'Divide' },
  { id: 'add',      symbol: '+', label: 'Add' },
  { id: 'subtract', symbol: '−', label: 'Subtract' },
]

const MULTIPLY_DIVIDE = new Set(['multiply', 'divide'])

export default function GameHome() {
  const { signOut } = useAuth()
  const { profile, loading } = useKidProfile()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('multiply')

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0d0d0d] text-[#FF5F1F]">Loading…</div>

  const xp = profile?.total_xp ?? 0
  const { current, next } = getLevelInfo(xp)
  const level = current.level
  const streak = profile?.current_streak_days ?? 0
  const activeDeck = profile?.unlocked_decks?.at(-1) ?? 'default'

  function startSession() {
    navigate('/game/play', { state: { operation: selected, level } })
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col px-4 pt-8 pb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Barlow_Condensed'] text-4xl font-black text-[#FF5F1F] uppercase tracking-tight">MathSesh</h1>
        <button onClick={signOut} className="text-[#555] font-['Space_Mono'] text-xs hover:text-white">OUT</button>
      </div>

      {/* Level / XP */}
      <div className="bg-[#1a1a1a] p-4 mb-4">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-['Barlow_Condensed'] text-3xl font-black text-white uppercase">{current.title}</span>
          <span className="font-['Space_Mono'] text-[#FF5F1F] text-sm">LVL {level}</span>
        </div>
        <XPBar xp={xp} current={current} next={next} />
        <div className="flex gap-4 mt-3">
          <span className="font-['Space_Mono'] text-xs text-[#888]">{xp} XP</span>
          {streak > 0 && (
            <span className="font-['Space_Mono'] text-xs text-[#FFE600]">🔥 {streak} day streak</span>
          )}
        </div>
      </div>

      {/* Deck */}
      <div className="flex justify-center mb-6">
        <DeckDisplay deckId={activeDeck} size="md" />
      </div>

      {/* Operation selector */}
      <div className="grid grid-cols-4 gap-2 mb-1">
        {OPERATIONS.map(op => (
          <button
            key={op.id}
            onClick={() => setSelected(op.id)}
            className={`py-5 font-['Barlow_Condensed'] font-black text-4xl transition-colors ${
              selected === op.id
                ? 'bg-[#FF5F1F] text-black'
                : 'bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#242424]'
            }`}
          >
            {op.symbol}
          </button>
        ))}
      </div>

      {/* Difficulty label for multiply/divide */}
      <div className="h-6 mb-4 flex items-center justify-center">
        {MULTIPLY_DIVIDE.has(selected) && (
          <span className="font-['Space_Mono'] text-xs text-[#555]">
            difficulty: {difficultyLabel(level)}
          </span>
        )}
      </div>

      <button
        onClick={startSession}
        className="w-full bg-[#FFE600] text-black font-['Barlow_Condensed'] font-black text-3xl uppercase tracking-widest py-5 active:scale-95 transition-transform"
      >
        DROP IN
      </button>
    </div>
  )
}
