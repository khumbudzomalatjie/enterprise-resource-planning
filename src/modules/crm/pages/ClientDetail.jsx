import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useCRMStore from '../store/crmStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Building2, Phone, Mail, MapPin, Globe, 
  Star, Edit, ArrowLeft, Sun, Moon, Sparkles,
  Users, Briefcase, FileText, Calendar,
  ChevronRight
} from 'lucide-react'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedClient, fetchClient, loading, error } = useCRMStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Check if id is a valid UUID or 'new'
    if (!id || id === 'new') {
      // Redirect to client list or show add form
      navigate('/crm/clients', { replace: true })
      return
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      navigate('/crm/clients', { replace: true })
      return
    }
    
    loadClient()
  }, [id])

  const loadClient = async () => {
    const result = await fetchClient(id)
    if (!result.success) {
      setNotFound(true)
      toast.error('Client not found')
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading client...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !selectedClient) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center neu-raised rounded-3xl p-12">
            <Building2 className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-xl mb-2">Client not found</p>
            <p className="text-slate-400 dark:text-slate-500 mb-6">The client you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/crm/clients')}
              className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    )
  }

  const client = selectedClient

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      {/* Theme Toggle */}
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
          <Link to="/crm" className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            CRM
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/crm/clients" className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Clients
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium truncate">{client.company_name}</span>
        </div>

        {/* Client Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="neu-raised rounded-3xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{client.company_name}</h1>
                  {client.trading_name && (
                    <p className="text-slate-500 dark:text-slate-400">Trading as: {client.trading_name}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.client_status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : client.client_status === 'prospect'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {client.client_status?.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-slate-500">{client.client_code}</span>
                    <span className="text-sm text-slate-500 capitalize">{client.client_type?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/crm/clients/${client.id}/edit`)}
              className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex-shrink-0"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Client</span>
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            {client.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-slate-800 dark:text-white">{client.email}</p>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-slate-800 dark:text-white">{client.phone}</p>
                </div>
              </div>
            )}
            {client.city && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-slate-800 dark:text-white">{[client.city, client.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Website</p>
                  <p className="text-slate-800 dark:text-white truncate">{client.website}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Contacts
              </h3>
              <span className="text-sm text-slate-500">{client.client_contacts?.length || 0}</span>
            </div>
            <div className="space-y-3">
              {client.client_contacts?.map(contact => (
                <div key={contact.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                  <p className="font-medium text-slate-800 dark:text-white">
                    {contact.first_name} {contact.last_name}
                    {contact.is_primary && (
                      <span className="ml-2 text-xs text-emerald-600">(Primary)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{contact.job_title}</p>
                  <p className="text-xs text-slate-500">{contact.email}</p>
                  <p className="text-xs text-slate-500">{contact.phone}</p>
                </div>
              ))}
              {(!client.client_contacts || client.client_contacts.length === 0) && (
                <p className="text-center text-slate-400 py-4 text-sm">No contacts added</p>
              )}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                Services
              </h3>
              <span className="text-sm text-slate-500">{client.client_services?.length || 0}</span>
            </div>
            <div className="space-y-3">
              {client.client_services?.map(service => (
                <div key={service.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                  <p className="font-medium text-slate-800 dark:text-white">{service.service_name}</p>
                  <p className="text-xs text-slate-500">{service.service_types?.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-emerald-600 font-semibold">
                      R {service.price?.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      service.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!client.client_services || client.client_services.length === 0) && (
                <p className="text-center text-slate-400 py-4 text-sm">No services added</p>
              )}
            </div>
          </motion.div>

          {/* Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neu-raised rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Pipeline
              </h3>
              <span className="text-sm text-slate-500">{client.sales_pipeline?.length || 0}</span>
            </div>
            <div className="space-y-3">
              {client.sales_pipeline?.map(deal => (
                <div key={deal.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                  <p className="font-medium text-slate-800 dark:text-white">{deal.opportunity_name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400">
                      {deal.stage?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-slate-500">
                      R {deal.estimated_value?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              ))}
              {(!client.sales_pipeline || client.sales_pipeline.length === 0) && (
                <p className="text-center text-slate-400 py-4 text-sm">No pipeline deals</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Notes Section */}
        {client.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="neu-raised rounded-3xl p-6 mt-6"
          >
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Notes</h3>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{client.notes}</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
