import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import FinanceDashboard from '../pages/FinanceDashboard'
import AccountsPayable from '../pages/AccountsPayable'
import AccountsReceivable from '../pages/AccountsReceivable'
import BudgetManagement from '../pages/BudgetManagement'
import GeneralLedger from '../pages/GeneralLedger'
import PaymentRecords from '../pages/PaymentRecords'
import { USER_ROLES } from '../../../types/authTypes'

export default function FinanceRoutes() {
  const allowedRoles = [
    USER_ROLES.SUPER_ADMIN, 
    USER_ROLES.FINANCE_OFFICER, 
    USER_ROLES.OPERATIONS_MANAGER
  ]

  return (
    <Routes>
      {/* ============================================ */}
      {/* FINANCE DASHBOARD                            */}
      {/* ============================================ */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <FinanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* APPROVALS QUEUE                              */}
      {/* ============================================ */}
      <Route 
        path="/approvals" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <FinanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* ACCOUNTS PAYABLE - Full CRUD                 */}
      {/* ============================================ */}
      <Route 
        path="/payables" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <AccountsPayable />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* ACCOUNTS RECEIVABLE - View & Receive Payment */}
      {/* ============================================ */}
      <Route 
        path="/receivables" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <AccountsReceivable />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* BUDGET MANAGEMENT - Create & View            */}
      {/* ============================================ */}
      <Route 
        path="/budgets" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <BudgetManagement />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* GENERAL LEDGER - View & Filter               */}
      {/* ============================================ */}
      <Route 
        path="/ledger" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <GeneralLedger />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* PAYMENT RECORDS - Create & View              */}
      {/* ============================================ */}
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <PaymentRecords />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

      {/* ============================================ */}
      {/* FINANCE REPORTS                              */}
      {/* ============================================ */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={allowedRoles}>
              <FinanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}
