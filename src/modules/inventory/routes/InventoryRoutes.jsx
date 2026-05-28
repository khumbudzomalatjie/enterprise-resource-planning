import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import InventoryDashboard from '../pages/InventoryDashboard'
import StockList from '../pages/StockList'
import { USER_ROLES } from '../../../types/authTypes'

export default function InventoryRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]}>
            <InventoryDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/items" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]}>
            <StockList />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/items/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]}>
            <StockList />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
