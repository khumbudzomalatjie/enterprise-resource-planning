import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { AlertCircle, ArrowLeft, Search, Filter, CheckCircle2, Eye, Sun, Moon, Sparkles } from 'lucide-react'

export default function IncidentReports() {
  const { isDark, toggleTheme } = useThemeStore()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedIncident, setSelectedIncident] = useState(null)

  useEffect(() => { loadIncidents() }, [statusFilter, severityFilter])

  const loadIncidents = async () => {
    setLoading(true)
    let query = supabase
      .from('incident_reports')
      .select('*, employees(first_name, last_name, employee_code, phone), jobs(title, job_number, site_address)')
      .order('incident_date', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (severityFilter !== 'all') query = query.eq('severity', severityFilter)

    const { data } = await query
    setIncidents(data || [])
    setLoading(false)
  }

  const handleResolve = async (id) => {
    await supabase.from('incident_reports').update({ status: 'resolved' }).eq('id', id)
    toast.success('Incident resolved!')
    loadIncidents()
  }

  const filteredIncidents = incidents.filter(i => {
    if (!search) return true
    const s = search.toLowerCase()
    return (i.employees?.first_name || '').toLowerCase().includes(s) ||
           (i.employees?.last_name || '').toLowerCase().includes(s) ||
           (i.description || '').toLowerCase().includes(s) ||
           (i.incident_type || '').toLowerCase().includes(s)
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

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />Incident Reports
        </h1>

        {/* Filters */}
        <div className="neu-raised rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents..." className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-sm">
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="px-4 py-3 neu-inset rounded-xl text-sm">
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Incidents Table */}
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div></div>
        ) : (
          <div className="neu-raised rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 text-slate-500">Cleaner</th>
                    <th className="text-left py-3 px-4 text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 text-slate-500">Severity</th>
                    <th className="text-left py-3 px-4 text-slate-500">Description</th>
                    <th className="text-left py-3 px-4 text-slate-500">Job</th>
                    <th className="text-left py-3 px-4 text-slate-500">Status</th>
                    <th className="text-right py-3 px-4 text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map(incident => (
                    <tr key={incident.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-xs">{new Date(incident.incident_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium">{incident.employees?.first_name} {incident.employees?.last_name}</td>
                      <td className="py-3 px-4 capitalize">{incident.incident_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          incident.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          incident.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{incident.severity}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{incident.description?.slice(0, 60)}</td>
                      <td className="py-3 px-4 text-xs">{incident.jobs?.job_number || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          incident.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          incident.status === 'investigating' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{incident.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedIncident(incident)} className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                          {incident.status !== 'resolved' && (
                            <button onClick={() => handleResolve(incident.id)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600" title="Resolve"><CheckCircle2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
