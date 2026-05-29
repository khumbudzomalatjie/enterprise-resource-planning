import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import { Users, MapPin, Clock, Phone, ArrowLeft, Search, Sun, Moon, Sparkles } from 'lucide-react'

export default function ActiveCleaners() {
  const { isDark, toggleTheme } = useThemeStore()
  const [cleaners, setCleaners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadCleaners() }, [])

  const loadCleaners = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    const { data } = await supabase
      .from('attendance_records')
      .select('*, employees(*)')
      .eq('attendance_date', today)
      .not('clock_in_time', 'is', null)
      .order('clock_in_time', { ascending: false })

    // Get assigned jobs for each cleaner
    const cleanersWithJobs = await Promise.all((data || []).map(async (c) => {
      const { data: assignments } = await supabase
        .from('job_assignments')
        .select('*, jobs(title, job_number, site_address, status)')
        .eq('employee_id', c.employee_id)
        .eq('status', 'assigned')
        .limit(5)
      
      return { ...c, assignments: assignments || [] }
    }))

    setCleaners(cleanersWithJobs)
    setLoading(false)
  }

  const filteredCleaners = cleaners.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return (c.employees?.first_name || '').toLowerCase().includes(s) ||
           (c.employees?.last_name || '').toLowerCase().includes(s)
  })

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
        <Link to="/mobile/field" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Field Operations</span>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />Active Cleaners
            </h1>
            <p className="text-slate-500 mt-1">{cleaners.length} cleaners working now</p>
          </div>
          <button onClick={loadCleaners} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">Refresh</button>
        </div>

        <div className="neu-raised rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cleaners..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCleaners.map(cleaner => (
              <motion.div key={cleaner.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="neu-raised rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center relative">
                    <Users className="w-6 h-6 text-emerald-600" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{cleaner.employees?.first_name} {cleaner.employees?.last_name}</h3>
                    <p className="text-xs text-slate-500">{cleaner.employees?.employee_code}</p>
                  </div>
                </div>
                
                <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />Clocked in: {new Date(cleaner.clock_in_time).toLocaleTimeString()}</div>
                  {cleaner.check_in_latitude && (
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />GPS: {cleaner.check_in_latitude.toFixed(4)}, {cleaner.check_in_longitude.toFixed(4)}</div>
                  )}
                </div>

                {cleaner.assignments?.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-600 pt-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Assigned Jobs ({cleaner.assignments.length})</p>
                    <div className="space-y-1.5">
                      {cleaner.assignments.map(a => (
                        <div key={a.id} className="text-xs bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2">
                          <p className="font-medium text-slate-700 dark:text-slate-300">{a.jobs?.title}</p>
                          <p className="text-slate-400">{a.jobs?.site_address?.slice(0, 40)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cleaner.employees?.phone && (
                  <a href={`tel:${cleaner.employees.phone}`} className="mt-3 inline-flex items-center gap-1 text-emerald-600 text-xs font-medium hover:underline">
                    <Phone className="w-3 h-3" /> Call {cleaner.employees?.first_name}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
