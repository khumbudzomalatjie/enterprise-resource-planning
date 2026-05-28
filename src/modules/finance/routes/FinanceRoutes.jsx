import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import FinanceDashboard from '../pages/FinanceDashboard'
import { USER_ROLES } from '../../../types/authTypes'

export default function FinanceRoutes() {
  const allowedRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE_OFFICER, USER_ROLES.OPERATIONS_MANAGER]

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/approvals" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/payables" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/receivables" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/budgets" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ledger" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <FinanceDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
