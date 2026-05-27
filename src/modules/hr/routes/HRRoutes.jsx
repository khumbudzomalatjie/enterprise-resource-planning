import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'
import RoleBasedRoute from '../../../components/RoleBasedRoute'
import HRDashboard from '../pages/HRDashboard'
import EmployeeList from '../pages/EmployeeList'
import AttendanceDashboard from '../attendance/pages/AttendanceDashboard'
import { USER_ROLES } from '../../../types/authTypes'

export default function HRRoutes() {
  return (
    <Routes>
      {/* HR Main Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Employee Management */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <EmployeeList />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <EmployeeList />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <EmployeeList />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Attendance Tracking (Sub-module under HR) */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER, 
              USER_ROLES.SUPERVISOR,
              USER_ROLES.CLEANER
            ]}>
              <AttendanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/records"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER, 
              USER_ROLES.SUPERVISOR
            ]}>
              <AttendanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/qr"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.SUPERVISOR
            ]}>
              <AttendanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/timesheets"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER, 
              USER_ROLES.SUPERVISOR
            ]}>
              <AttendanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/shifts"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER, 
              USER_ROLES.SUPERVISOR
            ]}>
              <AttendanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/reports"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER
            ]}>
              <AttendanceDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Leave Management Routes */}
      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER, 
              USER_ROLES.OPERATIONS_MANAGER,
              USER_ROLES.SUPERVISOR,
              USER_ROLES.CLEANER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Contract Routes */}
      <Route
        path="/contracts"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contracts/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Training Routes */}
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Disciplinary Routes */}
      <Route
        path="/disciplinary"
        element={
          <ProtectedRoute>
            <RoleBasedRoute requiredRoles={[
              USER_ROLES.SUPER_ADMIN, 
              USER_ROLES.HR_MANAGER
            ]}>
              <HRDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Redirect to Operations Module */}
      <Route
        path="/jobs"
        element={<Navigate to="/operations" replace />}
      />

      {/* Catch-all redirect for HR */}
      <Route
        path="*"
        element={<Navigate to="/hr" replace />}
      />
    </Routes>
  )
}
