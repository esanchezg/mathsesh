export default function FlamesDeck({ width = 80, height = 190, wheelColor = '#444', truckColor = '#888' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="60" height="150" rx="20" fill="#1a1a1a" />
      <path d="M20 160 Q25 130 20 110 Q30 130 35 110 Q38 135 40 120 Q45 140 42 160Z" fill="#FF5F1F" />
      <path d="M40 160 Q44 135 42 120 Q50 138 48 110 Q55 135 52 110 Q58 130 55 160Z" fill="#FFE600" />
      <path d="M20 160 Q25 140 22 120 Q28 140 32 120 Q34 145 35 160Z" fill="#FFE600" opacity="0.7" />
      <rect x="18" y="12" width="44" height="8" rx="4" fill={truckColor} />
      <rect x="18" y="170" width="44" height="8" rx="4" fill={truckColor} />
      <circle cx="22" cy="12" r="6" fill={wheelColor} />
      <circle cx="58" cy="12" r="6" fill={wheelColor} />
      <circle cx="22" cy="178" r="6" fill={wheelColor} />
      <circle cx="58" cy="178" r="6" fill={wheelColor} />
    </svg>
  )
}
