import { Select, TextInput, Section } from './FormFields'

export default function OutputConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <Section title="Output Configuration">
      <Select
        label="Output Type"
        value={config.outputType || 'display'}
        onChange={v => update('outputType', v)}
        options={[
          { value: 'display', label: 'Display' },
          { value: 'file', label: 'File Download' },
          { value: 'json', label: 'JSON' },
          { value: 'markdown', label: 'Markdown' },
        ]}
      />
      <TextInput
        label="Label"
        value={config.label || ''}
        onChange={v => update('label', v)}
        placeholder="Result"
      />
    </Section>
  )
}
