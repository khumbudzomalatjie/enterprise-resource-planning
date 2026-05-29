import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { 
  Briefcase, FileText, DollarSign, CheckCircle2, 
  Search, ArrowLeft, Sun, Moon, Sparkles,
  Building2, MapPin, Clock, Receipt, RefreshCw
} from 'lucide-react'

export default function FinanceJobs() {
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [generatingInvoice, setGeneratingInvoice] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCompletedJobs()
  }, [])

  const loadCompletedJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // First, let's see what columns exist in the jobs table
      console.log('Loading completed jobs...')
      
      // Simple query first - get all completed jobs
      const { data: completedJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'completed')
        .order('actual_end_time', { ascending: false })
        .limit(50)

      if (jobsError) {
        console.error('Jobs query error:', jobsError)
        setError(jobsError.message)
        setLoading(false)
        return
      }

      console.log('Completed jobs found:', completedJobs?.length || 0)

      // If no jobs, set empty and return
      if (!completedJobs || completedJobs.length === 0) {
        setJobs([])
        setLoading(false)
        return
      }

      // For each job, try to get client info separately
      const jobsWithDetails = await Promise.all(
        completedJobs.map(async (job) => {
          let clientInfo = null
          let categoryInfo = null

          // Get client info if client_id exists
          if (job.client_id) {
            try {
              const { data: client } = await supabase
                .from('clients')
                .select('company_name, email, phone, address_line1, city, postal_code')
                .eq('id', job.client_id)
                .single()
              clientInfo = client
            } catch (e) {
              console.log('No client found for job:', job.id)
            }
          }

          // Get category info if job_category_id exists
          if (job.job_category_id) {
            try {
              const { data: category } = await supabase
                .from('job_categories')
                .select('name')
                .eq('id', job.job_category_id)
                .single()
              categoryInfo = category
            } catch (e) {
              console.log('No category found for job:', job.id)
            }
          }

          return {
            ...job,
            clients: clientInfo,
            job_categories: categoryInfo
          }
        })
      )

      setJobs(jobsWithDetails)
      console.log('Jobs with details:', jobsWithDetails.length)
      
    } catch (err) {
      console.error('Error loading jobs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  const generateInvoice = async (job) => {
    if (!job.client_id) {
      toast.error('This job has no client assigned. Please assign a client first.')
      return
    }

    setGeneratingInvoice(job.id)

    try {
      // Create quotation first
      const quotationNumber = 'Q-' + new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
      
      const quotationAmount = job.quoted_amount || job.actual_cost || 500 // Default R500 if no amount set
      
      const { data: quotation, error: qError } = await supabase
        .from('quotations')
        .insert([{
          quotation_number: quotationNumber,
          client_id: job.client_id,
          client_name: job.clients?.company_name || 'Client',
          client_email: job.clients?.email || '',
          client_phone: job.clients?.phone || '',
          client_address: [job.clients?.address_line1, job.clients?.city, job.clients?.postal_code].filter(Boolean).join(', ') || '',
          quotation_date: new Date().toISOString().split('T')[0],
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: quotationAmount,
          tax_rate: 15,
          tax_amount: quotationAmount * 0.15,
          total_amount: quotationAmount * 1.15,
          status: 'accepted',
          notes: `Generated from completed job: ${job.job_number} - ${job.title}`,
          payment_terms: '30 Days'
        }])
        .select()
        .single()

      if (qError) throw qError

      // Add quotation item
      await supabase.from('quotation_items').insert([{
        quotation_id: quotation.id,
        item_number: 1,
        description: `${job.title || 'Cleaning Service'} - ${job.job_categories?.name || 'Service'}`,
        quantity: 1,
        unit: 'service',
        unit_price: quotationAmount,
        tax_percent: 15
      }])

      // Create invoice
      const invoiceNumber = 'INV-' + new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
      
      const totalAmount = quotationAmount * 1.15
      
      const { data: invoice, error: iError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          quotation_id: quotation.id,
          client_id: job.client_id,
          client_name: job.clients?.company_name || 'Client',
          client_email: job.clients?.email || '',
          client_address: [job.clients?.address_line1, job.clients?.city].filter(Boolean).join(', ') || '',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: quotationAmount,
          tax_rate: 15,
          tax_amount: quotationAmount * 0.15,
          total_amount: totalAmount,
          status: 'sent',
          notes: `Invoice for job: ${job.job_number} - ${job.title}`
        }])
        .select()
        .single()

      if (iError) throw iError

      // Add invoice item
      await supabase.from('invoice_items').insert([{
        invoice_id: invoice.id,
        item_number: 1,
        description: `${job.title || 'Cleaning Service'} - ${job.job_categories?.name || 'Service'}`,
        quantity: 1,
        unit: 'service',
        unit_price: quotationAmount,
        tax_percent: 15
      }])

      // Update job with quotation reference
      await supabase.from('jobs').update({ quotation_id: quotation.id }).eq('id', job.id)

      toast.success(`Invoice ${invoiceNumber} generated successfully! ✅`)
      loadCompletedJobs()
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Failed to generate invoice: ' + (error.message || 'Unknown error'))
    } finally {
      setGeneratingInvoice(null)
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (!search) return true
    const s = search.toLowerCase()
    return (job.title || '').toLowerCase().includes(s) ||
           (job.job_number || '').toLowerCase().includes(s) ||
           (job.clients?.company_name || '').toLowerCase().includes(s) ||
           (job.site_address || '').toLowerCase().includes(s)
  })

  const totalValue = jobs.reduce((sum, job) => sum + (job.quoted_amount || job.actual_cost || 0), 0)
  const invoicedCount = jobs.filter(j => j.quotation_id).length
  const readyToInvoice = jobs.filter(j => !j.quotation_id).length

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
        <Link to="/finance" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /><span className="text-sm">Back to Finance</span>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Completed Jobs - Invoice Generation</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-11">
              {jobs.length} completed jobs · {readyToInvoice} ready for invoice · Total: <span className="font-bold text-emerald-600">{formatCurrency(totalValue)}</span>
            </p>
          </div>
          <button onClick={loadCompletedJobs} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Jobs
          </button>
        </motion.div>

        {/* Search */}
        <div className="neu-raised rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by job title, number, client, or address..." 
              className="w-full pl-10 pr-4 py-3 neu-inset rounded-xl text-slate-700 dark:text-slate-300 text-sm" 
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Briefcase, label: 'Total Completed', value: jobs.length, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: Receipt, label: 'Ready to Invoice', value: readyToInvoice, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
            { icon: CheckCircle2, label: 'Already Invoiced', value: invoicedCount, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: DollarSign, label: 'Total Value', value: formatCurrency(totalValue), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="neu-raised rounded-3xl p-8 mb-6 text-center border-2 border-red-200 dark:border-red-800">
            <p className="text-red-600 font-semibold mb-2">Error loading jobs</p>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button onClick={loadCompletedJobs} className="neu-raised neu-btn px-6 py-2 rounded-xl bg-red-600 text-white text-sm">
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading completed jobs...</p>
          </div>
        )}

        {/* Jobs Table */}
        {!loading && !error && (
          <div className="neu-raised rounded-3xl overflow-hidden">
            {filteredJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Job #</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Title</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Client</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Location</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Completed</th>
                      <th className="text-right py-3 px-4 text-slate-500 font-medium">Amount</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-slate-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(job => (
                      <tr key={job.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{job.job_number || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 dark:text-white">{job.title || 'Untitled Job'}</p>
                          {job.job_categories?.name && (
                            <span className="text-xs text-slate-500">{job.job_categories.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {job.clients?.company_name ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400">{job.clients.company_name}</span>
                            </div>
                          ) : (
                            <span className="text-red-500 text-xs italic">No client assigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{job.site_address || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(job.actual_end_time)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(job.quoted_amount || job.actual_cost)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {job.quotation_id ? (
                            <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Invoiced
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              Ready
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {job.quotation_id ? (
                            <span className="text-xs text-slate-400">-</span>
                          ) : (
                            <button
                              onClick={() => generateInvoice(job)}
                              disabled={generatingInvoice === job.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto transition-colors"
                              title={!job.client_id ? 'No client assigned' : 'Generate invoice'}
                            >
                              {generatingInvoice === job.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  ...
                                </>
                              ) : (
                                <>
                                  <Receipt className="w-3 h-3" /> Generate Invoice
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-2">No completed jobs found</p>
                <p className="text-slate-400 text-sm">
                  {jobs.length === 0 
                    ? 'There are no completed jobs in the system yet. Jobs will appear here once they are marked as completed.' 
                    : 'All completed jobs match your search. Try different search terms.'}
                </p>
                {jobs.length === 0 && (
                  <button onClick={() => navigate('/operations/jobs/new')} className="mt-4 neu-raised neu-btn px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm">
                    Create a Job
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
