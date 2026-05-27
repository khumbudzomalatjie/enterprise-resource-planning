import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useOperationsStore from '../store/operationsStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  ClipboardCheck, Star, Plus, Eye, Search,
  Sun, Moon, Sparkles, ChevronRight, Calendar
} from 'lucide-react'

export default function QualityInspections() {
  const { qualityInspections, fetchQualityInspections, createQualityInspection, jobs, fetchJobs, loading } = useOperationsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  
  const [showForm, setShowForm] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [inspectionData, setInspectionData] = useState({
    job_id: '',
    overall_rating: 5,
    cleanliness_score: 5,
    thoroughness_score: 5,
    time_efficiency_score: 5,
    safety_compliance_score: 5,
    customer_satisfaction_score: 5,
    issues_found: '',
    recommendations: '',
    status: 'completed'
  })

  useEffect(() => {
    fetchQualityInspections()
    fetchJobs({ status: 'completed', limit: 50 })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inspectionData.job_id) {
      toast.error('Please select a job')
      return
    }
    const result = await createQualityInspection(inspectionData)
    if (result.success) {
      toast.success('Quality inspection recorded!')
      setShowForm(false)
      setInspectionData({
        job_id: '',
        overall_rating: 5,
        cleanliness_score: 5,
        thoroughness_score: 5,
        time_efficiency_score: 5,
        safety_compliance_score: 5,
        customer_satisfaction_score: 5,
        issues_found: '',
        recommendations: '',
        status: 'completed'
      })
      fetchQualityInspections()
    } else {
      toast.error('Failed to save inspection')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
    ))
  }

  const scoreFields = [
    { key: 'cleanliness_score', label: 'Cleanliness' },
    { key: 'thoroughness_score', label: 'Thoroughness' },
    { key: 'time_efficiency_score', label: 'Time Efficiency' },
    { key: 'safety_compliance_score', label: 'Safety Compliance' },
    { key: 'customer_satisfaction_score', label: 'Customer Satisfaction' },
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
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/operations" className="text-slate-500 hover:text-emerald-600">Operations</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Quality Inspections</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-emerald-600" />
              Quality Inspections
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Rate and review completed jobs</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>New Inspection</span>
          </button>
        </motion.div>

        {/* New Inspection Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-3xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">New Quality Inspection</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-500">Select Job</label>
                <select value={inspectionData.job_id} onChange={(e) => setInspectionData({...inspectionData, job_id: e.target.value})} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50">
                  <option value="">Select a completed job...</option>
                  {jobs.filter(j => j.status === 'completed').map(job => (
                    <option key={job.id} value={job.id}>{job.job_number} - {job.title} ({job.clients?.company_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scoreFields.map(field => (
                  <div key={field.key}>
                    <label className="text-sm text-slate-500 flex items-center gap-2">
                      {field.label}
                      <span className="flex">{renderStars(inspectionData[field.key])}</span>
                    </label>
                    <input type="range" min="1" max="5" value={inspectionData[field.key]} onChange={(e) => setInspectionData({...inspectionData, [field.key]: parseInt(e.target.value)})} className="w-full mt-1 accent-emerald-600" />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm text-slate-500">Overall Rating</label>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setInspectionData({...inspectionData, overall_rating: star})} className="p-1">
                      <Star className={`w-8 h-8 ${star <= inspectionData.overall_rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Issues Found</label>
                <textarea value={inspectionData.issues_found} onChange={(e) => setInspectionData({...inspectionData, issues_found: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" placeholder="Any issues found during inspection..." />
              </div>

              <div>
                <label className="text-sm text-slate-500">Recommendations</label>
                <textarea value={inspectionData.recommendations} onChange={(e) => setInspectionData({...inspectionData, recommendations: e.target.value})} rows={2} className="w-full p-3 neu-inset rounded-xl mt-1 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50" placeholder="Recommendations for improvement..." />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl bg-slate-500 text-white">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-600 text-white">Save Inspection</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Inspections List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
          ) : qualityInspections.length === 0 ? (
            <div className="col-span-full text-center py-12 neu-raised rounded-3xl">
              <ClipboardCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No quality inspections yet</p>
            </div>
          ) : (
            qualityInspections.map(inspection => (
              <motion.div key={inspection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{inspection.jobs?.job_number}</span>
                  <div className="flex">{renderStars(inspection.overall_rating)}</div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{inspection.jobs?.title}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span>Cleanliness: {inspection.cleanliness_score}/5</span>
                  <span>Thoroughness: {inspection.thoroughness_score}/5</span>
                  <span>Efficiency: {inspection.time_efficiency_score}/5</span>
                  <span>Safety: {inspection.safety_compliance_score}/5</span>
                </div>
                {inspection.issues_found && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{inspection.issues_found}</p>
                )}
                <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(inspection.inspection_date)}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
