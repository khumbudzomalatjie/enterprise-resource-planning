import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import DocumentsDashboard from '../pages/DocumentsDashboard'

export default function DocumentsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><DocumentsDashboard /></ProtectedRoute>} />
    </Routes>
  )
}
