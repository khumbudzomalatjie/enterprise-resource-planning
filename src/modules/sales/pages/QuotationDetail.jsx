import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useSalesStore from '../store/salesStore'
import useThemeStore from '../../../store/themeStore'
import QuotationPDF from '../components/QuotationPDF'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Download, Edit, FileText, Eye,
  Sun, Moon, Sparkles, ChevronRight,
  CheckCircle, XCircle, Clock, Send
} from 'lucide-react'

export default function QuotationDetail() {
  const { id } = useParams()
  const { selectedQuotation, fetchQuotation, updateQuotationStatus, loading } = useSalesStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuotation(id)
  }, [id])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleStatusChange = async (newStatus) => {
    const result = await updateQuotationStatus(id, newStatus)
    if (result.success) {
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      fetchQuotation(id)
    } else {
      toast.error('Failed to update status')
    }
  }

  const downloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('quotation-pdf-container')
      if (!element) return

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `Quotation_${selectedQuotation?.quotation_number}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      }

      await html2pdf().set(opt).from(element).save()
      toast.success('PDF downloaded')
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  if (loading || !selectedQuotation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const quote = selectedQuotation

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">ERP</span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/sales" className="text-slate-500 hover:text-emerald-600">Sales</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/sales/quotations" className="text-slate-500 hover:text-emerald-600">Quotations</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">{quote.quotation_number}</span>
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
              {quote.quotation_number}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {quote.client_name} · {formatDate(quote.quotation_date)}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={downloadPDF} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Download className="w-4 h-4" /><span>Download PDF</span>
            </button>
            <button onClick={() => navigate(`/sales/quotations/${id}/edit`)} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-slate-600 text-white hover:bg-slate-700">
              <Edit className="w-4 h-4" /><span>Edit</span>
            </button>
          </div>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neu-raised rounded-2xl p-4 mb-6 flex items-center gap-4"
        >
          <span className="text-sm text-slate-500">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            quote.status === 'sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            quote.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {quote.status?.replace('_', ' ')}
          </span>
          
          <div className="border-l border-slate-300 dark:border-slate-600 pl-4 flex gap-2">
            {['sent', 'accepted', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={quote.status === status}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  quote.status === status
                    ? 'bg-slate-200 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
                    : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-300'
                }`}
              >
                {status === 'sent' && <Send className="w-3 h-3 inline mr-1" />}
                {status === 'accepted' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                Mark as {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* A4 Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neu-raised rounded-3xl p-4"
        >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Quotation Preview
          </h2>
          <div id="quotation-pdf-container" className="bg-white rounded-xl overflow-hidden shadow-inner" style={{ maxHeight: '700px', overflow: 'auto' }}>
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '182%' }}>
              <QuotationPDF 
                quotation={quote}
                items={quote.quotation_items || []}
              />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
