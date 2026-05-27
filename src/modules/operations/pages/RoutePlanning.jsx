import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useOperationsStore from '../store/operationsStore'
import useThemeStore from '../../../store/themeStore'
import { 
  Map, MapPin, Plus, Navigation, Truck,
  Sun, Moon, Sparkles, ChevronRight
} from 'lucide-react'

export default function RoutePlanning() {
  const { routes, fetchRoutes, jobs, fetchJobs } = useOperationsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchRoutes()
    fetchJobs({ date_from: new Date().toISOString().split('T')[0] })
  }, [])

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
          <span className="text-slate-800 dark:text-white font-medium">Route Planning</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Map className="w-8 h-8 text-emerald-600" />
              Route Planning & Map
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Plan and optimize team routes for jobs</p>
          </div>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neu-raised rounded-3xl p-6 mb-8">
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-2xl h-96 flex flex-col items-center justify-center">
            <MapPin className="w-16 h-16 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">Map View</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
              Google Maps / Leaflet integration will be added here.
              <br />Displaying job locations with route optimization.
            </p>
            <button className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              Load Map
            </button>
          </div>
        </motion.div>

        {/* Job Locations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.slice(0, 9).map(job => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{job.title}</p>
                <p className="text-xs text-slate-500 truncate">{job.site_address}</p>
                <p className="text-xs text-slate-400 mt-1">{job.site_city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
