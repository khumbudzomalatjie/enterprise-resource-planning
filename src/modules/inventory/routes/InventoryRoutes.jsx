import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import InventoryDashboard from '../pages/InventoryDashboard'
import StockList from '../pages/StockList'
import AddItem from '../pages/AddItem'
import StockIn from '../pages/StockIn'
import StockOut from '../pages/StockOut'
import { USER_ROLES } from '../../../types/authTypes'

export default function InventoryRoutes() {
  const allowedRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.SUPERVISOR]

  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <InventoryDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Stock List */}
      <Route path="/items" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <StockList />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Add New Item */}
      <Route path="/items/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <AddItem />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Edit Item */}
      <Route path="/items/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <AddItem />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Stock In */}
      <Route path="/stock-in" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <StockIn />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      
      {/* Stock Out */}
      <Route path="/stock-out" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <StockOut />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
