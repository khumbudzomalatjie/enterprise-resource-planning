import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useInventoryStore from '../../inventory/store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Send, Save, Plus, Trash2, ChevronRight } from 'lucide-react'

export default function CreateRFQ() {
  const { createRFQ, fetchVendors, vendors } = useProcurementStore()
  const { items, fetchItems } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [rfqData, setRfqData] = useState({
    submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_terms: 'Delivery within 7 days',
    payment_terms: '30 Days',
    special_instructions: '',
    notes: '',
    status: 'draft'
  })

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit: 'each', specifications: '', item_id: null }
  ])

  useEffect(() => {
    fetchItems()
    fetchVendors({ status: 'active' })
  }, [])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit: 'each', specifications: '', item_id: null }])
  }

  const removeLineItem = (index) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index, field, value) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setLineItems(newItems)
  }

  const handleItemSelect = (index, itemId) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      updateLineItem(index, 'item_id', itemId)
      updateLineItem(index, 'description', item.name)
      updateLineItem(index, 'unit', item.unit)
    }
  }

  const handleSubmit = async (status = 'draft') => {
    if (lineItems.some(item => !item.description)) {
      toast.error('Please fill in all item descriptions')
      return
    }

    const result = await createRFQ(
      { ...rfqData, status },
      lineItems
    )

    if (result.success) {
      toast.success(status === 'issued' ? 'RFQ issued!' : 'RFQ saved as draft!')
      navigate('/procurement/rfq')
    } else {
      toast.error('Failed to create RFQ')
    }
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/procurement/rfq" className="text-slate-500 hover:text-emerald-600">RFQs</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">New RFQ</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <Send className="w-8 h-8 text-emerald-600" />Create RFQ
          </h1>

          <div className="space-y-6">
            {/* RFQ Details */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">RFQ Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Submission Deadline *</label>
                  <input type="date" value={rfqData.submission_deadline} onChange={(e) => setRfqData({...rfqData, submission_deadline: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" required />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Payment Terms</label>
                  <select value={rfqData.payment_terms} onChange={(e) => setRfqData({...rfqData, payment_terms: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Delivery Terms</label>
                  <input type="text" value={rfqData.delivery_terms} onChange={(e) => setRfqData({...rfqData, delivery_terms: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Special Instructions</label>
                  <textarea value={rfqData.special_instructions} onChange={(e) => setRfqData({...rfqData, special_instructions: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* RFQ Items */}
            <div className="neu-raised rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Items to Quote</h2>
                <button onClick={addLineItem} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Item {index + 1}</span>
                      <button onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <select onChange={(e) => handleItemSelect(index, e.target.value)} className="w-full p-2 neu-inset rounded-lg text-sm">
                      <option value="">Select from inventory</option>
                      {items.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                    </select>
                    <input type="text" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} placeholder="Description" className="w-full p-2 neu-inset rounded-lg text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Quantity" className="p-2 neu-inset rounded-lg text-sm" />
                      <select value={item.unit} onChange={(e) => updateLineItem(index, 'unit', e.target.value)} className="p-2 neu-inset rounded-lg text-sm">
                        <option value="each">Each</option><option value="box">Box</option><option value="bottle">Bottle</option><option value="pack">Pack</option>
                      </select>
                    </div>
                    <input type="text" value={item.specifications} onChange={(e) => updateLineItem(index, 'specifications', e.target.value)} placeholder="Specifications / Requirements" className="w-full p-2 neu-inset rounded-lg text-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button onClick={() => handleSubmit('draft')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-600 text-white hover:bg-slate-700 flex items-center gap-2">
                <Save className="w-5 h-5" /><span>Save Draft</span>
              </button>
              <button onClick={() => handleSubmit('issued')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
                <Send className="w-5 h-5" /><span>Issue RFQ</span>
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
