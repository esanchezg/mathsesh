// Half Pipe Harry — helmet, knee pads, vert skater
export default function HalfPipeHarry({ width = 64, height = 96 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Helmet */}
      <rect x="17" y="2" width="30" height="20" rx="10" fill="#16a34a" />
      <rect x="14" y="14" width="36" height="6" rx="3" fill="#15803d" />
      {/* Chin strap */}
      <rect x="20" y="18" width="4" height="8" rx="2" fill="#15803d" />
      <rect x="40" y="18" width="4" height="8" rx="2" fill="#15803d" />
      {/* Head */}
      <rect x="20" y="16" width="24" height="16" rx="3" fill="#fed7aa" />
      {/* Eyes */}
      <rect x="24" y="19" width="6" height="6" rx="1" fill="white" />
      <rect x="34" y="19" width="6" height="6" rx="1" fill="white" />
      <rect x="26" y="21" width="3" height="4" rx="1" fill="#111" />
      <rect x="36" y="21" width="3" height="4" rx="1" fill="#111" />
      {/* Goggles strap */}
      <rect x="20" y="19" width="24" height="4" rx="2" fill="#f97316" opacity="0.5" />
      {/* Neck */}
      <rect x="28" y="32" width="8" height="4" fill="#fed7aa" />
      {/* Body — green jersey */}
      <rect x="17" y="36" width="30" height="24" rx="3" fill="#22c55e" />
      {/* Jersey number */}
      <rect x="27" y="40" width="10" height="14" rx="1" fill="#16a34a" />
      <rect x="30" y="42" width="4" height="10" rx="1" fill="#22c55e" />
      {/* Left arm */}
      <rect x="5" y="36" width="12" height="7" rx="3" fill="#22c55e" />
      {/* Right arm */}
      <rect x="47" y="36" width="12" height="7" rx="3" fill="#22c55e" />
      {/* Hands */}
      <rect x="3" y="35" width="6" height="9" rx="3" fill="#fed7aa" />
      <rect x="55" y="35" width="6" height="9" rx="3" fill="#fed7aa" />
      {/* Pants */}
      <rect x="19" y="60" width="11" height="20" rx="3" fill="#1f2937" />
      <rect x="34" y="60" width="11" height="20" rx="3" fill="#1f2937" />
      {/* Knee pads */}
      <rect x="18" y="66" width="13" height="8" rx="3" fill="#f97316" />
      <rect x="33" y="66" width="13" height="8" rx="3" fill="#f97316" />
      {/* Shoes */}
      <rect x="16" y="76" width="15" height="8" rx="3" fill="#111" />
      <rect x="33" y="76" width="15" height="8" rx="3" fill="#111" />
    </svg>
  )
}
