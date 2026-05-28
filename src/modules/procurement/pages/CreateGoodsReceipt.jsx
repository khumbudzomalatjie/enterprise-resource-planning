import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useInventoryStore from '../../inventory/store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Truck, Save, ChevronRight } from 'lucide-react'

export default function CreateGoodsReceipt() {
  const { createGoodsReceipt } = useProcurementStore()
  const { purchaseOrders, fetchPurchaseOrders } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [grData, setGrData] = useState({
    purchase_order_id: '',
    warehouse_id: '',
    delivery_note_number: '',
    invoice_number: '',
    inspection_notes: '',
    quality_check_passed: true,
    notes: '',
    status: 'pending'
  })

  const [receivedItems, setReceivedItems] = useState([])

  useEffect(() => {
    fetchPurchaseOrders({ status: 'sent' })
  }, [])

  const handlePOSelect = async (poId) => {
    setGrData({...grData, purchase_order_id: poId})
    
    // Load PO items for receipt
    const po = purchaseOrders.find(p => p.id === poId)
    if (po?.purchase_order_items) {
      setReceivedItems(po.purchase_order_items.map(item => ({
        purchase_order_item_id: item.id,
        item_id: item.item_id,
        description: item.description,
        quantity_ordered: item.quantity_ordered,
        quantity_received: item.quantity_ordered,
        quantity_accepted: item.quantity_ordered,
        quantity_rejected: 0,
        unit_price: item.unit_price
      })))
    }
  }

  const updateReceivedItem = (index, field, value) => {
    const newItems = [...receivedItems]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity_rejected') {
      newItems[index].quantity_accepted = newItems[index].quantity_received - value
    }
    setReceivedItems(newItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!grData.purchase_order_id) {
      toast.error('Please select a purchase order')
      return
    }

    const result = await createGoodsReceipt(grData, receivedItems)
    
    if (result.success) {
      toast.success('Goods receipt created!')
      navigate('/procurement/receipts')
    } else {
      toast.error(result.error || 'Failed to create goods receipt')
    }
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/procurement/receipts" className="text-slate-500 hover:text-emerald-600">Receipts</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">New Receipt</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <Truck className="w-8 h-8 text-emerald-600" />Goods Receipt
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Receipt Details */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Receipt Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Purchase Order *</label>
                  <select value={grData.purchase_order_id} onChange={(e) => handlePOSelect(e.target.value)} className="w-full p-3 neu-inset rounded-xl mt-1" required>
                    <option value="">Select PO</option>
                    {purchaseOrders.filter(po => po.status === 'sent' || po.status === 'confirmed').map(po => (
                      <option key={po.id} value={po.id}>{po.po_number} - {po.vendors?.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Delivery Note #</label>
                  <input type="text" value={grData.delivery_note_number} onChange={(e) => setGrData({...grData, delivery_note_number: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Invoice #</label>
                  <input type="text" value={grData.invoice_number} onChange={(e) => setGrData({...grData, invoice_number: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Quality Check</label>
                  <select value={grData.quality_check_passed} onChange={(e) => setGrData({...grData, quality_check_passed: e.target.value === 'true'})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="true">Passed</option>
                    <option value="false">Failed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Inspection Notes</label>
                  <textarea value={grData.inspection_notes} onChange={(e) => setGrData({...grData, inspection_notes: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Received Items */}
            {receivedItems.length > 0 && (
              <div className="neu-raised rounded-3xl p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Items Received</h2>
                <div className="space-y-4">
                  {receivedItems.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                      <p className="font-medium text-sm text-slate-800 dark:text-white mb-2">{item.description || `Item ${index + 1}`}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-slate-500">Ordered</label>
                          <p className="text-sm font-semibold">{item.quantity_ordered}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Received</label>
                          <input type="number" value={item.quantity_received} onChange={(e) => updateReceivedItem(index, 'quantity_received', parseFloat(e.target.value) || 0)} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Rejected</label>
                          <input type="number" value={item.quantity_rejected} onChange={(e) => updateReceivedItem(index, 'quantity_rejected', parseFloat(e.target.value) || 0)} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => navigate('/procurement/receipts')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-600 text-white hover:bg-slate-700">
                Cancel
              </button>
              <button type="submit" className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
                <Save className="w-5 h-5" /><span>Save Receipt</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
