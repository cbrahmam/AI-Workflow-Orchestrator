import { Select, TextArea, Section } from './FormFields'

export default function InputConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <Section title="Input Configuration">
      <Select
        label="Input Type"
        value={config.inputType || 'text'}
        onChange={v => update('inputType', v)}
        options={[
          { value: 'text', label: 'Text' },
          { value: 'json', label: 'JSON' },
          { value: 'file', label: 'File Upload' },
        ]}
      />

      {config.inputType === 'text' && (
        <TextArea
          label="Default Value"
          value={config.defaultValue || ''}
          onChange={v => update('defaultValue', v)}
          placeholder="Enter default input text..."
          rows={4}
        />
      )}

      {config.inputType === 'json' && (
        <TextArea
          label="Default JSON"
          value={config.defaultValue || ''}
          onChange={v => update('defaultValue', v)}
          placeholder='{"key": "value"}'
          rows={6}
        />
      )}

      {config.inputType === 'file' && (
        <div className="border-2 border-dashed border-[#2A2A3C] rounded-lg p-6 text-center">
          <p className="text-xs text-slate-500">File upload available at runtime</p>
          <p className="text-[10px] text-slate-600 mt-1">Supports TXT, CSV, JSON, PDF</p>
        </div>
      )}
    </Section>
  )
}
