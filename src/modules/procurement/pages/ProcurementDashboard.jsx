import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import { 
  ShoppingCart, FileText, Send, Truck, CheckCircle2,
  DollarSign, Users, BarChart3, Plus, TrendingUp,
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft, Clock
} from 'lucide-react'

export default function ProcurementDashboard() {
  const { stats, fetchProcurementStats, loading } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    await fetchProcurementStats()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  const statCards = [
    { icon: Users, label: 'Active Vendors', value: stats.totalVendors || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: FileText, label: 'Pending PRs', value: stats.pendingPRs || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: Send, label: 'Open RFQs', value: stats.openRFQs || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: ShoppingCart, label: 'Pending POs', value: stats.pendingPOs || 0, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: Truck, label: 'Pending Receipts', value: stats.pendingGRs || 0, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { icon: DollarSign, label: 'Budget Used', value: `${stats.budgetUtilization || 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Procurement Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">Purchase requisitions, RFQs, purchase orders, and vendor management</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => navigate('/procurement/pr/new')} className="neu-raised neu-btn px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <Plus className="w-5 h-5" /><span>New PR</span>
            </button>
            <button onClick={() => navigate('/procurement/po/new')} className="neu-raised neu-btn px-4 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /><span>New PO</span>
            </button>
            <button onClick={() => navigate('/procurement/rfq/new')} className="neu-raised neu-btn px-4 py-3 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2">
              <Send className="w-5 h-5" /><span>New RFQ</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4 stat-card">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Budget Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neu-raised rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-600" />Budget Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <p className="text-sm text-slate-500">Total Budget</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency((stats.totalBudget || 0) - (stats.totalSpent || 0))}</p>
            </div>
          </div>
          <div className="mt-4 h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.budgetUtilization || 0}%` }}></div>
          </div>
        </motion.div>

        {/* Recent PRs & POs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-amber-600" />Recent PRs</h2>
              <Link to="/procurement/pr" className="text-sm text-emerald-600 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="space-y-3">
              {stats.recentPRs?.map(pr => (
                <div key={pr.id} className="flex justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => navigate(`/procurement/pr/${pr.id}`)}>
                  <div><p className="font-medium text-sm">{pr.pr_number}</p><p className="text-xs text-slate-500">{pr.purpose || 'No purpose specified'}</p></div>
                  <span className={`px-2 py-1 rounded-full text-xs ${pr.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : pr.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{pr.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-600" />Recent POs</h2>
              <Link to="/procurement/po" className="text-sm text-emerald-600 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="space-y-3">
              {stats.recentPOs?.map(po => (
                <div key={po.id} className="flex justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/30 cursor-pointer">
                  <div><p className="font-medium text-sm">{po.po_number}</p><p className="text-xs text-slate-500">{po.vendors?.company_name || 'No vendor'}</p></div>
                  <span className={`px-2 py-1 rounded-full text-xs ${po.status === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{po.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {[
            { label: 'Vendors', icon: Users, path: '/procurement/vendors' },
            { label: 'Purchase Reqs', icon: FileText, path: '/procurement/pr' },
            { label: 'RFQs', icon: Send, path: '/procurement/rfq' },
            { label: 'Orders', icon: ShoppingCart, path: '/procurement/po' },
            { label: 'Receipts', icon: Truck, path: '/procurement/receipts' },
          ].map(action => (
            <button key={action.label} onClick={() => navigate(action.path)} className="neu-raised neu-btn rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105">
              <action.icon className="w-6 h-6 text-emerald-600" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
            </button>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
