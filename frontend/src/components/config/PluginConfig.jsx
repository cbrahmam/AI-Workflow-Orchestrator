import { Section, TextInput, TextArea } from './FormFields'

export default function PluginConfig({ nodeId, config, onChange, configFields = [] }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="Plugin Settings">
        {configFields.length === 0 ? (
          <p className="text-xs text-slate-500">No configuration options available</p>
        ) : (
          configFields.map(field => {
            if (field.type === 'number') {
              return (
                <TextInput
                  key={field.key}
                  label={field.label}
                  value={config[field.key] ?? field.default ?? ''}
                  onChange={v => update(field.key, parseFloat(v) || 0)}
                  placeholder={String(field.default ?? '')}
                />
              )
            }
            if (field.type === 'boolean') {
              return (
                <label key={field.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[field.key] ?? field.default ?? false}
                    onChange={e => update(field.key, e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  {field.label}
                  {field.description && (
                    <span className="text-slate-500">— {field.description}</span>
                  )}
                </label>
              )
            }
            if (field.type === 'textarea') {
              return (
                <TextArea
                  key={field.key}
                  label={field.label}
                  value={config[field.key] ?? field.default ?? ''}
                  onChange={v => update(field.key, v)}
                  placeholder={field.description || ''}
                  rows={3}
                />
              )
            }
            return (
              <TextInput
                key={field.key}
                label={field.label}
                value={config[field.key] ?? field.default ?? ''}
                onChange={v => update(field.key, v)}
                placeholder={field.description || ''}
              />
            )
          })
        )}
      </Section>

      <div className="p-3 rounded-lg" style={{ background: '#1E1E2E' }}>
        <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Community Plugin</p>
        <p className="text-[11px] text-slate-400">
          This node is provided by a community plugin.
        </p>
      </div>
    </div>
  )
}
