import { useRef } from 'react'
import { Select, TextInput, TextArea, Section } from './FormFields'
import VariableChips from './VariableChips'

export default function MergeConfig({ nodeId, config, onChange }) {
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
    <Section title="Merge Configuration">
      <Select
        label="Merge Strategy"
        value={config.strategy || 'concatenate'}
        onChange={v => update('strategy', v)}
        options={[
          { value: 'concatenate', label: 'Concatenate' },
          { value: 'jsonMerge', label: 'JSON Merge' },
          { value: 'arrayCollect', label: 'Array Collect' },
          { value: 'template', label: 'Template' },
        ]}
      />

      {config.strategy === 'concatenate' && (
        <TextInput
          label="Separator"
          value={config.separator || '\n'}
          onChange={v => update('separator', v)}
          placeholder="\n"
        />
      )}

      {config.strategy === 'template' && (
        <>
          <TextArea
            label="Template"
            value={config.template || ''}
            onChange={v => update('template', v)}
            placeholder="Input 1: {{input-0}}\nInput 2: {{input-1}}"
            rows={4}
            inputRef={templateRef}
          />
          <VariableChips nodeId={nodeId} onInsert={insertVariable} />
        </>
      )}
    </Section>
  )
}
