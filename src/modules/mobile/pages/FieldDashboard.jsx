import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import useAuthStore from '../../../store/authStore'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { 
  Users, MapPin, Clock, Camera, AlertCircle, 
  Package, CheckCircle2, Briefcase, Phone,
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft,
  Activity, Eye, Navigation
} from 'lucide-react'

export default function FieldDashboard() {
  const { isDark, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [activeCleaners, setActiveCleaners] = useState([])
  const [liveJobs, setLiveJobs] = useState([])
  const [recentPhotos, setRecentPhotos] = useState([])
  const [recentIncidents, setRecentIncidents] = useState([])
  const [supplyRequests, setSupplyRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
    const interval = setInterval(loadAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([
      loadStats(),
      loadActiveCleaners(),
      loadLiveJobs(),
      loadRecentPhotos(),
      loadIncidents(),
      loadSupplyRequests()
    ])
    setLoading(false)
  }

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const [
      { data: cleaners },
      { data: activeAttendance },
      { data: todayJobs },
      { data: completedJobs },
      { data: pendingSupplies },
      { data: openIncidents },
      { data: todayPhotos }
    ] = await Promise.all([
      supabase.from('employees').select('*').eq('employment_status', 'active'),
      supabase.from('attendance_records').select('*').eq('attendance_date', today).not('clock_in_time', 'is', null).is('clock_out_time', null),
      supabase.from('jobs').select('*').eq('status', 'in_progress'),
      supabase.from('jobs').select('*').eq('status', 'completed').gte('actual_end_time', today + 'T00:00:00'),
      supabase.from('supplies_requests').select('*').eq('status', 'pending'),
      supabase.from('incident_reports').select('*').in('status', ['reported', 'investigating']),
      supabase.from('job_photos').select('*').gte('taken_at', today + 'T00:00:00')
    ])

    setStats({
      totalCleaners: cleaners?.length || 0,
      activeNow: activeAttendance?.length || 0,
      liveJobs: todayJobs?.length || 0,
      completedToday: completedJobs?.length || 0,
      pendingSupplies: pendingSupplies?.length || 0,
      openIncidents: openIncidents?.length || 0,
      photosToday: todayPhotos?.length || 0
    })
  }

  const loadActiveCleaners = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('*, employees(first_name, last_name, phone, employee_code)')
      .eq('attendance_date', today)
      .not('clock_in_time', 'is', null)
      .order('clock_in_time', { ascending: false })

    setActiveCleaners(attendance || [])
  }

  // LIVE JOBS - Show which cleaner is working on which job
  const loadLiveJobs = async () => {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, job_number, status, scheduled_date, scheduled_start_time, scheduled_end_time, site_address, notes, clients(company_name, phone), job_categories(name, color)')
      .eq('status', 'in_progress')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_start_time', { ascending: true })

    setLiveJobs(jobs || [])
  }

  const loadRecentPhotos = async () => {
    const { data } = await supabase
      .from('job_photos')
      .select('*, jobs(title, job_number), employees(first_name, last_name)')
      .order('taken_at', { ascending: false })
      .limit(8)
    setRecentPhotos(data || [])
  }

  const loadIncidents = async () => {
    const { data } = await supabase
      .from('incident_reports')
      .select('*, employees(first_name, last_name), jobs(title, job_number, site_address)')
      .order('incident_date', { ascending: false })
      .limit(10)
    setRecentIncidents(data || [])
  }

  const loadSupplyRequests = async () => {
    const { data } = await supabase
      .from('supplies_requests')
      .select('*, employees(first_name, last_name), supplies_request_items(*)')
      .order('created_at', { ascending: false })
      .limit(10)
    setSupplyRequests(data || [])
  }

  const handleApproveSupply = async (id) => {
    await supabase.from('supplies_requests').update({ status: 'approved' }).eq('id', id)
    toast.success('Supply request approved!')
    loadSupplyRequests()
    loadStats()
  }

  const handleResolveIncident = async (id) => {
    await supabase.from('incident_reports').update({ status: 'resolved' }).eq('id', id)
    toast.success('Incident marked as resolved')
    loadIncidents()
    loadStats()
  }

  // Extract cleaner name from job notes
  const getCleanerName = (job) => {
    if (job?.notes?.includes('SELECTED BY:')) {
      return job.notes.split('SELECTED BY:')[1]?.split('at')[0]?.trim() || 'Unknown'
    }
    return 'Not assigned'
  }

  const statCards = [
    { icon: Users, label: 'Total Cleaners', value: stats.totalCleaners || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Activity, label: 'Active Now', value: stats.activeNow || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Briefcase, label: 'Live Jobs', value: stats.liveJobs || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: CheckCircle2, label: 'Completed Today', value: stats.completedToday || 0, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: Camera, label: 'Photos Today', value: stats.photosToday || 0, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { icon: AlertCircle, label: 'Open Incidents', value: stats.openIncidents || 0, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { icon: Package, label: 'Supply Requests', value: stats.pendingSupplies || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
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
        <Link to="/dashboard" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Main Dashboard</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Field Operations Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">Monitor cleaners, live jobs, photos, incidents & supplies in real-time</p>
          </div>
          <button onClick={loadAllData} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Refresh Live
          </button>
        </motion.div>

        {/* Quick Nav */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Active Cleaners', icon: Activity, path: '/mobile/field/cleaners', color: 'bg-emerald-600' },
            { label: 'Live Jobs', icon: Briefcase, path: '/mobile/field/live-jobs', color: 'bg-purple-600' },
            { label: 'Job Photos', icon: Camera, path: '/mobile/field/photos', color: 'bg-indigo-600' },
            { label: 'Incidents', icon: AlertCircle, path: '/mobile/field/incidents', color: 'bg-red-600' },
            { label: 'Supply Orders', icon: Package, path: '/mobile/field/supplies', color: 'bg-amber-600' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`${item.color} text-white rounded-2xl p-3 flex flex-col items-center gap-1 hover:scale-105 transition-transform text-sm font-medium shadow-lg`}>
              <item.icon className="w-6 h-6" />{item.label}
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4 stat-card">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* LIVE JOBS - Main Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neu-raised rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />Live Jobs - Who's Working on What
            </h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-medium">
              {liveJobs.length} Active Jobs
            </span>
          </div>
          
          {liveJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Job #</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Job Title</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Cleaner</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Time</th>
                    <th className="text-center py-3 px-4 text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveJobs.map(job => (
                    <tr key={job.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-mono text-xs font-medium text-slate-600">{job.job_number}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{job.title}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                            {getCleanerName(job)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{job.clients?.company_name || 'N/A'}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.site_address?.slice(0, 25) || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{job.scheduled_date ? new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : 'N/A'}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{job.scheduled_start_time?.slice(0,5)} - {job.scheduled_end_time?.slice(0,5)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500">No active jobs right now</p>
            </div>
          )}
        </motion.div>

        {/* Active Cleaners + Recent Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Active Cleaners */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />Cleaners Working Now
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{activeCleaners.length} Active</span>
            </div>
            {activeCleaners.length > 0 ? (
              <div className="space-y-2">
                {activeCleaners.slice(0, 5).map(cleaner => (
                  <div key={cleaner.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center relative">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cleaner.employees?.first_name} {cleaner.employees?.last_name}</p>
                        <p className="text-xs text-slate-500">Clocked in: {new Date(cleaner.clock_in_time).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {cleaner.employees?.phone && (
                      <a href={`tel:${cleaner.employees.phone}`} className="text-emerald-600 text-xs font-medium">📞 Call</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No cleaners active</p>
            )}
          </motion.div>

          {/* Recent Photos */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />Recent Job Photos
              </h2>
              <Link to="/mobile/field/photos" className="text-sm text-emerald-600 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            {recentPhotos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {recentPhotos.slice(0, 8).map(photo => (
                  <div key={photo.id} className="relative cursor-pointer rounded-lg overflow-hidden" onClick={() => window.open(photo.photo_url, '_blank')}>
                    <img src={photo.photo_url} alt="" className="w-full h-20 object-cover" />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-black/50 text-white capitalize">{photo.photo_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No photos yet</p>
            )}
          </motion.div>
        </div>

        {/* Incidents & Supply Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="neu-raised rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />Recent Incidents
              </h2>
              <Link to="/mobile/field/incidents" className="text-sm text-emerald-600 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            {recentIncidents.length > 0 ? (
              <div className="space-y-2">
                {recentIncidents.slice(0, 4).map(incident => (
                  <div key={incident.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm capitalize">{incident.incident_type}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${incident.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{incident.severity}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{incident.description}</p>
                    {incident.status !== 'resolved' && (
                      <button onClick={() => handleResolveIncident(incident.id)} className="mt-1 text-xs text-emerald-600 font-medium">Mark Resolved</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No incidents 🎉</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="neu-raised rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />Supply Requests
              </h2>
              <Link to="/mobile/field/supplies" className="text-sm text-emerald-600 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            {supplyRequests.length > 0 ? (
              <div className="space-y-2">
                {supplyRequests.slice(0, 4).map(request => (
                  <div key={request.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">{request.employees?.first_name} {request.employees?.last_name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{request.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{request.supplies_request_items?.length || 0} items</p>
                    {request.status === 'pending' && (
                      <button onClick={() => handleApproveSupply(request.id)} className="mt-1 text-xs text-emerald-600 font-medium">Approve</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No pending requests</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
