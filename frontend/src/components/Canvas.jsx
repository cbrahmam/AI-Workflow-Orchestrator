import { useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import useWorkflowStore from '../store/workflowStore'

import InputNode from './nodes/InputNode'
import LLMNode from './nodes/LLMNode'
import TransformNode from './nodes/TransformNode'
import APINode from './nodes/APINode'
import ScrapeNode from './nodes/ScrapeNode'
import ConditionNode from './nodes/ConditionNode'
import MergeNode from './nodes/MergeNode'
import FileNode from './nodes/FileNode'
import OutputNode from './nodes/OutputNode'
import MCPNode from './nodes/MCPNode'
import SubWorkflowNode from './nodes/SubWorkflowNode'

const nodeTypes = {
  input: InputNode,
  llm: LLMNode,
  transform: TransformNode,
  api_call: APINode,
  scrape: ScrapeNode,
  condition: ConditionNode,
  merge: MergeNode,
  file: FileNode,
  output: OutputNode,
  mcp_tool: MCPNode,
  sub_workflow: SubWorkflowNode,
}

const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
  style: { stroke: '#555', strokeDasharray: '5 5' },
}

export default function Canvas() {
  const reactFlowWrapper = useRef(null)
  const { screenToFlowPosition } = useReactFlow()

  const nodes = useWorkflowStore(s => s.nodes)
  const edges = useWorkflowStore(s => s.edges)
  const onNodesChange = useWorkflowStore(s => s.onNodesChange)
  const onEdgesChange = useWorkflowStore(s => s.onEdgesChange)
  const onConnect = useWorkflowStore(s => s.onConnect)
  const addNode = useWorkflowStore(s => s.addNode)
  const setSelectedNode = useWorkflowStore(s => s.setSelectedNode)
  const undo = useWorkflowStore(s => s.undo)
  const redo = useWorkflowStore(s => s.redo)
  const duplicateSelectedNode = useWorkflowStore(s => s.duplicateSelectedNode)

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/flowpilot-node')
    if (!type) return

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    addNode(type, position)
  }, [screenToFlowPosition, addNode])

  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node.id)
  }, [setSelectedNode])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        duplicateSelectedNode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, duplicateSelectedNode])

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background variant="dots" gap={20} size={1} color="#333" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const type = node.data?.nodeType || node.type
            const colors = {
              input: '#10B981', output: '#EF4444', llm: '#8B5CF6',
              transform: '#0EA5E9', api_call: '#F59E0B', scrape: '#14B8A6',
              condition: '#EAB308', merge: '#0EA5E9', file: '#6B7280',
              mcp_tool: '#EC4899', sub_workflow: '#A855F7',
            }
            return colors[type] || '#6B7280'
          }}
          maskColor="rgba(13, 13, 21, 0.8)"
          style={{ background: '#252535', border: '1px solid #2A2A3C', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  )
}
