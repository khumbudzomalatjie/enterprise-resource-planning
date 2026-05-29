import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useFinanceStore from '../store/financeStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Building2, CheckCircle2, XCircle, Search, ArrowLeft,
  Sun, Moon, Sparkles, Mail, Phone, MapPin, Clock,
  Star, Shield, Users
} from 'lucide-react'

export default function VendorApprovals() {
  const { pendingVendors, pendingApprovals, fetchPendingApprovals, fetchPendingVendors, approveRequest, rejectRequest } = useFinanceStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchPendingApprovals()
    fetchPendingVendors()
  }, [])

  const handleApproveVendor = async (vendorId) => {
    setProcessingId(vendorId)
    const approval = pendingApprovals?.find(a => a.reference_id === vendorId && a.approval_type === 'vendor')
    if (approval) {
      const result = await approveRequest(approval.id)
      if (result.success) {
        toast.success('Vendor approved! ✅')
        fetchPendingApprovals()
        fetchPendingVendors()
      } else {
        toast.error('Failed to approve vendor')
      }
    }
    setProcessingId(null)
  }

  const handleRejectVendor = async (vendorId) => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return // User cancelled
    
    setProcessingId(vendorId)
    const approval = pendingApprovals?.find(a => a.reference_id === vendorId && a.approval_type === 'vendor')
    if (approval) {
      const result = await rejectRequest(approval.id, null, reason)
      if (result.success) {
        toast.success('Vendor rejected')
        fetchPendingApprovals()
        fetchPendingVendors()
      } else {
        toast.error('Failed to reject vendor')
      }
    }
    setProcessingId(null)
  }

  // Other approvals (PR, PO, etc.)
  const handleApprove = async (approvalId) => {
    setProcessingId(approvalId)
    const result = await approveRequest(approvalId)
    if (result.success) {
      toast.success('Approved! ✅')
      fetchPendingApprovals()
      fetchPendingVendors()
    }
    setProcessingId(null)
  }

  const handleReject = async (approvalId) => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return
    
    setProcessingId(approvalId)
    const result = await rejectRequest(approvalId, null, reason)
    if (result.success) {
      toast.success('Rejected')
      fetchPendingApprovals()
      fetchPendingVendors()
    }
    setProcessingId(null)
  }

  const filteredVendors = pendingVendors.filter(v => {
    if (!search) return true
    const s = search.toLowerCase()
    return (v.company_name || '').toLowerCase().includes(s) ||
           (v.vendor_code || '').toLowerCase().includes(s) ||
           (v.email || '').toLowerCase().includes(s) ||
           (v.vendor_category || '').toLowerCase().includes(s)
  })

  const otherApprovals = pendingApprovals?.filter(a => a.approval_type !== 'vendor') || []

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
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
        <Link to="/finance" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Finance</span>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-amber-600" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Vendor Approvals</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">
              {pendingVendors.length} vendors pending approval · {otherApprovals.length} other approvals
            </p>
          </div>
          <button onClick={() => { fetchPendingApprovals(); fetchPendingVendors() }} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700">
            Refresh
          </button>
        </motion.div>

        {/* Search */}
        <div className="neu-raised rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search vendors by name, code, email, or category..." 
              className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 text-sm" 
            />
          </div>
        </div>

        {/* Vendor Approvals Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            Vendor Approvals ({filteredVendors.length})
          </h2>

          {filteredVendors.length > 0 ? (
            <div className="space-y-4">
              {filteredVendors.map(vendor => (
                <motion.div key={vendor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="neu-raised rounded-2xl p-5 border-2 border-amber-200 dark:border-amber-800">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{vendor.company_name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500">{vendor.vendor_code}</span>
                          {vendor.is_preferred && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-purple-500" /> Preferred
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            vendor.status === 'pending_approval' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {vendor.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleApproveVendor(vendor.id)}
                        disabled={processingId === vendor.id}
                        className="neu-raised neu-btn px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                      >
                        {processingId === vendor.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        Approve Vendor
                      </button>
                      <button 
                        onClick={() => handleRejectVendor(vendor.id)}
                        disabled={processingId === vendor.id}
                        className="neu-raised neu-btn px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{vendor.email || 'No email'}</span>
                      </div>
                      {vendor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.contact_person && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{vendor.contact_person}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400 capitalize">{vendor.vendor_category?.replace(/_/g, ' ') || 'N/A'}</span>
                      </div>
                      {vendor.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{vendor.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Lead: {vendor.lead_time_days || 'N/A'} days</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-500">BBBEE:</span> Level {vendor.bbbee_level || 'N/A'}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-500">Payment:</span> {vendor.payment_terms?.replace(/_/g, ' ') || 'N/A'}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-500">Min Order:</span> R{vendor.minimum_order_value?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>

                  {vendor.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <p className="text-xs text-slate-500 italic">Notes: {vendor.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="neu-raised rounded-3xl p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No pending vendor approvals! 🎉</p>
              <p className="text-slate-400 text-sm mt-2">All vendors have been reviewed and processed.</p>
            </div>
          )}
        </motion.div>

        {/* Other Approvals Section */}
        {otherApprovals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Other Pending Approvals ({otherApprovals.length})
            </h2>
            <div className="neu-raised rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left py-3 px-4 text-slate-500">Reference</th>
                      <th className="text-left py-3 px-4 text-slate-500">Type</th>
                      <th className="text-left py-3 px-4 text-slate-500">Requested</th>
                      <th className="text-center py-3 px-4 text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherApprovals.map(approval => (
                      <tr key={approval.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{approval.reference_name || approval.reference_number}</td>
                        <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">{approval.approval_type?.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(approval.requested_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleApprove(approval.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Approve</button>
                            <button onClick={() => handleReject(approval.id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

// Need to import FileText
import { FileText } from 'lucide-react'
