import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { 
  Camera, ArrowLeft, Search, X, Download, Trash2, 
  Sun, Moon, Sparkles, Eye, AlertCircle
} from 'lucide-react'

export default function JobPhotos() {
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => { loadPhotos() }, [typeFilter])

  const loadPhotos = async () => {
    setLoading(true)
    let query = supabase
      .from('job_photos')
      .select('*, jobs(title, job_number, site_address), employees(first_name, last_name, employee_code)')
      .order('taken_at', { ascending: false })
      .limit(50)

    if (typeFilter !== 'all') query = query.eq('photo_type', typeFilter)

    const { data, error } = await query
    if (error) {
      console.error('Error loading photos:', error)
      toast.error('Failed to load photos')
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const handleDeletePhoto = async (photo) => {
    setDeletingId(photo.id)
    try {
      // Delete from storage if it's a Supabase URL
      if (photo.photo_url && photo.photo_url.includes('supabase')) {
        const urlParts = photo.photo_url.split('/')
        const bucketIndex = urlParts.indexOf('fleet')
        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/')
          try {
            await supabase.storage.from('fleet').remove([filePath])
          } catch (storageError) {
            console.log('Storage file may already be deleted:', storageError.message)
          }
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('job_photos')
        .delete()
        .eq('id', photo.id)

      if (error) throw error

      toast.success('Photo deleted successfully! 🗑️')
      setShowDeleteConfirm(null)
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null)
      loadPhotos()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete photo: ' + (error.message || 'Unknown error'))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPhotos = photos.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (p.employees?.first_name || '').toLowerCase().includes(s) ||
           (p.employees?.last_name || '').toLowerCase().includes(s) ||
           (p.jobs?.title || '').toLowerCase().includes(s) ||
           (p.caption || '').toLowerCase().includes(s) ||
           (p.jobs?.site_address || '').toLowerCase().includes(s)
  })

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-ZA', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

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

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Job Photos</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">{photos.length} photos uploaded by field workers</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs text-slate-400 self-center">
              Click photo to view · Click 🗑️ to delete
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by cleaner name, job title, caption, or location..." 
              className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-sm" 
            />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-sm">
            <option value="all">All Types</option>
            <option value="before">Before</option>
            <option value="after">After</option>
            <option value="incident">Incident</option>
            <option value="other">Other</option>
          </select>
          <button onClick={loadPhotos} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700">
            Refresh
          </button>
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading photos...</p>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPhotos.map(photo => (
              <motion.div 
                key={photo.id} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-md hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div onClick={() => setSelectedPhoto(photo)}>
                  <img 
                    src={photo.photo_url} 
                    alt={photo.caption || 'Job photo'} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Type Badge */}
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shadow-sm ${
                  photo.photo_type === 'before' ? 'bg-blue-500 text-white' :
                  photo.photo_type === 'after' ? 'bg-emerald-500 text-white' :
                  photo.photo_type === 'incident' ? 'bg-red-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {photo.photo_type}
                </span>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(photo)
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-medium truncate">
                    {photo.employees?.first_name} {photo.employees?.last_name}
                  </p>
                  <p className="text-white/70 text-[10px] truncate">
                    {photo.jobs?.title?.slice(0, 35) || 'No job title'}
                  </p>
                  <p className="text-white/50 text-[9px]">
                    {formatDate(photo.taken_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 neu-raised rounded-3xl">
            <Camera className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No photos found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Photos uploaded by cleaners will appear here'}
            </p>
          </div>
        )}

        {/* Photo count */}
        {!loading && filteredPhotos.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Showing {filteredPhotos.length} of {photos.length} photos
            </p>
          </div>
        )}
      </main>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
              className="max-w-3xl w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative bg-black">
                <img 
                  src={selectedPhoto.photo_url} 
                  alt="Full size" 
                  className="w-full max-h-[60vh] object-contain" 
                />
                <button 
                  onClick={() => setSelectedPhoto(null)} 
                  className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  selectedPhoto.photo_type === 'before' ? 'bg-blue-500 text-white' :
                  selectedPhoto.photo_type === 'after' ? 'bg-emerald-500 text-white' :
                  selectedPhoto.photo_type === 'incident' ? 'bg-red-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {selectedPhoto.photo_type}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {selectedPhoto.employees?.first_name} {selectedPhoto.employees?.last_name}
                    </h3>
                    <p className="text-sm text-slate-500">{selectedPhoto.employees?.employee_code}</p>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={selectedPhoto.photo_url} 
                      download 
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                    <button 
                      onClick={() => {
                        setShowDeleteConfirm(selectedPhoto)
                      }}
                      disabled={deletingId === selectedPhoto.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deletingId === selectedPhoto.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Job</p>
                    <p className="font-medium text-slate-800 dark:text-white">{selectedPhoto.jobs?.title || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{selectedPhoto.jobs?.job_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Location</p>
                    <p className="font-medium text-slate-800 dark:text-white">{selectedPhoto.jobs?.site_address || 'N/A'}</p>
                  </div>
                </div>

                {selectedPhoto.caption && (
                  <div>
                    <p className="text-slate-500 text-xs">Caption</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedPhoto.caption}</p>
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Taken: {formatDate(selectedPhoto.taken_at)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Photo?</h3>
                <p className="text-slate-500 text-sm mb-1">
                  This action cannot be undone.
                </p>
                <p className="text-slate-400 text-xs mb-4">
                  The photo will be permanently deleted from storage.
                </p>
                
                {/* Preview thumbnail */}
                <div className="w-32 h-24 mx-auto mb-4 rounded-lg overflow-hidden bg-slate-200">
                  <img 
                    src={showDeleteConfirm.photo_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-500 mb-4 truncate">
                  {showDeleteConfirm.caption || showDeleteConfirm.jobs?.title || 'Job photo'}
                </p>

                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeletePhoto(showDeleteConfirm)}
                    disabled={deletingId === showDeleteConfirm.id}
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {deletingId === showDeleteConfirm.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
