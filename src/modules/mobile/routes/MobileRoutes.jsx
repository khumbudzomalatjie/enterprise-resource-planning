import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import MobileHome from '../pages/MobileHome'

export default function MobileRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/clock" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/photos" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/supplies" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/incident" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MobileHome /></ProtectedRoute>} />
    </Routes>
  )
}
