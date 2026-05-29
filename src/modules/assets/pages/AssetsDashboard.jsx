import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useAssetsStore from '../store/assetsStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Database, Package, Wrench, Plus, Search, X,
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft,
  DollarSign, MapPin, User, Calendar, Save,
  AlertCircle, Edit, Trash2, Eye
} from 'lucide-react'

export default function AssetsDashboard() {
  const { assets, categories, stats, fetchAssets, fetchCategories, fetchAssetsStats, createAsset, updateAsset, deleteAsset, createCategory, loading } = useAssetsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modal states
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showEditAsset, setShowEditAsset] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showViewAsset, setShowViewAsset] = useState(null)

  // Form states
  const [assetForm, setAssetForm] = useState({
    name: '', description: '', category_id: '', purchase_date: '',
    purchase_price: '', salvage_value: '0', current_value: '',
    location: '', department: '', serial_number: '', model_number: '',
    manufacturer: '', supplier: '', warranty_expiry: '', notes: '',
    status: 'active', condition: 'good', insured: false
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', useful_life_years: 5, depreciation_rate: 20, depreciation_method: 'straight_line'
  })

  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchAssetsStats()
    fetchCategories()
    loadAssets()
  }, [statusFilter, categoryFilter])

  const loadAssets = async () => {
    const filters = {}
    if (statusFilter !== 'all') filters.status = statusFilter
    if (categoryFilter !== 'all') filters.category_id = categoryFilter
    if (search) filters.search = search
    await fetchAssets(filters)
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)

  // Create Asset
  const handleCreateAsset = async () => {
    if (!assetForm.name || !assetForm.category_id) {
      toast.error('Name and category are required')
      return
    }
    const result = await createAsset({
      ...assetForm,
      purchase_price: parseFloat(assetForm.purchase_price) || 0,
      salvage_value: parseFloat(assetForm.salvage_value) || 0,
      current_value: parseFloat(assetForm.current_value) || parseFloat(assetForm.purchase_price) || 0
    })
    if (result.success) {
      toast.success('Asset created!')
      setShowAddAsset(false)
      resetAssetForm()
      loadAssets()
      fetchAssetsStats()
    } else {
      toast.error(result.error || 'Failed to create asset')
    }
  }

  // Create Category
  const handleCreateCategory = async () => {
    if (!categoryForm.name) { toast.error('Category name is required'); return }
    const result = await createCategory(categoryForm)
    if (result.success) {
      toast.success('Category created!')
      setShowAddCategory(false)
      setCategoryForm({ name: '', description: '', useful_life_years: 5, depreciation_rate: 20, depreciation_method: 'straight_line' })
      fetchCategories()
    } else {
      toast.error('Failed to create category')
    }
  }

  // Edit Asset
  const handleEditAsset = (asset) => {
    setEditForm({
      name: asset.name || '',
      description: asset.description || '',
      category_id: asset.category_id || '',
      purchase_date: asset.purchase_date || '',
      purchase_price: asset.purchase_price || '',
      salvage_value: asset.salvage_value || '0',
      current_value: asset.current_value || '',
      location: asset.location || '',
      department: asset.department || '',
      serial_number: asset.serial_number || '',
      model_number: asset.model_number || '',
      manufacturer: asset.manufacturer || '',
      supplier: asset.supplier || '',
      warranty_expiry: asset.warranty_expiry || '',
      notes: asset.notes || '',
      status: asset.status || 'active',
      condition: asset.condition || 'good',
      insured: asset.insured || false
    })
    setShowEditAsset(asset)
  }

  const handleSaveEdit = async () => {
    if (!showEditAsset) return
    const result = await updateAsset(showEditAsset.id, {
      ...editForm,
      purchase_price: parseFloat(editForm.purchase_price) || 0,
      salvage_value: parseFloat(editForm.salvage_value) || 0,
      current_value: parseFloat(editForm.current_value) || parseFloat(editForm.purchase_price) || 0
    })
    if (result.success) {
      toast.success('Asset updated!')
      setShowEditAsset(null)
      loadAssets()
      fetchAssetsStats()
    } else {
      toast.error('Failed to update asset')
    }
  }

  // Delete Asset
  const handleDeleteAsset = async () => {
    if (!showDeleteConfirm) return
    const result = await deleteAsset(showDeleteConfirm.id)
    if (result.success) {
      toast.success('Asset disposed')
      setShowDeleteConfirm(null)
      loadAssets()
      fetchAssetsStats()
    }
  }

  const resetAssetForm = () => {
    setAssetForm({
      name: '', description: '', category_id: '', purchase_date: '',
      purchase_price: '', salvage_value: '0', current_value: '',
      location: '', department: '', serial_number: '', model_number: '',
      manufacturer: '', supplier: '', warranty_expiry: '', notes: '',
      status: 'active', condition: 'good', insured: false
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      in_use: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      available: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      retired: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
      disposed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || 'bg-slate-100 text-slate-600'
  }

  const statCards = [
    { icon: Database, label: 'Total Assets', value: stats.totalAssets || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Package, label: 'Active Assets', value: stats.activeAssets || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Wrench, label: 'In Maintenance', value: stats.maintenanceAssets || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: DollarSign, label: 'Total Value', value: formatCurrency(stats.totalCurrentValue), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: AlertCircle, label: 'Disposed', value: stats.disposedAssets || 0, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { icon: Calendar, label: 'Upcoming Service', value: stats.upcomingMaintenance?.length || 0, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ]

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">ERP</span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <Link to="/dashboard" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Main Dashboard</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Assets Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">Asset register, depreciation, maintenance & transfers</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddCategory(true)} className="neu-raised neu-btn px-4 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-5 h-5" /><span>Add Category</span>
            </button>
            <button onClick={() => setShowAddAsset(true)} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <Plus className="w-5 h-5" /><span>Add Asset</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4 stat-card">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, serial..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300" onKeyDown={e => e.key === 'Enter' && loadAssets()} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="in_use">In Use</option>
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="disposed">Disposed</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={loadAssets} className="neu-raised neu-btn px-6 py-3 rounded-xl bg-emerald-600 text-white">Search</button>
        </div>

        {/* Asset Grid */}
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div><p className="text-slate-500">Loading...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset, i) => (
              <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="neu-raised rounded-2xl p-5 stat-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{asset.name}</h3>
                    <p className="text-xs text-slate-500">{asset.asset_code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>{asset.status?.replace('_', ' ')}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium">{asset.asset_categories?.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Value:</span><span className="font-medium">{formatCurrency(asset.current_value)}</span></div>
                  {asset.purchase_date && <div className="flex justify-between"><span className="text-slate-500">Purchased:</span><span>{new Date(asset.purchase_date).toLocaleDateString()}</span></div>}
                  <div className="flex items-center gap-1 text-slate-500"><MapPin className="w-3.5 h-3.5" />{asset.location || 'No location'}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-1">
                  <button onClick={() => handleEditAsset(asset)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-slate-400 hover:text-purple-600" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setShowDeleteConfirm(asset)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ADD ASSET MODAL */}
      <AnimatePresence>
        {showAddAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Asset</h3>
                <button onClick={() => setShowAddAsset(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Asset Name *</label>
                  <input type="text" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="e.g., Industrial Vacuum Cleaner" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Category *</label>
                  <select value={assetForm.category_id} onChange={e => setAssetForm({...assetForm, category_id: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Purchase Date</label>
                  <input type="date" value={assetForm.purchase_date} onChange={e => setAssetForm({...assetForm, purchase_date: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Purchase Price (ZAR)</label>
                  <input type="number" step="0.01" value={assetForm.purchase_price} onChange={e => setAssetForm({...assetForm, purchase_price: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Current Value (ZAR)</label>
                  <input type="number" step="0.01" value={assetForm.current_value} onChange={e => setAssetForm({...assetForm, current_value: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Salvage Value (ZAR)</label>
                  <input type="number" step="0.01" value={assetForm.salvage_value} onChange={e => setAssetForm({...assetForm, salvage_value: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Serial Number</label>
                  <input type="text" value={assetForm.serial_number} onChange={e => setAssetForm({...assetForm, serial_number: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Model Number</label>
                  <input type="text" value={assetForm.model_number} onChange={e => setAssetForm({...assetForm, model_number: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Manufacturer</label>
                  <input type="text" value={assetForm.manufacturer} onChange={e => setAssetForm({...assetForm, manufacturer: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Supplier</label>
                  <input type="text" value={assetForm.supplier} onChange={e => setAssetForm({...assetForm, supplier: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Location</label>
                  <input type="text" value={assetForm.location} onChange={e => setAssetForm({...assetForm, location: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="e.g., Main Office" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Department</label>
                  <input type="text" value={assetForm.department} onChange={e => setAssetForm({...assetForm, department: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="e.g., Operations" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Status</label>
                  <select value={assetForm.status} onChange={e => setAssetForm({...assetForm, status: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="active">Active</option>
                    <option value="in_use">In Use</option>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Condition</label>
                  <select value={assetForm.condition} onChange={e => setAssetForm({...assetForm, condition: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Warranty Expiry</label>
                  <input type="date" value={assetForm.warranty_expiry} onChange={e => setAssetForm({...assetForm, warranty_expiry: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Description</label>
                  <textarea value={assetForm.description} onChange={e => setAssetForm({...assetForm, description: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Notes</label>
                  <textarea value={assetForm.notes} onChange={e => setAssetForm({...assetForm, notes: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setShowAddAsset(false)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-300 dark:bg-slate-600">Cancel</button>
                <button onClick={handleCreateAsset} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2"><Save className="w-4 h-4" /> Save Asset</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD CATEGORY MODAL */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add Asset Category</h3>
                <button onClick={() => setShowAddCategory(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Category Name *</label>
                  <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" placeholder="e.g., Cleaning Equipment" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Useful Life (Years)</label>
                  <input type="number" value={categoryForm.useful_life_years} onChange={e => setCategoryForm({...categoryForm, useful_life_years: parseInt(e.target.value) || 5})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Depreciation Rate (%)</label>
                  <input type="number" step="0.01" value={categoryForm.depreciation_rate} onChange={e => setCategoryForm({...categoryForm, depreciation_rate: parseFloat(e.target.value) || 20})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Depreciation Method</label>
                  <select value={categoryForm.depreciation_method} onChange={e => setCategoryForm({...categoryForm, depreciation_method: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="straight_line">Straight Line</option>
                    <option value="reducing_balance">Reducing Balance</option>
                    <option value="sum_of_years">Sum of Years</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Description</label>
                  <textarea value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setShowAddCategory(false)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-300 dark:bg-slate-600">Cancel</button>
                <button onClick={handleCreateCategory} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white">Create Category</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT ASSET MODAL */}
      <AnimatePresence>
        {showEditAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Edit Asset</h3>
                <button onClick={() => setShowEditAsset(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Asset Name *</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Category *</label>
                  <select value={editForm.category_id} onChange={e => setEditForm({...editForm, category_id: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Purchase Date</label>
                  <input type="date" value={editForm.purchase_date} onChange={e => setEditForm({...editForm, purchase_date: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Purchase Price (ZAR)</label>
                  <input type="number" step="0.01" value={editForm.purchase_price} onChange={e => setEditForm({...editForm, purchase_price: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Current Value (ZAR)</label>
                  <input type="number" step="0.01" value={editForm.current_value} onChange={e => setEditForm({...editForm, current_value: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="active">Active</option>
                    <option value="in_use">In Use</option>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Condition</label>
                  <select value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setShowEditAsset(null)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-300 dark:bg-slate-600">Cancel</button>
                <button onClick={handleSaveEdit} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dispose Asset?</h3>
                <p className="text-slate-500 text-sm mb-2">"{showDeleteConfirm.name}"</p>
                <p className="text-slate-400 text-xs mb-4">This will mark the asset as disposed.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowDeleteConfirm(null)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-300 dark:bg-slate-600">Cancel</button>
                  <button onClick={handleDeleteAsset} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-red-600 text-white">Dispose</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
