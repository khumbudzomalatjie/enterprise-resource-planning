import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import useMobileStore from '../store/mobileStore'
import BottomNav from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Briefcase, MapPin, Clock, ArrowLeft, CheckCircle2, Calendar, Phone } from 'lucide-react'

export default function MyJobs() {
  const { profile } = useAuthStore()
  const { myJobs, fetchMyJobs, loading, updateTaskItem, fetchJobTasks, jobTasks } = useMobileStore()
  const navigate = useNavigate()
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    if (profile?.id) fetchMyJobs(profile.id)
  }, [])

  const handleJobClick = (job) => {
    setSelectedJob(job)
    fetchJobTasks(job.id)
  }

  const handleCompleteTask = async (taskId) => {
    await updateTaskItem(taskId, { is_completed: true, completed_at: new Date().toISOString() })
    toast.success('Task completed! ✅')
    if (selectedJob) fetchJobTasks(selectedJob.id)
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-slate-50 font-['Inter'] pb-20">
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 px-4 pt-8 pb-6 text-white">
          <button onClick={() => setSelectedJob(null)} className="p-1 rounded-lg hover:bg-white/20 mb-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{selectedJob.title}</h1>
          <p className="text-blue-100 text-sm">{selectedJob.job_number}</p>
        </div>

        <div className="px-4 -mt-4 space-y-4">
          {/* Job Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" />{selectedJob.site_address}</div>
            <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-slate-400" />{selectedJob.scheduled_start_time?.slice(0,5)} - {selectedJob.scheduled_end_time?.slice(0,5)}</div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-slate-400" />{formatDate(selectedJob.scheduled_date)}</div>
            {selectedJob.clients?.company_name && <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-slate-400" />{selectedJob.clients.company_name}</div>}
          </div>

          {/* Task Checklist */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-700 mb-3">Task Checklist</h3>
            {jobTasks.length > 0 ? (
              <div className="space-y-2">
                {jobTasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    task.is_completed ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        task.is_completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                      }`}>
                        {task.is_completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${task.is_completed ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                        {task.description}
                      </span>
                    </div>
                    {!task.is_completed && (
                      <button onClick={() => handleCompleteTask(task.id)} className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-medium hover:bg-emerald-600">
                        Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">No tasks assigned for this job</p>
            )}
          </div>

          {/* Client Info */}
          {selectedJob.site_contact_name && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-2">Site Contact</h3>
              <p className="text-sm">{selectedJob.site_contact_name}</p>
              {selectedJob.site_contact_phone && (
                <a href={`tel:${selectedJob.site_contact_phone}`} className="text-blue-500 text-sm flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> {selectedJob.site_contact_phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] pb-20">
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 px-4 pt-8 pb-6 text-white">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <p className="text-blue-100 text-sm">{myJobs.length} jobs assigned today</p>
      </div>

      <div className="px-4 -mt-4 pt-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : myJobs.length > 0 ? (
          myJobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => handleJobClick(job)}
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800 flex-1">{job.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ml-2 ${
                  job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  job.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{job.status?.replace('_', ' ') || 'pending'}</span>
              </div>
              <div className="space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.site_address}</div>
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.scheduled_start_time?.slice(0,5)} - {job.scheduled_end_time?.slice(0,5)}</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-lg">No jobs assigned</p>
            <p className="text-slate-400 text-sm">Check back later or contact your supervisor</p>
          </div>
        )}
      </div>

      <BottomNav active="jobs" />
    </div>
  )
}
