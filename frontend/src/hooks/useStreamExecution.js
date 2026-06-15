import { useCallback, useRef } from 'react'
import useWorkflowStore from '../store/workflowStore'

export default function useStreamExecution() {
  const wsRef = useRef(null)

  const execute = useCallback((workflowId, input = null) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const ws = new WebSocket(`${protocol}//${host}/ws/execute/${workflowId}`)
    wsRef.current = ws

    useWorkflowStore.getState().resetNodeStatuses()
    useWorkflowStore.setState({
      isExecuting: true,
      executionStatus: 'running',
      executionResult: null,
      showExecutionPanel: true,
    })

    ws.onopen = () => {
      if (input !== null && input !== undefined) {
        ws.send(JSON.stringify({ input }))
      }
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'node_update') {
        const store = useWorkflowStore.getState()
        const status = msg.status === 'pending' ? 'idle' : msg.status
        useWorkflowStore.setState({
          nodes: store.nodes.map(n =>
            n.id === msg.node_id
              ? { ...n, data: { ...n.data, status } }
              : n
          ),
        })
      }

      if (msg.type === 'completed') {
        useWorkflowStore.setState({
          isExecuting: false,
          executionId: msg.execution_id,
          executionStatus: msg.status,
          executionResult: {
            execution_id: msg.execution_id,
            status: msg.status,
            final_output: msg.final_output,
            total_duration_ms: msg.total_duration_ms,
            total_tokens_used: msg.total_tokens_used,
            error_summary: msg.error_summary,
            node_logs: [],
          },
        })
      }

      if (msg.type === 'error') {
        useWorkflowStore.setState({
          isExecuting: false,
          executionStatus: 'failed',
        })
      }
    }

    ws.onerror = () => {
      useWorkflowStore.setState({
        isExecuting: false,
        executionStatus: 'failed',
      })
    }

    ws.onclose = () => {
      wsRef.current = null
    }

    return ws
  }, [])

  const cancel = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      useWorkflowStore.setState({
        isExecuting: false,
        executionStatus: 'cancelled',
      })
    }
  }, [])

  return { execute, cancel }
}
