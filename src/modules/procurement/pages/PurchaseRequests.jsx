import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Search, FileText, Plus, Eye, Edit, Trash2, ChevronRight, Sun, Moon, Sparkles } from 'lucide-react'

export default function PurchaseRequests() {
  const { purchaseRequisitions, fetchPurchaseRequisitions, updatePRStatus, loading } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadData() }, [statusFilter])

  const loadData = async () => {
    const filters = {}
    if (statusFilter !== 'all') filters.status = statusFilter
    await fetchPurchaseRequisitions(filters)
  }

  const filteredPRs = purchaseRequisitions.filter(pr => {
    if (!search) return true
    return pr.pr_number?.toLowerCase().includes(search.toLowerCase()) ||
           pr.purpose?.toLowerCase().includes(search.toLowerCase())
  })

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this PR?')) {
      await updatePRStatus(id, 'cancelled')
      toast.success('PR cancelled')
      loadData()
    }
  }

  const handleApprove = async (id) => {
    await updatePRStatus(id, 'approved')
    toast.success('PR approved!')
    loadData()
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      converted_to_po: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    }
    return badges[status] || 'bg-slate-100 text-slate-700'
  }

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
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Purchase Requests</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-600" />Purchase Requisitions
            </h1>
            <p className="text-slate-500 mt-1">{purchaseRequisitions.length} requisitions</p>
          </div>
          <button onClick={() => navigate('/procurement/pr/new')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>New PR</span>
          </button>
        </motion.div>

        {/* Filters */}
        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search PRs..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="converted_to_po">Converted to PO</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* PR List */}
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div><p className="text-slate-500">Loading...</p></div>
        ) : (
          <div className="neu-raised rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">PR Number</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Purpose</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Department</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Date</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Priority</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Total</th>
                    <th className="text-center text-sm font-medium text-slate-500 py-4 px-4">Status</th>
                    <th className="text-right text-sm font-medium text-slate-500 py-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPRs.map(pr => (
                    <tr key={pr.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-white">{pr.pr_number}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{pr.purpose || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{pr.department || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">{new Date(pr.date_requested).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${pr.priority === 'urgent' ? 'text-red-600' : pr.priority === 'high' ? 'text-amber-600' : 'text-slate-500'}`}>
                          {pr.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(pr.estimated_total || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(pr.status)}`}>
                          {pr.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/procurement/pr/${pr.id}`)} className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {pr.status === 'pending_approval' && (
                            <button onClick={() => handleApprove(pr.id)} className="p-2 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600" title="Approve">✓</button>
                          )}
                          {pr.status !== 'cancelled' && pr.status !== 'converted_to_po' && (
                            <button onClick={() => handleDelete(pr.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600" title="Cancel">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPRs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No purchase requests found</p>
                <button onClick={() => navigate('/procurement/pr/new')} className="mt-4 neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white">Create First PR</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
