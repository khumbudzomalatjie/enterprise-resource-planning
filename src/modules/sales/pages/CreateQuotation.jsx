import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useSalesStore from '../store/salesStore'
import useCRMStore from '../../crm/store/crmStore'
import useThemeStore from '../../../store/themeStore'
import QuotationPDF from '../components/QuotationPDF'
import toast from 'react-hot-toast'
import { 
  FileText, Plus, Trash2, Download, Eye,
  Sun, Moon, Sparkles, ChevronRight,
  Save, Send
} from 'lucide-react'

// Pre-defined services
const SERVICES = [
  // Once-Off Cleaning
  { category: 'Once-Off Cleaning', name: '1 Bedroom - Once-Off', unit_price: 1275, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '2 Bedroom - Once-Off', unit_price: 1700, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '3 Bedroom - Once-Off', unit_price: 2295, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '4 Bedroom - Once-Off', unit_price: 2975, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '5 Bedroom - Once-Off', unit_price: 3400, unit: 'per_service' },
  // Monthly Contracts - 1x per Week
  { category: 'Monthly Contract (1x Week)', name: '1 Bedroom - 1x Week', unit_price: 850, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '2 Bedroom - 1x Week', unit_price: 1020, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '3 Bedroom - 1x Week', unit_price: 1360, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '4 Bedroom - 1x Week', unit_price: 1700, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '5 Bedroom - 1x Week', unit_price: 2125, unit: 'per_month' },
  // Monthly Contracts - 2x per Week
  { category: 'Monthly Contract (2x Week)', name: '1 Bedroom - 2x Week', unit_price: 1530, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '2 Bedroom - 2x Week', unit_price: 1870, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '3 Bedroom - 2x Week', unit_price: 2380, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '4 Bedroom - 2x Week', unit_price: 3060, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '5 Bedroom - 2x Week', unit_price: 3825, unit: 'per_month' },
  // Monthly Contracts - 3x per Week
  { category: 'Monthly Contract (3x Week)', name: '1 Bedroom - 3x Week', unit_price: 2125, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '2 Bedroom - 3x Week', unit_price: 2550, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '3 Bedroom - 3x Week', unit_price: 2975, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '4 Bedroom - 3x Week', unit_price: 3825, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '5 Bedroom - 3x Week', unit_price: 4675, unit: 'per_month' },
]

