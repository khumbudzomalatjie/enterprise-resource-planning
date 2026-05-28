import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Search, Send, Plus, Eye, Trash2, ChevronRight, Sun, Moon, Sparkles, Award } from 'lucide-react'

export default function RFQManagement() {
  const { rfqs, fetchRFQs, awardRFQ, loading } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadData() }, [statusFilter])

  const loadData = async () => {
    const filters = {}
    if (statusFilter !== 'all') filters.status = statusFilter
    await fetchRFQs(filters)
  }

  const handleAward = async (rfqId, responseId) => {
    if (window.confirm('Award this RFQ to the selected vendor?')) {
      await awardRFQ(rfqId, responseId)
      toast.success('RFQ awarded!')
      loadData()
    }
  }

  const filteredRFQs = rfqs.filter(rfq => {
    if (!search) return true
    return rfq.rfq_number?.toLowerCase().includes(search.toLowerCase())
  })

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-700',
      issued: 'bg-blue-100 text-blue-700',
      received: 'bg-purple-100 text-purple-700',
      evaluated: 'bg-amber-100 text-amber-700',
      awarded: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
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
          <span className="text-slate-800 dark:text-white font-medium">RFQs</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Send className="w-8 h-8 text-emerald-600" />RFQ Management
            </h1>
            <p className="text-slate-500 mt-1">{rfqs.length} RFQs</p>
          </div>
          <button onClick={() => navigate('/procurement/rfq/new')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>New RFQ</span>
          </button>
        </motion.div>

        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RFQs..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="received">Received</option>
            <option value="awarded">Awarded</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRFQs.map(rfq => (
            <motion.div key={rfq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{rfq.rfq_number}</h3>
                  <p className="text-xs text-slate-500">{rfq.rfq_items?.length || 0} items</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(rfq.status)}`}>{rfq.status}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>Deadline: {new Date(rfq.submission_deadline).toLocaleDateString()}</p>
                <p>Responses: {rfq.rfq_responses?.length || 0}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <button onClick={() => navigate(`/procurement/rfq/${rfq.id}`)} className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1"><Eye className="w-4 h-4" />View</button>
                {rfq.status === 'received' && rfq.rfq_responses?.some(r => !r.is_selected) && (
                  <button onClick={() => {
                    const bestResponse = rfq.rfq_responses.sort((a, b) => a.total_amount - b.total_amount)[0]
                    if (bestResponse) handleAward(rfq.id, bestResponse.id)
                  }} className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"><Award className="w-4 h-4" />Award</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
