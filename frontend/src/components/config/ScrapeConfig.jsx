import { Select, TextInput, Section } from './FormFields'
import VariableChips from './VariableChips'

export default function ScrapeConfig({ nodeId, config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="Target">
        <TextInput
          label="URL"
          value={config.url || ''}
          onChange={v => update('url', v)}
          placeholder="https://example.com"
        />
        <VariableChips nodeId={nodeId} onInsert={v => update('url', (config.url || '') + v)} />
      </Section>

      <Section title="Extraction">
        <Select
          label="Extraction Type"
          value={config.extractionType || 'fullText'}
          onChange={v => update('extractionType', v)}
          options={[
            { value: 'fullText', label: 'Full Text' },
            { value: 'cssSelector', label: 'CSS Selector' },
            { value: 'metadata', label: 'Meta Data' },
            { value: 'links', label: 'Links' },
            { value: 'tables', label: 'Tables' },
          ]}
        />

        {config.extractionType === 'cssSelector' && (
          <TextInput
            label="CSS Selector"
            value={config.selector || ''}
            onChange={v => update('selector', v)}
            placeholder="article h2, .content p"
          />
        )}

        <TextInput
          label="Max Pages"
          value={config.maxPages || 1}
          onChange={v => update('maxPages', v)}
          type="number"
        />
      </Section>
    </div>
  )
}
