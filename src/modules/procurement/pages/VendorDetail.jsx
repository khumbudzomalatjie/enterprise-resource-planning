import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Users, Edit, Trash2, Save, X, ChevronRight, ArrowLeft, Star, Mail, Phone, MapPin, Building2 } from 'lucide-react'

export default function VendorDetail() {
  const { id } = useParams()
  const { selectedVendor, fetchVendor, updateVendor, loading } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    if (id && id !== 'new') {
      fetchVendor(id)
    }
  }, [id])

  useEffect(() => {
    if (selectedVendor) {
      setEditData({ ...selectedVendor })
    }
  }, [selectedVendor])

  const handleSave = async () => {
    const result = await updateVendor(id, editData)
    if (result.success) {
      toast.success('Vendor updated!')
      setIsEditing(false)
      fetchVendor(id)
    } else {
      toast.error('Failed to update vendor')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to deactivate this vendor?')) {
      const result = await updateVendor(id, { status: 'inactive' })
      if (result.success) {
        toast.success('Vendor deactivated')
        navigate('/procurement/vendors')
      }
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < (rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!selectedVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Vendor not found</p>
      </div>
    )
  }

  const vendor = selectedVendor

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/procurement/vendors" className="text-slate-500 hover:text-emerald-600">Vendors</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">{vendor.company_name}</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-600" />
              {isEditing ? (
                <input type="text" value={editData.company_name} onChange={(e) => setEditData({...editData, company_name: e.target.value})} className="p-2 neu-inset rounded-xl text-2xl font-bold" />
              ) : vendor.company_name}
            </h1>
            <p className="text-slate-500 ml-11">{vendor.vendor_code}</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2">
                  <Save className="w-4 h-4" /><span>Save</span>
                </button>
                <button onClick={() => { setIsEditing(false); setEditData({...vendor}) }} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-600 text-white flex items-center gap-2">
                  <X className="w-4 h-4" /><span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white flex items-center gap-2">
                  <Edit className="w-4 h-4" /><span>Edit</span>
                </button>
                {vendor.status === 'active' && (
                  <button onClick={handleDelete} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-red-600 text-white flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /><span>Deactivate</span>
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`px-3 py-1 rounded-full text-sm ${vendor.status === 'active' ? 'bg-emerald-100 text-emerald-700' : vendor.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
            {vendor.status?.replace('_', ' ')}
          </span>
          {vendor.is_preferred && <span className="ml-2 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">Preferred</span>}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Info */}
          <div className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Company Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium capitalize">{vendor.vendor_category?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Registration:</span><span>{vendor.registration_number || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax Number:</span><span>{vendor.tax_number || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">BBBEE Level:</span><span>{vendor.bbbee_level || 'N/A'}</span></div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Contact Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span>{vendor.email || 'No email'}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{vendor.phone || 'No phone'}</span></div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span>{vendor.contact_person || 'No contact'}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span>{vendor.city || 'No location'}</span></div>
            </div>
          </div>

          {/* Banking */}
          <div className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Banking & Terms</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Bank:</span><span>{vendor.bank_name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Account:</span><span>{vendor.bank_account_number || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment Terms:</span><span className="capitalize">{vendor.payment_terms?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Lead Time:</span><span>{vendor.lead_time_days} days</span></div>
            </div>
          </div>

          {/* Rating */}
          <div className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Rating & Performance</h3>
            <div className="flex items-center gap-2 mb-3">{renderStars(vendor.vendor_rating)}</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Performance Score:</span><span className="font-medium">{vendor.performance_score || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Min Order:</span><span>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(vendor.minimum_order_value || 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Delivery Fee:</span><span>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(vendor.delivery_fee || 0)}</span></div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {vendor.notes && (
          <div className="neu-raised rounded-3xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Notes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{vendor.notes}</p>
          </div>
        )}
      </main>
    </div>
  )
}
