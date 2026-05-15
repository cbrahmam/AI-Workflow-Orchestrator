import { Select, TextInput, Section } from './FormFields'
import VariableChips from './VariableChips'

export default function FileConfig({ nodeId, config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="File Operation">
        <Select
          label="Operation"
          value={config.operation || 'read'}
          onChange={v => update('operation', v)}
          options={[
            { value: 'read', label: 'Read File' },
            { value: 'write', label: 'Write File' },
          ]}
        />
      </Section>

      {config.operation === 'read' && (
        <Section title="Read Settings">
          <Select
            label="File Type"
            value={config.fileType || 'txt'}
            onChange={v => update('fileType', v)}
            options={[
              { value: 'txt', label: 'Text (TXT)' },
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
              { value: 'pdf', label: 'PDF' },
            ]}
          />
          <div className="border-2 border-dashed border-[#2A2A3C] rounded-lg p-6 text-center">
            <p className="text-xs text-slate-500">File upload available at runtime</p>
            <p className="text-[10px] text-slate-600 mt-1">Drop or select a .{config.fileType || 'txt'} file</p>
          </div>
        </Section>
      )}

      {config.operation === 'write' && (
        <Section title="Write Settings">
          <TextInput
            label="Filename"
            value={config.filename || ''}
            onChange={v => update('filename', v)}
            placeholder="output_{{timestamp}}.txt"
          />
          <VariableChips nodeId={nodeId} onInsert={v => update('filename', (config.filename || '') + v)} />
          <Select
            label="Format"
            value={config.fileType || 'txt'}
            onChange={v => update('fileType', v)}
            options={[
              { value: 'txt', label: 'Text (TXT)' },
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
              { value: 'md', label: 'Markdown' },
            ]}
          />
        </Section>
      )}
    </div>
  )
}
