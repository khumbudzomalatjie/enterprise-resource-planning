import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useInventoryStore from '../store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { ArrowUp, Package, Save, Plus, Trash2, ChevronRight, Sparkles, Sun, Moon, ArrowLeft, AlertTriangle } from 'lucide-react'

export default function StockOut() {
  const { items, fetchItems, warehouses, fetchWarehouses, createStockMovement, fetchInventoryStats } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [movements, setMovements] = useState([{ 
    item_id: '', 
    quantity: '', 
    movement_type: 'job_usage', 
    warehouse_id: '', 
    notes: '' 
  }])

  useEffect(() => {
    fetchItems()
    fetchWarehouses()
  }, [])

  const addRow = () => {
    setMovements([...movements, { 
      item_id: '', 
      quantity: '', 
      movement_type: 'job_usage', 
      warehouse_id: movements[0]?.warehouse_id || '', 
      notes: '' 
    }])
  }

  const removeRow = (i) => {
    if (movements.length > 1) {
      setMovements(movements.filter((_, idx) => idx !== i))
    }
  }

  const updateRow = (i, field, value) => {
    const newMov = [...movements]
    newMov[i] = { ...newMov[i], [field]: value }
    setMovements(newMov)
  }

  const getItemInfo = (itemId) => {
    return items.find(it => it.id === itemId)
  }

  const handleSubmit = async () => {
    // Validate
    const validMovements = movements.filter(m => m.item_id && m.quantity && parseFloat(m.quantity) > 0)
    
    if (validMovements.length === 0) {
      toast.error('Please fill in at least one item with a valid quantity')
      return
    }

    // Check if enough stock
    for (const m of validMovements) {
      const item = getItemInfo(m.item_id)
      if (item && parseFloat(m.quantity) > item.current_stock) {
        toast.error(`Insufficient stock for ${item.name}. Available: ${item.current_stock} ${item.unit}`)
        return
      }
    }

    setSaving(true)
    let successCount = 0
    let failCount = 0

    for (const m of validMovements) {
      const item = getItemInfo(m.item_id)
      const movementData = {
        item_id: m.item_id,
        movement_type: m.movement_type,
        quantity: parseFloat(m.quantity),
        unit_cost: item?.unit_cost || 0,
        warehouse_id: m.warehouse_id || warehouses[0]?.id,
        notes: m.notes || 'Stock Out',
        status: 'completed'
      }

      const result = await createStockMovement(movementData)
      if (result.success) {
        successCount++
      } else {
        failCount++
        console.error('Failed to stock out:', result.error)
      }
    }

    setSaving(false)

    if (successCount > 0) {
      toast.success(`${successCount} item(s) stocked out successfully!`)
      await fetchInventoryStats()
      await fetchItems()
    }
    
    if (failCount > 0) {
      toast.error(`${failCount} item(s) failed to stock out`)
    }

    if (successCount > 0 && failCount === 0) {
      navigate('/inventory')
    }
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <Link to="/inventory" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Inventory</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-2">
            <ArrowUp className="w-8 h-8 text-red-600" />Stock Out (Issue)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 ml-11">Issue stock for jobs, sales, transfers, or write-offs</p>

          <div className="neu-raised rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Items Being Issued</h2>
              <button onClick={addRow} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium">
                <Plus className="w-4 h-4" />Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {movements.map((m, i) => {
                const selectedItem = getItemInfo(m.item_id)
                const isOverStock = selectedItem && parseFloat(m.quantity) > selectedItem.current_stock
                
                return (
                  <div key={i} className={`p-5 rounded-xl border transition-colors ${
                    isOverStock 
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700/50' 
                      : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-500">Item #{i + 1}</span>
                      {movements.length > 1 && (
                        <button onClick={() => removeRow(i)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Item *</label>
                        <select 
                          value={m.item_id} 
                          onChange={(e) => updateRow(i, 'item_id', e.target.value)} 
                          className="w-full p-3 neu-inset rounded-xl text-sm text-slate-700 dark:text-slate-300"
                        >
                          <option value="">Select Item</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} (Stock: {item.current_stock} {item.unit})
                            </option>
                          ))}
                        </select>
                        {selectedItem && (
                          <p className={`text-xs mt-1 ${isOverStock ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                            Available: <span className="font-medium">{selectedItem.current_stock} {selectedItem.unit}</span>
                            {isOverStock && (
                              <span className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" /> Insufficient stock!
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Quantity *</label>
                        <input 
                          type="number" 
                          value={m.quantity} 
                          onChange={(e) => updateRow(i, 'quantity', e.target.value)} 
                          placeholder="0" 
                          min="0.01" 
                          step="0.01"
                          className={`w-full p-3 neu-inset rounded-xl text-sm ${
                            isOverStock ? 'text-red-600 border-red-300' : 'text-slate-700 dark:text-slate-300'
                          }`} 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Type</label>
                        <select 
                          value={m.movement_type} 
                          onChange={(e) => updateRow(i, 'movement_type', e.target.value)} 
                          className="w-full p-3 neu-inset rounded-xl text-sm text-slate-700 dark:text-slate-300"
                        >
                          <option value="job_usage">Job Usage</option>
                          <option value="sale">Sale</option>
                          <option value="transfer_out">Transfer Out</option>
                          <option value="write_off">Write Off</option>
                          <option value="damage">Damaged</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Warehouse</label>
                        <select 
                          value={m.warehouse_id} 
                          onChange={(e) => updateRow(i, 'warehouse_id', e.target.value)} 
                          className="w-full p-3 neu-inset rounded-xl text-sm text-slate-700 dark:text-slate-300"
                        >
                          <option value="">Select Warehouse</option>
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-500 mb-1 block">Notes / Reason</label>
                        <input 
                          type="text" 
                          value={m.notes} 
                          onChange={(e) => updateRow(i, 'notes', e.target.value)} 
                          placeholder="e.g., Job #JOB-001, or reason for write-off" 
                          className="w-full p-3 neu-inset rounded-xl text-sm text-slate-700 dark:text-slate-300" 
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {movements.filter(m => m.item_id && m.quantity).length > 0 && (
            <div className="neu-raised rounded-3xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Summary</h3>
              <div className="space-y-2">
                {movements.filter(m => m.item_id && m.quantity).map((m, i) => {
                  const item = getItemInfo(m.item_id)
                  const typeLabels = {
                    job_usage: 'Job Usage',
                    sale: 'Sale',
                    transfer_out: 'Transfer Out',
                    write_off: 'Write Off',
                    damage: 'Damaged'
                  }
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {item?.name || 'Unknown'} x {m.quantity} {item?.unit || ''}
                        <span className="text-xs text-slate-500 ml-2">({typeLabels[m.movement_type] || m.movement_type})</span>
                      </span>
                      <span className="font-medium text-slate-800 dark:text-white">
                        {m.quantity} {item?.unit || ''}
                      </span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-800 dark:text-white">Total Items</span>
                  <span className="text-red-600">
                    {movements.filter(m => m.item_id && m.quantity).length} items
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button 
              onClick={() => navigate('/inventory')} 
              className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-500 text-white hover:bg-slate-600"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={saving}
              className="neu-raised neu-btn px-8 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Processing...' : 'Confirm Stock Out'}</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
