import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useHRStore from '../store/hrStore'
import useThemeStore from '../../../store/themeStore'
import { 
  Users, UserPlus, UserCheck, UserX, 
  FileText, Calendar, Briefcase, GraduationCap,
  AlertTriangle, Clock, TrendingUp, Sparkles,
  Sun, Moon, ChevronRight, ArrowLeft
} from 'lucide-react'

export default function HRDashboard() {
  const { stats, fetchHRStats, fetchEmployees, fetchLeaveRequests, loading } = useHRStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [recentEmployees, setRecentEmployees] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await fetchHRStats()
    const empResult = await fetchEmployees({ limit: 5 })
    if (empResult.success) setRecentEmployees(empResult.data.slice(0, 5))
    const leaveResult = await fetchLeaveRequests({ status: 'pending' })
    if (leaveResult.success) setPendingLeaves(leaveResult.data.slice(0, 5))
  }

  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats.totalEmployees || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: UserCheck, label: 'Active Employees', value: stats.activeEmployees || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: FileText, label: 'Active Contracts', value: stats.activeContracts || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: Clock, label: 'Pending Leave', value: stats.pendingLeave || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: GraduationCap, label: 'Ongoing Training', value: stats.ongoingTraining || 0, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { icon: AlertTriangle, label: 'Disciplinary Cases', value: '0', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  ]

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
        <button 
          onClick={toggleTheme}
          className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Back to Dashboard */}
        <Link 
          to="/dashboard"
          className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="text-sm">Back to Main Dashboard</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              HR Management
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-11">
            Employee lifecycle management, contracts, leave, and training
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Add Employee', icon: UserPlus, path: '/hr/employees/new' },
            { label: 'New Contract', icon: FileText, path: '/hr/contracts/new' },
            { label: 'Leave Request', icon: Calendar, path: '/hr/leave/new' },
            { label: 'Training Record', icon: GraduationCap, path: '/hr/training/new' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="neu-raised neu-btn rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
            >
              <action.icon className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="neu-raised rounded-2xl p-4 stat-card"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Employees */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Recent Employees
              </h2>
              <Link 
                to="/hr/employees"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/hr/employees/${emp.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-slate-500">{emp.position || 'No position'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    emp.employment_status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {emp.employment_status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Leave Requests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Pending Leave Requests
              </h2>
              <Link 
                to="/hr/leave"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white text-sm">
                      {leave.employees?.first_name} {leave.employees?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{leave.leave_types?.name} · {leave.total_days} days</p>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                <p className="text-center text-slate-500 py-8">No pending leave requests</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
