import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import ProcurementDashboard from '../pages/ProcurementDashboard'
import PurchaseRequests from '../pages/PurchaseRequests'
import CreatePurchaseRequest from '../pages/CreatePurchaseRequest'
import PRDetail from '../pages/PRDetail'
import PurchaseOrders from '../pages/PurchaseOrders'
import CreatePurchaseOrder from '../pages/CreatePurchaseOrder'
import RFQManagement from '../pages/RFQManagement'
import CreateRFQ from '../pages/CreateRFQ'
import VendorManagement from '../pages/VendorManagement'
import CreateVendor from '../pages/CreateVendor'
import VendorDetail from '../pages/VendorDetail'
import GoodsReceipts from '../pages/GoodsReceipts'
import CreateGoodsReceipt from '../pages/CreateGoodsReceipt'
import { USER_ROLES } from '../../../types/authTypes'

export default function ProcurementRoutes() {
  const allowedRoles = [
    USER_ROLES.SUPER_ADMIN, 
    USER_ROLES.OPERATIONS_MANAGER, 
    USER_ROLES.FINANCE_OFFICER
  ]

  return (
    <Routes>
      {/* ============================================ */}
      {/* PROCUREMENT DASHBOARD                        */}
      {/* ============================================ */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <ProcurementDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* PURCHASE REQUISITIONS (PR)                   */}
      {/* ============================================ */}
      {/* List all PRs */}
      <Route 
        path="/pr" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PurchaseRequests />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* Create new PR */}
      <Route 
        path="/pr/new" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <CreatePurchaseRequest />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* View/Edit PR Detail */}
      <Route 
        path="/pr/:id" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PRDetail />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* PURCHASE ORDERS (PO)                         */}
      {/* ============================================ */}
      {/* List all POs */}
      <Route 
        path="/po" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PurchaseOrders />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* Create new PO */}
      <Route 
        path="/po/new" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <CreatePurchaseOrder />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* View PO Detail */}
      <Route 
        path="/po/:id" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PRDetail />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* REQUEST FOR QUOTATIONS (RFQ)                 */}
      {/* ============================================ */}
      {/* List all RFQs */}
      <Route 
        path="/rfq" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <RFQManagement />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* Create new RFQ */}
      <Route 
        path="/rfq/new" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <CreateRFQ />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* View RFQ Detail */}
      <Route 
        path="/rfq/:id" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PRDetail />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* VENDOR MANAGEMENT                            */}
      {/* ============================================ */}
      {/* List all vendors */}
      <Route 
        path="/vendors" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <VendorManagement />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* Create new vendor */}
      <Route 
        path="/vendors/new" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <CreateVendor />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* View/Edit vendor detail */}
      <Route 
        path="/vendors/:id" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <VendorDetail />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* GOODS RECEIPTS                               */}
      {/* ============================================ */}
      {/* List all receipts */}
      <Route 
        path="/receipts" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <GoodsReceipts />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* Create new receipt */}
      <Route 
        path="/receipts/new" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <CreateGoodsReceipt />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      {/* View receipt detail */}
      <Route 
        path="/receipts/:id" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PRDetail />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* VENDOR EVALUATIONS                           */}
      {/* ============================================ */}
      <Route 
        path="/evaluations" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <VendorManagement />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* PROCUREMENT BUDGETS                          */}
      {/* ============================================ */}
      <Route 
        path="/budgets" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <ProcurementDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* PROCUREMENT REPORTS                          */}
      {/* ============================================ */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <ProcurementDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}
