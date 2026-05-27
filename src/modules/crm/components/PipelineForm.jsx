import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'

export default function PipelineForm({ clients, onSubmit, onCancel, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || '',
    opportunity_name: initialData?.opportunity_name || '',
    description: initialData?.description || '',
    estimated_value: initialData?.estimated_value || '',
    actual_value: initialData?.actual_value || '',
    probability_percentage: initialData?.probability_percentage || 50,
    stage: initialData?.stage || 'lead',
    expected_close_date: initialData?.expected_close_date || '',
    competitors: initialData?.competitors || '',
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || '',
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
          {initialData ? 'Edit Deal' : 'Add New Pipeline Deal'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Client *</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange} required className={selectClass}>
              <option value="">Select Client</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Opportunity Name *</label>
            <input type="text" name="opportunity_name" value={formData.opportunity_name} onChange={handleChange} required className={inputClass} placeholder="e.g., Office Cleaning Contract Q1" />
          </div>
          <div>
            <label className={labelClass}>Stage</label>
            <select name="stage" value={formData.stage} onChange={handleChange} className={selectClass}>
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="contract_sent">Contract Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={selectClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Estimated Value (ZAR)</label>
            <input type="number" name="estimated_value" value={formData.estimated_value} onChange={handleChange} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Probability (%)</label>
            <input type="range" name="probability_percentage" value={formData.probability_percentage} onChange={handleChange} min="0" max="100" className="w-full" />
            <span className="text-sm text-slate-500">{formData.probability_percentage}%</span>
          </div>
          <div>
            <label className={labelClass}>Expected Close Date</label>
            <input type="date" name="expected_close_date" value={formData.expected_close_date} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Competitors</label>
            <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} className={inputClass} placeholder="e.g., Company A, Company B" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass}></textarea>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass}></textarea>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : initialData ? 'Update Deal' : 'Add Deal'}</span>
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
