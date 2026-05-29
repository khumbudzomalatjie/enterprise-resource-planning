import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import useMobileStore from '../store/mobileStore'
import BottomNav from '../components/BottomNav'
import toast from 'react-hot-toast'
import { 
  Briefcase, Clock, CheckCircle2, MapPin, 
  Camera, AlertCircle, Package, LogOut,
  ChevronRight
} from 'lucide-react'

export default function MobileHome() {
  const { user, profile, signOut } = useAuthStore()
  const { myJobs, stats, fetchMyJobs, fetchMobileStats, fetchMyProfile, myProfile, loading } = useMobileStore()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    loadData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hour = currentTime.getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [currentTime])

  const loadData = async () => {
    if (user?.id) {
      await fetchMyProfile(user.id)
    }
    if (profile?.id) {
      await fetchMobileStats(profile.id)
      await fetchMyJobs(profile.id)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const formatTime = (date) => date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-500 to-emerald-700 font-['Inter']">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-emerald-100 text-sm">{formatDate(currentTime)}</p>
            <h1 className="text-2xl font-bold">{greeting}, {myProfile?.first_name || user?.email?.split('@')[0] || 'Cleaner'}!</h1>
          </div>
          <button onClick={handleSignOut} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <p className="text-4xl font-bold text-center my-4 font-mono">{formatTime(currentTime)}</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-2">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Briefcase, label: "Today's Jobs", value: stats.jobsToday || 0, color: 'bg-blue-500' },
            { icon: CheckCircle2, label: 'Completed', value: stats.completedJobs || 0, color: 'bg-green-500' },
            { icon: Clock, label: 'Status', value: stats.isClockedIn ? 'In' : 'Out', color: stats.isClockedIn ? 'bg-amber-500' : 'bg-slate-500' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`${s.color} bg-white/20 backdrop-blur rounded-2xl p-3 text-white text-center`}>
              <s.icon className="w-6 h-6 mx-auto mb-1" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[11px] opacity-80">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-3xl mt-4 px-4 pt-6 pb-24 min-h-screen">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Clock, label: 'Clock In/Out', path: '/mobile/clock', color: 'bg-amber-500', desc: 'Record attendance' },
            { icon: Camera, label: 'Take Photos', path: '/mobile/photos', color: 'bg-blue-500', desc: 'Before & after' },
            { icon: Package, label: 'Request Supplies', path: '/mobile/supplies', color: 'bg-purple-500', desc: 'Order materials' },
            { icon: AlertCircle, label: 'Report Incident', path: '/mobile/incident', color: 'bg-red-500', desc: 'Damages & issues' },
          ].map(action => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow-lg`}>
              <action.icon className="w-8 h-8" />
              <span className="text-sm font-semibold">{action.label}</span>
              <span className="text-[10px] opacity-75">{action.desc}</span>
            </button>
          ))}
        </div>

        {/* Today's Jobs */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />My Jobs Today
          </h2>
          <button onClick={() => navigate('/mobile/jobs')} className="text-emerald-600 text-sm flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {myJobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/mobile/jobs/${job.id}`)}
                className="bg-slate-50 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all border border-slate-100 active:scale-[0.98]">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{job.title}</h3>
                    <p className="text-xs text-slate-500">{job.job_number} · {job.clients?.company_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    job.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {(job.status || 'pending').replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{job.site_address}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />
                    {job.scheduled_start_time?.slice(0,5)} - {job.scheduled_end_time?.slice(0,5)}
                  </div>
                </div>
              </motion.div>
            ))}
            {myJobs.length === 0 && !loading && (
              <div className="text-center py-8 bg-slate-50 rounded-2xl">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No jobs assigned for today</p>
                <p className="text-slate-400 text-xs mt-1">Check back later or contact your supervisor</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="home" />
    </div>
  )
}
