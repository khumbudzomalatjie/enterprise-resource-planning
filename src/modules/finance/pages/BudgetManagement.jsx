import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useFinanceStore from '../store/financeStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { DollarSign, Plus, Edit, Trash2, Save, X, ChevronRight, Sun, Moon, Sparkles } from 'lucide-react'

export default function BudgetManagement() {
  const { budgets, fetchBudgets, createBudget } = useFinanceStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    budget_name: '', department: 'Operations', fiscal_year: new Date().getFullYear(),
    total_budget: 0, period_start: '', period_end: '', notes: ''
  })

  useEffect(() => { fetchBudgets() }, [])

  const handleSave = async () => {
    if (!formData.budget_name || !formData.total_budget) {
      toast.error('Name and total budget are required')
      return
    }
    const result = await createBudget(formData)
    if (result.success) {
      toast.success('Budget created!')
      setShowForm(false)
      setFormData({ budget_name: '', department: 'Operations', fiscal_year: new Date().getFullYear(), total_budget: 0, period_start: '', period_end: '', notes: '' })
      fetchBudgets()
    } else {
      toast.error('Failed to create budget')
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
          <span className="text-slate-800 dark:text-white font-medium">Budgets</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3"><DollarSign className="w-8 h-8 text-purple-600" />Budget Management</h1>
            <p className="text-slate-500 mt-1">{budgets.length} budgets</p>
          </div>
          <button onClick={() => setShowForm(true)} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>New Budget</span>
          </button>
        </motion.div>

        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neu-raised rounded-3xl p-6 mb-6 border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="text-lg font-semibold mb-4">Create Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" value={formData.budget_name} onChange={(e) => setFormData({...formData, budget_name: e.target.value})} placeholder="Budget Name *" className="p-3 neu-inset rounded-xl" />
              <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="p-3 neu-inset rounded-xl">
                <option value="Operations">Operations</option><option value="Fleet">Fleet</option><option value="Administration">Administration</option><option value="Sales">Sales</option>
              </select>
              <input type="number" value={formData.total_budget} onChange={(e) => setFormData({...formData, total_budget: parseFloat(e.target.value) || 0})} placeholder="Total Budget *" className="p-3 neu-inset rounded-xl" />
              <input type="number" value={formData.fiscal_year} onChange={(e) => setFormData({...formData, fiscal_year: parseInt(e.target.value)})} placeholder="Fiscal Year" className="p-3 neu-inset rounded-xl" />
              <input type="date" value={formData.period_start} onChange={(e) => setFormData({...formData, period_start: e.target.value})} className="p-3 neu-inset rounded-xl" />
              <input type="date" value={formData.period_end} onChange={(e) => setFormData({...formData, period_end: e.target.value})} className="p-3 neu-inset rounded-xl" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-600 text-white"><X className="w-4 h-4" /></button>
              <button onClick={handleSave} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2"><Save className="w-4 h-4" />Save</button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const pct = budget.total_budget > 0 ? Math.round(((budget.spent_amount || 0) / budget.total_budget) * 100) : 0
            return (
              <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-2xl p-5">
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{budget.budget_name}</h3>
                    <p className="text-xs text-slate-500">{budget.budget_code} · {budget.department}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${budget.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{budget.status}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Total:</span><span className="font-bold">{formatCurrency(budget.total_budget)}</span></div>
                  <div className="flex justify-between text-sm"><span>Spent:</span><span className="text-red-600">{formatCurrency(budget.spent_amount)}</span></div>
                  <div className="flex justify-between text-sm"><span>Remaining:</span><span className="text-emerald-600 font-bold">{formatCurrency(budget.remaining_amount)}</span></div>
                </div>
                <div className="mt-3 h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{pct}% utilized</p>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
