import DefaultCharacter from './characters/DefaultCharacter'
import StreetKid from './characters/StreetKid'
import HalfPipeHarry from './characters/HalfPipeHarry'
import ProSkater from './characters/ProSkater'

const CHARACTER_MAP = {
  default:  DefaultCharacter,
  street:   StreetKid,
  halfpipe: HalfPipeHarry,
  pro:      ProSkater,
}

export default function CharacterDisplay({ characterId = 'default', width = 64, height = 96 }) {
  const Character = CHARACTER_MAP[characterId] ?? DefaultCharacter
  return <Character width={width} height={height} />
}
