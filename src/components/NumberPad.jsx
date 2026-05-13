const DIGITS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']

export default function NumberPad({ onKey, onBackspace, onSubmit, disabled }) {
  function handlePress(key) {
    if (disabled) return
    if (key === '⌫') onBackspace()
    else if (key === '✓') onSubmit()
    else onKey(key)
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {DIGITS.map(k => (
        <button
          key={k}
          onPointerDown={e => { e.preventDefault(); handlePress(k) }}
          disabled={disabled}
          className={`
            h-[72px] font-['Barlow_Condensed'] font-black text-3xl active:scale-95 transition-transform select-none
            ${k === '✓' ? 'bg-[#FF5F1F] text-black' : k === '⌫' ? 'bg-[#242424] text-[#888]' : 'bg-[#1a1a1a] text-white'}
            ${disabled ? 'opacity-30' : ''}
          `}
        >
          {k}
        </button>
      ))}
    </div>
  )
}
