import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import usePayrollStore from '../store/payrollStore'
import useThemeStore from '../../../store/themeStore'
import { 
  Search, FileText, Download, Eye, ChevronRight,
  ArrowLeft, Sun, Moon, Sparkles
} from 'lucide-react'

export default function PayslipList() {
  const { payslips, fetchPayslips, fetchPayrollPeriods, payrollPeriods, loading } = usePayrollStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchPayrollPeriods()
    fetchPayslips()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount || 0)
  }

  const filteredPayslips = payslips.filter(p => {
    const matchesSearch = p.employees?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                         p.employees?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
                         p.payslip_number?.toLowerCase().includes(search.toLowerCase())
    const matchesPeriod = selectedPeriod === 'all' || p.payroll_period_id === selectedPeriod
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus
    return matchesSearch && matchesPeriod && matchesStatus
  })

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">
            Enterprise Resource Planning
          </span>
        </div>
        <button 
          onClick={toggleTheme}
          className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/payroll" className="text-slate-500 hover:text-emerald-600">Payroll</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Payslips</span>
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
              Payslips
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage employee payslips</p>
          </div>
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
                placeholder="Search by name or payslip number..."
                className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
              />
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Periods</option>
              {payrollPeriods.map(p => (
                <option key={p.id} value={p.id}>{p.period_name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="finalized">Finalized</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </motion.div>

        {/* Payslips Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neu-raised rounded-3xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Employee</th>
                  <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Payslip #</th>
                  <th className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Period</th>
                  <th className="text-right text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Gross</th>
                  <th className="text-right text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Deductions</th>
                  <th className="text-right text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Net Pay</th>
                  <th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Status</th>
                  <th className="text-right text-sm font-medium text-slate-500 dark:text-slate-400 py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayslips.map((payslip) => (
                  <tr 
                    key={payslip.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {payslip.employees?.first_name} {payslip.employees?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{payslip.employees?.employee_code}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {payslip.payslip_number}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {payslip.payroll_periods?.period_name}
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-slate-800 dark:text-white">
                      {formatCurrency(payslip.total_earnings)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-red-600">
                      -{formatCurrency(payslip.total_deductions)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-semibold text-emerald-600">
                      {formatCurrency(payslip.net_salary)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payslip.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : payslip.status === 'finalized'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/payroll/payslips/${payslip.id}`)}
                          className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!loading && filteredPayslips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No payslips found</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
