import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKidProfile } from '../hooks/useKidProfile'
import { useShop } from '../hooks/useShop'
import { SHOP_CATALOG, CATEGORY_LABELS } from '../utils/shopCatalog'
import DeckDisplay from '../components/DeckDisplay'
import CharacterDisplay from '../components/CharacterDisplay'

const CATEGORIES = ['board', 'wheels', 'trucks', 'character']

function ItemPreview({ category, itemId, equipped, wheels, trucks }) {
  if (category === 'board') {
    return (
      <DeckDisplay
        deckId={itemId}
        wheelsId={equipped?.wheels ?? wheels ?? 'classic'}
        trucksId={equipped?.trucks ?? trucks ?? 'steel'}
        size="sm"
      />
    )
  }
  if (category === 'character') {
    return <CharacterDisplay characterId={itemId} width={48} height={72} />
  }
  if (category === 'wheels') {
    return (
      <DeckDisplay deckId="default" wheelsId={itemId} trucksId="steel" size="sm" />
    )
  }
  // trucks
  return (
    <DeckDisplay deckId="default" wheelsId="classic" trucksId={itemId} size="sm" />
  )
}

export default function Shop() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading, refresh } = useKidProfile()
  const { owned, isOwned, purchase, equip, loading: shopLoading } = useShop()
  const [activeTab, setActiveTab] = useState('board')
  const [feedback, setFeedback] = useState(null)
  const [purchasing, setPurchasing] = useState(null)
  const [equipping, setEquipping] = useState(null)

  if (profileLoading || shopLoading) {
    return <div className="flex items-center justify-center h-screen bg-[#0d0d0d] text-[#FF5F1F]">Loading…</div>
  }

  const coins = profile?.coins ?? 0
  const equipped = {
    board:     profile?.equipped_board ?? 'default',
    wheels:    profile?.equipped_wheels ?? 'classic',
    trucks:    profile?.equipped_trucks ?? 'steel',
    character: profile?.equipped_character ?? 'default',
  }

  async function handlePurchase(item) {
    setPurchasing(item.id)
    const result = await purchase(item)
    if (result?.success) {
      setFeedback({ type: 'success', msg: `${item.name} purchased!` })
      await refresh()
    } else if (result?.error === 'insufficient_coins') {
      setFeedback({ type: 'error', msg: 'Not enough coins' })
      await refresh()
    } else if (result?.error === 'already_owned') {
      setFeedback({ type: 'error', msg: 'You already own this!' })
      await refresh()
    } else {
      setFeedback({ type: 'error', msg: result?.detail ?? `Purchase failed — try again` })
      console.error('purchase failed:', result)
      await refresh()
    }
    setPurchasing(null)
    setTimeout(() => setFeedback(null), 2000)
  }

  async function handleEquip(item) {
    setEquipping(item.id)
    await equip(item)
    await refresh()
    setEquipping(null)
  }

  const items = SHOP_CATALOG[activeTab] ?? []

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3">
        <button onClick={() => navigate('/game')} className="text-[#555] font-['Space_Mono'] text-xs hover:text-white">← BACK</button>
        <h1 className="font-['Barlow_Condensed'] font-black text-3xl text-[#FF5F1F] uppercase">Skate Shop</h1>
        <div className="flex items-center gap-1">
          <span className="text-lg">🪙</span>
          <span className="font-['Space_Mono'] font-bold text-[#FFE600] text-sm">{coins}</span>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`mx-4 mb-2 py-2 px-4 font-['Space_Mono'] text-xs text-center ${
          feedback.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-900 text-red-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Category tabs */}
      <div className="grid grid-cols-4 gap-1 px-4 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`py-2 font-['Barlow_Condensed'] font-black text-sm uppercase transition-colors ${
              activeTab === cat ? 'bg-[#FF5F1F] text-black' : 'bg-[#1a1a1a] text-[#555]'
            }`}
          >
            {CATEGORY_LABELS[cat].slice(0, cat === 'character' ? 4 : 99)}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => {
            const itemWithCategory = { ...item, category: activeTab }
            const owned = isOwned(item.id, activeTab)
            const isEquipped = equipped[activeTab] === item.id
            const canAfford = coins >= item.price

            return (
              <div
                key={item.id}
                className={`bg-[#1a1a1a] p-3 flex flex-col items-center gap-2 ${
                  isEquipped ? 'ring-2 ring-[#FF5F1F]' : ''
                }`}
              >
                <div className="flex items-center justify-center h-[100px]">
                  <ItemPreview
                    category={activeTab}
                    itemId={item.id}
                    equipped={equipped}
                    wheels={equipped.wheels}
                    trucks={equipped.trucks}
                  />
                </div>

                <div className="text-center">
                  <div className="font-['Barlow_Condensed'] font-black text-white text-sm uppercase leading-tight">
                    {item.name}
                  </div>
                  <div className="font-['Space_Mono'] text-[#555] text-xs mt-0.5">
                    {item.description}
                  </div>
                </div>

                {isEquipped ? (
                  <div className="w-full py-2 bg-[#FF5F1F] text-black font-['Barlow_Condensed'] font-black text-sm uppercase text-center">
                    EQUIPPED
                  </div>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(itemWithCategory)}
                    disabled={equipping === item.id}
                    className="w-full py-2 bg-[#242424] text-white font-['Barlow_Condensed'] font-black text-sm uppercase hover:bg-[#333] transition-colors"
                  >
                    {equipping === item.id ? '…' : 'EQUIP'}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(itemWithCategory)}
                    disabled={!canAfford || purchasing === item.id}
                    className={`w-full py-2 font-['Barlow_Condensed'] font-black text-sm uppercase transition-colors ${
                      canAfford
                        ? 'bg-[#FFE600] text-black hover:bg-yellow-300'
                        : 'bg-[#1a1a1a] text-[#444] border border-[#333]'
                    }`}
                  >
                    {purchasing === item.id ? '…' : (
                      <span className="flex items-center justify-center gap-1">
                        🪙 {item.price}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
