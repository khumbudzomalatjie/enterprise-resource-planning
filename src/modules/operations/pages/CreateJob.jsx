import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useOperationsStore from '../store/operationsStore'
import useCRMStore from '../../crm/store/crmStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { Briefcase, Save, Send, Calendar, MapPin, Clock, Users } from 'lucide-react'

export default function CreateJob() {
  const { createJob, fetchJobCategories, jobCategories } = useOperationsStore()
  const { clients, fetchClients } = useCRMStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [jobData, setJobData] = useState({
    client_id: '',
    job_category_id: '',
    title: '',
    description: '',
    site_address: '',
    site_city: '',
    site_contact_name: '',
    site_contact_phone: '',
    access_instructions: '',
    scheduled_date: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    estimated_duration_minutes: 120,
    priority: 'medium',
    cleaners_required: 2,
    special_instructions: '',
    notes: '',
    quoted_amount: 0
  })

  useEffect(() => {
    fetchClients({ status: 'active' })
    fetchJobCategories()
  }, [])

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setJobData({
        ...jobData,
        client_id: client.id,
        site_address: client.address_line1 || '',
        site_city: client.city || '',
      })
    }
  }

  const handleSubmit = async (status = 'pending') => {
    if (!jobData.title || !jobData.client_id) {
      toast.error('Please fill in required fields')
      return
    }

    const result = await createJob({ ...jobData, status })
    if (result.success) {
      toast.success('Job created successfully!')
      navigate(`/operations/jobs/${result.data.id}`)
    } else {
      toast.error('Failed to create job')
    }
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <Link to="/operations" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <span className="text-sm">← Back to Operations</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-8">
            <Briefcase className="w-8 h-8 text-emerald-600" />Create New Job
          </h1>

          <div className="space-y-6">
            {/* Client & Category */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Client *</label>
                  <select value={jobData.client_id} onChange={(e) => handleClientSelect(e.target.value)} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Job Category</label>
                  <select value={jobData.job_category_id} onChange={(e) => setJobData({...jobData, job_category_id: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300">
                    <option value="">Select Category</option>
                    {jobCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Job Title *</label>
                  <input type="text" value={jobData.title} onChange={(e) => setJobData({...jobData, title: e.target.value})} placeholder="e.g., Office Cleaning - Main Street" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Description</label>
                  <textarea value={jobData.description} onChange={(e) => setJobData({...jobData, description: e.target.value})} rows={3} placeholder="Job description..." className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" />Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Site Address</label>
                  <input type="text" value={jobData.site_address} onChange={(e) => setJobData({...jobData, site_address: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">City</label>
                  <input type="text" value={jobData.site_city} onChange={(e) => setJobData({...jobData, site_city: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Contact Name</label>
                  <input type="text" value={jobData.site_contact_name} onChange={(e) => setJobData({...jobData, site_contact_name: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Contact Phone</label>
                  <input type="text" value={jobData.site_contact_phone} onChange={(e) => setJobData({...jobData, site_contact_phone: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-500">Access Instructions</label>
                  <textarea value={jobData.access_instructions} onChange={(e) => setJobData({...jobData, access_instructions: e.target.value})} rows={2} placeholder="Gate code, parking, key location..." className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-600" />Scheduling</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Date</label>
                  <input type="date" value={jobData.scheduled_date} onChange={(e) => setJobData({...jobData, scheduled_date: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Start Time</label>
                  <input type="time" value={jobData.scheduled_start_time} onChange={(e) => setJobData({...jobData, scheduled_start_time: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">End Time</label>
                  <input type="time" value={jobData.scheduled_end_time} onChange={(e) => setJobData({...jobData, scheduled_end_time: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Est. Duration (min)</label>
                  <input type="number" value={jobData.estimated_duration_minutes} onChange={(e) => setJobData({...jobData, estimated_duration_minutes: parseInt(e.target.value)})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Priority</label>
                  <select value={jobData.priority} onChange={(e) => setJobData({...jobData, priority: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Cleaners Required</label>
                  <input type="number" value={jobData.cleaners_required} onChange={(e) => setJobData({...jobData, cleaners_required: parseInt(e.target.value)})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Quoted Amount (ZAR)</label>
                  <input type="number" value={jobData.quoted_amount} onChange={(e) => setJobData({...jobData, quoted_amount: parseFloat(e.target.value)})} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Special Instructions</label>
                  <textarea value={jobData.special_instructions} onChange={(e) => setJobData({...jobData, special_instructions: e.target.value})} rows={3} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Internal Notes</label>
                  <textarea value={jobData.notes} onChange={(e) => setJobData({...jobData, notes: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <button onClick={() => handleSubmit('pending')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-slate-600 text-white hover:bg-slate-700 flex items-center gap-2">
                <Save className="w-5 h-5" /><span>Save as Draft</span>
              </button>
              <button onClick={() => handleSubmit('scheduled')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
                <Send className="w-5 h-5" /><span>Create & Schedule</span>
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
