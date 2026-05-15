import DefaultDeck from './decks/DefaultDeck'
import FlamesDeck from './decks/FlamesDeck'
import GalaxyDeck from './decks/GalaxyDeck'
import CheckerDeck from './decks/CheckerDeck'
import NeonDeck from './decks/NeonDeck'
import GoldDeck from './decks/GoldDeck'
import { getWheelColor, getTruckColor } from '../utils/shopCatalog'

const DECK_MAP = {
  default: DefaultDeck,
  flames:  FlamesDeck,
  galaxy:  GalaxyDeck,
  checker: CheckerDeck,
  neon:    NeonDeck,
  gold:    GoldDeck,
}

const SIZE_MAP = {
  sm: { width: 60,  height: 140 },
  md: { width: 80,  height: 190 },
  lg: { width: 100, height: 240 },
}

export default function DeckDisplay({ deckId = 'default', wheelsId = 'classic', trucksId = 'steel', size = 'md' }) {
  const Deck = DECK_MAP[deckId] ?? DefaultDeck
  const { width, height } = SIZE_MAP[size]
  return (
    <Deck
      width={width}
      height={height}
      wheelColor={getWheelColor(wheelsId)}
      truckColor={getTruckColor(trucksId)}
    />
  )
}
