import { supabase } from '../../../lib/supabaseClient'

export const salesApi = {
  // ============================================
  // QUOTATIONS
  // ============================================
  async getQuotations(filters = {}) {
    var query = supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.client_id) query = query.eq('client_id', filters.client_id)
    if (filters.search) {
      query = query.or('quotation_number.ilike.%' + filters.search + '%,client_name.ilike.%' + filters.search + '%')
    }

    var result = await query
    return { data: result.data || [], error: result.error }
  },

  async getQuotation(id) {
    var result = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('id', id)
      .single()
    return { data: result.data, error: result.error }
  },

  async createQuotation(quotationData, items) {
    // Generate quotation number
    var existingResult = await supabase
      .from('quotations')
      .select('quotation_number')
      .order('created_at', { ascending: false })
      .limit(1)

    var nextNum = 1
    if (existingResult.data && existingResult.data.length > 0) {
      var lastQuote = existingResult.data[0].quotation_number || ''
      var parts = lastQuote.split('-')
      if (parts.length > 2) {
        nextNum = parseInt(parts[parts.length - 1]) + 1 || 1
      }
    }

    var yearSuffix = new Date().getFullYear().toString().slice(-2)
    var quotationNumber = 'Q-' + yearSuffix + '-' + String(nextNum).padStart(4, '0')

    var cleanData = {
      quotation_number: quotationNumber,
      client_id: quotationData.client_id || null,
      client_name: quotationData.client_name || null,
      client_email: quotationData.client_email || null,
      client_phone: quotationData.client_phone || null,
      client_address: quotationData.client_address || null,
      quotation_date: quotationData.quotation_date || new Date().toISOString().split('T')[0],
      valid_until: quotationData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_terms: quotationData.payment_terms || '30 Days',
      subtotal: quotationData.subtotal || 0,
      tax_rate: quotationData.tax_rate || 15,
      tax_amount: quotationData.tax_amount || 0,
      discount_type: quotationData.discount_type || 'none',
      discount_value: quotationData.discount_value || 0,
      discount_amount: quotationData.discount_amount || 0,
      total_amount: quotationData.total_amount || 0,
      status: quotationData.status || 'draft',
      notes: quotationData.notes || null,
      terms_and_conditions: quotationData.terms_and_conditions || null,
      prepared_by: quotationData.prepared_by || null
    }

    if (!cleanData.client_id) delete cleanData.client_id
    if (!cleanData.prepared_by) delete cleanData.prepared_by

    var quoteResult = await supabase
      .from('quotations')
      .insert([cleanData])
      .select('*')
      .single()

    if (quoteResult.error) return { error: quoteResult.error }

    if (items && items.length > 0) {
      var itemsData = items.map(function(item, index) {
        return {
          quotation_id: quoteResult.data.id,
          item_number: index + 1,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'each',
          unit_price: item.unit_price || 0,
          discount_percent: item.discount_percent || 0,
          tax_percent: item.tax_percent || 15
        }
      })

      await supabase.from('quotation_items').insert(itemsData)
    }

    return await salesApi.getQuotation(quoteResult.data.id)
  },

  async updateQuotation(id, updates) {
    var cleanUpdates = { ...updates }
    if (cleanUpdates.quotation_date === '') delete cleanUpdates.quotation_date
    if (cleanUpdates.valid_until === '') delete cleanUpdates.valid_until
    if (cleanUpdates.prepared_by === '') delete cleanUpdates.prepared_by
    if (cleanUpdates.client_id === '') delete cleanUpdates.client_id

    var result = await supabase
      .from('quotations')
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    return { data: result.data, error: result.error }
  },

  // Convert quotation to JOB (creates a job in operations)
  async convertQuotationToJob(quotationId) {
    console.log('Converting quotation to job:', quotationId)
    
    // Call the database function
    var result = await supabase
      .rpc('convert_quotation_to_job', { p_quotation_id: quotationId })

    if (result.error) {
      console.error('convertQuotationToJob error:', result.error)
      return { data: null, error: result.error }
    }

    // Fetch the created job
    if (result.data) {
      var jobResult = await supabase
        .from('jobs')
        .select('*')
        .eq('id', result.data)
        .single()
      
      return { data: jobResult.data, error: null }
    }

    return { data: null, error: { message: 'Failed to create job' } }
  },

  // Convert quotation to INVOICE
  async convertQuotationToInvoice(quotationId) {
    var quoteResult = await salesApi.getQuotation(quotationId)
    if (quoteResult.error || !quoteResult.data) return { error: quoteResult.error || 'Quotation not found' }

    var quotation = quoteResult.data
    var yearSuffix = new Date().getFullYear().toString().slice(-2)
    
    var existingInvResult = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)

    var nextInvNum = 1
    if (existingInvResult.data && existingInvResult.data.length > 0) {
      var lastInv = existingInvResult.data[0].invoice_number || ''
      var invParts = lastInv.split('-')
      if (invParts.length > 2) {
        nextInvNum = parseInt(invParts[invParts.length - 1]) + 1 || 1
      }
    }
    var invoiceNumber = 'INV-' + yearSuffix + '-' + String(nextInvNum).padStart(4, '0')

    var invResult = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        quotation_id: quotation.id,
        client_id: quotation.client_id,
        client_name: quotation.client_name,
        client_email: quotation.client_email,
        client_address: quotation.client_address,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: quotation.subtotal || 0,
        tax_rate: quotation.tax_rate || 15,
        tax_amount: quotation.tax_amount || 0,
        discount_amount: quotation.discount_amount || 0,
        total_amount: quotation.total_amount || 0,
        status: 'sent',
        notes: 'Converted from quotation ' + quotation.quotation_number
      }])
      .select('*')
      .single()

    if (invResult.error) return { error: invResult.error }

    if (quotation.quotation_items && quotation.quotation_items.length > 0) {
      var invoiceItems = quotation.quotation_items.map(function(item, index) {
        return {
          invoice_id: invResult.data.id,
          item_number: index + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          tax_percent: item.tax_percent || 15
        }
      })
      await supabase.from('invoice_items').insert(invoiceItems)
    }

    await supabase
      .from('quotations')
      .update({
        status: 'converted',
        converted_to_invoice: true,
        invoice_id: invResult.data.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', quotationId)

    return { data: invResult.data }
  },

  // ============================================
  // INVOICES
  // ============================================
  async getInvoices(filters = {}) {
    var query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.client_id) query = query.eq('client_id', filters.client_id)

    var result = await query
    return { data: result.data || [], error: result.error }
  },

  async getInvoice(id) {
    var result = await supabase
      .from('invoices')
      .select('*, invoice_items(*), payments(*)')
      .eq('id', id)
      .single()
    return { data: result.data, error: result.error }
  },

  async recordPayment(paymentData) {
    var cleanData = { ...paymentData }
    if (!cleanData.invoice_id || cleanData.invoice_id === '') delete cleanData.invoice_id
    if (!cleanData.client_id || cleanData.client_id === '') delete cleanData.client_id
    if (!cleanData.recorded_by || cleanData.recorded_by === '') delete cleanData.recorded_by
    if (cleanData.amount !== undefined) cleanData.amount = Number(cleanData.amount)

    var result = await supabase
      .from('payments')
      .insert([cleanData])
      .select('*')
      .single()

    return { data: result.data, error: result.error }
  },

  // ============================================
  // PRODUCTS/SERVICES
  // ============================================
  async getProductsServices() {
    var result = await supabase
      .from('products_services')
      .select('*')
      .eq('is_active', true)
      .order('category')
    return { data: result.data || [], error: result.error }
  },

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getSalesStats() {
    try {
      var currentMonth = new Date().toISOString().slice(0, 7)

      var totalQResult = await supabase.from('quotations').select('*', { count: 'exact', head: true })
      var pendingQResult = await supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('status', 'sent')
      var totalInvResult = await supabase.from('invoices').select('*', { count: 'exact', head: true })
      var unpaidInvResult = await supabase.from('invoices').select('*', { count: 'exact', head: true }).in('status', ['sent', 'overdue', 'partially_paid'])
      var monthlyResult = await supabase.from('invoices').select('total_amount').gte('invoice_date', currentMonth + '-01')
      var recentQResult = await supabase.from('quotations').select('*').order('created_at', { ascending: false }).limit(5)

      var monthlyTotal = (monthlyResult.data || []).reduce(function(sum, inv) {
        return sum + (inv.total_amount || 0)
      }, 0)

      return {
        totalQuotations: totalQResult.count || 0,
        pendingQuotations: pendingQResult.count || 0,
        totalInvoices: totalInvResult.count || 0,
        unpaidInvoices: unpaidInvResult.count || 0,
        monthlyTotal: monthlyTotal,
        recentQuotations: recentQResult.data || []
      }
    } catch (error) {
      console.error('getSalesStats error:', error)
      return { totalQuotations: 0, pendingQuotations: 0, totalInvoices: 0, unpaidInvoices: 0, monthlyTotal: 0, recentQuotations: [] }
    }
  }
}
