export default function GalaxyDeck({ width = 80, height = 190, wheelColor = '#444', truckColor = '#888' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="galaxy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d0042" />
          <stop offset="50%" stopColor="#6b21a8" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      <rect x="10" y="20" width="60" height="150" rx="20" fill="url(#galaxy)" />
      {[[20,40],[55,55],[30,90],[65,80],[25,130],[50,110],[38,155],[60,145]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="white" opacity="0.8" />
      ))}
      {[[40,60],[15,100],[70,120],[35,75]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="white" opacity="0.5" />
      ))}
      <rect x="18" y="12" width="44" height="8" rx="4" fill={truckColor} />
      <rect x="18" y="170" width="44" height="8" rx="4" fill={truckColor} />
      <circle cx="22" cy="12" r="6" fill={wheelColor} />
      <circle cx="58" cy="12" r="6" fill={wheelColor} />
      <circle cx="22" cy="178" r="6" fill={wheelColor} />
      <circle cx="58" cy="178" r="6" fill={wheelColor} />
    </svg>
  )
}
