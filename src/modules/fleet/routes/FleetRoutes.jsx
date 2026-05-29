import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import FleetDashboard from '../pages/FleetDashboard'
import { USER_ROLES } from '../../../types/authTypes'

export default function FleetRoutes() {
  const allowedRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><RoleBasedRoute requiredRoles={allowedRoles}><FleetDashboard /></RoleBasedRoute></ProtectedRoute>} />
      <Route path="/vehicles/:id" element={<ProtectedRoute><RoleBasedRoute requiredRoles={allowedRoles}><FleetDashboard /></RoleBasedRoute></ProtectedRoute>} />
    </Routes>
  )
}
