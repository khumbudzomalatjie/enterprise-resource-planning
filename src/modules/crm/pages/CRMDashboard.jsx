import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useCRMStore from '../store/crmStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  Building2, Users, Phone, TrendingUp, 
  Star, AlertCircle, DollarSign, Target,
  Sparkles, Sun, Moon, ChevronRight, ArrowLeft,
  UserPlus, BarChart3, Briefcase, Calendar
} from 'lucide-react'

export default function CRMDashboard() {
  const { stats, fetchCRMStats, fetchPipeline, loading } = useCRMStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [pipelineStages, setPipelineStages] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const statsData = await fetchCRMStats()
    const pipelineResult = await fetchPipeline()
    if (pipelineResult.success) {
      // Group by stage
      const stages = {}
      pipelineResult.data.forEach(item => {
        if (!stages[item.stage]) stages[item.stage] = []
        stages[item.stage].push(item)
      })
      setPipelineStages(Object.entries(stages))
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount || 0)
  }

  const statCards = [
    { icon: Building2, label: 'Total Clients', value: stats.totalClients || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Users, label: 'Active Clients', value: stats.activeClients || 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Target, label: 'Pipeline Deals', value: stats.pipelineOpportunities || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: DollarSign, label: 'Pipeline Value', value: formatCurrency(stats.totalPipelineValue), color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: Star, label: 'Avg Rating', value: '4.2/5', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: AlertCircle, label: 'Open Issues', value: stats.openFeedback || 0, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  ]

  const stageColors = {
    lead: 'bg-slate-500',
    qualified: 'bg-blue-500',
    proposal_sent: 'bg-amber-500',
    negotiation: 'bg-purple-500',
    contract_sent: 'bg-indigo-500',
    won: 'bg-emerald-500',
    lost: 'bg-red-500',
    on_hold: 'bg-gray-400'
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
        <Link 
          to="/dashboard"
          className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="text-sm">Back to Main Dashboard</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                CRM & Client Management
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">
              Manage clients, contacts, services, and sales pipeline
            </p>
          </div>
          
          <button
            onClick={() => navigate('/crm/clients/new')}
            className="neu-raised neu-btn px-6 py-3 rounded-2xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'All Clients', icon: Building2, path: '/crm/clients' },
            { label: 'Contacts', icon: Phone, path: '/crm/contacts' },
            { label: 'Pipeline', icon: BarChart3, path: '/crm/pipeline' },
            { label: 'Services', icon: Briefcase, path: '/crm/services' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="neu-raised neu-btn rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
            >
              <action.icon className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="neu-raised rounded-2xl p-4 stat-card"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white truncate">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Pipeline View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Sales Pipeline
            </h2>
            <Link to="/crm/pipeline" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <div className="flex gap-4 min-w-max pb-4">
              {pipelineStages.map(([stage, items]) => (
                <div key={stage} className="neu-raised rounded-2xl p-4 w-64 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
                      {stage.replace('_', ' ')}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${stageColors[stage] || 'bg-slate-400'}`}></span>
                  </div>
                  <div className="space-y-2">
                    {items.slice(0, 3).map(item => (
                      <div key={item.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-3">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {item.clients?.company_name}
                        </p>
                        <p className="text-xs text-slate-500">{formatCurrency(item.estimated_value)}</p>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-slate-500 text-center">+{items.length - 3} more</p>
                    )}
                  </div>
                </div>
              ))}
              {pipelineStages.length === 0 && (
                <p className="text-slate-500 py-8">No pipeline deals yet</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neu-raised rounded-3xl p-6"
        >
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Recent Interactions
          </h2>
          <div className="space-y-3">
            {stats.recentInteractions?.map((interaction) => (
              <div key={interaction.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white text-sm">
                    {interaction.clients?.company_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {interaction.interaction_type?.replace('_', ' ')} · {interaction.subject}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {interaction.scheduled_date ? new Date(interaction.scheduled_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
            {(!stats.recentInteractions || stats.recentInteractions.length === 0) && (
              <p className="text-center text-slate-500 py-8">No recent interactions</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
