export default function DefaultDeck({ width = 80, height = 190 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="60" height="150" rx="20" fill="#c8a96e" />
      <rect x="10" y="20" width="60" height="150" rx="20" fill="url(#woodGrain)" opacity="0.4" />
      <line x1="40" y1="20" x2="40" y2="170" stroke="#a07840" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="10" y1="80" x2="70" y2="80" stroke="#a07840" strokeWidth="0.5" />
      <line x1="10" y1="110" x2="70" y2="110" stroke="#a07840" strokeWidth="0.5" />
      {/* Trucks */}
      <rect x="18" y="12" width="44" height="8" rx="4" fill="#888" />
      <rect x="18" y="170" width="44" height="8" rx="4" fill="#888" />
      {/* Wheels */}
      <circle cx="22" cy="12" r="6" fill="#444" />
      <circle cx="58" cy="12" r="6" fill="#444" />
      <circle cx="22" cy="178" r="6" fill="#444" />
      <circle cx="58" cy="178" r="6" fill="#444" />
      <defs>
        <pattern id="woodGrain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="4" y2="2" stroke="#8B6914" strokeWidth="0.5" />
        </pattern>
      </defs>
    </svg>
  )
}
