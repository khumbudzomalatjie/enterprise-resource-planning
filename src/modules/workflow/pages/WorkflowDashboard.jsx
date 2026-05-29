import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { workflowApi } from '../api/workflowApi'
import toast from 'react-hot-toast'
import { 
  Workflow, Play, CheckCircle2, XCircle, Clock, 
  Plus, Zap, Settings, BarChart3, ArrowLeft,
  Sparkles, Sun, Moon
} from 'lucide-react'

export default function WorkflowDashboard() {
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [workflows, setWorkflows] = useState([])
  const [approvalRules, setApprovalRules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [statsData, { data: wf }, { data: rules }] = await Promise.all([
      workflowApi.getStats(),
      workflowApi.getWorkflows(),
      workflowApi.getApprovalRules()
    ])
    setStats(statsData)
    setWorkflows(wf || [])
    setApprovalRules(rules || [])
    setLoading(false)
  }

  const toggleWorkflow = async (id, currentStatus) => {
    await workflowApi.updateWorkflow(id, { is_active: !currentStatus })
    toast.success(`Workflow ${currentStatus ? 'disabled' : 'enabled'}`)
    loadData()
  }

  const triggers = [
    { id: 'job_created', label: 'Job Created', icon: '📋' },
    { id: 'pr_submitted', label: 'PR Submitted', icon: '📝' },
    { id: 'leave_requested', label: 'Leave Requested', icon: '🏖️' },
    { id: 'invoice_created', label: 'Invoice Created', icon: '🧾' },
    { id: 'vendor_pending', label: 'Vendor Pending', icon: '🏢' },
    { id: 'low_stock', label: 'Low Stock Alert', icon: '📦' },
    { id: 'maintenance_due', label: 'Maintenance Due', icon: '🔧' },
    { id: 'scheduled', label: 'Scheduled', icon: '⏰' },
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Workflow className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Workflow Automation</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-11">Automate approvals, triggers, and business processes</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Workflow, label: 'Total Workflows', value: stats.totalWorkflows || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: Play, label: 'Active', value: stats.activeWorkflows || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: CheckCircle2, label: 'Executions', value: stats.totalExecutions || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
            { icon: Settings, label: 'Approval Rules', value: approvalRules.length, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Available Triggers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neu-raised rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" />Available Triggers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {triggers.map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors">
                <span className="text-2xl">{t.icon}</span>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">{t.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Approval Rules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" />Approval Rules</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700"><th className="text-left py-2 px-3 text-slate-500">Rule</th><th className="text-left py-2 px-3 text-slate-500">Applies To</th><th className="text-left py-2 px-3 text-slate-500">Amount Range</th><th className="text-left py-2 px-3 text-slate-500">Approver</th></tr></thead>
              <tbody>
                {approvalRules.map(rule => (
                  <tr key={rule.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-2 px-3 font-medium">{rule.rule_name}</td>
                    <td className="py-2 px-3 capitalize">{rule.applies_to?.replace('_', ' ')}</td>
                    <td className="py-2 px-3">{rule.min_amount > 0 ? `R${rule.min_amount}+` : 'Any'}</td>
                    <td className="py-2 px-3 capitalize">{rule.approver_role?.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Executions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="neu-raised rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" />Recent Executions</h2>
          <div className="space-y-2">
            {stats.recentExecutions?.map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-sm">
                <div>
                  <p className="font-medium">{ex.workflows?.workflow_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{new Date(ex.started_at).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${ex.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ex.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {ex.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
