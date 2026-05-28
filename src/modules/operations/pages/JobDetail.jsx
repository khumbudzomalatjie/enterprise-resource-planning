import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useOperationsStore from '../store/operationsStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Briefcase, Calendar, Clock, MapPin, Users,
  Save, ArrowLeft, ChevronRight, Pencil, Trash2,
  Sun, Moon, Sparkles, CheckCircle2, Play, XCircle,
  DollarSign, AlertTriangle, Eye
} from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  
  const { selectedJob, fetchJob, updateJob, updateJobStatus, deleteJob, fetchJobCategories, jobCategories, loading } = useOperationsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  
  const [editMode, setEditMode] = useState(isEditMode)
  const [jobData, setJobData] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [statusConfirm, setStatusConfirm] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    if (id) {
      loadJob()
    }
    fetchJobCategories()
  }, [id])

  const loadJob = async () => {
    setFetchError(null)
    const result = await fetchJob(id)
    if (result.success && result.data) {
      setJobData(result.data)
    } else {
      setFetchError(result.error || 'Job not found')
      toast.error('Job not found. It may have been deleted or you may not have access.')
    }
  }

  const handleSave = async () => {
    if (!jobData) return
    
    // Build update object with only changed fields
    const updates = {
      title: jobData.title,
      description: jobData.description,
      job_category_id: jobData.job_category_id,
      site_address: jobData.site_address,
      site_city: jobData.site_city,
      site_postal_code: jobData.site_postal_code,
      site_contact_name: jobData.site_contact_name,
      site_contact_phone: jobData.site_contact_phone,
      access_instructions: jobData.access_instructions,
      scheduled_date: jobData.scheduled_date,
      scheduled_start_time: jobData.scheduled_start_time,
      scheduled_end_time: jobData.scheduled_end_time,
      estimated_duration_minutes: jobData.estimated_duration_minutes,
      priority: jobData.priority,
      cleaners_required: jobData.cleaners_required,
      quoted_amount: jobData.quoted_amount,
      special_instructions: jobData.special_instructions,
      notes: jobData.notes,
    }

    const result = await updateJob(id, updates)
    if (result.success) {
      toast.success('Job updated successfully')
      setEditMode(false)
      loadJob()
    } else {
      toast.error(result.error || 'Failed to update job')
    }
  }

  const handleStatusChange = async (newStatus) => {
    const result = await updateJobStatus(id, newStatus)
    if (result.success) {
      toast.success(`Job marked as ${newStatus.replace(/_/g, ' ')}`)
      setStatusConfirm(null)
      loadJob()
    } else {
      toast.error(result.error || 'Failed to update status')
      setStatusConfirm(null)
    }
  }

  const handleDelete = async () => {
    const result = await deleteJob(id)
    if (result.success) {
      toast.success('Job cancelled')
      navigate('/operations/jobs')
    } else {
      toast.error(result.error || 'Failed to cancel job')
      setDeleteConfirm(false)
    }
  }

  const handleCategorySelect = (categoryId) => {
    const category = jobCategories.find(c => c.id === categoryId)
    if (category) {
      setJobData({
        ...jobData,
        job_category_id: category.id,
        estimated_duration_minutes: category.estimated_duration_minutes || jobData.estimated_duration_minutes,
        cleaners_required: category.default_cleaners_required || jobData.cleaners_required,
      })
    } else {
      setJobData({ ...jobData, job_category_id: categoryId })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  // Loading state
  if (loading && !jobData) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError && !jobData) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Job Not Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{fetchError}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/operations/jobs')} className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                Go to Jobs List
              </button>
              <button onClick={loadJob} className="px-6 py-2 rounded-xl bg-slate-500 text-white hover:bg-slate-600 transition-colors">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!jobData) return null

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/operations" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">Operations</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/operations/jobs" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">Jobs</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">{jobData.job_number || 'Job Details'}</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editMode ? 'Edit Job' : jobData.title}
                </h1>
                <p className="text-sm text-slate-500">
                  {jobData.job_number} · {jobData.clients?.company_name || 'No client'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <button onClick={() => setEditMode(true)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                  <Pencil className="w-4 h-4" /><span>Edit</span>
                </button>
                {jobData.status !== 'cancelled' && (
                  <button onClick={() => setDeleteConfirm(true)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /><span>Cancel Job</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={() => { setEditMode(false); loadJob() }} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-500 text-white hover:bg-slate-600">Cancel</button>
                <button onClick={handleSave} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /><span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Status Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neu-raised rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusColor(jobData.status)}`}>
            {jobData.status?.replace(/_/g, ' ')}
          </span>
          
          {(jobData.status === 'pending' || jobData.status === 'draft') && (
            <button onClick={() => setStatusConfirm('scheduled')} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Mark Scheduled
            </button>
          )}
          
          {(jobData.status === 'scheduled' || jobData.status === 'pending') && (
            <button onClick={() => setStatusConfirm('in_progress')} className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-sm hover:bg-amber-700 flex items-center gap-1">
              <Play className="w-4 h-4" /> Start Job
            </button>
          )}
          
          {jobData.status === 'in_progress' && (
            <button onClick={() => setStatusConfirm('completed')} className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Complete Job
            </button>
          )}
          
          {jobData.status !== 'cancelled' && jobData.status !== 'completed' && (
            <button onClick={() => setStatusConfirm('cancelled')} className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </motion.div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Info */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Job Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                {editMode ? (
                  <select 
                    value={jobData.job_category_id || ''} 
                    onChange={(e) => handleCategorySelect(e.target.value)} 
                    className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50"
                  >
                    <option value="">Select Category</option>
                    {jobCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1">
                    {jobData.job_categories ? (
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: jobData.job_categories.color + '20', color: jobData.job_categories.color }}>
                        {jobData.job_categories.name}
                      </span>
                    ) : 'Not set'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Title</label>
                {editMode ? (
                  <input type="text" value={jobData.title || ''} onChange={(e) => setJobData({...jobData, title: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1">{jobData.title}</p>
                )}
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
                {editMode ? (
                  <textarea value={jobData.description || ''} onChange={(e) => setJobData({...jobData, description: e.target.value})} rows={3} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{jobData.description || 'No description'}</p>
                )}
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Quoted Amount</label>
                {editMode ? (
                  <input type="number" value={jobData.quoted_amount || 0} onChange={(e) => setJobData({...jobData, quoted_amount: parseFloat(e.target.value) || 0})} step="0.01" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1 font-semibold">{formatCurrency(jobData.quoted_amount)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Site Address</label>
                {editMode ? (
                  <input type="text" value={jobData.site_address || ''} onChange={(e) => setJobData({...jobData, site_address: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1">{jobData.site_address || 'Not set'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">City</label>
                  {editMode ? (
                    <input type="text" value={jobData.site_city || ''} onChange={(e) => setJobData({...jobData, site_city: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                  ) : (
                    <p className="text-slate-800 dark:text-white mt-1">{jobData.site_city || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Postal Code</label>
                  {editMode ? (
                    <input type="text" value={jobData.site_postal_code || ''} onChange={(e) => setJobData({...jobData, site_postal_code: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                  ) : (
                    <p className="text-slate-800 dark:text-white mt-1">{jobData.site_postal_code || '-'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Site Contact</label>
                {editMode ? (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input type="text" value={jobData.site_contact_name || ''} onChange={(e) => setJobData({...jobData, site_contact_name: e.target.value})} placeholder="Name" className="p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                    <input type="text" value={jobData.site_contact_phone || ''} onChange={(e) => setJobData({...jobData, site_contact_phone: e.target.value})} placeholder="Phone" className="p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                  </div>
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1">
                    {jobData.site_contact_name || 'No contact'} 
                    {jobData.site_contact_phone && <span className="text-slate-500"> · {jobData.site_contact_phone}</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Access Instructions</label>
                {editMode ? (
                  <textarea value={jobData.access_instructions || ''} onChange={(e) => setJobData({...jobData, access_instructions: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" placeholder="Gate code, parking, key location..." />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{jobData.access_instructions || 'None'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" /> Schedule
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date</label>
                {editMode ? (
                  <input type="date" value={jobData.scheduled_date || ''} onChange={(e) => setJobData({...jobData, scheduled_date: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1">{formatDate(jobData.scheduled_date)}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start Time</label>
                  {editMode ? (
                    <input type="time" value={jobData.scheduled_start_time || ''} onChange={(e) => setJobData({...jobData, scheduled_start_time: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                  ) : (
                    <p className="text-slate-800 dark:text-white mt-1">{jobData.scheduled_start_time?.slice(0,5) || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End Time</label>
                  {editMode ? (
                    <input type="time" value={jobData.scheduled_end_time || ''} onChange={(e) => setJobData({...jobData, scheduled_end_time: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                  ) : (
                    <p className="text-slate-800 dark:text-white mt-1">{jobData.scheduled_end_time?.slice(0,5) || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Est. Duration (min)</label>
                  {editMode ? (
                    <input type="number" value={jobData.estimated_duration_minutes || 0} onChange={(e) => setJobData({...jobData, estimated_duration_minutes: parseInt(e.target.value) || 0})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                  ) : (
                    <p className="text-slate-800 dark:text-white mt-1">{jobData.estimated_duration_minutes || '-'} min</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority</label>
                  {editMode ? (
                    <select value={jobData.priority || 'medium'} onChange={(e) => setJobData({...jobData, priority: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  ) : (
                    <p className="text-slate-800 dark:text-white mt-1 capitalize">{jobData.priority || 'medium'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" /> Assignment
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Cleaners Required</label>
                {editMode ? (
                  <input type="number" value={jobData.cleaners_required || 1} onChange={(e) => setJobData({...jobData, cleaners_required: parseInt(e.target.value) || 1})} min="1" className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
                ) : (
                  <p className="text-slate-800 dark:text-white mt-1">{jobData.cleaners_required || 1}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned Cleaners</label>
                <p className="text-slate-800 dark:text-white mt-1">{jobData.cleaners_assigned || 0} / {jobData.cleaners_required || 1}</p>
              </div>
              {jobData.job_assignments && jobData.job_assignments.length > 0 && (
                <div className="space-y-2 mt-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned Team</label>
                  {jobData.job_assignments.map(assignment => (
                    <div key={assignment.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          {assignment.employees?.first_name?.[0]}{assignment.employees?.last_name?.[0]}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {assignment.employees?.first_name} {assignment.employees?.last_name}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto capitalize">{assignment.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Special Instructions</h2>
            {editMode ? (
              <textarea value={jobData.special_instructions || ''} onChange={(e) => setJobData({...jobData, special_instructions: e.target.value})} rows={3} className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
            ) : (
              <p className="text-slate-600 dark:text-slate-400">{jobData.special_instructions || 'No special instructions'}</p>
            )}
          </div>
          <div className="neu-raised rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Internal Notes</h2>
            {editMode ? (
              <textarea value={jobData.notes || ''} onChange={(e) => setJobData({...jobData, notes: e.target.value})} rows={3} className="w-full p-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" />
            ) : (
              <p className="text-slate-600 dark:text-slate-400">{jobData.notes || 'No notes'}</p>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="neu-raised rounded-3xl p-8 max-w-md mx-4 bg-white dark:bg-slate-800">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cancel Job?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">This will mark the job as cancelled. This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(false)} className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Keep Job</button>
                <button onClick={handleDelete} className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">Cancel Job</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {statusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="neu-raised rounded-3xl p-8 max-w-md mx-4 bg-white dark:bg-slate-800">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Change Status?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Mark job as <strong className="capitalize">{statusConfirm.replace(/_/g, ' ')}</strong>?
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStatusConfirm(null)} className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                <button onClick={() => handleStatusChange(statusConfirm)} className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Confirm</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
