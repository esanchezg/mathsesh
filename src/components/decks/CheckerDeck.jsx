export default function CheckerDeck({ width = 80, height = 190, wheelColor = '#444', truckColor = '#888' }) {
  const squares = []
  const cols = 4, rows = 9
  const sqW = 60 / cols, sqH = 150 / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) squares.push({ x: 10 + c * sqW, y: 20 + r * sqH })
    }
  }
  return (
    <svg width={width} height={height} viewBox="0 0 80 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="boardClip"><rect x="10" y="20" width="60" height="150" rx="20" /></clipPath>
      <rect x="10" y="20" width="60" height="150" rx="20" fill="white" />
      <g clipPath="url(#boardClip)">
        {squares.map((s, i) => <rect key={i} x={s.x} y={s.y} width={sqW} height={sqH} fill="black" />)}
      </g>
      <rect x="18" y="12" width="44" height="8" rx="4" fill={truckColor} />
      <rect x="18" y="170" width="44" height="8" rx="4" fill={truckColor} />
      <circle cx="22" cy="12" r="6" fill={wheelColor} />
      <circle cx="58" cy="12" r="6" fill={wheelColor} />
      <circle cx="22" cy="178" r="6" fill={wheelColor} />
      <circle cx="58" cy="178" r="6" fill={wheelColor} />
    </svg>
  )
}
