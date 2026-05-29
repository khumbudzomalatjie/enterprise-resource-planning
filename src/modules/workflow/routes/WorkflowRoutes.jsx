import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import WorkflowDashboard from '../pages/WorkflowDashboard'

export default function WorkflowRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><WorkflowDashboard /></ProtectedRoute>} />
    </Routes>
  )
}
