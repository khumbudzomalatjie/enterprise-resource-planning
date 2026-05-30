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
  Calendar, Search, List
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

  // All Jobs State
  const [allJobs, setAllJobs] = useState([])
  const [loadingAllJobs, setLoadingAllJobs] = useState(false)
  const [jobSearch, setJobSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState('all')

  useEffect(() => {
    loadData()
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadAllJobs()
  }, [selectedDate])

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

  // Load ALL scheduled/in-progress jobs - visible to ALL cleaners
  const loadAllJobs = async () => {
    setLoadingAllJobs(true)
    
    try {
      console.log('🔍 MOBILE: Loading jobs...')
      console.log('   Date filter:', selectedDate)
      
      // First, let's check what statuses exist in the database
      const { data: statusCheck, error: statusError } = await supabase
        .from('jobs')
        .select('status')
      
      if (statusCheck) {
        const statuses = [...new Set(statusCheck.map(j => j.status))]
        console.log('   All statuses in DB:', statuses)
      }

      // Build the query
      let query = supabase
        .from('jobs')
        .select('*, clients(company_name, phone), job_categories(name, color)')
        .in('status', ['pending', 'scheduled', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_start_time', { ascending: true })

      if (selectedDate !== 'all') {
        query = query.eq('scheduled_date', selectedDate)
      }

      const { data: jobs, error } = await query
      
      console.log('📊 MOBILE: Jobs result:', jobs?.length || 0, 'jobs found')
      
      if (error) {
        console.error('❌ MOBILE: Error loading jobs:', error.message)
        console.error('   Full error:', error)
        toast.error('Failed to load jobs: ' + error.message)
      } else if (jobs && jobs.length > 0) {
        console.log('📋 MOBILE: First job:', {
          title: jobs[0].title,
          status: jobs[0].status,
          date: jobs[0].scheduled_date,
          time: jobs[0].scheduled_start_time
        })
        console.log('   All job statuses:', [...new Set(jobs.map(j => j.status))])
        setAllJobs(jobs)
      } else {
        console.log('⚠️ MOBILE: No jobs found with status pending/scheduled/in_progress')
        console.log('   Try running this SQL:')
        console.log("   UPDATE jobs SET status = 'scheduled', scheduled_date = CURRENT_DATE WHERE status NOT IN ('completed','cancelled','on_hold')")
        setAllJobs([])
      }
      
    } catch (error) {
      console.error('❌ MOBILE: Exception:', error.message)
      toast.error('Error loading jobs')
    } finally {
      setLoadingAllJobs(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    await loadAllJobs()
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

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleStartJob = async (jobId) => {
    setUpdatingJob(jobId)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'in_progress', 
          actual_start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
      if (error) throw error
      toast.success('Job started! 🚀')
      loadAllJobs()
    } catch { toast.error('Failed to start job') }
    finally { setUpdatingJob(null) }
  }

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm('Mark as completed? This will send for invoicing.')) return
    setUpdatingJob(jobId)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed', 
          actual_end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
      if (error) throw error
      toast.success('Job completed! Moving to finance ✅')
      loadAllJobs()
    } catch { toast.error('Failed to complete job') }
    finally { setUpdatingJob(null) }
  }

  const handlePauseJob = async (jobId) => {
    const reason = prompt('Reason for pausing this job:')
    if (reason === null) return
    setUpdatingJob(jobId)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'on_hold',
          notes: `PAUSED BY CLEANER: ${reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
      if (error) throw error
      toast.success('Job paused - supervisor will review')
      loadAllJobs()
    } catch { toast.error('Failed to pause job') }
    finally { setUpdatingJob(null) }
  }

  const formatTime = (date) => date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
  const formatDateShort = (date) => {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredJobs = allJobs.filter(job => {
    if (!jobSearch) return true
    const s = jobSearch.toLowerCase()
    return (job.title || '').toLowerCase().includes(s) ||
           (job.job_number || '').toLowerCase().includes(s) ||
           (job.clients?.company_name || '').toLowerCase().includes(s) ||
           (job.site_address || '').toLowerCase().includes(s)
  })

  const scheduledCount = allJobs.filter(j => j.status === 'scheduled' || j.status === 'pending').length
  const inProgressCount = allJobs.filter(j => j.status === 'in_progress').length

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: todayStr, label: 'Today' },
  ]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  dateOptions.push({ value: tomorrow.toISOString().split('T')[0], label: 'Tomorrow' })
  for (let i = 2; i < 5; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dateOptions.push({ value: d.toISOString().split('T')[0], label: formatDateShort(d.toISOString().split('T')[0]) })
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 font-['Inter'] pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullDistance > 20 || refreshing) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: pullDistance > 20 ? pullDistance : refreshing ? 50 : 0, opacity: 1 }}
            className="flex items-center justify-center text-white/80 overflow-hidden"
          >
            {refreshing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
             pullDistance >= pullThreshold ? <span className="text-sm font-medium">Release to refresh</span> : 
             <ChevronDown className="w-5 h-5" />}
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        <div className="px-5 pt-6 pb-6 text-white safe-area-top">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <p className="text-emerald-100 text-xs font-medium opacity-80">{formatDate(currentTime)}</p>
              <h1 className="text-xl font-bold mt-0.5">{greeting}, {myProfile?.first_name || user?.email?.split('@')[0] || 'Cleaner'}!</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={handleSignOut} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-5xl font-bold text-center my-3 font-mono tracking-wider">{formatTime(currentTime)}</p>
        </div>

        <div className="px-5 -mt-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Briefcase, label: 'All Jobs', value: allJobs.length, color: 'from-blue-400 to-blue-500' },
              { icon: Calendar, label: 'Scheduled', value: scheduledCount, color: 'from-indigo-400 to-indigo-500' },
              { icon: Clock, label: 'Active', value: inProgressCount, color: 'from-amber-400 to-amber-500' },
              { icon: CheckCircle2, label: 'Done', value: stats.completedJobs || 0, color: 'from-green-400 to-green-500' },
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

        <div className="px-5 mt-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Clock, label: 'Clock In/Out', path: '/mobile/clock', color: 'from-amber-400 to-orange-500' },
              { icon: Camera, label: 'Job Photos', path: '/mobile/photos', color: 'from-blue-400 to-indigo-500' },
              { icon: Package, label: 'Request Supplies', path: '/mobile/supplies', color: 'from-purple-400 to-violet-500' },
              { icon: AlertCircle, label: 'Report Incident', path: '/mobile/incident', color: 'from-red-400 to-rose-500' },
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

        <div className="px-5 mt-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Briefcase className="w-4 h-4" />All Jobs</h2>
            <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full">{filteredJobs.length} jobs</span>
          </div>

          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input type="text" value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                placeholder="Search by title, client, address..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/15 text-white placeholder-white/40 text-sm border border-white/10 focus:outline-none focus:bg-white/25" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dateOptions.map(opt => (
                <button key={opt.value} onClick={() => setSelectedDate(opt.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${selectedDate === opt.value ? 'bg-white text-emerald-700 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loadingAllJobs ? (
            <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div></div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-2">
              {filteredJobs.map((job, i) => {
                const isToday = job.scheduled_date === todayStr
                return (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`bg-white rounded-2xl p-4 shadow-md ${!isToday ? 'border-l-4 border-l-amber-400' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1" onClick={() => navigate(`/mobile/jobs/${job.id}`)}>
                        <h3 className="font-semibold text-slate-800 text-sm">{job.title}</h3>
                        <p className="text-xs text-slate-400">{job.job_number} · {job.clients?.company_name || 'Client'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ml-2 ${job.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{(job.status || 'pending').replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span className={!isToday ? 'text-amber-600 font-medium' : ''}>{isToday ? 'Today' : formatDateShort(job.scheduled_date)}</span>
                      <span className="mx-1">·</span>
                      <Clock className="w-3 h-3" />{job.scheduled_start_time?.slice(0,5)}-{job.scheduled_end_time?.slice(0,5)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3"><MapPin className="w-3 h-3" />{job.site_address?.slice(0, 40)}</div>
                    <div className="flex gap-2">
                      {(job.status === 'scheduled' || job.status === 'pending') && (
                        <button onClick={() => handleStartJob(job.id)} disabled={updatingJob === job.id}
                          className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 shadow-sm">
                          <Play className="w-3.5 h-3.5" />Start Job
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <>
                          <button onClick={() => handleCompleteJob(job.id)} disabled={updatingJob === job.id}
                            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />Complete
                          </button>
                          <button onClick={() => handlePauseJob(job.id)} disabled={updatingJob === job.id}
                            className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 shadow-sm">
                            <Pause className="w-3.5 h-3.5" />Pause
                          </button>
                        </>
                      )}
                    </div>
                    {job.clients?.phone && (
                      <a href={`tel:${job.clients.phone}`} className="mt-2 text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 rounded-lg px-2 py-1 w-fit">📞 {job.clients.company_name?.split(' ')[0]}</a>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/10 backdrop-blur rounded-2xl">
              <Briefcase className="w-12 h-12 text-white/60 mx-auto mb-2" />
              <p className="text-white font-semibold">No jobs available</p>
              <p className="text-white/60 text-xs mt-1">{jobSearch ? 'No jobs match your search' : 'Pull down to refresh'}</p>
            </div>
          )}
        </div>
        <div className="h-4" />
      </div>
      <BottomNav />
    </div>
  )
}
