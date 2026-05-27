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
  Users, Briefcase, FileText, Calendar
} from 'lucide-react'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedClient, fetchClient, loading } = useCRMStore()
  const { isDark, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (id) fetchClient(id)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!selectedClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Client not found</p>
        </div>
      </div>
    )
  }

  const client = selectedClient

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
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/crm" className="text-slate-500 hover:text-emerald-600">CRM</Link>
          <span className="text-slate-400">/</span>
          <Link to="/crm/clients" className="text-slate-500 hover:text-emerald-600">Clients</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 dark:text-white font-medium">{client.company_name}</span>
        </div>

        {/* Client Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-3xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{client.company_name}</h1>
              {client.trading_name && <p className="text-slate-500">{client.trading_name}</p>}
              <div className="flex items-center gap-4 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  client.client_status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {client.client_status}
                </span>
                <span className="text-sm text-slate-500">{client.client_code}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/crm/clients/${client.id}/edit`)}
              className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Client</span>
            </button>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.city && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{client.city}, {client.state}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                <span>{client.website}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neu-raised rounded-3xl p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              Contacts ({client.client_contacts?.length || 0})
            </h3>
            {client.client_contacts?.map(contact => (
              <div key={contact.id} className="py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <p className="font-medium text-slate-800 dark:text-white">{contact.first_name} {contact.last_name}</p>
                <p className="text-xs text-slate-500">{contact.job_title}</p>
                <p className="text-xs text-slate-500">{contact.email}</p>
              </div>
            ))}
          </div>

          <div className="neu-raised rounded-3xl p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Services ({client.client_services?.length || 0})
            </h3>
            {client.client_services?.map(service => (
              <div key={service.id} className="py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <p className="font-medium text-slate-800 dark:text-white">{service.service_name}</p>
                <p className="text-xs text-slate-500">{service.service_types?.name}</p>
              </div>
            ))}
          </div>

          <div className="neu-raised rounded-3xl p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-600" />
              Pipeline ({client.sales_pipeline?.length || 0})
            </h3>
            {client.sales_pipeline?.map(deal => (
              <div key={deal.id} className="py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <p className="font-medium text-slate-800 dark:text-white">{deal.opportunity_name}</p>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {deal.stage?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
