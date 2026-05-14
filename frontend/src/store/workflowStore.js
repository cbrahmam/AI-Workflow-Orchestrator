import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { NODE_TYPES } from '../utils/nodeTypes'

let nodeCounter = 0

function generateNodeId() {
  nodeCounter += 1
  return `node_${nodeCounter}`
}

function getConfigPreview(type, config) {
  switch (type) {
    case 'llm':
      return config.model ? config.model.split('-').slice(0, 2).join(' ') : 'Configure model'
    case 'api_call':
      return config.url ? `${config.method} ${config.url}` : 'Configure URL'
    case 'scrape':
      return config.url || 'Configure URL'
    case 'transform':
      return config.operation || 'Configure operation'
    case 'condition':
      return config.conditionType || 'Configure condition'
    case 'file':
      return `${config.operation || 'read'} ${config.fileType || 'txt'}`
    case 'merge':
      return config.strategy || 'concatenate'
    case 'input':
      return config.inputType || 'text'
    case 'output':
      return config.outputType || 'display'
    default:
      return ''
  }
}

const MAX_HISTORY = 50

const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  workflowName: 'Untitled Workflow',
  workflowId: null,
  isDirty: false,

  past: [],
  future: [],

  _pushHistory() {
    const { nodes, edges, past } = get()
    const snapshot = { nodes: structuredClone(nodes), edges: structuredClone(edges) }
    set({
      past: [...past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [],
    })
  },

  undo() {
    const { past, nodes, edges } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      future: [{ nodes: structuredClone(nodes), edges: structuredClone(edges) }, ...get().future],
      nodes: previous.nodes,
      edges: previous.edges,
      isDirty: true,
    })
  },

  redo() {
    const { future, nodes, edges } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      future: future.slice(1),
      past: [...get().past, { nodes: structuredClone(nodes), edges: structuredClone(edges) }],
      nodes: next.nodes,
      edges: next.edges,
      isDirty: true,
    })
  },

  onNodesChange(changes) {
    const hasStructuralChange = changes.some(c => c.type === 'remove')
    if (hasStructuralChange) get()._pushHistory()

    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    })
  },

  onEdgesChange(changes) {
    const hasStructuralChange = changes.some(c => c.type === 'remove')
    if (hasStructuralChange) get()._pushHistory()

    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    })
  },

  onConnect(connection) {
    get()._pushHistory()
    set({
      edges: addEdge(
        { ...connection, animated: true, type: 'smoothstep', style: { stroke: '#555', strokeDasharray: '5 5' } },
        get().edges
      ),
      isDirty: true,
    })
  },

  addNode(type, position) {
    const typeDef = NODE_TYPES[type]
    if (!typeDef) return

    get()._pushHistory()

    const id = generateNodeId()
    const config = { ...typeDef.defaultConfig }

    const newNode = {
      id,
      type,
      position,
      data: {
        label: typeDef.label,
        title: `${typeDef.label} ${nodeCounter}`,
        nodeType: type,
        status: 'idle',
        config,
        configPreview: getConfigPreview(type, config),
      },
    }

    set({
      nodes: [...get().nodes, newNode],
      isDirty: true,
    })

    return id
  },

  removeNode(id) {
    get()._pushHistory()
    set({
      nodes: get().nodes.filter(n => n.id !== id),
      edges: get().edges.filter(e => e.source !== id && e.target !== id),
      selectedNode: get().selectedNode === id ? null : get().selectedNode,
      isDirty: true,
    })
  },

  updateNodeData(id, data) {
    set({
      nodes: get().nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    })
  },

  updateNodeConfig(id, config) {
    set({
      nodes: get().nodes.map(n => {
        if (n.id !== id) return n
        const newConfig = { ...n.data.config, ...config }
        return {
          ...n,
          data: {
            ...n.data,
            config: newConfig,
            configPreview: getConfigPreview(n.data.nodeType, newConfig),
          },
        }
      }),
      isDirty: true,
    })
  },

  setSelectedNode(id) {
    set({ selectedNode: id })
  },

  setWorkflowName(name) {
    set({ workflowName: name, isDirty: true })
  },

  serializeWorkflow() {
    const { nodes, edges, workflowName, workflowId } = get()
    return {
      id: workflowId,
      name: workflowName,
      workflow_json: { nodes, edges },
    }
  },

  loadWorkflow(data) {
    const wf = data.workflow_json || {}
    nodeCounter = 0
    if (wf.nodes) {
      wf.nodes.forEach(n => {
        const num = parseInt(n.id.split('_')[1], 10)
        if (num > nodeCounter) nodeCounter = num
      })
    }
    set({
      nodes: wf.nodes || [],
      edges: wf.edges || [],
      workflowName: data.name || 'Untitled Workflow',
      workflowId: data.id || null,
      isDirty: false,
      past: [],
      future: [],
    })
  },

  resetWorkflow() {
    nodeCounter = 0
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      workflowName: 'Untitled Workflow',
      workflowId: null,
      isDirty: false,
      past: [],
      future: [],
    })
  },
}))

export default useWorkflowStore
