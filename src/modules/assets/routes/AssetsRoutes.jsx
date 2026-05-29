import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import AssetsDashboard from '../pages/AssetsDashboard'

export default function AssetsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><AssetsDashboard /></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><AssetsDashboard /></ProtectedRoute>} />
      <Route path="/:id" element={<ProtectedRoute><AssetsDashboard /></ProtectedRoute>} />
    </Routes>
  )
}
