import { useRef } from 'react'
import { Select, TextInput, TextArea, Section } from './FormFields'
import VariableChips from './VariableChips'

const OPERATIONS = [
  { value: 'template', label: 'Template' },
  { value: 'extractJson', label: 'Extract JSON Field' },
  { value: 'splitText', label: 'Split Text' },
  { value: 'joinTexts', label: 'Join Texts' },
  { value: 'regexExtract', label: 'Regex Extract' },
  { value: 'parseCsv', label: 'Parse CSV' },
  { value: 'filterArray', label: 'Filter Array' },
  { value: 'mapArray', label: 'Map Array' },
]

export default function TransformConfig({ nodeId, config, onChange }) {
  const templateRef = useRef(null)
  const update = (key, val) => onChange({ ...config, [key]: val })

  const insertVariable = (variable) => {
    const el = templateRef.current
    if (!el) {
      update('template', (config.template || '') + variable)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = config.template || ''
    update('template', text.slice(0, start) + variable + text.slice(end))
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + variable.length
      el.focus()
    })
  }

  return (
    <Section title="Transform Configuration">
      <Select
        label="Operation"
        value={config.operation || 'template'}
        onChange={v => update('operation', v)}
        options={OPERATIONS}
      />

      {config.operation === 'extractJson' && (
        <TextInput
          label="JSON Path"
          value={config.jsonPath || ''}
          onChange={v => update('jsonPath', v)}
          placeholder="data.items[0].name"
        />
      )}

      {config.operation === 'splitText' && (
        <TextInput
          label="Delimiter"
          value={config.delimiter || ''}
          onChange={v => update('delimiter', v)}
          placeholder="\n or , or custom"
        />
      )}

      {config.operation === 'joinTexts' && (
        <TextInput
          label="Separator"
          value={config.delimiter || ''}
          onChange={v => update('delimiter', v)}
          placeholder="\n"
        />
      )}

      {config.operation === 'regexExtract' && (
        <TextInput
          label="Regex Pattern"
          value={config.regex || ''}
          onChange={v => update('regex', v)}
          placeholder="(\d+)"
        />
      )}

      {config.operation === 'filterArray' && (
        <TextInput
          label="Filter Condition"
          value={config.filterCondition || ''}
          onChange={v => update('filterCondition', v)}
          placeholder="item.status === 'active'"
        />
      )}

      {config.operation === 'mapArray' && (
        <TextInput
          label="Map Expression"
          value={config.mapExpression || ''}
          onChange={v => update('mapExpression', v)}
          placeholder="item.name"
        />
      )}

      {config.operation === 'template' && (
        <>
          <TextArea
            label="Template"
            value={config.template || ''}
            onChange={v => update('template', v)}
            placeholder="Result: {{Input 1.output}}"
            rows={4}
            inputRef={templateRef}
          />
          <VariableChips nodeId={nodeId} onInsert={insertVariable} />
        </>
      )}
    </Section>
  )
}
