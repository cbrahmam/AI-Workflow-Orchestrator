export function Label({ children }) {
  return <label className="block text-xs font-medium text-slate-400 mb-1">{children}</label>
}

export function Select({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#1E1E2E] text-sm text-slate-200 rounded-md px-3 py-2 border border-[#2A2A3C] outline-none focus:border-violet-500 transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function TextInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1E1E2E] text-sm text-slate-200 rounded-md px-3 py-2 border border-[#2A2A3C] outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
      />
    </div>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, inputRef }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#1E1E2E] text-sm text-slate-200 rounded-md px-3 py-2 border border-[#2A2A3C] outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600 font-mono resize-none"
      />
    </div>
  )
}

export function Slider({ label, value, onChange, min = 0, max = 1, step = 0.1 }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-xs text-slate-400 font-mono">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-violet-500"
      />
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <div className="space-y-3">
      {title && (
        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{title}</p>
      )}
      {children}
    </div>
  )
}

export function KeyValueEditor({ label, pairs, onChange }) {
  const update = (index, field, val) => {
    const next = pairs.map((p, i) => i === index ? { ...p, [field]: val } : p)
    onChange(next)
  }

  const add = () => onChange([...pairs, { key: '', value: '' }])

  const remove = (index) => onChange(pairs.filter((_, i) => i !== index))

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-1.5">
        {pairs.map((pair, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={pair.key}
              onChange={e => update(i, 'key', e.target.value)}
              placeholder="Key"
              className="flex-1 bg-[#1E1E2E] text-xs text-slate-200 rounded px-2 py-1.5 border border-[#2A2A3C] outline-none focus:border-violet-500"
            />
            <input
              value={pair.value}
              onChange={e => update(i, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1 bg-[#1E1E2E] text-xs text-slate-200 rounded px-2 py-1.5 border border-[#2A2A3C] outline-none focus:border-violet-500"
            />
            <button
              onClick={() => remove(i)}
              className="px-1.5 text-slate-500 hover:text-red-400 text-xs"
            >
              x
            </button>
          </div>
        ))}
        <button
          onClick={add}
          className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
        >
          + Add header
        </button>
      </div>
    </div>
  )
}
