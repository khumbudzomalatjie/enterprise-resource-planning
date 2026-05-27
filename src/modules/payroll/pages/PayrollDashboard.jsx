import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import usePayrollStore from '../store/payrollStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  CreditCard, DollarSign, FileText, Clock, 
  TrendingUp, TrendingDown, Users, Calculator,
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft,
  Download, Printer, BarChart3, PieChart
} from 'lucide-react'

export default function PayrollDashboard() {
  const { stats, fetchPayrollStats, fetchPayrollPeriods, fetchPayslips, fetchOvertimeRecords, loading } = usePayrollStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [recentPayslips, setRecentPayslips] = useState([])
  const [pendingOvertime, setPendingOvertime] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await fetchPayrollStats()
    await fetchPayrollPeriods()
    const payslipResult = await fetchPayslips()
    if (payslipResult.success) setRecentPayslips(payslipResult.data.slice(0, 5))
    const overtimeResult = await fetchOvertimeRecords({ status: 'pending' })
    if (overtimeResult.success) setPendingOvertime(overtimeResult.data.slice(0, 5))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const statCards = [
    { 
      icon: DollarSign, 
      label: 'Total Gross Salary', 
      value: formatCurrency(stats.totalGross), 
      color: 'text-blue-600', 
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      icon: TrendingDown, 
      label: 'Total Deductions', 
      value: formatCurrency(stats.totalDeductions), 
      color: 'text-red-600', 
      bg: 'bg-red-100 dark:bg-red-900/30',
      trend: '+2.1%',
      trendUp: true
    },
    { 
      icon: TrendingUp, 
      label: 'Total Net Salary', 
      value: formatCurrency(stats.totalNetSalary), 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      trend: '+4.8%',
      trendUp: true
    },
    { 
      icon: Users, 
      label: 'Total Payslips', 
      value: stats.totalPayslips || 0, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100 dark:bg-purple-900/30' 
    },
    { 
      icon: Clock, 
      label: 'Pending Overtime', 
      value: stats.pendingOvertime || 0, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100 dark:bg-amber-900/30' 
    },
    { 
      icon: Calculator, 
      label: 'Avg Monthly Salary', 
      value: formatCurrency(stats.averageSalary), 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-100 dark:bg-indigo-900/30' 
    },
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
        {/* Breadcrumb */}
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
            <CreditCard className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              Payroll Management
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-11">
            Salary processing, payslips, overtime, and tax management
          </p>
        </motion.div>

        {/* Current Period Banner */}
        {stats.currentPeriod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{stats.currentPeriod.period_name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(stats.currentPeriod.period_start).toLocaleDateString()} - {new Date(stats.currentPeriod.period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs ${
                stats.currentPeriod.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {stats.currentPeriod.status}
              </span>
              <button className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700">
                Run Payroll
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'New Payslip', icon: FileText, path: '/payroll/payslips/new' },
            { label: 'Add Overtime', icon: Clock, path: '/payroll/overtime/new' },
            { label: 'Salary Structures', icon: Calculator, path: '/payroll/salaries' },
            { label: 'Generate Report', icon: BarChart3, path: '/payroll/reports' },
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
              transition={{ delay: 0.2 + index * 0.05 }}
              className="neu-raised rounded-2xl p-4 stat-card"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                {stat.trend && (
                  <span className={`text-xs ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payslips */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Recent Payslips
              </h2>
              <Link to="/payroll/payslips" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPayslips.map((payslip) => (
                <div 
                  key={payslip.id} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/payroll/payslips/${payslip.id}`)}
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white text-sm">
                      {payslip.employees?.first_name} {payslip.employees?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{payslip.payslip_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {formatCurrency(payslip.net_salary)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      payslip.status === 'paid' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {payslip.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Overtime */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pending Overtime
              </h2>
              <Link to="/payroll/overtime" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendingOvertime.map((ot) => (
                <div key={ot.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white text-sm">
                      {ot.employees?.first_name} {ot.employees?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{ot.hours_worked} hours · {new Date(ot.overtime_date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                    {ot.status}
                  </span>
                </div>
              ))}
              {pendingOvertime.length === 0 && (
                <p className="text-center text-slate-500 py-8">No pending overtime requests</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

// Missing Calendar import fix
import { Calendar } from 'lucide-react'
