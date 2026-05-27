import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useSalesStore from '../store/salesStore'
import useThemeStore from '../../../store/themeStore'
import QuotationPDF from '../components/QuotationPDF'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Download, Edit, FileText, Printer, X,
  Sun, Moon, Sparkles, ChevronRight,
  CheckCircle, XCircle, Send, Maximize2, Minimize2
} from 'lucide-react'

export default function QuotationDetail() {
  const { id } = useParams()
  const { selectedQuotation, fetchQuotation, updateQuotationStatus, loading } = useSalesStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const pdfContainerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    fetchQuotation(id)
  }, [id])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
      const element = pdfContainerRef.current
      if (!element) {
        toast.error('Preview not loaded')
        return
      }

      toast.loading('Generating PDF...')
      
      const opt = {
        margin: [0, 0, 0, 0],
        filename: `Quotation_${selectedQuotation?.quotation_number || 'download'}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 794,
          height: 1123
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: 'avoid-all' }
      }

      await html2pdf().set(opt).from(element).save()
      toast.dismiss()
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.dismiss()
      console.error('PDF error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const printQuotation = () => {
    const element = pdfContainerRef.current
    if (!element) return
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation ${selectedQuotation?.quotation_number}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading || !selectedQuotation) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500 text-lg">Loading quotation...</p>
          </div>
        </div>
      </div>
    )
  }

  const quote = selectedQuotation

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      {/* Fullscreen modal for A4 preview */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex gap-3 z-10">
            <button onClick={downloadPDF} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={printQuotation} className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={toggleFullscreen} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 text-sm">
              <X className="w-4 h-4" /> Close
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-2xl overflow-auto" style={{ 
            width: '210mm', 
            maxHeight: '95vh',
            transform: 'scale(1)',
          }}>
            <div ref={pdfContainerRef}>
              <QuotationPDF 
                quotation={quote}
                items={quote.quotation_items || []}
              />
            </div>
          </div>
        </div>
      )}

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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-600" />
              {quote.quotation_number}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {quote.client_name} · {formatDate(quote.quotation_date)} · 
              <span className="font-semibold text-emerald-600 ml-2">{formatCurrency(quote.total_amount)}</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={toggleFullscreen} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Maximize2 className="w-4 h-4" /><span>Full A4 Preview</span>
            </button>
            <button onClick={downloadPDF} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              <Download className="w-4 h-4" /><span>Download PDF</span>
            </button>
            <button onClick={printQuotation} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700">
              <Printer className="w-4 h-4" /><span>Print</span>
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
          className="neu-raised rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4"
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
          
          <div className="border-l border-slate-300 dark:border-slate-600 pl-4 flex flex-wrap gap-2">
            {quote.status !== 'sent' && (
              <button onClick={() => handleStatusChange('sent')} className="px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 transition-colors">
                <Send className="w-3 h-3 inline mr-1" />Mark as Sent
              </button>
            )}
            {quote.status !== 'accepted' && (
              <button onClick={() => handleStatusChange('accepted')} className="px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-300 transition-colors">
                <CheckCircle className="w-3 h-3 inline mr-1" />Mark as Accepted
              </button>
            )}
            {quote.status !== 'rejected' && (
              <button onClick={() => handleStatusChange('rejected')} className="px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-300 transition-colors">
                <XCircle className="w-3 h-3 inline mr-1" />Mark as Rejected
              </button>
            )}
          </div>
        </motion.div>

        {/* Quotation Details Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="neu-raised rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Client</p>
            <p className="font-semibold text-slate-800 dark:text-white mt-1">{quote.client_name}</p>
          </div>
          <div className="neu-raised rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Date</p>
            <p className="font-semibold text-slate-800 dark:text-white mt-1">{formatDate(quote.quotation_date)}</p>
          </div>
          <div className="neu-raised rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Valid Until</p>
            <p className="font-semibold text-slate-800 dark:text-white mt-1">{formatDate(quote.valid_until)}</p>
          </div>
          <div className="neu-raised rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Total (Incl. VAT)</p>
            <p className="font-semibold text-emerald-600 text-lg mt-1">{formatCurrency(quote.total_amount)}</p>
          </div>
        </motion.div>

        {/* Items Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neu-raised rounded-3xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">#</th>
                  <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">Description</th>
                  <th className="text-center text-xs font-medium text-slate-500 py-3 px-3">Qty</th>
                  <th className="text-right text-xs font-medium text-slate-500 py-3 px-3">Unit Price</th>
                  <th className="text-right text-xs font-medium text-slate-500 py-3 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.quotation_items?.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-3 text-sm text-slate-500">{index + 1}</td>
                    <td className="py-3 px-3 text-sm text-slate-800 dark:text-white font-medium">{item.description}</td>
                    <td className="py-3 px-3 text-sm text-slate-700 dark:text-slate-300 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 text-sm text-slate-700 dark:text-slate-300 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 px-3 text-sm font-semibold text-slate-800 dark:text-white text-right">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-600">
                  <td colSpan="4" className="py-3 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Subtotal:</td>
                  <td className="py-3 px-3 text-sm font-semibold text-slate-800 dark:text-white text-right">{formatCurrency(quote.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="4" className="py-2 px-3 text-sm text-slate-500 text-right">VAT (15%):</td>
                  <td className="py-2 px-3 text-sm text-slate-600 dark:text-slate-400 text-right">{formatCurrency(quote.tax_amount)}</td>
                </tr>
                <tr>
                  <td colSpan="4" className="py-3 px-3 text-lg font-bold text-emerald-600 text-right">TOTAL:</td>
                  <td className="py-3 px-3 text-lg font-bold text-emerald-600 text-right">{formatCurrency(quote.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Embedded A4 Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="neu-raised rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              A4 Quotation Preview
            </h2>
            <button onClick={toggleFullscreen} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <Maximize2 className="w-4 h-4" /> Full Screen
            </button>
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200" style={{ maxHeight: '600px', overflow: 'auto' }}>
            <div style={{ transform: 'scale(0.48)', transformOrigin: 'top left', width: '208%' }}>
              <div ref={pdfContainerRef}>
                <QuotationPDF 
                  quotation={quote}
                  items={quote.quotation_items || []}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
