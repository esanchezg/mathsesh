export default function GoldDeck({ width = 80, height = 190 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldFoil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="30%" stopColor="#fffacd" />
          <stop offset="60%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
      </defs>
      <rect x="10" y="20" width="60" height="150" rx="20" fill="url(#goldFoil)" />
      {/* Foil sheen lines */}
      <line x1="10" y1="50" x2="70" y2="20" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="90" x2="70" y2="60" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="130" x2="70" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="170" x2="70" y2="140" stroke="white" strokeWidth="0.5" opacity="0.3" />
      {/* Crown */}
      <path d="M30 85 L35 75 L40 85 L45 75 L50 85 L50 100 L30 100 Z" fill="#1a1a1a" opacity="0.6" />
      <rect x="18" y="12" width="44" height="8" rx="4" fill="#b8860b" />
      <rect x="18" y="170" width="44" height="8" rx="4" fill="#b8860b" />
      <circle cx="22" cy="12" r="6" fill="#8B6914" />
      <circle cx="58" cy="12" r="6" fill="#8B6914" />
      <circle cx="22" cy="178" r="6" fill="#8B6914" />
      <circle cx="58" cy="178" r="6" fill="#8B6914" />
    </svg>
  )
}
