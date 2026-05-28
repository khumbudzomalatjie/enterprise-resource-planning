import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import ProcurementDashboard from '../pages/ProcurementDashboard'
import PurchaseRequests from '../pages/PurchaseRequests'
import CreatePurchaseRequest from '../pages/CreatePurchaseRequest'
import PurchaseOrders from '../pages/PurchaseOrders'
import RFQManagement from '../pages/RFQManagement'
import VendorManagement from '../pages/VendorManagement'
import GoodsReceipts from '../pages/GoodsReceipts'
import { USER_ROLES } from '../../../types/authTypes'

export default function ProcurementRoutes() {
  const allowedRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.OPERATIONS_MANAGER, USER_ROLES.FINANCE_OFFICER]

  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <ProcurementDashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      {/* Purchase Requests */}
      <Route path="/pr" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <PurchaseRequests />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/pr/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/pr/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      {/* Purchase Orders */}
      <Route path="/po" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <PurchaseOrders />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/po/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/po/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      {/* RFQs */}
      <Route path="/rfq" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <RFQManagement />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/rfq/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/rfq/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      {/* Vendors */}
      <Route path="/vendors" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <VendorManagement />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/vendors/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/vendors/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/vendors/:id/edit" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      {/* Goods Receipts */}
      <Route path="/receipts" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <GoodsReceipts />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/receipts/new" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/receipts/:id" element={
        <ProtectedRoute>
          <RoleBasedRoute requiredRoles={allowedRoles}>
            <CreatePurchaseRequest />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
