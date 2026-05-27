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

export default function CreateQuotation() {
  const { createQuotation, fetchProductsServices, productsServices, loading } = useSalesStore()
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
    payment_terms: '30 Days',
    tax_rate: 15,
    discount_type: 'none',
    discount_value: 0,
    notes: '',
    terms_and_conditions: '',
    status: 'draft'
  })

  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'each', unit_price: 0, tax_percent: 15, discount_percent: 0 }
  ])

  useEffect(() => {
    fetchClients({ status: 'active' })
    fetchProductsServices()
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

  const handleProductSelect = (index, productId) => {
    const product = productsServices.find(p => p.id === productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        description: product.name,
        unit: product.unit,
        unit_price: product.unit_price,
        tax_percent: product.tax_rate
      }
      setItems(newItems)
    }
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'each', unit_price: 0, tax_percent: 15, discount_percent: 0 }])
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
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0) * (1 - (item.discount_percent || 0) / 100)
      return sum + itemTotal
    }, 0)
    
    let discountAmount = 0
    if (quotationData.discount_type === 'percentage') {
      discountAmount = subtotal * ((quotationData.discount_value || 0) / 100)
    } else if (quotationData.discount_type === 'fixed') {
      discountAmount = quotationData.discount_value || 0
    }

    const taxAmount = (subtotal - discountAmount) * ((quotationData.tax_rate || 0) / 100)
    const total = subtotal - discountAmount + taxAmount

    return { subtotal, discountAmount, taxAmount, total }
  }

  const totals = calculateTotals()

  const handleSave = async (status = 'draft') => {
    const result = await createQuotation(
      { ...quotationData, ...totals, status },
      items
    )
    
    if (result.error) {
      toast.error('Failed to save quotation')
      return
    }
    
    toast.success(status === 'sent' ? 'Quotation sent!' : 'Quotation saved!')
    if (result.data) {
      navigate(`/sales/quotations/${result.data.id}`)
    }
  }

  const downloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = pdfRef.current
      if (!element) return

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `Quotation_DRAFT.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
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
    }).format(amount || 0)
  }

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
                <input type="text" value={quotationData.client_name} onChange={(e) => setQuotationData({...quotationData, client_name: e.target.value})} placeholder="Client Name" className="w-full p-3 neu-inset rounded-xl" />
                <input type="email" value={quotationData.client_email} onChange={(e) => setQuotationData({...quotationData, client_email: e.target.value})} placeholder="Email" className="w-full p-3 neu-inset rounded-xl" />
                <input type="text" value={quotationData.client_phone} onChange={(e) => setQuotationData({...quotationData, client_phone: e.target.value})} placeholder="Phone" className="w-full p-3 neu-inset rounded-xl" />
                <textarea value={quotationData.client_address} onChange={(e) => setQuotationData({...quotationData, client_address: e.target.value})} placeholder="Address" rows={2} className="w-full p-3 neu-inset rounded-xl" />
              </div>
            </div>

            {/* Items */}
            <div className="neu-raised rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Items/Services</h2>
                <button onClick={addItem} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Item {index + 1}</span>
                      <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <select
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className="w-full p-2 neu-inset rounded-lg text-sm"
                    >
                      <option value="">Select Product/Service</option>
                      {productsServices.map(ps => (
                        <option key={ps.id} value={ps.id}>{ps.name} - {formatCurrency(ps.unit_price)}/{ps.unit}</option>
                      ))}
                    </select>
                    
                    <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Description" className="w-full p-2 neu-inset rounded-lg text-sm" />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qty" className="p-2 neu-inset rounded-lg text-sm" />
                      <select value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} className="p-2 neu-inset rounded-lg text-sm">
                        <option value="each">Each</option>
                        <option value="per_hour">Per Hour</option>
                        <option value="per_sqm">Per m²</option>
                        <option value="per_month">Per Month</option>
                        <option value="per_service">Per Service</option>
                      </select>
                      <input type="number" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} placeholder="Price" className="p-2 neu-inset rounded-lg text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Terms & Notes</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Valid Until</label>
                  <input type="date" value={quotationData.valid_until} onChange={(e) => setQuotationData({...quotationData, valid_until: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Payment Terms</label>
                  <select value={quotationData.payment_terms} onChange={(e) => setQuotationData({...quotationData, payment_terms: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="Immediate">Immediate</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>
                <textarea value={quotationData.notes} onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})} placeholder="Additional notes..." rows={3} className="w-full p-3 neu-inset rounded-xl" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="neu-raised rounded-3xl p-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Preview
              </h2>
              <div className="bg-white rounded-xl overflow-hidden shadow-inner" style={{ maxHeight: '600px', overflow: 'auto' }}>
                <div style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '222%' }}>
                  <QuotationPDF 
                    ref={pdfRef}
                    quotation={{ ...quotationData, ...totals }}
                    items={items.map((item) => ({ 
                      ...item, 
                      total_price: (item.quantity || 0) * (item.unit_price || 0) * (1 - (item.discount_percent || 0) / 100) 
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="neu-raised rounded-3xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Totals</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="text-slate-800 dark:text-white">{formatCurrency(totals.subtotal)}</span>
                </div>
                {quotationData.discount_type !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discount:</span>
                    <span className="text-red-500">-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT (15%):</span>
                  <span className="text-slate-800 dark:text-white">{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-lg font-bold">
                  <span className="text-emerald-600">Total:</span>
                  <span className="text-emerald-600">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden PDF for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <QuotationPDF 
          ref={pdfRef}
          quotation={{ ...quotationData, ...totals, quotation_number: 'DRAFT' }}
          items={items.map((item) => ({ 
            ...item, 
            total_price: (item.quantity || 0) * (item.unit_price || 0) * (1 - (item.discount_percent || 0) / 100) 
          }))}
        />
      </div>
    </div>
  )
}
