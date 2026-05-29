import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { Package, ArrowLeft, Search, CheckCircle2, XCircle, Sun, Moon, Sparkles } from 'lucide-react'

export default function SupplyOrders() {
  const { isDark, toggleTheme } = useThemeStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadRequests() }, [statusFilter])

  const loadRequests = async () => {
    setLoading(true)
    let query = supabase
      .from('supplies_requests')
      .select('*, employees(first_name, last_name, employee_code), supplies_request_items(*)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setRequests(data || [])
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await supabase.from('supplies_requests').update({ status: 'approved' }).eq('id', id)
    toast.success('Request approved! ✅')
    loadRequests()
  }

  const handleFulfill = async (id) => {
    await supabase.from('supplies_requests').update({ status: 'fulfilled' }).eq('id', id)
    toast.success('Request marked as fulfilled!')
    loadRequests()
  }

  const handleCancel = async (id) => {
    await supabase.from('supplies_requests').update({ status: 'cancelled' }).eq('id', id)
    toast.success('Request cancelled')
    loadRequests()
  }

  const filteredRequests = requests.filter(r => {
    if (!search) return true
    const s = search.toLowerCase()
    return (r.employees?.first_name || '').toLowerCase().includes(s) ||
           (r.employees?.last_name || '').toLowerCase().includes(s)
  })

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
        <Link to="/mobile/field" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Field Operations</span>
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-amber-600" />Supply Orders
        </h1>

        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by cleaner..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map(request => (
              <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="neu-raised rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{request.employees?.first_name} {request.employees?.last_name}</h3>
                    <p className="text-xs text-slate-500">{request.employees?.employee_code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    request.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{request.status}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Items ({request.supplies_request_items?.length || 0})</p>
                  {request.supplies_request_items?.map((item, i) => (
                    <p key={i} className="text-sm text-slate-700 dark:text-slate-300 py-0.5">
                      • {item.item_name} x{item.quantity} {item.unit}
                    </p>
                  ))}
                </div>

                {request.notes && <p className="text-xs text-slate-500 mb-3">Notes: {request.notes}</p>}
                <p className="text-xs text-slate-400 mb-3">{new Date(request.created_at).toLocaleDateString()}</p>

                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(request.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-medium hover:bg-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleCancel(request.id)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-medium hover:bg-red-600 flex items-center justify-center gap-1">
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <button onClick={() => handleFulfill(request.id)} className="w-full py-2 bg-blue-500 text-white rounded-xl text-xs font-medium hover:bg-blue-600">
                      Mark as Fulfilled
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
