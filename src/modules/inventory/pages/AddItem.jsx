import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useInventoryStore from '../store/inventoryStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Package, Save, ArrowLeft, Sparkles, Sun, Moon, Plus } from 'lucide-react'

export default function AddItem() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { 
    createItem, updateItem, fetchItem, selectedItem, 
    categories, fetchCategories, 
    warehouses, fetchWarehouses, 
    suppliers, fetchSuppliers 
  } = useInventoryStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showQuickSupplier, setShowQuickSupplier] = useState(false)

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

  // Quick supplier form
  const [quickSupplier, setQuickSupplier] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    city: ''
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
        unit_cost: item.unit_cost ?? '',
        unit_price: item.unit_price ?? '',
        minimum_stock: item.minimum_stock || 0,
        maximum_stock: item.maximum_stock ?? '',
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

  const handleQuickSupplierChange = (e) => {
    const { name, value } = e.target
    setQuickSupplier(prev => ({ ...prev, [name]: value }))
  }

  const handleQuickSupplierSubmit = async () => {
    if (!quickSupplier.company_name) {
      toast.error('Please enter supplier company name')
      return
    }
    
    const { createSupplier } = useInventoryStore.getState()
    const result = await createSupplier(quickSupplier)
    
    if (result.success) {
      toast.success('Supplier added successfully!')
      setFormData(prev => ({ ...prev, preferred_supplier_id: result.data.id }))
      setQuickSupplier({ company_name: '', contact_name: '', email: '', phone: '', city: '' })
      setShowQuickSupplier(false)
      await fetchSuppliers() // Refresh supplier list
    } else {
      toast.error('Failed to add supplier')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.unit) {
      toast.error('Please fill in required fields (Name and Unit)')
      return
    }

    setLoading(true)
    
    // Convert empty strings to null for UUID fields
    const data = {
      name: formData.name,
      description: formData.description || null,
      category_id: formData.category_id || null,
      unit: formData.unit,
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      minimum_stock: parseInt(formData.minimum_stock) || 0,
      maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null,
      reorder_point: parseInt(formData.reorder_point) || 10,
      reorder_quantity: parseInt(formData.reorder_quantity) || 50,
      default_warehouse_id: formData.default_warehouse_id || null,
      preferred_supplier_id: formData.preferred_supplier_id || null,
      storage_location: formData.storage_location || null,
      shelf_number: formData.shelf_number || null,
      bin_number: formData.bin_number || null,
      barcode: formData.barcode || null,
      notes: formData.notes || null,
      status: formData.status || 'active'
    }

    console.log('Saving item data:', data)

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
      console.error('Save error:', result.error)
    }
  }

  // Get category color for display
  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.color || '#10b981'
  }

  // Get supplier info
  const getSupplierInfo = (supplierId) => {
    return suppliers.find(s => s.id === supplierId)
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

          {loading && isEditing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading item...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="neu-raised rounded-3xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-500">Item Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="e.g., Multi-Purpose Cleaner 5L" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                      required 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-500">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows={2} 
                      placeholder="Item description..." 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>

                  {/* Category with color indicator */}
                  <div>
                    <label className="text-sm text-slate-500">Category</label>
                    <select 
                      name="category_id" 
                      value={formData.category_id} 
                      onChange={handleChange} 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {formData.category_id && (
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="w-3 h-3 rounded-full inline-block" 
                          style={{ backgroundColor: getCategoryColor(formData.category_id) }}
                        ></span>
                        <span className="text-xs text-slate-500">
                          {categories.find(c => c.id === formData.category_id)?.description || ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Unit *</label>
                    <select 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleChange} 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                      required
                    >
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
                      <option value="carton">Carton</option>
                      <option value="drum">Drum</option>
                      <option value="can">Can</option>
                      <option value="sachet">Sachet</option>
                      <option value="bag">Bag</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Unit Cost (R)</label>
                    <input 
                      type="number" 
                      name="unit_cost" 
                      value={formData.unit_cost} 
                      onChange={handleChange} 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Selling Price (R)</label>
                    <input 
                      type="number" 
                      name="unit_price" 
                      value={formData.unit_price} 
                      onChange={handleChange} 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange} 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300"
                    >
                      <option value="active">Active</option>
                      <option value="discontinued">Discontinued</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Barcode / SKU</label>
                    <input 
                      type="text" 
                      name="barcode" 
                      value={formData.barcode} 
                      onChange={handleChange} 
                      placeholder="Scan or enter barcode" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>
                </div>
              </div>

              {/* Stock Levels */}
              <div className="neu-raised rounded-3xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Stock Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Minimum Stock Level</label>
                    <input 
                      type="number" 
                      name="minimum_stock" 
                      value={formData.minimum_stock} 
                      onChange={handleChange} 
                      min="0" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                    <p className="text-xs text-slate-400 mt-1">Alert when stock goes below this level</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Maximum Stock Level</label>
                    <input 
                      type="number" 
                      name="maximum_stock" 
                      value={formData.maximum_stock} 
                      onChange={handleChange} 
                      min="0" 
                      placeholder="Optional" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                    <p className="text-xs text-slate-400 mt-1">Maximum quantity to keep in stock</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Reorder Point</label>
                    <input 
                      type="number" 
                      name="reorder_point" 
                      value={formData.reorder_point} 
                      onChange={handleChange} 
                      min="0" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                    <p className="text-xs text-slate-400 mt-1">Trigger reorder when stock reaches this</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Reorder Quantity</label>
                    <input 
                      type="number" 
                      name="reorder_quantity" 
                      value={formData.reorder_quantity} 
                      onChange={handleChange} 
                      min="0" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                    <p className="text-xs text-slate-400 mt-1">Default quantity to order</p>
                  </div>
                </div>
              </div>

              {/* Storage & Supplier */}
              <div className="neu-raised rounded-3xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Storage & Supplier</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Default Warehouse</label>
                    <select 
                      name="default_warehouse_id" 
                      value={formData.default_warehouse_id} 
                      onChange={handleChange} 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred Supplier - Enhanced with quick add */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-500">Preferred Supplier</label>
                      <button 
                        type="button"
                        onClick={() => setShowQuickSupplier(!showQuickSupplier)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add New
                      </button>
                    </div>
                    <select 
                      name="preferred_supplier_id" 
                      value={formData.preferred_supplier_id} 
                      onChange={handleChange} 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.company_name} {s.is_preferred ? '⭐' : ''} - {s.city || 'N/A'}
                        </option>
                      ))}
                    </select>
                    {formData.preferred_supplier_id && (
                      <div className="mt-1 text-xs text-slate-500">
                        {(() => {
                          const supplier = getSupplierInfo(formData.preferred_supplier_id)
                          return supplier ? (
                            <span>
                              📞 {supplier.phone || 'N/A'} | ✉️ {supplier.email || 'N/A'}
                              {supplier.is_preferred && <span className="ml-2 text-amber-500">⭐ Preferred</span>}
                            </span>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Quick Supplier Form */}
                  {showQuickSupplier && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30">
                      <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">Quick Add Supplier</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <input 
                            type="text" 
                            name="company_name"
                            value={quickSupplier.company_name} 
                            onChange={handleQuickSupplierChange} 
                            placeholder="Company Name *" 
                            className="w-full p-2 rounded-lg text-sm border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300" 
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            name="contact_name"
                            value={quickSupplier.contact_name} 
                            onChange={handleQuickSupplierChange} 
                            placeholder="Contact Person" 
                            className="w-full p-2 rounded-lg text-sm border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300" 
                          />
                        </div>
                        <div>
                          <input 
                            type="email" 
                            name="email"
                            value={quickSupplier.email} 
                            onChange={handleQuickSupplierChange} 
                            placeholder="Email" 
                            className="w-full p-2 rounded-lg text-sm border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300" 
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            name="phone"
                            value={quickSupplier.phone} 
                            onChange={handleQuickSupplierChange} 
                            placeholder="Phone" 
                            className="w-full p-2 rounded-lg text-sm border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300" 
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            name="city"
                            value={quickSupplier.city} 
                            onChange={handleQuickSupplierChange} 
                            placeholder="City" 
                            className="w-full p-2 rounded-lg text-sm border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300" 
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button 
                          type="button"
                          onClick={handleQuickSupplierSubmit}
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                        >
                          Add Supplier
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowQuickSupplier(false)}
                          className="px-4 py-2 rounded-lg bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-500">Storage Location</label>
                    <input 
                      type="text" 
                      name="storage_location" 
                      value={formData.storage_location} 
                      onChange={handleChange} 
                      placeholder="e.g., Aisle A, Section 3" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Shelf Number</label>
                    <input 
                      type="text" 
                      name="shelf_number" 
                      value={formData.shelf_number} 
                      onChange={handleChange} 
                      placeholder="e.g., S-01" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Bin Number</label>
                    <input 
                      type="text" 
                      name="bin_number" 
                      value={formData.bin_number} 
                      onChange={handleChange} 
                      placeholder="e.g., B-001" 
                      className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="neu-raised rounded-3xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Additional Notes</h2>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Any additional notes about this item..." 
                  className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" 
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => navigate('/inventory/items')} 
                  className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-500 text-white hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="neu-raised neu-btn px-8 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  )
}
