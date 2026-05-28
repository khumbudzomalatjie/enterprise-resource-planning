import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import { Search, Truck, Plus, Eye, CheckCircle2, ChevronRight, Sun, Moon, Sparkles } from 'lucide-react'

export default function GoodsReceipts() {
  const { goodsReceipts, fetchGoodsReceipts, loading } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => { fetchGoodsReceipts() }, [])

  const filteredGRs = goodsReceipts.filter(gr => {
    if (!search) return true
    return gr.gr_number?.toLowerCase().includes(search.toLowerCase()) ||
           gr.vendors?.company_name?.toLowerCase().includes(search.toLowerCase())
  })

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700',
      partial: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
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
          <span className="text-slate-800 dark:text-white font-medium">Goods Receipts</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Truck className="w-8 h-8 text-emerald-600" />Goods Receipts
            </h1>
            <p className="text-slate-500 mt-1">{goodsReceipts.length} receipts</p>
          </div>
          <button onClick={() => navigate('/procurement/receipts/new')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>New Receipt</span>
          </button>
        </motion.div>

        <div className="neu-raised rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
          </div>
        </div>

        <div className="neu-raised rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">GR Number</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">PO Reference</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Vendor</th>
                  <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Date</th>
                  <th className="text-center text-sm font-medium text-slate-500 py-4 px-4">Status</th>
                  <th className="text-right text-sm font-medium text-slate-500 py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGRs.map(gr => (
                  <tr key={gr.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-white">{gr.gr_number}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{gr.purchase_orders?.po_number || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{gr.vendors?.company_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{new Date(gr.receipt_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(gr.status)}`}>{gr.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => navigate(`/procurement/receipts/${gr.id}`)} className="p-2 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredGRs.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No goods receipts found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
