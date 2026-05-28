import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useAuthStore from '../../../store/authStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Users, Edit, Trash2, Save, X, ChevronRight, ArrowLeft, 
  Star, Mail, Phone, MapPin, Building2, Globe, 
  CheckCircle2, XCircle, Clock, Shield, Banknote,
  BadgeCheck, AlertCircle, UserCheck, UserX
} from 'lucide-react'

export default function VendorDetail() {
  const { id } = useParams()
  const { selectedVendor, fetchVendor, updateVendor, loading } = useProcurementStore()
  const { profile } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)

  // Check if user can approve vendors
  const canApprove = ['super_admin', 'operations_manager', 'finance_officer'].includes(profile?.role)

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
    if (!editData.company_name || !editData.email) {
      toast.error('Company name and email are required')
      return
    }

    const result = await updateVendor(id, editData)
    if (result.success) {
      toast.success('Vendor updated successfully!')
      setIsEditing(false)
      fetchVendor(id)
    } else {
      toast.error(result.error || 'Failed to update vendor')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({ ...selectedVendor })
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to deactivate this vendor? They will no longer be available for purchase orders.')) {
      const result = await updateVendor(id, { status: 'inactive' })
      if (result.success) {
        toast.success('Vendor deactivated')
        navigate('/procurement/vendors')
      } else {
        toast.error('Failed to deactivate vendor')
      }
    }
  }

  const handleReactivate = async () => {
    if (window.confirm('Reactivate this vendor?')) {
      const result = await updateVendor(id, { status: 'active' })
      if (result.success) {
        toast.success('Vendor reactivated!')
        fetchVendor(id)
      } else {
        toast.error('Failed to reactivate vendor')
      }
    }
  }

  const handleApprove = async () => {
    if (window.confirm('Approve this vendor? They will become active and available for purchase orders.')) {
      const result = await updateVendor(id, { 
        status: 'active', 
        approved_by: profile?.id,
        approved_at: new Date().toISOString()
      })
      if (result.success) {
        toast.success('Vendor approved!')
        fetchVendor(id)
      } else {
        toast.error('Failed to approve vendor')
      }
    }
  }

  const handleReject = async () => {
    const reason = prompt('Rejection reason (optional):')
    if (window.confirm('Are you sure you want to reject/blacklist this vendor?')) {
      const result = await updateVendor(id, { 
        status: 'blacklisted',
        notes: selectedVendor.notes 
          ? `${selectedVendor.notes}\nRejection reason: ${reason || 'N/A'}`
          : `Rejection reason: ${reason || 'N/A'}`
      })
      if (result.success) {
        toast.success('Vendor rejected')
        navigate('/procurement/vendors')
      } else {
        toast.error('Failed to reject vendor')
      }
    }
  }

  const handleTogglePreferred = async () => {
    const result = await updateVendor(id, { is_preferred: !selectedVendor.is_preferred })
    if (result.success) {
      toast.success(selectedVendor.is_preferred ? 'Removed from preferred' : 'Marked as preferred!')
      fetchVendor(id)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < (rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
    ))
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      blacklisted: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    }
    return badges[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  }

  const getStatusIcon = (status) => {
    const icons = {
      active: CheckCircle2,
      inactive: XCircle,
      pending_approval: Clock,
      blacklisted: Shield,
    }
    return icons[status] || AlertCircle
  }

  const getCategoryLabel = (category) => {
    const labels = {
      cleaning_chemicals: 'Cleaning Chemicals',
      equipment: 'Equipment',
      ppe: 'PPE & Safety',
      consumables: 'Consumables',
      uniforms: 'Uniforms',
      vehicle_maintenance: 'Vehicle Maintenance',
      office_supplies: 'Office Supplies',
      other: 'Other'
    }
    return labels[category] || category?.replace('_', ' ') || 'N/A'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  // Loading State
  if (loading) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Loading vendor details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not Found State
  if (!selectedVendor) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <Building2 className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">Vendor not found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/procurement/vendors')}
              className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Back to Vendors
            </button>
          </div>
        </div>
      </div>
    )
  }

  const vendor = selectedVendor
  const StatusIcon = getStatusIcon(vendor.status)

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      {/* Theme Toggle */}
      <div className="fixed top-20 right-4 z-30">
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          {isDark ? <span className="text-amber-400 text-xl">☀️</span> : <span className="text-slate-600 text-xl">🌙</span>}
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
            Procurement
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/procurement/vendors" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
            Vendors
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium truncate max-w-[200px]">
            {isEditing ? 'Edit Vendor' : vendor.company_name}
          </span>
        </div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="neu-raised rounded-3xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Vendor Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.company_name} 
                    onChange={(e) => setEditData({...editData, company_name: e.target.value})}
                    className="text-2xl font-bold p-2 neu-inset rounded-xl text-slate-800 dark:text-white w-full mb-1"
                    placeholder="Company Name"
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    {vendor.company_name}
                  </h1>
                )}
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{vendor.vendor_code}</span>
                  
                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(vendor.status)} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {vendor.status?.replace('_', ' ')}
                  </span>
                  
                  {/* Preferred Badge */}
                  {vendor.is_preferred && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Preferred
                    </span>
                  )}
                  
                  {/* BBBEE Badge */}
                  {vendor.bbbee_level && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      B-BBEE Level {vendor.bbbee_level}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Edit Mode Buttons */}
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave} 
                    className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-slate-600 text-white hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Edit Button */}
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {/* Toggle Preferred */}
                  <button 
                    onClick={handleTogglePreferred} 
                    className={`neu-raised neu-btn px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm ${
                      vendor.is_preferred 
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${vendor.is_preferred ? 'fill-purple-500' : ''}`} />
                    <span>{vendor.is_preferred ? 'Preferred' : 'Mark Preferred'}</span>
                  </button>

                  {/* Approve Button - Only for pending vendors */}
                  {vendor.status === 'pending_approval' && canApprove && (
                    <button 
                      onClick={handleApprove} 
                      className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  )}

                  {/* Reject Button - Only for pending vendors */}
                  {vendor.status === 'pending_approval' && canApprove && (
                    <button 
                      onClick={handleReject} 
                      className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Reactivate Button - For inactive vendors */}
                  {vendor.status === 'inactive' && (
                    <button 
                      onClick={handleReactivate} 
                      className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reactivate</span>
                    </button>
                  )}

                  {/* Deactivate/Delete Button */}
                  {vendor.status === 'active' && (
                    <button 
                      onClick={handleDelete} 
                      className="neu-raised neu-btn px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Deactivate</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Approval Pending Banner */}
        {vendor.status === 'pending_approval' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="neu-raised rounded-2xl p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-800 dark:text-amber-300 font-medium text-sm">
                  This vendor is pending approval
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                  {canApprove 
                    ? 'You can approve or reject this vendor using the buttons above.' 
                    : 'Only Operations Managers and Finance Officers can approve vendors.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="neu-raised rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Company Information
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Trading Name</label>
                  <input type="text" value={editData.trading_name || ''} onChange={(e) => setEditData({...editData, trading_name: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Category</label>
                  <select value={editData.vendor_category || 'other'} onChange={(e) => setEditData({...editData, vendor_category: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1">
                    <option value="cleaning_chemicals">Cleaning Chemicals</option>
                    <option value="equipment">Equipment</option>
                    <option value="ppe">PPE & Safety</option>
                    <option value="consumables">Consumables</option>
                    <option value="uniforms">Uniforms</option>
                    <option value="vehicle_maintenance">Vehicle Maintenance</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Registration Number</label>
                  <input type="text" value={editData.registration_number || ''} onChange={(e) => setEditData({...editData, registration_number: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tax Number</label>
                  <input type="text" value={editData.tax_number || ''} onChange={(e) => setEditData({...editData, tax_number: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {vendor.trading_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Trading Name:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{vendor.trading_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Category:</span>
                  <span className="font-medium text-slate-800 dark:text-white capitalize">
                    {getCategoryLabel(vendor.vendor_category)}
                  </span>
                </div>
                {vendor.registration_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Registration:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{vendor.registration_number}</span>
                  </div>
                )}
                {vendor.tax_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Tax Number:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{vendor.tax_number}</span>
                  </div>
                )}
                {vendor.bbbee_level && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">B-BBEE Level:</span>
                    <span className="font-medium text-slate-800 dark:text-white">Level {vendor.bbbee_level}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Contact Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }}
            className="neu-raised rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Contact Details
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Contact Person</label>
                  <input type="text" value={editData.contact_person || ''} onChange={(e) => setEditData({...editData, contact_person: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Email *</label>
                  <input type="email" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Phone</label>
                  <input type="text" value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Mobile</label>
                  <input type="text" value={editData.mobile || ''} onChange={(e) => setEditData({...editData, mobile: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Website</label>
                  <input type="url" value={editData.website || ''} onChange={(e) => setEditData({...editData, website: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {vendor.contact_person && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-800 dark:text-white font-medium">{vendor.contact_person}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${vendor.email}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                      {vendor.email}
                    </a>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${vendor.phone}`} className="text-slate-800 dark:text-white hover:text-emerald-600">
                      {vendor.phone}
                    </a>
                  </div>
                )}
                {vendor.mobile && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${vendor.mobile}`} className="text-slate-800 dark:text-white hover:text-emerald-600">
                      {vendor.mobile}
                    </a>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                      {vendor.website}
                    </a>
                  </div>
                )}
                {!vendor.contact_person && !vendor.email && !vendor.phone && !vendor.mobile && !vendor.website && (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No contact details available</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Address */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="neu-raised rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Address
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Address Line 1</label>
                  <input type="text" value={editData.address_line1 || ''} onChange={(e) => setEditData({...editData, address_line1: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Address Line 2</label>
                  <input type="text" value={editData.address_line2 || ''} onChange={(e) => setEditData({...editData, address_line2: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">City</label>
                    <input type="text" value={editData.city || ''} onChange={(e) => setEditData({...editData, city: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Postal Code</label>
                    <input type="text" value={editData.postal_code || ''} onChange={(e) => setEditData({...editData, postal_code: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {vendor.address_line1 && (
                  <p className="text-slate-800 dark:text-white">{vendor.address_line1}</p>
                )}
                {vendor.address_line2 && (
                  <p className="text-slate-600 dark:text-slate-400">{vendor.address_line2}</p>
                )}
                {(vendor.city || vendor.postal_code) && (
                  <p className="text-slate-600 dark:text-slate-400">
                    {[vendor.city, vendor.postal_code].filter(Boolean).join(', ')}
                  </p>
                )}
                {!vendor.address_line1 && !vendor.city && (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No address available</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Banking & Terms */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25 }}
            className="neu-raised rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Banking & Payment Terms
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Bank Name</label>
                  <input type="text" value={editData.bank_name || ''} onChange={(e) => setEditData({...editData, bank_name: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Account Number</label>
                  <input type="text" value={editData.bank_account_number || ''} onChange={(e) => setEditData({...editData, bank_account_number: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Branch Code</label>
                  <input type="text" value={editData.bank_branch_code || ''} onChange={(e) => setEditData({...editData, bank_branch_code: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Payment Terms</label>
                  <select value={editData.payment_terms || '30_days'} onChange={(e) => setEditData({...editData, payment_terms: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1">
                    <option value="immediate">Immediate</option>
                    <option value="7_days">7 Days</option>
                    <option value="15_days">15 Days</option>
                    <option value="30_days">30 Days</option>
                    <option value="45_days">45 Days</option>
                    <option value="60_days">60 Days</option>
                    <option value="90_days">90 Days</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Lead Time (Days)</label>
                    <input type="number" value={editData.lead_time_days || 0} onChange={(e) => setEditData({...editData, lead_time_days: parseInt(e.target.value) || 0})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Min Order (ZAR)</label>
                    <input type="number" value={editData.minimum_order_value || 0} onChange={(e) => setEditData({...editData, minimum_order_value: parseFloat(e.target.value) || 0})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Delivery Fee (ZAR)</label>
                  <input type="number" value={editData.delivery_fee || 0} onChange={(e) => setEditData({...editData, delivery_fee: parseFloat(e.target.value) || 0})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {(vendor.bank_name || vendor.bank_account_number) && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Bank Details</p>
                    <p className="text-slate-800 dark:text-white font-medium">{vendor.bank_name || 'N/A'}</p>
                    {vendor.bank_account_number && (
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Acc: {vendor.bank_account_number}</p>
                    )}
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Payment Terms:</span>
                  <span className="font-medium text-slate-800 dark:text-white capitalize">
                    {vendor.payment_terms?.replace(/_/g, ' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Lead Time:</span>
                  <span className="font-medium text-slate-800 dark:text-white">{vendor.lead_time_days || 0} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Min Order:</span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatCurrency(vendor.minimum_order_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Delivery Fee:</span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatCurrency(vendor.delivery_fee)}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Rating & Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="neu-raised rounded-3xl p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rating & Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(vendor.vendor_rating)}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {vendor.vendor_rating ? `${vendor.vendor_rating}/5` : 'Not rated yet'}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Performance Score</p>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(vendor.performance_score || 0) * 20}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{vendor.performance_score || 'N/A'}/5</p>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        {(vendor.notes || isEditing) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.35 }}
            className="neu-raised rounded-3xl p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Notes</h3>
            {isEditing ? (
              <textarea 
                value={editData.notes || ''} 
                onChange={(e) => setEditData({...editData, notes: e.target.value})} 
                rows={4} 
                className="w-full p-3 neu-inset rounded-xl text-sm" 
                placeholder="Add notes about this vendor..."
              />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {vendor.notes || 'No notes'}
              </p>
            )}
          </motion.div>
        )}

        {/* Metadata */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="neu-raised rounded-3xl p-6 mt-6"
        >
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Record Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-300">Created</p>
              <p>{vendor.created_at ? new Date(vendor.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-300">Last Updated</p>
              <p>{vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-300">Approved</p>
              <p>{vendor.approved_at ? new Date(vendor.approved_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not yet'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-300">Vendor Code</p>
              <p className="font-mono">{vendor.vendor_code}</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
