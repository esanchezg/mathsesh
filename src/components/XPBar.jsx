export default function XPBar({ xp, current, next }) {
  if (!next) {
    return <div className="h-2 bg-[#FF5F1F] w-full" />
  }
  const pct = Math.min(100, ((xp - current.xp) / (next.xp - current.xp)) * 100)
  return (
    <div className="h-2 bg-[#242424] w-full">
      <div className="h-full bg-[#FF5F1F] transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}
