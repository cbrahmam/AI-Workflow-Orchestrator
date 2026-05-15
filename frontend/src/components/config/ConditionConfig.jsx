import { Select, TextInput, Section } from './FormFields'

const CONDITION_TYPES = [
  { value: 'contains', label: 'Contains Text' },
  { value: 'equals', label: 'Equals' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'isEmpty', label: 'Is Empty' },
  { value: 'isNotEmpty', label: 'Is Not Empty' },
  { value: 'regex', label: 'Regex Match' },
  { value: 'jsonFieldCheck', label: 'JSON Field Check' },
  { value: 'custom', label: 'Custom Expression' },
]

const NEEDS_VALUE = ['contains', 'equals', 'greaterThan', 'lessThan', 'regex', 'jsonFieldCheck', 'custom']

export default function ConditionConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="Condition">
        <Select
          label="Condition Type"
          value={config.conditionType || 'contains'}
          onChange={v => update('conditionType', v)}
          options={CONDITION_TYPES}
        />

        {NEEDS_VALUE.includes(config.conditionType) && (
          <TextInput
            label="Value to Compare"
            value={config.compareValue || ''}
            onChange={v => update('compareValue', v)}
            placeholder={
              config.conditionType === 'regex' ? '\\d+' :
              config.conditionType === 'jsonFieldCheck' ? 'field.name' :
              config.conditionType === 'custom' ? 'value > 100' :
              'Enter value...'
            }
          />
        )}
      </Section>

      <Section title="Branch Labels">
        <TextInput
          label="True Output Label"
          value={config.trueLabel || 'True'}
          onChange={v => update('trueLabel', v)}
        />
        <TextInput
          label="False Output Label"
          value={config.falseLabel || 'False'}
          onChange={v => update('falseLabel', v)}
        />
      </Section>
    </div>
  )
}
