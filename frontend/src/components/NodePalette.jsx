import { CATEGORIES, NODE_TYPES } from '../utils/nodeTypes'

export default function NodePalette() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/flowpilot-node', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      {CATEGORIES.map(category => (
        <div key={category.name}>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2 px-1">
            {category.name}
          </h3>
          <div className="flex flex-col gap-1.5">
            {category.types.map(typeKey => {
              const typeDef = NODE_TYPES[typeKey]
              const Icon = typeDef.icon
              return (
                <div
                  key={typeKey}
                  draggable
                  onDragStart={(e) => onDragStart(e, typeKey)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150 hover:bg-white/5"
                  style={{ border: '1px solid #2A2A3C' }}
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
                    style={{ background: `${typeDef.color}18` }}
                  >
                    <Icon size={14} style={{ color: typeDef.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 leading-tight">
                      {typeDef.label}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate">
                      {typeDef.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
