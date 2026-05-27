import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import OperationsDashboard from '../pages/OperationsDashboard'
import CreateJob from '../pages/CreateJob'
import { USER_ROLES } from '../../../types/authTypes'

export default function OperationsRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]}>
            <OperationsDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/jobs/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]}>
            <CreateJob />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/jobs/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]}>
            <CreateJob />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
