import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useProcurementStore from '../store/procurementStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Users, Save, ChevronRight } from 'lucide-react'

export default function CreateVendor() {
  const { createVendor } = useProcurementStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [vendorData, setVendorData] = useState({
    company_name: '',
    trading_name: '',
    registration_number: '',
    tax_number: '',
    vendor_category: 'cleaning_chemicals',
    contact_person: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    bank_name: '',
    bank_account_number: '',
    bank_branch_code: '',
    payment_terms: '30_days',
    lead_time_days: 7,
    minimum_order_value: 0,
    delivery_fee: 0,
    bbbee_level: 1,
    notes: '',
    status: 'pending_approval'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!vendorData.company_name || !vendorData.email) {
      toast.error('Company name and email are required')
      return
    }

    const result = await createVendor(vendorData)
    
    if (result.success) {
      toast.success('Vendor created successfully!')
      navigate('/procurement/vendors')
    } else {
      toast.error(result.error || 'Failed to create vendor')
    }
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/procurement" className="text-slate-500 hover:text-emerald-600">Procurement</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/procurement/vendors" className="text-slate-500 hover:text-emerald-600">Vendors</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">New Vendor</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-emerald-600" />Add New Vendor
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Company Name *</label>
                  <input type="text" value={vendorData.company_name} onChange={(e) => setVendorData({...vendorData, company_name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" required />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Trading Name</label>
                  <input type="text" value={vendorData.trading_name} onChange={(e) => setVendorData({...vendorData, trading_name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Category</label>
                  <select value={vendorData.vendor_category} onChange={(e) => setVendorData({...vendorData, vendor_category: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
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
                  <label className="text-sm text-slate-500">Email *</label>
                  <input type="email" value={vendorData.email} onChange={(e) => setVendorData({...vendorData, email: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" required />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Contact Person</label>
                  <input type="text" value={vendorData.contact_person} onChange={(e) => setVendorData({...vendorData, contact_person: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Phone</label>
                  <input type="text" value={vendorData.phone} onChange={(e) => setVendorData({...vendorData, phone: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Mobile</label>
                  <input type="text" value={vendorData.mobile} onChange={(e) => setVendorData({...vendorData, mobile: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Website</label>
                  <input type="url" value={vendorData.website} onChange={(e) => setVendorData({...vendorData, website: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Address Line 1</label>
                  <input type="text" value={vendorData.address_line1} onChange={(e) => setVendorData({...vendorData, address_line1: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">City</label>
                  <input type="text" value={vendorData.city} onChange={(e) => setVendorData({...vendorData, city: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Postal Code</label>
                  <input type="text" value={vendorData.postal_code} onChange={(e) => setVendorData({...vendorData, postal_code: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Banking & Terms */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Banking & Payment Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Bank Name</label>
                  <input type="text" value={vendorData.bank_name} onChange={(e) => setVendorData({...vendorData, bank_name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Account Number</label>
                  <input type="text" value={vendorData.bank_account_number} onChange={(e) => setVendorData({...vendorData, bank_account_number: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Payment Terms</label>
                  <select value={vendorData.payment_terms} onChange={(e) => setVendorData({...vendorData, payment_terms: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="immediate">Immediate</option>
                    <option value="7_days">7 Days</option>
                    <option value="15_days">15 Days</option>
                    <option value="30_days">30 Days</option>
                    <option value="45_days">45 Days</option>
                    <option value="60_days">60 Days</option>
                    <option value="90_days">90 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Lead Time (Days)</label>
                  <input type="number" value={vendorData.lead_time_days} onChange={(e) => setVendorData({...vendorData, lead_time_days: parseInt(e.target.value)})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Minimum Order Value</label>
                  <input type="number" value={vendorData.minimum_order_value} onChange={(e) => setVendorData({...vendorData, minimum_order_value: parseFloat(e.target.value)})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">BBBEE Level (1-8)</label>
                  <input type="number" min="1" max="8" value={vendorData.bbbee_level} onChange={(e) => setVendorData({...vendorData, bbbee_level: parseInt(e.target.value)})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Additional Notes</h2>
              <textarea value={vendorData.notes} onChange={(e) => setVendorData({...vendorData, notes: e.target.value})} rows={3} className="w-full p-3 neu-inset rounded-xl" placeholder="Any additional notes about this vendor..." />
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => navigate('/procurement/vendors')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-600 text-white hover:bg-slate-700">
                Cancel
              </button>
              <button type="submit" className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
                <Save className="w-5 h-5" /><span>Save Vendor</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