export default function CreateQuotation() {
  const { createQuotation } = useSalesStore()
  const { clients, fetchClients } = useCRMStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const pdfRef = useRef(null)

  const [quotationData, setQuotationData] = useState({
    client_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: '50% Deposit, Balance on Completion',
    tax_rate: 15,
    discount_type: 'none',
    discount_value: 0,
    notes: '',
    status: 'draft'
  })

  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'per_service', unit_price: 0, tax_percent: 15, discount_percent: 0 }
  ])

  useEffect(() => {
    fetchClients({ status: 'active' })
  }, [])

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setQuotationData({
        ...quotationData,
        client_id: client.id,
        client_name: client.company_name,
        client_email: client.email || '',
        client_phone: client.phone || '',
        client_address: `${client.address_line1 || ''}, ${client.city || ''}, ${client.postal_code || ''}`
      })
    }
  }

  const handleServiceSelect = (index, serviceName) => {
    const service = SERVICES.find(s => s.name === serviceName)
    if (service) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        description: service.name,
        unit: service.unit,
        unit_price: service.unit_price,
        tax_percent: 15
      }
      setItems(newItems)
    }
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'per_service', unit_price: 0, tax_percent: 15, discount_percent: 0 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const qty = item.quantity || 1
      const price = item.unit_price || 0
      return sum + (qty * price)
    }, 0)
    
    const taxAmount = subtotal * 0.15
    const total = subtotal + taxAmount

    return { subtotal, discountAmount: 0, taxAmount, total }
  }

  const totals = calculateTotals()

  const handleSave = async (status = 'draft') => {
    if (!quotationData.client_name) {
      toast.error('Please select a client')
      return
    }
    
    if (items.length === 0 || !items[0].description) {
      toast.error('Please add at least one service')
      return
    }

    const result = await createQuotation(
      { ...quotationData, ...totals, status },
      items.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: (item.quantity || 1) * (item.unit_price || 0)
      }))
    )
    
    if (result.error) {
      toast.error('Failed to save quotation: ' + result.error)
      return
    }
    
    toast.success(status === 'sent' ? 'Quotation sent!' : 'Quotation saved as draft!')
    if (result.data) {
      navigate(`/sales/quotations/${result.data.id}`)
    }
  }

  const downloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = pdfRef.current
      if (!element) {
        toast.error('PDF preview not ready')
        return
      }

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `Quotation_${quotationData.client_name?.replace(/\s+/g, '_') || 'client'}.pdf`,
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
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Group services by category
  const serviceCategories = [...new Set(SERVICES.map(s => s.category))]

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
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/sales" className="text-slate-500 hover:text-emerald-600">Sales</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">New Quotation</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            Create Quotation
          </h1>
          
          <div className="flex gap-3">
            <button onClick={downloadPDF} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button onClick={() => handleSave('draft')} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-slate-600 text-white hover:bg-slate-700">
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button onClick={() => handleSave('sent')} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              <Send className="w-4 h-4" />
              <span>Save & Send</span>
            </button>
          </div>
        </div>

        {/* Quotation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Client Information</h2>
              <div className="space-y-4">
                <select
                  value={quotationData.client_id}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.company_name}</option>
                  ))}
                </select>
                <input type="text" value={quotationData.client_name} onChange={(e) => setQuotationData({...quotationData, client_name: e.target.value})} placeholder="Client Name" className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" value={quotationData.client_email} onChange={(e) => setQuotationData({...quotationData, client_email: e.target.value})} placeholder="Email" className="p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
                  <input type="text" value={quotationData.client_phone} onChange={(e) => setQuotationData({...quotationData, client_phone: e.target.value})} placeholder="Phone" className="p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
                </div>
                <textarea value={quotationData.client_address} onChange={(e) => setQuotationData({...quotationData, client_address: e.target.value})} placeholder="Address" rows={2} className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
              </div>
            </div>

            {/* Items */}
            <div className="neu-raised rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Services</h2>
                <button onClick={addItem} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Service {index + 1}</span>
                      <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <select
                      value={item.description}
                      onChange={(e) => handleServiceSelect(index, e.target.value)}
                      className="w-full p-2 neu-inset rounded-lg text-sm text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Select Service</option>
                      {serviceCategories.map(category => (
                        <optgroup key={category} label={category}>
                          {SERVICES.filter(s => s.category === category).map(service => (
                            <option key={service.name} value={service.name}>
                              {service.name} - {formatCurrency(service.unit_price)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">Quantity</label>
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} min="1" className="w-full p-2 neu-inset rounded-lg text-sm text-slate-700 dark:text-slate-300 mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Unit Price (Excl. VAT)</label>
                        <input type="number" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="w-full p-2 neu-inset rounded-lg text-sm text-slate-700 dark:text-slate-300 mt-1" />
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Line Total (Excl. VAT): <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency((item.quantity || 1) * (item.unit_price || 0))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates & Notes */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Valid Until</label>
                  <input type="date" value={quotationData.valid_until} onChange={(e) => setQuotationData({...quotationData, valid_until: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <textarea value={quotationData.notes} onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})} placeholder="Additional notes for client..." rows={2} className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="neu-raised rounded-3xl p-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                A4 Preview
              </h2>
              <div className="bg-white rounded-xl overflow-hidden shadow-inner" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <div style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%' }}>
                  <QuotationPDF 
                    ref={pdfRef}
                    quotation={{ ...quotationData, ...totals, quotation_number: 'Q-25-XXXX' }}
                    items={items.map((item) => ({ 
                      ...item, 
                      total_price: (item.quantity || 1) * (item.unit_price || 0) 
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="neu-raised rounded-3xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Totals Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal (Excl. VAT):</span>
                  <span className="text-slate-800 dark:text-white">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT (15%):</span>
                  <span className="text-slate-800 dark:text-white">{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-lg font-bold">
                  <span className="text-emerald-600">Total (Incl. VAT):</span>
                  <span className="text-emerald-600">{formatCurrency(totals.total)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                ⚠️ All prices exclude VAT. 15% VAT will be added to the final amount.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden PDF for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px' }}>
        <QuotationPDF 
          ref={pdfRef}
          quotation={{ ...quotationData, ...totals }}
          items={items.map((item) => ({ 
            ...item, 
            total_price: (item.quantity || 1) * (item.unit_price || 0) 
          }))}
        />
      </div>
    </div>
  )
}
