import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useFinanceStore from '../store/financeStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Receipt, Plus, Save, X, ChevronRight, Sun, Moon, Sparkles } from 'lucide-react'

export default function PaymentRecords() {
  const { payments, recordPayment } = useFinanceStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    payment_type: 'expense', amount: 0, payment_method: 'eft',
    reference_number: '', description: '', payment_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => { useFinanceStore.getState().payments || recordPayment }, [])

  const handleSave = async () => {
    if (!formData.amount) { toast.error('Amount required'); return }
    const result = await recordPayment(formData)
    if (result.success) {
      toast.success('Payment recorded!')
      setShowForm(false)
      setFormData({ payment_type: 'expense', amount: 0, payment_method: 'eft', reference_number: '', description: '', payment_date: new Date().toISOString().split('T')[0] })
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)

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
          <Link to="/finance" className="text-slate-500 hover:text-emerald-600">Finance</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Payment Records</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3"><Receipt className="w-8 h-8 text-indigo-600" />Payment Records</h1>
            <p className="text-slate-500 mt-1">{(payments || []).length} payments</p>
          </div>
          <button onClick={() => setShowForm(true)} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>Record Payment</span>
          </button>
        </motion.div>

        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neu-raised rounded-3xl p-6 mb-6 border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={formData.payment_type} onChange={(e) => setFormData({...formData, payment_type: e.target.value})} className="p-3 neu-inset rounded-xl">
                <option value="expense">Expense</option><option value="accounts_payable">Accounts Payable</option><option value="accounts_receivable">Accounts Receivable</option><option value="other">Other</option>
              </select>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} placeholder="Amount *" className="p-3 neu-inset rounded-xl" />
              <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="p-3 neu-inset rounded-xl">
                <option value="eft">EFT</option><option value="cash">Cash</option><option value="credit_card">Credit Card</option><option value="cheque">Cheque</option><option value="direct_deposit">Direct Deposit</option>
              </select>
              <input type="text" value={formData.reference_number} onChange={(e) => setFormData({...formData, reference_number: e.target.value})} placeholder="Reference Number" className="p-3 neu-inset rounded-xl" />
              <input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} className="p-3 neu-inset rounded-xl" />
              <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" className="p-3 neu-inset rounded-xl" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-600 text-white"><X className="w-4 h-4" /></button>
              <button onClick={handleSave} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2"><Save className="w-4 h-4" />Save</button>
            </div>
          </motion.div>
        )}

        <div className="neu-raised rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Date</th>
                <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Type</th>
                <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Description</th>
                <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Method</th>
                <th className="text-left text-sm font-medium text-slate-500 py-4 px-4">Reference</th>
                <th className="text-right text-sm font-medium text-slate-500 py-4 px-4">Amount</th>
                <th className="text-center text-sm font-medium text-slate-500 py-4 px-4">Status</th>
              </tr></thead>
              <tbody>
                {(payments || []).map(p => (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm capitalize">{p.payment_type?.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-sm">{p.description || '-'}</td>
                    <td className="py-3 px-4 text-sm capitalize">{p.payment_method?.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{p.reference_number || '-'}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4 text-center"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(payments || []).length === 0 && <div className="text-center py-12"><Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No payments recorded</p></div>}
        </div>
      </main>
    </div>
  )
}
