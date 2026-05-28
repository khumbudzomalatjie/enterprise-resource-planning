import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useInventoryStore from '../store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Package, Save, ArrowLeft, Sparkles, Sun, Moon } from 'lucide-react'

export default function AddItem() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { createItem, updateItem, fetchItem, selectedItem, categories, fetchCategories, warehouses, fetchWarehouses, suppliers, fetchSuppliers } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    unit: 'each',
    unit_cost: '',
    unit_price: '',
    minimum_stock: 0,
    maximum_stock: '',
    reorder_point: 10,
    reorder_quantity: 50,
    default_warehouse_id: '',
    preferred_supplier_id: '',
    storage_location: '',
    shelf_number: '',
    bin_number: '',
    barcode: '',
    notes: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCategories()
    fetchWarehouses()
    fetchSuppliers()
    
    if (isEditing) {
      loadItem()
    }
  }, [id])

  const loadItem = async () => {
    setLoading(true)
    const result = await fetchItem(id)
    if (result.success && result.data) {
      const item = result.data
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category_id: item.category_id || '',
        unit: item.unit || 'each',
        unit_cost: item.unit_cost || '',
        unit_price: item.unit_price || '',
        minimum_stock: item.minimum_stock || 0,
        maximum_stock: item.maximum_stock || '',
        reorder_point: item.reorder_point || 10,
        reorder_quantity: item.reorder_quantity || 50,
        default_warehouse_id: item.default_warehouse_id || '',
        preferred_supplier_id: item.preferred_supplier_id || '',
        storage_location: item.storage_location || '',
        shelf_number: item.shelf_number || '',
        bin_number: item.bin_number || '',
        barcode: item.barcode || '',
        notes: item.notes || '',
        status: item.status || 'active'
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.unit) {
      toast.error('Please fill in required fields (Name and Unit)')
      return
    }

    setLoading(true)
    
    const data = {
      ...formData,
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      minimum_stock: parseInt(formData.minimum_stock) || 0,
      maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null,
      reorder_point: parseInt(formData.reorder_point) || 10,
      reorder_quantity: parseInt(formData.reorder_quantity) || 50,
    }

    let result
    if (isEditing) {
      result = await updateItem(id, data)
    } else {
      result = await createItem(data)
    }

    setLoading(false)

    if (result.success) {
      toast.success(isEditing ? 'Item updated successfully!' : 'Item created successfully!')
      navigate('/inventory/items')
    } else {
      toast.error(result.error || 'Failed to save item')
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
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <Link to="/inventory/items" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Stock List</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-emerald-600" />
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="neu-raised rounded-3xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Item Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Multi-Purpose Cleaner 5L" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Item description..." className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Unit *</label>
                  <select name="unit" value={formData.unit} onChange={handleChange} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" required>
                    <option value="each">Each</option>
                    <option value="bottle">Bottle</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="liter">Liter</option>
                    <option value="kg">Kilogram</option>
                    <option value="roll">Roll</option>
                    <option value="unit">Unit</option>
                    <option value="pair">Pair</option>
                    <option value="set">Set</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Unit Cost (R)</label>
                  <input type="number" name="unit_cost" value={formData.unit_cost} onChange={handleChange} step="0.01" min="0" placeholder="0.00" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Unit Price (R)</label>
                  <input type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} step="0.01" min="0" placeholder="0.00" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300">
                    <option value="active">Active</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Barcode</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Scan or enter barcode" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>

            {/* Stock Levels */}
            <div className="neu-raised rounded-3xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Stock Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Minimum Stock Level</label>
                  <input type="number" name="minimum_stock" value={formData.minimum_stock} onChange={handleChange} min="0" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Maximum Stock Level</label>
                  <input type="number" name="maximum_stock" value={formData.maximum_stock} onChange={handleChange} min="0" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Reorder Point</label>
                  <input type="number" name="reorder_point" value={formData.reorder_point} onChange={handleChange} min="0" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Reorder Quantity</label>
                  <input type="number" name="reorder_quantity" value={formData.reorder_quantity} onChange={handleChange} min="0" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>

            {/* Storage & Supplier */}
            <div className="neu-raised rounded-3xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Storage & Supplier</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Default Warehouse</label>
                  <select name="default_warehouse_id" value={formData.default_warehouse_id} onChange={handleChange} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300">
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Preferred Supplier</label>
                  <select name="preferred_supplier_id" value={formData.preferred_supplier_id} onChange={handleChange} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300">
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Storage Location</label>
                  <input type="text" name="storage_location" value={formData.storage_location} onChange={handleChange} placeholder="e.g., Aisle A" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Shelf Number</label>
                  <input type="text" name="shelf_number" value={formData.shelf_number} onChange={handleChange} placeholder="e.g., S-01" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Bin Number</label>
                  <input type="text" name="bin_number" value={formData.bin_number} onChange={handleChange} placeholder="e.g., B-001" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="neu-raised rounded-3xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Additional Notes</h2>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Any additional notes..." className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => navigate('/inventory/items')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-500 text-white hover:bg-slate-600">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="neu-raised neu-btn px-8 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
