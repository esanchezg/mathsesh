import { useLocation, useNavigate } from 'react-router-dom'
import { useKidProfile } from '../hooks/useKidProfile'
import { getLevelInfo } from '../utils/xp'

const OP_SYMBOLS = { multiply: '×', divide: '÷', add: '+', subtract: '−' }

export default function GameResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useKidProfile()

  const { operation, results = [], sessionXP = 0, coinsEarned = 0 } = location.state ?? {}

  const correct = results.filter(r => r.correct).length
  const accuracy = results.length ? Math.round((correct / results.length) * 100) : 0

  const prevXP = (profile?.total_xp ?? 0) - sessionXP
  const { current: prevLevel } = getLevelInfo(prevXP < 0 ? 0 : prevXP)
  const { current: newLevel } = getLevelInfo(profile?.total_xp ?? 0)
  const leveledUp = newLevel.level > prevLevel.level

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col px-4 pt-10 pb-6 max-w-md mx-auto">
      <h2 className="font-['Barlow_Condensed'] font-black text-5xl text-[#FF5F1F] uppercase mb-6">Session Done</h2>

      {/* XP + Coins earned */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1a1a1a] p-5">
          <div className="font-['Space_Mono'] text-[#888] text-xs mb-1 uppercase tracking-widest">XP Earned</div>
          <div className="font-['Barlow_Condensed'] font-black text-4xl text-[#FFE600]">+{sessionXP}</div>
        </div>
        <div className="bg-[#1a1a1a] p-5">
          <div className="font-['Space_Mono'] text-[#888] text-xs mb-1 uppercase tracking-widest">Coins Earned</div>
          <div className="font-['Barlow_Condensed'] font-black text-4xl text-[#FFE600]">🪙{coinsEarned}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1a1a1a] p-4">
          <div className="font-['Space_Mono'] text-[#888] text-xs mb-1">Accuracy</div>
          <div className="font-['Barlow_Condensed'] font-black text-3xl text-white">{accuracy}%</div>
        </div>
        <div className="bg-[#1a1a1a] p-4">
          <div className="font-['Space_Mono'] text-[#888] text-xs mb-1">Correct</div>
          <div className="font-['Barlow_Condensed'] font-black text-3xl text-white">{correct}/{results.length}</div>
        </div>
      </div>

      {/* Accuracy bonus note */}
      {accuracy >= 80 && (
        <div className="bg-[#1a1a1a] px-4 py-3 mb-4 font-['Space_Mono'] text-[#22c55e] text-xs">
          +3 bonus coins for 80%+ accuracy 🎯
        </div>
      )}

      {/* Level up */}
      {leveledUp && (
        <div className="bg-[#FF5F1F] p-5 mb-4 text-center animate-bounce">
          <div className="font-['Barlow_Condensed'] font-black text-3xl text-black uppercase">LEVEL UP!</div>
          <div className="font-['Space_Mono'] text-black text-sm mt-1">{newLevel.title}</div>
        </div>
      )}

      <div className="flex-1" />

      <div className="space-y-3">
        <button
          onClick={() => navigate('/game')}
          className="w-full bg-[#FFE600] text-black font-['Barlow_Condensed'] font-black text-2xl uppercase tracking-widest py-5 active:scale-95 transition-transform"
        >
          SKATE AGAIN
        </button>
        <button
          onClick={() => navigate('/shop')}
          className="w-full bg-[#1a1a1a] text-[#FFE600] font-['Barlow_Condensed'] font-black text-2xl uppercase tracking-widest py-4 active:scale-95 transition-transform"
        >
          🪙 VISIT SHOP
        </button>
        <button
          onClick={() => navigate('/game')}
          className="w-full bg-[#111] text-[#555] font-['Barlow_Condensed'] font-black text-xl uppercase tracking-widest py-3 active:scale-95 transition-transform"
        >
          GO HOME
        </button>
      </div>
    </div>
  )
}
