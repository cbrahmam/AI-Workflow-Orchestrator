import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Canvas from './Canvas'
import ConfigPanel from './ConfigPanel'
import useWorkflowStore from '../store/workflowStore'

export default function Layout() {
  const selectedNode = useWorkflowStore(s => s.selectedNode)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Toolbar />
        <Canvas />
      </div>
      {selectedNode && <ConfigPanel />}
    </div>
  )
}
