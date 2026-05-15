// Blocky Roblox-style skater — orange/black, arms out for balance
export default function DefaultCharacter({ width = 64, height = 96 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <rect x="20" y="4" width="24" height="22" rx="3" fill="#FF5F1F" />
      {/* Eyes */}
      <rect x="25" y="10" width="5" height="5" rx="1" fill="white" />
      <rect x="34" y="10" width="5" height="5" rx="1" fill="white" />
      <rect x="27" y="12" width="2" height="3" rx="1" fill="#111" />
      <rect x="36" y="12" width="2" height="3" rx="1" fill="#111" />
      {/* Mouth */}
      <rect x="27" y="20" width="10" height="2" rx="1" fill="#111" />
      {/* Neck */}
      <rect x="28" y="26" width="8" height="4" fill="#FF5F1F" />
      {/* Body */}
      <rect x="18" y="30" width="28" height="26" rx="3" fill="#111" />
      {/* Logo on shirt */}
      <rect x="27" y="36" width="10" height="3" rx="1" fill="#FF5F1F" />
      {/* Left arm (out for balance) */}
      <rect x="4" y="30" width="14" height="7" rx="3" fill="#FF5F1F" />
      {/* Right arm (out for balance) */}
      <rect x="46" y="30" width="14" height="7" rx="3" fill="#FF5F1F" />
      {/* Left hand */}
      <rect x="2" y="29" width="6" height="9" rx="3" fill="#FF5F1F" />
      {/* Right hand */}
      <rect x="56" y="29" width="6" height="9" rx="3" fill="#FF5F1F" />
      {/* Left leg */}
      <rect x="20" y="56" width="10" height="24" rx="3" fill="#333" />
      {/* Right leg */}
      <rect x="34" y="56" width="10" height="24" rx="3" fill="#333" />
      {/* Left shoe */}
      <rect x="17" y="76" width="14" height="8" rx="3" fill="#111" />
      {/* Right shoe */}
      <rect x="33" y="76" width="14" height="8" rx="3" fill="#111" />
    </svg>
  )
}
