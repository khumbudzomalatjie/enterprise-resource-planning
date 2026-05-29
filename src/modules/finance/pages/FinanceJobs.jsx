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
  Building2, MapPin, Clock, User, Eye, Receipt
} from 'lucide-react'

export default function FinanceJobs() {
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [generatingInvoice, setGeneratingInvoice] = useState(null)

  useEffect(() => {
    loadCompletedJobs()
  }, [])

  const loadCompletedJobs = async () => {
    setLoading(true)
    
    // Get all completed jobs that don't have an invoice yet
    const { data, error } = await supabase
      .from('jobs')
      .select('*, clients(company_name, email, phone, address_line1, city, postal_code), job_categories(name), employees!jobs_assigned_to_fkey(first_name, last_name)')
      .eq('status', 'completed')
      .is('quotation_id', null)
      .order('actual_end_time', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load jobs')
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  const generateInvoice = async (job) => {
    if (!job.clients?.company_name) {
      toast.error('This job has no client assigned')
      return
    }

    setGeneratingInvoice(job.id)

    try {
      // 1. Create quotation first
      const quotationNumber = 'Q-' + new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
      
      const { data: quotation, error: qError } = await supabase
        .from('quotations')
        .insert([{
          quotation_number: quotationNumber,
          client_id: job.client_id,
          client_name: job.clients.company_name,
          client_email: job.clients.email,
          client_phone: job.clients.phone,
          client_address: `${job.clients.address_line1 || ''}, ${job.clients.city || ''} ${job.clients.postal_code || ''}`.trim(),
          quotation_date: new Date().toISOString().split('T')[0],
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: job.quoted_amount || 0,
          tax_rate: 15,
          tax_amount: (job.quoted_amount || 0) * 0.15,
          total_amount: (job.quoted_amount || 0) * 1.15,
          status: 'accepted',
          notes: `Generated from completed job: ${job.job_number} - ${job.title}`,
          payment_terms: '30 Days'
        }])
        .select()
        .single()

      if (qError) throw qError

      // 2. Add quotation item
      await supabase.from('quotation_items').insert([{
        quotation_id: quotation.id,
        item_number: 1,
        description: `${job.title} - ${job.job_categories?.name || 'Cleaning Service'}`,
        quantity: 1,
        unit: 'service',
        unit_price: job.quoted_amount || job.actual_cost || 0,
        tax_percent: 15
      }])

      // 3. Update quotation totals
      const totalAmount = (job.quoted_amount || job.actual_cost || 0) * 1.15
      await supabase.from('quotations').update({
        subtotal: job.quoted_amount || job.actual_cost || 0,
        tax_amount: (job.quoted_amount || job.actual_cost || 0) * 0.15,
        total_amount: totalAmount
      }).eq('id', quotation.id)

      // 4. Update job with quotation reference
      await supabase.from('jobs').update({ quotation_id: quotation.id }).eq('id', job.id)

      // 5. Create invoice from quotation
      const invoiceNumber = 'INV-' + new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
      
      const { data: invoice, error: iError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          quotation_id: quotation.id,
          client_id: job.client_id,
          client_name: job.clients.company_name,
          client_email: job.clients.email,
          client_address: `${job.clients.address_line1 || ''}, ${job.clients.city || ''}`.trim(),
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: job.quoted_amount || job.actual_cost || 0,
          tax_rate: 15,
          tax_amount: (job.quoted_amount || job.actual_cost || 0) * 0.15,
          total_amount: totalAmount,
          status: 'sent',
          notes: `Invoice for job: ${job.job_number} - ${job.title}`
        }])
        .select()
        .single()

      if (iError) throw iError

      // 6. Add invoice item
      await supabase.from('invoice_items').insert([{
        invoice_id: invoice.id,
        item_number: 1,
        description: `${job.title} - ${job.job_categories?.name || 'Cleaning Service'}`,
        quantity: 1,
        unit: 'service',
        unit_price: job.quoted_amount || job.actual_cost || 0,
        tax_percent: 15
      }])

      toast.success(`Invoice ${invoiceNumber} generated! ✅`)
      loadCompletedJobs() // Refresh list
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Failed to generate invoice: ' + error.message)
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
              {jobs.length} completed jobs ready for invoicing · Total Value: <span className="font-bold text-emerald-600">{formatCurrency(totalValue)}</span>
            </p>
          </div>
          <button onClick={loadCompletedJobs} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700">
            Refresh Jobs
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
            { icon: Briefcase, label: 'Ready to Invoice', value: jobs.length, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: DollarSign, label: 'Total Value', value: formatCurrency(totalValue), color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: CheckCircle2, label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
            { icon: Receipt, label: 'Invoiced', value: jobs.filter(j => j.quotation_id).length, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="neu-raised rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading completed jobs...</p>
          </div>
        ) : (
          <div className="neu-raised rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Job #</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Title</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Completed</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Amount</th>
                    <th className="text-center py-3 px-4 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{job.job_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-white">{job.title}</p>
                        {job.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{job.description}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{job.clients?.company_name || 'No Client'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {job.job_categories?.name ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            {job.job_categories.name}
                          </span>
                        ) : '-'}
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
                          <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Invoiced
                          </span>
                        ) : (
                          <button
                            onClick={() => generateInvoice(job)}
                            disabled={generatingInvoice === job.id || !job.clients?.company_name}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto transition-colors"
                            title={!job.clients?.company_name ? 'No client assigned to this job' : 'Generate invoice'}
                          >
                            {generatingInvoice === job.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Generating...
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

            {filteredJobs.length === 0 && !loading && (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-2">All jobs have been invoiced! 🎉</p>
                <p className="text-slate-400 text-sm">No completed jobs waiting for invoice generation.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
