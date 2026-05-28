import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Search, FileText, Plus, Eye, Edit, Trash2, ChevronRight, 
  Sun, Moon, Sparkles, CheckCircle2, XCircle, ShoppingCart,
  Clock, AlertCircle, Filter
} from 'lucide-react'

export default function PurchaseRequests() {
  const { purchaseRequisitions, fetchPurchaseRequisitions, updatePRStatus, convertPRToPO, loading } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => { loadData() }, [statusFilter, priorityFilter])

  const loadData = async () => {
    const filters = {}
    if (statusFilter !== 'all') filters.status = statusFilter
    if (priorityFilter !== 'all') filters.priority = priorityFilter
    await fetchPurchaseRequisitions(filters)
  }

  const filteredPRs = (purchaseRequisitions || []).filter(pr => {
    if (!search) return true
    return pr.pr_number?.toLowerCase().includes(search.toLowerCase()) ||
           pr.purpose?.toLowerCase().includes(search.toLowerCase()) ||
           pr.department?.toLowerCase().includes(search.toLowerCase())
  })

  const handleView = (id) => {
    navigate(`/procurement/pr/${id}`)
  }

  const handleEdit = (id, e) => {
    e.stopPropagation()
    navigate(`/procurement/pr/${id}`)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to cancel this Purchase Requisition?')) {
      const result = await updatePRStatus(id, 'cancelled')
      if (result.success) {
        toast.success('PR cancelled successfully')
        loadData()
      } else {
        toast.error('Failed to cancel PR')
      }
    }
  }

  const handleApprove = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('Approve this Purchase Requisition?')) {
      const result = await updatePRStatus(id, 'approved')
      if (result.success) {
        toast.success('PR approved!')
        loadData()
      } else {
        toast.error('Failed to approve PR')
      }
    }
  }

  const handleReject = async (id, e) => {
    e.stopPropagation()
    const reason = prompt('Rejection reason (optional):')
    const result = await updatePRStatus(id, 'rejected')
    if (result.success) {
      toast.success('PR rejected')
      loadData()
    } else {
      toast.error('Failed to reject PR')
    }
  }

  const handleConvertToPO = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('Convert this PR to a Purchase Order? This action cannot be undone.')) {
      const result = await convertPRToPO(id)
      if (result.success) {
        toast.success('Converted to Purchase Order!')
        loadData()
      } else {
        toast.error(result.error || 'Failed to convert PR to PO')
      }
    }
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
    return badges[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'text-slate-500',
      medium: 'text-blue-600',
      high: 'text-amber-600',
      urgent: 'text-red-600 font-semibold',
    }
    return badges[priority] || 'text-slate-500'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">ERP</span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Purchase Requisitions</span>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-600" />
              Purchase Requisitions
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{(purchaseRequisitions || []).length} requisitions</p>
          </div>
          <button 
            onClick={() => navigate('/procurement/pr/new')} 
            className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>New PR</span>
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="neu-raised rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search by PR number, purpose, department..." 
                className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted_to_po">Converted to PO</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)} 
              className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading requisitions...</p>
          </div>
        )}

        {/* PR Table */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="neu-raised rounded-3xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">PR Number</th>
                    <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Purpose</th>
                    <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Department</th>
                    <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Date</th>
                    <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Priority</th>
                    <th className="text-right text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Total</th>
                    <th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Status</th>
                    <th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPRs.map((pr, index) => (
                    <tr 
                      key={pr.id} 
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => handleView(pr.id)}
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{pr.pr_number}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{pr.purpose || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{pr.department || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pr.date_requested ? new Date(pr.date_requested).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        {pr.date_required && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Required: {new Date(pr.date_required).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium capitalize ${getPriorityBadge(pr.priority)}`}>
                          {pr.priority === 'urgent' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                          {pr.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {formatCurrency(pr.estimated_total)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {pr.purchase_requisition_items?.length || 0} items
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(pr.status)}`}>
                          {pr.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {/* View Button */}
                          <button 
                            onClick={() => handleView(pr.id)}
                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve Button - Only for pending_approval */}
                          {pr.status === 'pending_approval' && (
                            <button 
                              onClick={(e) => handleApprove(pr.id, e)}
                              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject Button - Only for pending_approval */}
                          {pr.status === 'pending_approval' && (
                            <button 
                              onClick={(e) => handleReject(pr.id, e)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Convert to PO - Only for approved */}
                          {pr.status === 'approved' && (
                            <button 
                              onClick={(e) => handleConvertToPO(pr.id, e)}
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Convert to Purchase Order"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Button */}
                          {(pr.status === 'draft' || pr.status === 'pending_approval') && (
                            <button 
                              onClick={(e) => handleEdit(pr.id, e)}
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Cancel/Delete Button */}
                          {pr.status !== 'cancelled' && pr.status !== 'converted_to_po' && (
                            <button 
                              onClick={(e) => handleDelete(pr.id, e)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Cancel PR"
                            >
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

            {/* Empty State */}
            {filteredPRs.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No purchase requisitions found</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
                  {search || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by creating your first purchase requisition'}
                </p>
                {!search && statusFilter === 'all' && priorityFilter === 'all' && (
                  <button 
                    onClick={() => navigate('/procurement/pr/new')} 
                    className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First PR</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Summary Stats */}
        {!loading && filteredPRs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="neu-raised rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total PRs</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{purchaseRequisitions.length}</p>
            </div>
            <div className="neu-raised rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending Approval</p>
              <p className="text-2xl font-bold text-amber-600">{purchaseRequisitions.filter(p => p.status === 'pending_approval').length}</p>
            </div>
            <div className="neu-raised rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{purchaseRequisitions.filter(p => p.status === 'approved').length}</p>
            </div>
            <div className="neu-raised rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Converted to PO</p>
              <p className="text-2xl font-bold text-blue-600">{purchaseRequisitions.filter(p => p.status === 'converted_to_po').length}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
