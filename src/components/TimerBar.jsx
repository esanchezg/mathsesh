import { useEffect, useRef, useState } from 'react'

export default function TimerBar({ active, durationMs }) {
  const [width, setWidth] = useState(100)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) {
      setWidth(100)
      return
    }
    startRef.current = performance.now()

    function tick(now) {
      const elapsed = now - startRef.current
      const remaining = Math.max(0, 1 - elapsed / durationMs) * 100
      setWidth(remaining)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, durationMs])

  const color = width > 50 ? '#FF5F1F' : width > 20 ? '#FFE600' : '#ef4444'

  return (
    <div className="h-1.5 w-full bg-[#1a1a1a]">
      <div
        className="h-full transition-none"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  )
}
