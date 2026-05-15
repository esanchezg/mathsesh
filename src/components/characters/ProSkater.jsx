// Pro Skater — gold trim, sunglasses, sponsored
export default function ProSkater({ width = 64, height = 96 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hair */}
      <rect x="18" y="2" width="28" height="10" rx="5" fill="#1f2937" />
      {/* Head */}
      <rect x="20" y="6" width="24" height="22" rx="3" fill="#fcd34d" />
      {/* Sunglasses frame */}
      <rect x="22" y="11" width="8" height="6" rx="2" fill="#111" />
      <rect x="34" y="11" width="8" height="6" rx="2" fill="#111" />
      <rect x="29" y="13" width="6" height="2" fill="#111" />
      {/* Sunglass shine */}
      <rect x="23" y="12" width="3" height="2" rx="1" fill="#374151" />
      <rect x="35" y="12" width="3" height="2" rx="1" fill="#374151" />
      {/* Smug smile */}
      <rect x="26" y="22" width="12" height="2" rx="1" fill="#111" />
      <rect x="36" y="20" width="2" height="4" rx="1" fill="#111" />
      {/* Neck */}
      <rect x="28" y="28" width="8" height="4" fill="#fcd34d" />
      {/* Pro jersey — black with gold */}
      <rect x="16" y="32" width="32" height="26" rx="3" fill="#111" />
      {/* Gold trim */}
      <rect x="16" y="32" width="32" height="4" rx="2" fill="#b8860b" />
      <rect x="16" y="54" width="32" height="4" rx="2" fill="#b8860b" />
      <rect x="16" y="32" width="4" height="26" rx="2" fill="#b8860b" />
      <rect x="44" y="32" width="4" height="26" rx="2" fill="#b8860b" />
      {/* Star logo */}
      <polygon points="32,38 33.5,42.5 38,42.5 34.5,45 35.8,49.5 32,47 28.2,49.5 29.5,45 26,42.5 30.5,42.5" fill="#FFE600" />
      {/* Arms */}
      <rect x="4" y="32" width="12" height="7" rx="3" fill="#111" />
      <rect x="48" y="32" width="12" height="7" rx="3" fill="#111" />
      <rect x="4" y="32" width="12" height="3" rx="2" fill="#b8860b" />
      <rect x="48" y="32" width="12" height="3" rx="2" fill="#b8860b" />
      {/* Hands */}
      <rect x="2" y="31" width="6" height="9" rx="3" fill="#fcd34d" />
      <rect x="56" y="31" width="6" height="9" rx="3" fill="#fcd34d" />
      {/* Pants — gold */}
      <rect x="19" y="58" width="11" height="22" rx="3" fill="#b8860b" />
      <rect x="34" y="58" width="11" height="22" rx="3" fill="#b8860b" />
      {/* Shoes — gold */}
      <rect x="16" y="76" width="15" height="8" rx="3" fill="#b8860b" />
      <rect x="33" y="76" width="15" height="8" rx="3" fill="#b8860b" />
      {/* Shoe shine */}
      <rect x="17" y="77" width="5" height="3" rx="1" fill="#ffd700" opacity="0.6" />
      <rect x="34" y="77" width="5" height="3" rx="1" fill="#ffd700" opacity="0.6" />
    </svg>
  )
}
