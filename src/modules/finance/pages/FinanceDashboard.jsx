import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useFinanceStore from '../store/financeStore'
import useThemeStore from '../../../store/themeStore'
import { 
  Landmark, DollarSign, TrendingUp, TrendingDown, 
  CheckCircle2, Clock, AlertCircle, FileText, 
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft,
  Users, ShoppingCart, Send, Receipt, BarChart3,
  Briefcase, Building2, XCircle
} from 'lucide-react'

export default function FinanceDashboard() {
  const { stats, fetchFinanceStats, pendingApprovals, fetchPendingApprovals, fetchPendingVendors, pendingVendors, approveRequest, rejectRequest } = useFinanceStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchFinanceStats()
    fetchPendingApprovals()
    fetchPendingVendors()
  }, [])

  const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)

  const handleApproveVendor = async (vendorId) => {
    // Find the approval record for this vendor
    const approval = pendingApprovals?.find(a => a.reference_id === vendorId && a.approval_type === 'vendor')
    if (approval) {
      const result = await approveRequest(approval.id)
      if (result.success) {
        fetchPendingApprovals()
        fetchPendingVendors()
      }
    }
  }

  const handleRejectVendor = async (vendorId) => {
    const reason = prompt('Rejection reason (optional):')
    const approval = pendingApprovals?.find(a => a.reference_id === vendorId && a.approval_type === 'vendor')
    if (approval) {
      await rejectRequest(approval.id, null, reason)
      fetchPendingApprovals()
      fetchPendingVendors()
    }
  }

  const handleApprove = async (approvalId) => {
    const result = await approveRequest(approvalId)
    if (result.success) {
      fetchPendingApprovals()
      fetchPendingVendors()
    }
  }

  const handleReject = async (approvalId) => {
    const reason = prompt('Rejection reason (optional):')
    await rejectRequest(approvalId, null, reason)
    fetchPendingApprovals()
    fetchPendingVendors()
  }

  const statCards = [
    { icon: AlertCircle, label: 'Pending Approvals', value: stats.pendingApprovals || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: TrendingUp, label: 'Receivables', value: formatCurrency(stats.totalReceivables), color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: TrendingDown, label: 'Payables', value: formatCurrency(stats.totalPayables), color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { icon: DollarSign, label: 'Budget Used', value: `${stats.budgetUtilization || 0}%`, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: Landmark, label: 'Total Budget', value: formatCurrency(stats.totalBudget), color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Receipt, label: 'Monthly Payments', value: formatCurrency(stats.monthlyPayments), color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
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
            <Landmark className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Finance & Accounting</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-11">Approvals, budgets, ledger, payables, receivables, vendor management & invoice generation</p>
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

        {/* PENDING APPROVALS - VENDOR APPROVAL SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neu-raised rounded-3xl p-6 mb-8 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-600" />
              Vendor Approvals
              {pendingVendors.length > 0 && (
                <span className="px-2 py-1 rounded-full text-xs bg-amber-600 text-white">{pendingVendors.length} Pending</span>
              )}
            </h2>
          </div>

          {pendingVendors.length > 0 ? (
            <div className="space-y-3">
              {pendingVendors.map(vendor => (
                <div key={vendor.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <p className="font-semibold text-slate-800 dark:text-white">{vendor.company_name}</p>
                      {vendor.is_preferred && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Preferred</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-500 mt-2">
                      <div><span className="font-medium">Code:</span> {vendor.vendor_code}</div>
                      <div><span className="font-medium">Email:</span> {vendor.email || 'N/A'}</div>
                      <div><span className="font-medium">Category:</span> {vendor.vendor_category?.replace(/_/g, ' ') || 'N/A'}</div>
                      <div><span className="font-medium">BBBEE:</span> Level {vendor.bbbee_level || 'N/A'}</div>
                      {vendor.contact_person && <div><span className="font-medium">Contact:</span> {vendor.contact_person}</div>}
                      {vendor.phone && <div><span className="font-medium">Phone:</span> {vendor.phone}</div>}
                      {vendor.city && <div><span className="font-medium">Location:</span> {vendor.city}</div>}
                      {vendor.lead_time_days && <div><span className="font-medium">Lead Time:</span> {vendor.lead_time_days} days</div>}
                    </div>
                    {vendor.notes && (
                      <p className="text-xs text-slate-400 mt-2 italic">Notes: {vendor.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleApproveVendor(vendor.id)} className="neu-raised neu-btn px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleRejectVendor(vendor.id)} className="neu-raised neu-btn px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm flex items-center gap-1 font-medium">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500">No pending vendor approvals 🎉</p>
              <p className="text-slate-400 text-xs mt-1">All vendors have been reviewed</p>
            </div>
          )}

          {/* Other Pending Approvals (PR, PO, etc.) */}
          {pendingApprovals && pendingApprovals.filter(a => a.approval_type !== 'vendor').length > 0 && (
            <div className="mt-6 pt-6 border-t border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Other Pending Approvals ({pendingApprovals.filter(a => a.approval_type !== 'vendor').length})
              </h3>
              <div className="space-y-2">
                {pendingApprovals.filter(a => a.approval_type !== 'vendor').map(approval => (
                  <div key={approval.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                    <div>
                      <p className="font-medium text-sm text-slate-800 dark:text-white">{approval.reference_name || approval.reference_number}</p>
                      <p className="text-xs text-slate-500 capitalize">{approval.approval_type?.replace(/_/g, ' ')} · Requested {new Date(approval.requested_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(approval.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Approve</button>
                      <button onClick={() => handleReject(approval.id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Vendor Approvals', icon: Building2, path: '/finance/approvals', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
              { label: 'Payables', icon: TrendingDown, path: '/finance/payables', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
              { label: 'Receivables', icon: TrendingUp, path: '/finance/receivables', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { label: 'Budgets', icon: DollarSign, path: '/finance/budgets', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
              { label: 'Ledger', icon: FileText, path: '/finance/ledger', color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
              { label: 'Payments', icon: Receipt, path: '/finance/payments', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
              { label: 'Jobs → Invoice', icon: Briefcase, path: '/finance/jobs', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
              { label: 'Procurement', icon: ShoppingCart, path: '/procurement', color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
            ].map(action => (
              <button key={action.label} onClick={() => navigate(action.path)} 
                className="neu-raised neu-btn rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Budget Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="neu-raised rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />Budget Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <p className="text-sm text-slate-500">Total Budget</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency((stats.totalBudget || 0) - (stats.totalSpent || 0))}</p>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.budgetUtilization || 0, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">{stats.budgetUtilization || 0}% of budget utilized</p>
        </motion.div>
      </main>
    </div>
  )
}
