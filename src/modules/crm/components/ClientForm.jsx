import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'

export default function ClientForm({ onSubmit, onCancel, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    trading_name: initialData?.trading_name || '',
    registration_number: initialData?.registration_number || '',
    tax_number: initialData?.tax_number || '',
    vat_number: initialData?.vat_number || '',
    industry: initialData?.industry || '',
    client_type: initialData?.client_type || 'corporate',
    client_status: initialData?.client_status || 'active',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    alternative_phone: initialData?.alternative_phone || '',
    website: initialData?.website || '',
    address_line1: initialData?.address_line1 || '',
    address_line2: initialData?.address_line2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'South Africa',
    billing_address: initialData?.billing_address || '',
    payment_terms: initialData?.payment_terms || '30_days',
    credit_limit: initialData?.credit_limit || '',
    tax_exempt: initialData?.tax_exempt || false,
    client_rating: initialData?.client_rating || 'unrated',
    notes: initialData?.notes || '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const inputClass = "w-full px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
  const selectClass = "w-full px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 transition-all"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="neu-raised rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {initialData ? 'Edit Client' : 'Add New Client'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Trading Name</label>
              <input type="text" name="trading_name" value={formData.trading_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Registration Number</label>
              <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tax Number</label>
              <input type="text" name="tax_number" value={formData.tax_number} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>VAT Number</label>
              <input type="text" name="vat_number" value={formData.vat_number} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <input type="text" name="industry" value={formData.industry} onChange={handleChange} className={inputClass} placeholder="e.g., Healthcare, Education" />
            </div>
            <div>
              <label className={labelClass}>Client Type</label>
              <select name="client_type" value={formData.client_type} onChange={handleChange} className={selectClass}>
                <option value="corporate">Corporate</option>
                <option value="government">Government</option>
                <option value="retail">Retail</option>
                <option value="industrial">Industrial</option>
                <option value="residential">Residential</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Client Status</label>
              <select name="client_status" value={formData.client_status} onChange={handleChange} className={selectClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="former">Former</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Client Rating</label>
              <select name="client_rating" value={formData.client_rating} onChange={handleChange} className={selectClass}>
                <option value="unrated">Unrated</option>
                <option value="A">A - Excellent</option>
                <option value="B">B - Good</option>
                <option value="C">C - Average</option>
                <option value="D">D - Poor</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Credit Limit (ZAR)</label>
              <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleChange} className={inputClass} placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Alternative Phone</label>
              <input type="text" name="alternative_phone" value={formData.alternative_phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClass} placeholder="https://" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address Line 2</label>
              <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State/Province</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Billing */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Payment Terms</label>
              <select name="payment_terms" value={formData.payment_terms} onChange={handleChange} className={selectClass}>
                <option value="immediate">Immediate</option>
                <option value="7_days">7 Days</option>
                <option value="15_days">15 Days</option>
                <option value="30_days">30 Days</option>
                <option value="60_days">60 Days</option>
                <option value="90_days">90 Days</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <input type="checkbox" name="tax_exempt" checked={formData.tax_exempt} onChange={handleChange} className="w-4 h-4 text-emerald-600 rounded" />
              <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">Tax Exempt</label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className={inputClass} placeholder="Additional notes about this client..."></textarea>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : initialData ? 'Update Client' : 'Add Client'}</span>
          </button>
          <button type="button" onClick={onCancel}
            className="neu-raised neu-btn px-6 py-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}
