import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useOperationsStore from '../store/operationsStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Briefcase, Calendar, Clock, CheckCircle2, AlertTriangle,
  Users, MapPin, BarChart3, Plus, TrendingUp,
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft,
  Truck, ClipboardCheck
} from 'lucide-react'

export default function OperationsDashboard() {
  const { stats, fetchOperationsStats, fetchJobs, loading } = useOperationsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [todayJobs, setTodayJobs] = useState([])
  const [recentJobs, setRecentJobs] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const statsData = await fetchOperationsStats()
    setTodayJobs(statsData.todayJobs || [])
    setRecentJobs(statsData.recentJobs || [])
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      on_hold: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-slate-500',
      medium: 'text-blue-600',
      high: 'text-amber-600',
      urgent: 'text-red-600',
      emergency: 'text-red-600 animate-pulse',
    }
    return colors[priority] || 'text-slate-500'
  }

  const statCards = [
    { icon: Briefcase, label: 'Total Jobs', value: stats.totalJobs || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Calendar, label: 'Scheduled Today', value: stats.scheduledToday || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Clock, label: 'In Progress', value: stats.inProgress || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: CheckCircle2, label: 'Completed Today', value: stats.completedToday || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: AlertTriangle, label: 'Overdue', value: stats.overdueJobs || 0, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { icon: TrendingUp, label: 'Completion Rate', value: `${stats.completionRate || 0}%`, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ]

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">ERP</span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <Link to="/dashboard" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Main Dashboard</span>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Operations & Scheduling</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">Job management, team scheduling, routes, and quality control</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/operations/jobs/new')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <Plus className="w-5 h-5" /><span>New Job</span>
            </button>
            <button onClick={() => navigate('/operations/routes')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <Truck className="w-5 h-5" /><span>Plan Route</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4 stat-card">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'All Jobs', icon: Briefcase, path: '/operations/jobs' },
            { label: 'Calendar', icon: Calendar, path: '/operations/calendar' },
            { label: 'Teams', icon: Users, path: '/operations/teams' },
            { label: 'Quality Checks', icon: ClipboardCheck, path: '/operations/quality' },
          ].map(action => (
            <button key={action.label} onClick={() => navigate(action.path)} className="neu-raised neu-btn rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105">
              <action.icon className="w-6 h-6 text-emerald-600" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Today's Jobs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6 mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-600" />Today's Schedule</h2>
            <Link to="/operations/calendar" className="text-sm text-emerald-600 flex items-center gap-1">Calendar <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Job #</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Client</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Category</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Time</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Priority</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Status</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Location</th>
                </tr>
              </thead>
              <tbody>
                {todayJobs.map(job => (
                  <tr key={job.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => navigate(`/operations/jobs/${job.id}`)}>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-white">{job.job_number}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{job.clients?.company_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: job.job_categories?.color + '20', color: job.job_categories?.color }}>
                        {job.job_categories?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{job.scheduled_start_time?.slice(0,5)}</td>
                    <td className="py-3 px-4"><span className={`text-xs font-medium ${getPriorityColor(job.priority)}`}>{job.priority}</span></td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>{job.status.replace('_', ' ')}</span></td>
                    <td className="py-3 px-4 text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.site_city || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {todayJobs.length === 0 && <p className="text-center text-slate-500 py-8">No jobs scheduled for today</p>}
        </motion.div>

        {/* Recent Jobs & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-600" />Recent Jobs</h2>
            <div className="space-y-3">
              {recentJobs.map(job => (
                <div key={job.id} className="flex justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => navigate(`/operations/jobs/${job.id}`)}>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white text-sm">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.clients?.company_name} · {job.job_number}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>{job.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-600" />Job Categories</h2>
            <div className="space-y-3">
              {['Office Cleaning', 'Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning', 'Industrial Cleaning'].map(cat => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{cat}</span>
                  <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
