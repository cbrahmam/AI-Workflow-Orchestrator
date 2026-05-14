import { Handle, Position } from '@xyflow/react'
import { NODE_TYPES } from '../../utils/nodeTypes'
import useWorkflowStore from '../../store/workflowStore'

const statusColors = {
  idle: '#6B7280',
  running: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
}

export default function BaseNode({ id, data, selected }) {
  const typeDef = NODE_TYPES[data.nodeType]
  if (!typeDef) return null

  const Icon = typeDef.icon
  const color = typeDef.color
  const statusColor = statusColors[data.status] || statusColors.idle

  const updateNodeData = useWorkflowStore(s => s.updateNodeData)

  const handleTitleChange = (e) => {
    updateNodeData(id, { title: e.target.value })
  }

  const statusClass = data.status === 'running' ? 'node-running' : ''
  const flashClass = data.status === 'success' ? 'node-success-flash' : ''

  return (
    <div
      className={`relative min-w-[220px] max-w-[280px] rounded-lg shadow-lg transition-all duration-200 ${statusClass} ${flashClass}`}
      style={{
        background: '#1E1E2E',
        borderLeft: `4px solid ${color}`,
        border: selected ? `2px solid ${color}` : `1px solid #2A2A3C`,
        borderLeftWidth: '4px',
        borderLeftColor: color,
        boxShadow: selected ? `0 0 16px ${color}33` : '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Input Handles */}
      {typeDef.handles.inputs === 1 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: color, width: 10, height: 10, border: '2px solid #1E1E2E' }}
        />
      )}
      {typeDef.handles.inputs === 2 && typeDef.handles.inputIds?.map((hid, i) => (
        <Handle
          key={hid}
          id={hid}
          type="target"
          position={Position.Left}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: '2px solid #1E1E2E',
            top: `${30 + i * 40}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <Icon size={16} style={{ color, flexShrink: 0 }} />
        <span className="text-xs font-mono font-medium uppercase tracking-wider" style={{ color }}>
          {typeDef.label}
        </span>
        <div className="ml-auto flex-shrink-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: statusColor }}
            title={data.status}
          />
        </div>
      </div>

      {/* Title */}
      <div className="px-3 py-1">
        <input
          type="text"
          value={data.title || ''}
          onChange={handleTitleChange}
          className="w-full bg-transparent text-sm font-medium text-slate-200 outline-none border-none focus:ring-0 p-0"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>

      {/* Config Preview */}
      {data.configPreview && (
        <div className="px-3 pb-3">
          <p className="text-xs text-slate-500 font-mono truncate">
            {data.configPreview}
          </p>
        </div>
      )}

      {/* Output Handles */}
      {typeDef.handles.outputs === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: color, width: 10, height: 10, border: '2px solid #1E1E2E' }}
        />
      )}
      {typeDef.handles.outputs === 2 && typeDef.handles.outputIds?.map((hid, i) => (
        <Handle
          key={hid}
          id={hid}
          type="source"
          position={Position.Right}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: '2px solid #1E1E2E',
            top: `${30 + i * 40}%`,
          }}
        >
          <span
            className="absolute text-[9px] font-mono font-bold pointer-events-none"
            style={{
              color,
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {typeDef.handles.outputLabels?.[i]}
          </span>
        </Handle>
      ))}
    </div>
  )
}
