// Street Kid — blue hoodie, backwards cap, attitude
export default function StreetKid({ width = 64, height = 96 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cap brim (backwards) */}
      <rect x="17" y="6" width="30" height="4" rx="2" fill="#1f2937" />
      {/* Cap body */}
      <rect x="19" y="2" width="26" height="12" rx="3" fill="#374151" />
      {/* Head */}
      <rect x="20" y="8" width="24" height="20" rx="3" fill="#fbbf24" />
      {/* Eyes */}
      <rect x="25" y="13" width="5" height="5" rx="1" fill="white" />
      <rect x="34" y="13" width="5" height="5" rx="1" fill="white" />
      <rect x="27" y="15" width="2" height="3" rx="1" fill="#111" />
      <rect x="36" y="15" width="2" height="3" rx="1" fill="#111" />
      {/* Smirk */}
      <rect x="30" y="22" width="8" height="2" rx="1" fill="#111" />
      <rect x="36" y="20" width="2" height="4" rx="1" fill="#111" />
      {/* Neck */}
      <rect x="28" y="28" width="8" height="4" fill="#fbbf24" />
      {/* Hoodie body */}
      <rect x="16" y="32" width="32" height="26" rx="3" fill="#2563eb" />
      {/* Hoodie pocket */}
      <rect x="24" y="44" width="16" height="10" rx="2" fill="#1d4ed8" />
      {/* Left arm */}
      <rect x="4" y="32" width="12" height="7" rx="3" fill="#2563eb" />
      {/* Right arm */}
      <rect x="48" y="32" width="12" height="7" rx="3" fill="#2563eb" />
      {/* Hands */}
      <rect x="2" y="31" width="6" height="9" rx="3" fill="#fbbf24" />
      <rect x="56" y="31" width="6" height="9" rx="3" fill="#fbbf24" />
      {/* Pants */}
      <rect x="18" y="58" width="12" height="22" rx="3" fill="#1f2937" />
      <rect x="34" y="58" width="12" height="22" rx="3" fill="#1f2937" />
      {/* Shoes */}
      <rect x="15" y="76" width="16" height="8" rx="3" fill="#dc2626" />
      <rect x="33" y="76" width="16" height="8" rx="3" fill="#dc2626" />
      {/* Shoe stripe */}
      <rect x="15" y="80" width="16" height="2" fill="white" />
      <rect x="33" y="80" width="16" height="2" fill="white" />
    </svg>
  )
}
