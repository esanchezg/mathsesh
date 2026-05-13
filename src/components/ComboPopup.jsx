import { useEffect, useState } from 'react'

export default function ComboPopup({ combo }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [combo])

  if (!visible || !combo) return null

  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-bounce">
      <div className="bg-[#FFE600] text-black font-['Barlow_Condensed'] font-black text-4xl uppercase px-6 py-3 whitespace-nowrap">
        {combo.name}! {combo.multiplier}×
      </div>
    </div>
  )
}
