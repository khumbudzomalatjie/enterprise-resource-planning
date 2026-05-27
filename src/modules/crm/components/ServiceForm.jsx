import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'

export default function ServiceForm({ clients, serviceTypes, onSubmit, onCancel, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || '',
    service_type_id: initialData?.service_type_id || '',
    service_name: initialData?.service_name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    pricing_unit: initialData?.pricing_unit || 'per_hour',
    billing_frequency: initialData?.billing_frequency || 'monthly',
    service_day: initialData?.service_day || '',
    service_time: initialData?.service_time || '',
    frequency_per_week: initialData?.frequency_per_week || 1,
    square_meters: initialData?.square_meters || '',
    number_of_cleaners: initialData?.number_of_cleaners || 1,
    special_instructions: initialData?.special_instructions || '',
    status: initialData?.status || 'active',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const inputClass = "w-full px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 transition-all"
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
  const selectClass = "w-full px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 transition-all"

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="neu-raised rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {initialData ? 'Edit Service' : 'Add New Service'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client *</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange} required className={selectClass}>
              <option value="">Select Client</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Service Type</label>
            <select name="service_type_id" value={formData.service_type_id} onChange={handleChange} className={selectClass}>
              <option value="">Select Type</option>
              {serviceTypes?.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Service Name *</label>
            <input type="text" name="service_name" value={formData.service_name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Price (ZAR)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Pricing Unit</label>
            <select name="pricing_unit" value={formData.pricing_unit} onChange={handleChange} className={selectClass}>
              <option value="per_hour">Per Hour</option>
              <option value="per_sqm">Per Square Meter</option>
              <option value="per_service">Per Service</option>
              <option value="per_month">Per Month</option>
              <option value="fixed">Fixed Price</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Billing Frequency</label>
            <select name="billing_frequency" value={formData.billing_frequency} onChange={handleChange} className={selectClass}>
              <option value="once_off">Once Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi_weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={selectClass}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Service Day</label>
            <select name="service_day" value={formData.service_day} onChange={handleChange} className={selectClass}>
              <option value="">Select Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Service Time</label>
            <input type="time" name="service_time" value={formData.service_time} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Frequency (per week)</label>
            <input type="number" name="frequency_per_week" value={formData.frequency_per_week} onChange={handleChange} min="1" max="7" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Square Meters</label>
            <input type="number" name="square_meters" value={formData.square_meters} onChange={handleChange} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Number of Cleaners</label>
            <input type="number" name="number_of_cleaners" value={formData.number_of_cleaners} onChange={handleChange} min="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass}></textarea>
        </div>

        <div>
          <label className={labelClass}>Special Instructions</label>
          <textarea name="special_instructions" value={formData.special_instructions} onChange={handleChange} rows={3} className={inputClass}></textarea>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : initialData ? 'Update Service' : 'Add Service'}</span>
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
