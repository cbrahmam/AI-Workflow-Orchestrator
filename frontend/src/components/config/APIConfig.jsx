import { useRef } from 'react'
import { Select, TextInput, TextArea, KeyValueEditor, Section } from './FormFields'
import VariableChips from './VariableChips'

export default function APIConfig({ nodeId, config, onChange }) {
  const urlRef = useRef(null)
  const update = (key, val) => onChange({ ...config, [key]: val })

  const insertVariable = (variable) => {
    const el = urlRef.current
    if (el) {
      update('url', (config.url || '') + variable)
    }
  }

  return (
    <div className="space-y-4">
      <Section title="Request">
        <div className="flex gap-2">
          <div className="w-[100px]">
            <Select
              label="Method"
              value={config.method || 'GET'}
              onChange={v => update('method', v)}
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'DELETE', label: 'DELETE' },
              ]}
            />
          </div>
          <div className="flex-1">
            <TextInput
              label="URL"
              value={config.url || ''}
              onChange={v => update('url', v)}
              placeholder="https://api.example.com/data"
            />
          </div>
        </div>
        <VariableChips nodeId={nodeId} onInsert={insertVariable} />
      </Section>

      <Section title="Headers">
        <KeyValueEditor
          label="Request Headers"
          pairs={config.headers || []}
          onChange={v => update('headers', v)}
        />
      </Section>

      {['POST', 'PUT'].includes(config.method) && (
        <Section title="Body">
          <TextArea
            label="Request Body"
            value={config.body || ''}
            onChange={v => update('body', v)}
            placeholder='{"key": "value"}'
            rows={4}
          />
        </Section>
      )}

      <Section title="Authentication">
        <Select
          label="Auth Type"
          value={config.authType || 'none'}
          onChange={v => update('authType', v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'bearer', label: 'Bearer Token' },
            { value: 'apiKey', label: 'API Key' },
            { value: 'basic', label: 'Basic Auth' },
          ]}
        />
        {config.authType !== 'none' && (
          <TextInput
            label={config.authType === 'basic' ? 'Username:Password' : 'Token / Key'}
            value={config.authValue || ''}
            onChange={v => update('authValue', v)}
            placeholder="Enter credentials..."
            type="password"
          />
        )}
      </Section>

      <Section title="Response">
        <Select
          label="Response Handling"
          value={config.responseHandling || 'full'}
          onChange={v => update('responseHandling', v)}
          options={[
            { value: 'full', label: 'Full Response' },
            { value: 'jsonPath', label: 'JSON Path' },
            { value: 'statusOnly', label: 'Status Code Only' },
          ]}
        />
        {config.responseHandling === 'jsonPath' && (
          <TextInput
            label="JSON Path"
            value={config.responsePath || ''}
            onChange={v => update('responsePath', v)}
            placeholder="data.results"
          />
        )}
      </Section>
    </div>
  )
}
