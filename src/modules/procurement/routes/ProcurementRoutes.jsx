import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import ProcurementDashboard from '../pages/ProcurementDashboard'
import { USER_ROLES } from '../../../types/authTypes'

export default function ProcurementRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.FINANCE_OFFICER]}>
            <ProcurementDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
