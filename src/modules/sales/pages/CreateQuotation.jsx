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
  Save, Send, Briefcase
} from 'lucide-react'

// UPDATED Pre-defined services with new prices
var SERVICES = [
  // Once-Off Cleaning
  { category: 'Once-Off Cleaning', name: '1 Bedroom - Once-Off', unit_price: 1304.35, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '2 Bedroom - Once-Off', unit_price: 1739.13, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '3 Bedroom - Once-Off', unit_price: 2347.83, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '4 Bedroom - Once-Off', unit_price: 3043.48, unit: 'per_service' },
  { category: 'Once-Off Cleaning', name: '5 Bedroom - Once-Off', unit_price: 3478.26, unit: 'per_service' },
  // Monthly Contracts - 1x per Week
  { category: 'Monthly Contract (1x Week)', name: '1 Bedroom - 1x Week', unit_price: 869.57, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '2 Bedroom - 1x Week', unit_price: 1043.48, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '3 Bedroom - 1x Week', unit_price: 1391.30, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '4 Bedroom - 1x Week', unit_price: 1739.13, unit: 'per_month' },
  { category: 'Monthly Contract (1x Week)', name: '5 Bedroom - 1x Week', unit_price: 2173.91, unit: 'per_month' },
  // Monthly Contracts - 2x per Week
  { category: 'Monthly Contract (2x Week)', name: '1 Bedroom - 2x Week', unit_price: 1565.22, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '2 Bedroom - 2x Week', unit_price: 1913.04, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '3 Bedroom - 2x Week', unit_price: 2434.78, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '4 Bedroom - 2x Week', unit_price: 3130.43, unit: 'per_month' },
  { category: 'Monthly Contract (2x Week)', name: '5 Bedroom - 2x Week', unit_price: 3913.04, unit: 'per_month' },
  // Monthly Contracts - 3x per Week
  { category: 'Monthly Contract (3x Week)', name: '1 Bedroom - 3x Week', unit_price: 2173.91, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '2 Bedroom - 3x Week', unit_price: 2608.70, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '3 Bedroom - 3x Week', unit_price: 3043.48, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '4 Bedroom - 3x Week', unit_price: 3913.04, unit: 'per_month' },
  { category: 'Monthly Contract (3x Week)', name: '5 Bedroom - 3x Week', unit_price: 4782.61, unit: 'per_month' },
]

