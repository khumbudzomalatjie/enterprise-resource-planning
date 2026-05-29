import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import { Camera, ArrowLeft, Search, Filter, X, Download, Sun, Moon, Sparkles } from 'lucide-react'

export default function JobPhotos() {
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => { loadPhotos() }, [typeFilter])

  const loadPhotos = async () => {
    setLoading(true)
    let query = supabase
      .from('job_photos')
      .select('*, jobs(title, job_number, site_address), employees(first_name, last_name, employee_code)')
      .order('taken_at', { ascending: false })
      .limit(50)

    if (typeFilter !== 'all') query = query.eq('photo_type', typeFilter)

    const { data } = await query
    setPhotos(data || [])
    setLoading(false)
  }

  const filteredPhotos = photos.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (p.employees?.first_name || '').toLowerCase().includes(s) ||
           (p.employees?.last_name || '').toLowerCase().includes(s) ||
           (p.jobs?.title || '').toLowerCase().includes(s) ||
           (p.caption || '').toLowerCase().includes(s)
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Camera className="w-8 h-8 text-indigo-600" />Job Photos
          </h1>
        </div>

        {/* Filters */}
        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by cleaner or job..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-sm" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-sm">
            <option value="all">All Types</option>
            <option value="before">Before</option>
            <option value="after">After</option>
            <option value="incident">Incident</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPhotos.map(photo => (
              <motion.div key={photo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelectedPhoto(photo)}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img src={photo.photo_url} alt={photo.caption || 'Job photo'} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-medium">{photo.employees?.first_name} {photo.employees?.last_name}</p>
                  <p className="text-white/70 text-xs">{photo.jobs?.title?.slice(0, 40)}</p>
                  <p className="text-white/50 text-[10px]">{new Date(photo.taken_at).toLocaleString()}</p>
                </div>
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                  photo.photo_type === 'before' ? 'bg-blue-500 text-white' :
                  photo.photo_type === 'after' ? 'bg-emerald-500 text-white' :
                  photo.photo_type === 'incident' ? 'bg-red-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>{photo.photo_type}</span>
                {photo.caption && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full max-w-[120px] truncate">{photo.caption}</div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedPhoto.photo_url} alt="Full size" className="w-full max-h-[70vh] object-contain bg-black" />
              <button onClick={() => setSelectedPhoto(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{selectedPhoto.employees?.first_name} {selectedPhoto.employees?.last_name}</h3>
                  <p className="text-sm text-slate-500">{selectedPhoto.employees?.employee_code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  selectedPhoto.photo_type === 'before' ? 'bg-blue-100 text-blue-700' :
                  selectedPhoto.photo_type === 'after' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>{selectedPhoto.photo_type}</span>
              </div>
              <p className="text-sm"><strong>Job:</strong> {selectedPhoto.jobs?.title} ({selectedPhoto.jobs?.job_number})</p>
              <p className="text-sm"><strong>Location:</strong> {selectedPhoto.jobs?.site_address}</p>
              {selectedPhoto.caption && <p className="text-sm"><strong>Caption:</strong> {selectedPhoto.caption}</p>}
              <p className="text-xs text-slate-400">Taken: {new Date(selectedPhoto.taken_at).toLocaleString()}</p>
              <a href={selectedPhoto.photo_url} download className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
