import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useInventoryStore from '../../inventory/store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { FileText, Save, Send, Plus, Trash2, ChevronRight } from 'lucide-react'

export default function CreatePurchaseRequest() {
  const { createPurchaseRequisition, fetchVendors, vendors } = useProcurementStore()
  const { items, fetchItems } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [prData, setPrData] = useState({
    department: 'Operations',
    priority: 'medium',
    purpose: '',
    notes: '',
    date_required: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimated_total: 0
  })

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit: 'each', estimated_unit_price: 0, item_id: null, suggested_vendor_id: null }
  ])

  useEffect(() => {
    fetchItems()
    fetchVendors({ status: 'active' })
  }, [])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit: 'each', estimated_unit_price: 0, item_id: null, suggested_vendor_id: null }])
  }

  const removeLineItem = (index) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index, field, value) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'estimated_unit_price') {
      newItems[index].estimated_total = (newItems[index].quantity || 0) * (newItems[index].estimated_unit_price || 0)
    }
    setLineItems(newItems)
  }

  const handleItemSelect = (index, itemId) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      updateLineItem(index, 'item_id', itemId)
      updateLineItem(index, 'description', item.name)
      updateLineItem(index, 'unit', item.unit)
      updateLineItem(index, 'estimated_unit_price', item.unit_cost || 0)
      if (item.preferred_supplier_id) {
        updateLineItem(index, 'suggested_vendor_id', item.preferred_supplier_id)
      }
    }
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.estimated_unit_price), 0)
  }

  const handleSubmit = async (status = 'draft') => {
    if (!prData.purpose || lineItems.some(item => !item.description)) {
      toast.error('Please fill in all required fields')
      return
    }

    const total = calculateTotal()
    const result = await createPurchaseRequisition(
      { ...prData, estimated_total: total, status },
      lineItems
    )

    if (result.success) {
      toast.success(status === 'pending_approval' ? 'PR submitted for approval!' : 'PR saved as draft!')
      navigate('/procurement/pr')
    } else {
      toast.error('Failed to create PR')
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/procurement/pr" className="text-slate-500 hover:text-emerald-600">PRs</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">New PR</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-emerald-600" />Create Purchase Requisition
          </h1>

          {/* Header Info */}
          <div className="neu-raised rounded-3xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Purpose *</label>
                <input type="text" value={prData.purpose} onChange={(e) => setPrData({...prData, purpose: e.target.value})} placeholder="e.g., Restock cleaning supplies for Q3" className="w-full p-3 neu-inset rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-sm text-slate-500">Department</label>
                <select value={prData.department} onChange={(e) => setPrData({...prData, department: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                  <option value="Operations">Operations</option>
                  <option value="Administration">Administration</option>
                  <option value="Fleet">Fleet</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-500">Priority</label>
                <select value={prData.priority} onChange={(e) => setPrData({...prData, priority: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-500">Date Required</label>
                <input type="date" value={prData.date_required} onChange={(e) => setPrData({...prData, date_required: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-500">Notes</label>
                <textarea value={prData.notes} onChange={(e) => setPrData({...prData, notes: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="neu-raised rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Line Items</h2>
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
                    {items.map(inv => <option key={inv.id} value={inv.id}>{inv.name} ({inv.item_code})</option>)}
                  </select>
                  <input type="text" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} placeholder="Description" className="w-full p-2 neu-inset rounded-lg text-sm" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qty" className="p-2 neu-inset rounded-lg text-sm" />
                    <select value={item.unit} onChange={(e) => updateLineItem(index, 'unit', e.target.value)} className="p-2 neu-inset rounded-lg text-sm">
                      <option value="each">Each</option><option value="box">Box</option><option value="bottle">Bottle</option><option value="pack">Pack</option><option value="litre">Litre</option>
                    </select>
                    <input type="number" value={item.estimated_unit_price} onChange={(e) => updateLineItem(index, 'estimated_unit_price', parseFloat(e.target.value) || 0)} placeholder="Unit Price" className="p-2 neu-inset rounded-lg text-sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Line Total:</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(item.quantity * item.estimated_unit_price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-800 dark:text-white">Estimated Total:</span>
              <span className="text-xl font-bold text-emerald-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button onClick={() => handleSubmit('draft')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-600 text-white hover:bg-slate-700 flex items-center gap-2">
              <Save className="w-5 h-5" /><span>Save Draft</span>
            </button>
            <button onClick={() => handleSubmit('pending_approval')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <Send className="w-5 h-5" /><span>Submit for Approval</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