export default function CreateQuotation() {
  var createQuotation = useSalesStore(function(state) { return state.createQuotation })
  var convertQuotationToJob = useSalesStore(function(state) { return state.convertQuotationToJob })
  var clients = useCRMStore(function(state) { return state.clients })
  var fetchClients = useCRMStore(function(state) { return state.fetchClients })
  var isDark = useThemeStore(function(state) { return state.isDark })
  var toggleTheme = useThemeStore(function(state) { return state.toggleTheme })
  var navigate = useNavigate()
  var pdfRef = useRef(null)

  var [quotationData, setQuotationData] = useState({
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

  var [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'per_service', unit_price: 0, tax_percent: 15, discount_percent: 0 }
  ])

  var [savedQuotationId, setSavedQuotationId] = useState(null)

  useEffect(function() {
    fetchClients({ status: 'active' })
  }, [])

  // ============================================
  // BACKGROUND CALCULATOR (Runs silently)
  // ============================================
  var calculateLineTotal = function(item) {
    var qty = item.quantity || 0
    var price = item.unit_price || 0
    return qty * price
  }

  var calculateSubtotal = function() {
    return items.reduce(function(sum, item) { return sum + calculateLineTotal(item) }, 0)
  }

  var calculateVAT = function() {
    return calculateSubtotal() * 0.15
  }

  var calculateTotal = function() {
    return calculateSubtotal() + calculateVAT()
  }

  var subtotal = calculateSubtotal()
  var vatAmount = calculateVAT()
  var totalAmount = calculateTotal()

  // ============================================
  // CLIENT & SERVICE HANDLERS
  // ============================================
  var handleClientSelect = function(clientId) {
    var client = clients.find(function(c) { return c.id === clientId })
    if (client) {
      setQuotationData({
        ...quotationData,
        client_id: client.id,
        client_name: client.company_name || '',
        client_email: client.email || '',
        client_phone: client.phone || '',
        client_address: (client.address_line1 || '') + ', ' + (client.city || '') + ', ' + (client.postal_code || '')
      })
    }
  }

  var handleServiceSelect = function(index, serviceName) {
    var service = SERVICES.find(function(s) { return s.name === serviceName })
    if (service) {
      var newItems = [...items]
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

  var addItem = function() {
    setItems([...items, { description: '', quantity: 1, unit: 'per_service', unit_price: 0, tax_percent: 15, discount_percent: 0 }])
  }

  var removeItem = function(index) {
    if (items.length > 1) {
      setItems(items.filter(function(_, i) { return i !== index }))
    }
  }

  var updateItem = function(index, field, value) {
    var newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // ============================================
  // SAVE, DOWNLOAD & CONVERT HANDLERS
  // ============================================
  var handleSave = async function(status) {
    status = status || 'draft'
    
    if (!quotationData.client_name) {
      toast.error('Please select a client')
      return
    }
    
    var hasItems = items.some(function(item) { return item.description && item.unit_price > 0 })
    if (!hasItems) {
      toast.error('Please add at least one service with a price')
      return
    }

    var result = await createQuotation(
      { 
        ...quotationData, 
        subtotal: subtotal,
        tax_amount: vatAmount,
        discount_amount: 0,
        total_amount: totalAmount,
        status: status 
      },
      items.map(function(item) {
        return {
          description: item.description,
          quantity: item.quantity || 1,
          unit: item.unit,
          unit_price: item.unit_price || 0,
          tax_percent: 15,
          discount_percent: 0,
          total_price: calculateLineTotal(item)
        }
      })
    )
    
    if (result.error) {
      toast.error('Failed to save quotation: ' + result.error)
      return
    }
    
    if (result.data) {
      setSavedQuotationId(result.data.id)
      toast.success(status === 'sent' ? 'Quotation sent!' : 'Quotation saved as draft!')
    }
  }

  var handleConvertToJob = async function() {
    if (!savedQuotationId) {
      toast.error('Please save the quotation first')
      return
    }

    var result = await convertQuotationToJob(savedQuotationId)
    if (result.success) {
      toast.success('Quotation converted to job successfully!')
      navigate('/operations/jobs/' + result.data.id)
    } else {
      toast.error('Failed to convert to job: ' + (result.error || 'Unknown error'))
    }
  }

  var downloadPDF = async function() {
    try {
      var html2pdf = (await import('html2pdf.js')).default
      var element = pdfRef.current
      if (!element) {
        toast.error('PDF preview not ready')
        return
      }

      var opt = {
        margin: [0, 0, 0, 0],
        filename: 'Quotation_' + (quotationData.client_name || 'client').replace(/\s+/g, '_') + '.pdf',
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

  var formatCurrency = function(amount) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  // Group services by category
  var serviceCategories = [...new Set(SERVICES.map(function(s) { return s.category }))]

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
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button onClick={function() { handleSave('draft') }} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-slate-600 text-white hover:bg-slate-700">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <button onClick={function() { handleSave('sent') }} className="neu-raised neu-btn px-4 py-2 rounded-xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Save & Send</span>
            </button>
          </div>
        </div>

        {/* Convert to Job Button - Shows after saving */}
        {savedQuotationId && (
          <div className="mb-6 p-4 neu-raised rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Quotation Saved!</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">You can now convert this quotation to a job or continue editing.</p>
            </div>
            <button 
              onClick={handleConvertToJob}
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Convert to Job</span>
            </button>
          </div>
        )}

        {/* Quotation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Form - Left Side */}
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Client Information</h2>
              <div className="space-y-4">
                <select
                  value={quotationData.client_id}
                  onChange={function(e) { handleClientSelect(e.target.value) }}
                  className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
                >
                  <option value="">Select Client</option>
                  {clients.map(function(client) {
                    return (
                      <option key={client.id} value={client.id}>
                        {client.company_name || client.first_name + ' ' + client.last_name}
                      </option>
                    )
                  })}
                </select>
                <input type="text" value={quotationData.client_name} onChange={function(e) { setQuotationData({...quotationData, client_name: e.target.value}) }} placeholder="Client Name" className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" value={quotationData.client_email} onChange={function(e) { setQuotationData({...quotationData, client_email: e.target.value}) }} placeholder="Email" className="p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
                  <input type="text" value={quotationData.client_phone} onChange={function(e) { setQuotationData({...quotationData, client_phone: e.target.value}) }} placeholder="Phone" className="p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
                </div>
                <textarea value={quotationData.client_address} onChange={function(e) { setQuotationData({...quotationData, client_address: e.target.value}) }} placeholder="Address" rows={2} className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
              </div>
            </div>

            {/* Services */}
            <div className="neu-raised rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Services</h2>
                <button onClick={addItem} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map(function(item, index) {
                  return (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Service {index + 1}</span>
                        <button onClick={function() { removeItem(index) }} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <select
                        value={item.description}
                        onChange={function(e) { handleServiceSelect(index, e.target.value) }}
                        className="w-full p-2 neu-inset rounded-lg text-sm text-slate-700 dark:text-slate-300"
                      >
                        <option value="">Select Service</option>
                        {serviceCategories.map(function(category) {
                          return (
                            <optgroup key={category} label={category}>
                              {SERVICES.filter(function(s) { return s.category === category }).map(function(service) {
                                return (
                                  <option key={service.name} value={service.name}>
                                    {service.name} - {formatCurrency(service.unit_price)}
                                  </option>
                                )
                              })}
                            </optgroup>
                          )
                        })}
                      </select>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-slate-500">Quantity</label>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={function(e) { updateItem(index, 'quantity', parseInt(e.target.value) || 1) }} 
                            min="1" 
                            className="w-full p-2 neu-inset rounded-lg text-sm text-slate-700 dark:text-slate-300 mt-1" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Unit Price (Excl. VAT)</label>
                          <input 
                            type="number" 
                            value={item.unit_price} 
                            onChange={function(e) { updateItem(index, 'unit_price', parseFloat(e.target.value) || 0) }} 
                            className="w-full p-2 neu-inset rounded-lg text-sm text-slate-700 dark:text-slate-300 mt-1" 
                          />
                        </div>
                      </div>
                      {/* Line Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600">
                        <span className="text-xs text-slate-500">Line Total (Excl. VAT):</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(calculateLineTotal(item))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dates & Notes */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Valid Until</label>
                  <input type="date" value={quotationData.valid_until} onChange={function(e) { setQuotationData({...quotationData, valid_until: e.target.value}) }} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <textarea value={quotationData.notes} onChange={function(e) { setQuotationData({...quotationData, notes: e.target.value}) }} placeholder="Additional notes for client..." rows={2} className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </div>

          {/* Preview - Right Side */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            {/* Totals Summary */}
            <div className="neu-raised rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quotation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal (Excl. VAT):</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">VAT (15%):</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-800 dark:text-white font-bold text-lg">Total (Incl. VAT):</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* A4 Preview */}
            <div className="neu-raised rounded-3xl p-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                A4 Preview
              </h3>
              <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%' }}>
                  <QuotationPDF 
                    ref={pdfRef}
                    quotation={{ 
                      ...quotationData, 
                      subtotal: subtotal,
                      tax_amount: vatAmount,
                      total_amount: totalAmount,
                      quotation_number: 'Q-25-XXXX' 
                    }}
                    items={items.filter(function(item) { return item.description }).map(function(item) { 
                      return { 
                        ...item, 
                        total_price: calculateLineTotal(item) 
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden PDF for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px' }}>
        <QuotationPDF 
          ref={pdfRef}
          quotation={{ 
            ...quotationData, 
            subtotal: subtotal,
            tax_amount: vatAmount,
            total_amount: totalAmount
          }}
          items={items.filter(function(item) { return item.description }).map(function(item) { 
            return { 
              ...item, 
              total_price: calculateLineTotal(item) 
            }
          })}
        />
      </div>
    </div>
  )
}
