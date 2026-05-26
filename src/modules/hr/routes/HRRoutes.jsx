import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import HRDashboard from '../pages/HRDashboard'
import EmployeeList from '../pages/EmployeeList'
import EmployeeDetail from '../pages/EmployeeDetail'
import AddEmployee from '../pages/AddEmployee'
import { USER_ROLES } from '../../../types/authTypes'

export default function HRRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER, USER_ROLES.OPERATIONS_MANAGER]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER]}>
              <EmployeeList />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER]}>
              <AddEmployee />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER]}>
              <EmployeeDetail />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
