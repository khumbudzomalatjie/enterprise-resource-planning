import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useInventoryStore from '../store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { ArrowDown, Package, Save, Plus, Trash2, ChevronRight, Sparkles, Sun, Moon } from 'lucide-react'

export default function StockIn() {
  const { items, fetchItems, warehouses, fetchWarehouses, createStockMovement } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [movements, setMovements] = useState([{ item_id: '', quantity: 1, unit_cost: 0, warehouse_id: '', notes: '' }])

  useEffect(() => {
    fetchItems()
    fetchWarehouses()
  }, [])

  const addRow = () => setMovements([...movements, { item_id: '', quantity: 1, unit_cost: 0, warehouse_id: '', notes: '' }])
  const removeRow = (i) => { if (movements.length > 1) setMovements(movements.filter((_, idx) => idx !== i)) }
  const updateRow = (i, field, value) => {
    const newMov = [...movements]
    newMov[i] = { ...newMov[i], [field]: value }
    if (field === 'item_id') {
      const item = items.find(it => it.id === value)
      if (item) newMov[i].unit_cost = item.unit_cost || 0
    }
    setMovements(newMov)
  }

  const handleSubmit = async () => {
    const validMovements = movements.filter(m => m.item_id && m.quantity > 0)
    if (validMovements.length === 0) { toast.error('Please fill in at least one item'); return }
    
    let success = 0
    for (const m of validMovements) {
      const result = await createStockMovement({
        item_id: m.item_id,
        movement_type: 'purchase',
        quantity: m.quantity,
        unit_cost: m.unit_cost,
        warehouse_id: m.warehouse_id || warehouses[0]?.id,
        notes: m.notes,
        status: 'completed'
      })
      if (result.success) success++
    }
    
    toast.success(`${success} items stocked in successfully!`)
    navigate('/inventory')
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 hidden sm:inline">ERP</span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/inventory" className="text-slate-500 hover:text-emerald-600">Inventory</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Stock In</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <ArrowDown className="w-8 h-8 text-emerald-600" />Stock In (Receive)
          </h1>

          <div className="neu-raised rounded-3xl p-6 mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Items Received</h2>
              <button onClick={addRow} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm"><Plus className="w-4 h-4" />Add Row</button>
            </div>
            
            <div className="space-y-4">
              {movements.map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500">Item</label>
                    <select value={m.item_id} onChange={(e) => updateRow(i, 'item_id', e.target.value)} className="w-full p-2 neu-inset rounded-lg text-sm">
                      <option value="">Select Item</option>
                      {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.item_code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Quantity</label>
                    <input type="number" value={m.quantity} onChange={(e) => updateRow(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-full p-2 neu-inset rounded-lg text-sm" min="1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Unit Cost (R)</label>
                    <input type="number" value={m.unit_cost} onChange={(e) => updateRow(i, 'unit_cost', parseFloat(e.target.value) || 0)} className="w-full p-2 neu-inset rounded-lg text-sm" step="0.01" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500">Warehouse</label>
                      <select value={m.warehouse_id} onChange={(e) => updateRow(i, 'warehouse_id', e.target.value)} className="w-full p-2 neu-inset rounded-lg text-sm">
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <button onClick={() => removeRow(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button onClick={() => navigate('/inventory')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-500 text-white hover:bg-slate-600">Cancel</button>
            <button onClick={handleSubmit} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <Save className="w-5 h-5" /><span>Confirm Stock In</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
