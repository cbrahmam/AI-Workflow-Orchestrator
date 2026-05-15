import { NODE_TYPES } from './nodeTypes'

export function validateWorkflow(nodes, edges) {
  const errors = []

  if (nodes.length === 0) {
    errors.push({ type: 'workflow', message: 'Workflow has no nodes' })
    return { valid: false, errors }
  }

  const inputNodes = nodes.filter(n => n.data.nodeType === 'input')
  const outputNodes = nodes.filter(n => n.data.nodeType === 'output')

  if (inputNodes.length === 0) {
    errors.push({ type: 'workflow', message: 'Workflow needs at least one Input node' })
  }
  if (outputNodes.length === 0) {
    errors.push({ type: 'workflow', message: 'Workflow needs at least one Output node' })
  }

  const incomingEdges = {}
  const outgoingEdges = {}
  edges.forEach(e => {
    if (!incomingEdges[e.target]) incomingEdges[e.target] = []
    incomingEdges[e.target].push(e)
    if (!outgoingEdges[e.source]) outgoingEdges[e.source] = []
    outgoingEdges[e.source].push(e)
  })

  for (const node of nodes) {
    const typeDef = NODE_TYPES[node.data.nodeType]
    if (!typeDef) continue

    if (typeDef.handles.inputs > 0 && (!incomingEdges[node.id] || incomingEdges[node.id].length === 0)) {
      errors.push({
        type: 'node',
        nodeId: node.id,
        message: `${node.data.title} has no input connection`,
      })
    }

    if (typeDef.handles.outputs > 0 && (!outgoingEdges[node.id] || outgoingEdges[node.id].length === 0)) {
      errors.push({
        type: 'node',
        nodeId: node.id,
        message: `${node.data.title} has no output connection`,
      })
    }

    if (node.data.nodeType === 'condition') {
      const outs = outgoingEdges[node.id] || []
      const hasTrue = outs.some(e => e.sourceHandle === 'true')
      const hasFalse = outs.some(e => e.sourceHandle === 'false')
      if (!hasTrue || !hasFalse) {
        errors.push({
          type: 'node',
          nodeId: node.id,
          message: `${node.data.title} needs both True and False branches connected`,
        })
      }
    }

    const configErrors = validateNodeConfig(node.data.nodeType, node.data.config)
    configErrors.forEach(msg => {
      errors.push({ type: 'node', nodeId: node.id, message: `${node.data.title}: ${msg}` })
    })
  }

  if (hasCycle(nodes, edges)) {
    errors.push({ type: 'workflow', message: 'Workflow has circular dependencies' })
  }

  return { valid: errors.length === 0, errors }
}

function validateNodeConfig(type, config) {
  const errors = []
  switch (type) {
    case 'llm':
      if (!config.provider) errors.push('Provider is required')
      if (!config.model) errors.push('Model is required')
      if (!config.userPrompt) errors.push('User prompt is required')
      break
    case 'api_call':
      if (!config.url) errors.push('URL is required')
      break
    case 'scrape':
      if (!config.url) errors.push('URL is required')
      if (config.extractionType === 'cssSelector' && !config.selector) {
        errors.push('CSS selector is required')
      }
      break
    case 'condition':
      if (!config.conditionType) errors.push('Condition type is required')
      if (['contains', 'equals', 'greaterThan', 'lessThan', 'regex'].includes(config.conditionType) && !config.compareValue) {
        errors.push('Comparison value is required')
      }
      break
    case 'file':
      if (config.operation === 'write' && !config.filename) {
        errors.push('Filename is required for write operation')
      }
      break
  }
  return errors
}

function hasCycle(nodes, edges) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target)
  })

  const visited = new Set()
  const inStack = new Set()

  function dfs(nodeId) {
    visited.add(nodeId)
    inStack.add(nodeId)
    for (const neighbor of (adj[nodeId] || [])) {
      if (inStack.has(neighbor)) return true
      if (!visited.has(neighbor) && dfs(neighbor)) return true
    }
    inStack.delete(nodeId)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) return true
  }
  return false
}

export function getUpstreamVariables(nodeId, nodes, edges) {
  const upstream = []
  const visited = new Set()

  function walk(currentId) {
    const incoming = edges.filter(e => e.target === currentId)
    for (const edge of incoming) {
      if (visited.has(edge.source)) continue
      visited.add(edge.source)
      const sourceNode = nodes.find(n => n.id === edge.source)
      if (sourceNode) {
        upstream.push({
          nodeId: sourceNode.id,
          title: sourceNode.data.title,
          type: sourceNode.data.nodeType,
          variable: `{{${sourceNode.data.title}.output}}`,
        })
        walk(sourceNode.id)
      }
    }
  }

  walk(nodeId)
  return upstream
}
