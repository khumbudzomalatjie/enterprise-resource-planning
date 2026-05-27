import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import CRMDashboard from '../pages/CRMDashboard'
import ClientList from '../pages/ClientList'
import ClientDetail from '../pages/ClientDetail'
import { USER_ROLES } from '../../../types/authTypes'

export default function CRMRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SALES_AGENT]}>
            <CRMDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Client List - MUST come before /:id */}
      <Route path="/clients" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SALES_AGENT]}>
            <ClientList />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Client Detail - Only match UUID patterns */}
      <Route path="/clients/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SALES_AGENT]}>
            <ClientDetail />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/crm" replace />} />
    </Routes>
  )
}
