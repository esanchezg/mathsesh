export default function NeonDeck({ width = 80, height = 190 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="60" height="150" rx="20" fill="#050505" />
      {/* Neon lines */}
      <line x1="10" y1="60" x2="70" y2="60" stroke="#FF5F1F" strokeWidth="2" filter="url(#glow1)" />
      <line x1="10" y1="95" x2="70" y2="95" stroke="#FFE600" strokeWidth="2" filter="url(#glow2)" />
      <line x1="10" y1="130" x2="70" y2="130" stroke="#00ffea" strokeWidth="2" filter="url(#glow3)" />
      <defs>
        <filter id="glow1"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="glow2"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="glow3"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x="18" y="12" width="44" height="8" rx="4" fill="#888" />
      <rect x="18" y="170" width="44" height="8" rx="4" fill="#888" />
      <circle cx="22" cy="12" r="6" fill="#444" />
      <circle cx="58" cy="12" r="6" fill="#444" />
      <circle cx="22" cy="178" r="6" fill="#444" />
      <circle cx="58" cy="178" r="6" fill="#444" />
    </svg>
  )
}
