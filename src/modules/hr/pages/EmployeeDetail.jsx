import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useHRStore from '../store/hrStore'
import useThemeStore from '../../../store/themeStore'
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar,
  FileText, GraduationCap, AlertTriangle, ChevronRight,
  Sun, Moon, Sparkles, Edit, User
} from 'lucide-react'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedEmployee, fetchEmployee, loading } = useHRStore()
  const { isDark, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (id) fetchEmployee(id)
  }, [id])

  const employee = selectedEmployee

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Employee not found</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">
            Enterprise Resource Planning
          </span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/hr" className="text-slate-500 hover:text-emerald-600">HR Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/hr/employees" className="text-slate-500 hover:text-emerald-600">Employees</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">
            {employee.first_name} {employee.last_name}
          </span>
        </div>

        {/* Employee Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neu-raised rounded-3xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-emerald-600 text-3xl font-bold">
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {employee.first_name} {employee.last_name}
                  </h1>
                  <p className="text-slate-500">{employee.employee_code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  employee.employment_status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {employee.employment_status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Briefcase className="w-4 h-4" />
                  <span>{employee.position || 'No position'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Hired: {employee.date_of_hire ? new Date(employee.date_of_hire).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Employee Details Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Personal Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-500">Department</label>
                <p className="text-slate-800 dark:text-white">{employee.department || 'N/A'}</p>
              </div>
              <div>
                <label className="text-slate-500">Employment Type</label>
                <p className="text-slate-800 dark:text-white capitalize">{employee.employment_type?.replace('_', ' ') || 'N/A'}</p>
              </div>
              <div>
                <label className="text-slate-500">ID Number</label>
                <p className="text-slate-800 dark:text-white">{employee.id_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: FileText, label: 'View Contracts', path: `/hr/contracts?employee=${employee.id}` },
                { icon: Calendar, label: 'Leave History', path: `/hr/leave?employee=${employee.id}` },
                { icon: GraduationCap, label: 'Training Records', path: `/hr/training?employee=${employee.id}` },
                { icon: AlertTriangle, label: 'Disciplinary Records', path: `/hr/disciplinary?employee=${employee.id}` },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <action.icon className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {employee.contracts?.length || 0}
                </p>
                <p className="text-sm text-slate-500">Active Contracts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {employee.training_records?.length || 0}
                </p>
                <p className="text-sm text-slate-500">Training Records</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {employee.disciplinary_records?.length || 0}
                </p>
                <p className="text-sm text-slate-500">Disciplinary Cases</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
