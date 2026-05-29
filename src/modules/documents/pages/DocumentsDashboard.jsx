import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { documentsApi } from '../api/documentsApi'
import toast from 'react-hot-toast'
import { 
  FolderOpen, FileText, Upload, FileCheck, Shield, 
  BookOpen, Clock, Plus, Search, ArrowLeft,
  Sparkles, Sun, Moon
} from 'lucide-react'

export default function DocumentsDashboard() {
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [folders, setFolders] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [statsData, { data: f }, { data: docs }] = await Promise.all([
      documentsApi.getStats(),
      documentsApi.getFolders(),
      documentsApi.getDocuments()
    ])
    setStats(statsData)
    setFolders(f || [])
    setRecentDocs((docs || []).slice(0, 5))
    setLoading(false)
  }

  const folderIcons = {
    contracts: FileCheck,
    policies: Shield,
    sops: BookOpen,
    hr: FileText,
    finance: FileText,
    operations: FileText,
    general: FolderOpen,
  }

  const folderColors = {
    contracts: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    policies: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    sops: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    hr: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    finance: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    operations: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
    general: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30',
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
        <Link to="/dashboard" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Main Dashboard</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Document Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">Contracts, policies, SOPs, and document storage</p>
          </div>
          <button onClick={() => document.getElementById('fileUpload')?.click()} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Upload className="w-5 h-5" /><span>Upload</span>
          </button>
          <input id="fileUpload" type="file" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              await documentsApi.uploadDocument(file, { document_name: file.name, document_type: 'other' })
              toast.success('Document uploaded!')
              loadData()
            }
          }} />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Total Documents', value: stats.totalDocs || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: FileCheck, label: 'Contracts', value: stats.contracts || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: Shield, label: 'Policies', value: stats.policies || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
            { icon: BookOpen, label: 'SOPs', value: stats.sops || 0, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Folders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><FolderOpen className="w-5 h-5 text-emerald-600" />Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map(folder => {
              const Icon = folderIcons[folder.folder_type] || FolderOpen
              return (
                <motion.div key={folder.id} whileHover={{ scale: 1.02 }} className="neu-raised rounded-2xl p-5 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${folderColors[folder.folder_type]} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{folder.folder_name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{folder.description || folder.folder_type}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="neu-raised rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" />Recent Documents</h2>
          <div className="space-y-3">
            {recentDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{doc.document_name}</p>
                    <p className="text-xs text-slate-500">{doc.document_folders?.folder_name} · v{doc.version_number} · {new Date(doc.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${doc.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
