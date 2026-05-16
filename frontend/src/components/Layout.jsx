import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Canvas from './Canvas'
import ConfigPanel from './ConfigPanel'
import ExecutionPanel from './ExecutionPanel'
import Onboarding from './Onboarding'
import ShortcutsModal from './ShortcutsModal'
import useWorkflowStore from '../store/workflowStore'
import { getWorkflow } from '../api/client'

export default function Layout() {
  const selectedNode = useWorkflowStore(s => s.selectedNode)
  const showExecutionPanel = useWorkflowStore(s => s.showExecutionPanel)
  const loadWorkflow = useWorkflowStore(s => s.loadWorkflow)
  const resetWorkflow = useWorkflowStore(s => s.resetWorkflow)
  const [searchParams] = useSearchParams()
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const workflowId = searchParams.get('workflow')
    if (workflowId) {
      getWorkflow(workflowId).then(data => {
        loadWorkflow(data)
      }).catch(() => {
        resetWorkflow()
      })
    } else {
      resetWorkflow()
    }
  }, [searchParams])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Toolbar />
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col flex-1 min-w-0">
            <Canvas />
            {showExecutionPanel && <ExecutionPanel />}
          </div>
          {selectedNode && <ConfigPanel />}
        </div>
      </div>
      <Onboarding />
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
