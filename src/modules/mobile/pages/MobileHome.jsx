import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import useMobileStore from '../store/mobileStore'
import BottomNav from '../components/BottomNav'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabaseClient'
import { 
  Briefcase, Clock, CheckCircle2, MapPin, 
  Camera, AlertCircle, Package, LogOut,
  Play, Pause, RefreshCw, ChevronDown,
  Calendar, Eye
} from 'lucide-react'

export default function MobileHome() {
  const { user, profile, signOut } = useAuthStore()
  const { myJobs, stats, fetchMyJobs, fetchMobileStats, fetchMyProfile, myProfile, loading } = useMobileStore()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [updatingJob, setUpdatingJob] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const touchStartY = useRef(0)
  const pullThreshold = 80

  // Tomorrow's Jobs State
  const [upcomingJobs, setUpcomingJobs] = useState([])
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [loadingUpcoming, setLoadingUpcoming] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
    loadUpcomingJobs()
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hour = currentTime.getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [currentTime])

  const loadData = async () => {
    if (user?.id) await fetchMyProfile(user.id)
    if (profile?.id) {
      await fetchMobileStats(profile.id)
      await fetchMyJobs(profile.id)
    }
  }

  // Load upcoming jobs for selected date
  const loadUpcomingJobs = async (date = null) => {
    const targetDate = date || selectedDate
    setLoadingUpcoming(true)
    
    try {
      // Get employee ID from profile
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!employee) { setLoadingUpcoming(false); return }

      // Get job assignments for the target date
      const { data: assignments } = await supabase
        .from('job_assignments')
        .select('job_id')
        .eq('employee_id', employee.id)
        .eq('status', 'assigned')

      const jobIds = assignments?.map(a => a.job_id) || []

      if (jobIds.length === 0) {
        setUpcomingJobs([])
        setLoadingUpcoming(false)
        return
      }

      // Get jobs scheduled for the target date (excluding completed, cancelled, on_hold)
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*, clients(company_name, phone), job_categories(name, color)')
        .in('id', jobIds)
        .eq('scheduled_date', targetDate)
        .not('status', 'in', '(completed,cancelled,on_hold)')
        .order('scheduled_start_time', { ascending: true })

      setUpcomingJobs(jobs || [])
    } catch (error) {
      console.error('Error loading upcoming jobs:', error)
    } finally {
      setLoadingUpcoming(false)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    loadUpcomingJobs(date)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    await loadUpcomingJobs()
    setTimeout(() => setRefreshing(false), 500)
    toast.success('Refreshed!', { duration: 1500 })
  }

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!isPulling) return
    const currentY = e.touches[0].clientY
    const distance = currentY - touchStartY.current
    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.5, pullThreshold))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= pullThreshold && !refreshing) {
      await handleRefresh()
    }
    setPullDistance(0)
    setIsPulling(false)
  }

  const scrollToJobs = () => {
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToUpcoming = () => {
    document.getElementById('upcoming-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleStartJob = async (jobId) => {
    setUpdatingJob(jobId)
    try {
      await supabase.from('jobs').update({ status: 'in_progress', actual_start_time: new Date().toISOString() }).eq('id', jobId)
      toast.success('Job started! 🚀')
      loadData()
    } catch { toast.error('Failed to start job') }
    finally { setUpdatingJob(null) }
  }

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm('Mark as completed? This will generate an invoice.')) return
    setUpdatingJob(jobId)
    try {
      await supabase.from('jobs').update({ status: 'completed', actual_end_time: new Date().toISOString() }).eq('id', jobId)
      toast.success('Job completed! ✅')
      loadData()
    } catch { toast.error('Failed to complete job') }
    finally { setUpdatingJob(null) }
  }

  const handlePauseJob = async (jobId) => {
    setUpdatingJob(jobId)
    try {
      await supabase.from('jobs').update({ status: 'on_hold' }).eq('id', jobId)
      toast.success('Job paused')
      loadData()
    } catch { toast.error('Failed to pause job') }
    finally { setUpdatingJob(null) }
  }

  const formatTime = (date) => date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
  const formatDateShort = (date) => date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })

  // Filter out completed AND held jobs from mobile view
  const activeJobs = (myJobs || []).filter(job => 
    job.status !== 'completed' && job.status !== 'on_hold'
  )

  // Generate next 7 days for date selector
  const nextDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    nextDays.push({
      value: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDateShort(date)
    })
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 font-['Inter'] pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {(pullDistance > 20 || refreshing) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: pullDistance > 20 ? pullDistance : refreshing ? 50 : 0, opacity: 1 }}
            className="flex items-center justify-center text-white/80 overflow-hidden"
          >
            {refreshing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : pullDistance >= pullThreshold ? (
              <span className="text-sm font-medium">Release to refresh</span>
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <div className="px-5 pt-6 pb-6 text-white safe-area-top">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <p className="text-emerald-100 text-xs font-medium opacity-80">{formatDate(currentTime)}</p>
              <h1 className="text-xl font-bold mt-0.5">{greeting}, {myProfile?.first_name || user?.email?.split('@')[0] || 'Cleaner'}!</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={handleSignOut} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-5xl font-bold text-center my-3 font-mono tracking-wider">{formatTime(currentTime)}</p>
          
          <div className="flex justify-center gap-3 mt-1 flex-wrap">
            <button onClick={scrollToJobs} className="text-xs text-white/70 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
              <ChevronDown className="w-3 h-3" /> Today's Jobs
            </button>
            <button onClick={scrollToUpcoming} className="text-xs text-white/70 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> Upcoming Jobs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-5 -mt-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Briefcase, label: 'Today', value: activeJobs.length, color: 'from-blue-400 to-blue-500' },
              { icon: CheckCircle2, label: 'Done', value: stats.completedJobs || 0, color: 'from-green-400 to-green-500' },
              { icon: Clock, label: 'Clock', value: stats.isClockedIn ? 'In' : 'Out', color: stats.isClockedIn ? 'from-amber-400 to-amber-500' : 'from-slate-400 to-slate-500' },
              { icon: Calendar, label: 'Upcoming', value: upcomingJobs.length, color: 'from-purple-400 to-violet-500' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${s.color} rounded-2xl p-2.5 text-white text-center shadow-lg`}>
                <s.icon className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[9px] opacity-80 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Clock, label: 'Clock In/Out', path: '/mobile/clock', color: 'from-amber-400 to-orange-500' },
              { icon: Camera, label: 'Job Photos', path: '/mobile/photos', color: 'from-blue-400 to-indigo-500' },
              { icon: Package, label: 'Supplies', path: '/mobile/supplies', color: 'from-purple-400 to-violet-500' },
              { icon: AlertCircle, label: 'Report Issue', path: '/mobile/incident', color: 'from-red-400 to-rose-500' },
            ].map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-3.5 text-left hover:scale-[1.02] active:scale-95 transition-all shadow-lg`}>
                <action.icon className="w-7 h-7 mb-2" />
                <span className="text-sm font-bold block">{action.label}</span>
                <span className="text-[10px] opacity-75">Tap to open</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Active Jobs Section */}
        <div id="jobs-section" className="px-5 mt-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4" />Today's Jobs
            </h2>
            <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full">{activeJobs.length} active</span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-white/60 text-xs mt-2">Loading jobs...</p>
            </div>
          ) : activeJobs.length > 0 ? (
            <div className="space-y-2.5">
              {activeJobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/mobile/jobs/${job.id}`)}>
                      <h3 className="font-semibold text-slate-800 text-sm">{job.title}</h3>
                      <p className="text-xs text-slate-400">{job.job_number} · {job.clients?.company_name || 'Client'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ml-2 ${
                      job.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{(job.status || 'pending').replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3 h-3" />{job.site_address?.slice(0, 30)}
                    <span className="mx-1">·</span>
                    <Clock className="w-3 h-3" />{job.scheduled_start_time?.slice(0,5)}-{job.scheduled_end_time?.slice(0,5)}
                  </div>

                  <div className="flex gap-2">
                    {(job.status === 'scheduled' || job.status === 'pending') && (
                      <button onClick={() => handleStartJob(job.id)} disabled={updatingJob === job.id}
                        className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50">
                        <Play className="w-3.5 h-3.5" />Start Job
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <>
                        <button onClick={() => handleCompleteJob(job.id)} disabled={updatingJob === job.id}
                          className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50">
                          <CheckCircle2 className="w-3.5 h-3.5" />Complete
                        </button>
                        <button onClick={() => handlePauseJob(job.id)} disabled={updatingJob === job.id}
                          className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50">
                          <Pause className="w-3.5 h-3.5" />Pause
                        </button>
                      </>
                    )}
                    {job.status === 'on_hold' && (
                      <button onClick={() => handleStartJob(job.id)} disabled={updatingJob === job.id}
                        className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50">
                        <Play className="w-3.5 h-3.5" />Resume
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/10 backdrop-blur rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-white/60 mx-auto mb-2" />
              <p className="text-white font-semibold">All Done! 🎉</p>
              <p className="text-white/60 text-xs mt-1">Pull down to refresh</p>
            </div>
          )}
        </div>

        {/* UPCOMING JOBS SECTION - VIEW ONLY */}
        <div id="upcoming-section" className="px-5 mt-2 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />Upcoming Jobs
            </h2>
            <button 
              onClick={() => setShowUpcoming(!showUpcoming)}
              className="text-xs text-white/70 hover:text-white bg-white/10 px-3 py-1 rounded-full flex items-center gap-1"
            >
              {showUpcoming ? 'Hide' : 'Show'} <ChevronDown className={`w-3 h-3 transition-transform ${showUpcoming ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Date Selector */}
          {showUpcoming && (
            <div className="mb-3 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {nextDays.map(day => (
                  <button
                    key={day.value}
                    onClick={() => handleDateChange(day.value)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      selectedDate === day.value
                        ? 'bg-white text-emerald-700 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {showUpcoming && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {loadingUpcoming ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    <p className="text-white/60 text-xs mt-2">Loading...</p>
                  </div>
                ) : upcomingJobs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-white/70 text-xs font-medium">
                      {selectedDate === new Date().toISOString().split('T')[0] 
                        ? "Today's Schedule" 
                        : selectedDate === nextDays[1]?.value 
                          ? "Tomorrow's Schedule" 
                          : `Schedule for ${formatDateShort(new Date(selectedDate + 'T00:00:00'))}`}
                    </p>
                    {upcomingJobs.map((job, i) => (
                      <motion.div 
                        key={job.id} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/15 backdrop-blur rounded-xl p-3 border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                            <p className="text-white/60 text-xs">{job.job_number} · {job.clients?.company_name || 'Client'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white">
                            <Eye className="w-3 h-3 inline mr-0.5" /> View Only
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                          <MapPin className="w-3 h-3" />{job.site_address?.slice(0, 30)}
                          <span className="mx-1">·</span>
                          <Clock className="w-3 h-3" />{job.scheduled_start_time?.slice(0,5)}-{job.scheduled_end_time?.slice(0,5)}
                        </div>

                        {job.clients?.phone && (
                          <a href={`tel:${job.clients.phone}`} 
                            className="text-xs text-white/80 flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1 w-fit hover:bg-white/20 transition-colors">
                            📞 Call Client
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white/10 rounded-2xl">
                    <Calendar className="w-10 h-10 text-white/50 mx-auto mb-2" />
                    <p className="text-white/70 text-sm font-medium">No jobs scheduled</p>
                    <p className="text-white/40 text-xs mt-1">
                      {selectedDate === new Date().toISOString().split('T')[0] 
                        ? 'No jobs for today' 
                        : `No jobs for ${formatDateShort(new Date(selectedDate + 'T00:00:00'))}`}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-4" />
      </div>

      <BottomNav />
    </div>
  )
}
