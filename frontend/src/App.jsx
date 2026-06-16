import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import Layout from './components/Layout'
import WorkflowList from './pages/WorkflowList'
import TemplatesPage from './pages/TemplatesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ErrorBoundary from './components/ErrorBoundary'
import MobileWarning from './components/MobileWarning'

export default function App() {
  return (
    <ErrorBoundary>
      <MobileWarning />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ReactFlowProvider>
                <Layout />
              </ReactFlowProvider>
            }
          />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
