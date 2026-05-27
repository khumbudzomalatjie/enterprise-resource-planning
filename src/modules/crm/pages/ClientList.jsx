import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useCRMStore from '../store/crmStore'
import useThemeStore from '../../../store/themeStore'
import { 
  Search, Building2, Plus, Star, MapPin, 
  Phone, Mail, ChevronRight, Sun, Moon, Sparkles
} from 'lucide-react'

export default function ClientList() {
  const { clients, fetchClients, loading } = useCRMStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadClients()
  }, [statusFilter, typeFilter])

  const loadClients = async () => {
    const filters = {}
    if (statusFilter !== 'all') filters.status = statusFilter
    if (typeFilter !== 'type') filters.type = typeFilter
    if (search) filters.search = search
    await fetchClients(filters)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadClients()
  }

  const getRatingStars = (rating) => {
    if (rating === 'A') return '⭐⭐⭐⭐⭐'
    if (rating === 'B') return '⭐⭐⭐⭐'
    if (rating === 'C') return '⭐⭐⭐'
    if (rating === 'D') return '⭐⭐'
    return '⭐'
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">
            Enterprise Resource Planning
          </span>
        </div>
        <button 
          onClick={toggleTheme}
          className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/crm" className="text-slate-500 hover:text-emerald-600">CRM</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Clients</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-600" />
              Clients
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your client portfolio</p>
          </div>
          
          <button
            onClick={() => navigate('/crm/clients/new')}
            className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neu-raised rounded-2xl p-4 mb-6"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
              <option value="former">Former</option>
            </select>

            <button
              type="submit"
              className="neu-raised neu-btn px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Client Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading clients...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/crm/clients/${client.id}`)}
                className="neu-raised rounded-2xl p-5 stat-card cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-lg">
                      {client.company_name}
                    </h3>
                    {client.trading_name && (
                      <p className="text-xs text-slate-500">{client.trading_name}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.client_status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : client.client_status === 'prospect'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {client.client_status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {client.city || 'No location'}
                  </p>
                  {client.phone && (
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </p>
                  )}
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email || 'No email'}</span>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-slate-500">{client.client_rating || 'Unrated'}</span>
                  </div>
                  <span className="text-xs text-slate-500">{client.client_code}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && clients.length === 0 && (
          <div className="text-center py-12 neu-raised rounded-3xl">
            <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No clients found</p>
            <button
              onClick={() => navigate('/crm/clients/new')}
              className="mt-4 neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Client</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
