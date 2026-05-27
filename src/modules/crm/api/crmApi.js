import { supabase } from '../../../lib/supabaseClient'

export const crmApi = {
  // Clients
  async getClients(filters = {}) {
    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('client_status', filters.status)
    if (filters.type) query = query.eq('client_type', filters.type)
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,trading_name.ilike.%${filters.search}%,client_code.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) {
      console.error('getClients error:', error)
      return { data: [], error }
    }
    return { data: data || [], error: null }
  },

  async getClient(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*, client_contacts(*), client_services(*, service_types(*)), sales_pipeline(*)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createClient(clientData) {
    console.log('API: Creating client with data:', clientData) // Debug log
    
    // Ensure required fields
    if (!clientData.company_name) {
      return { data: null, error: { message: 'Company name is required' } }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        company_name: clientData.company_name,
        trading_name: clientData.trading_name || null,
        registration_number: clientData.registration_number || null,
        tax_number: clientData.tax_number || null,
        vat_number: clientData.vat_number || null,
        industry: clientData.industry || null,
        client_type: clientData.client_type || 'corporate',
        client_status: clientData.client_status || 'active',
        email: clientData.email || null,
        phone: clientData.phone || null,
        alternative_phone: clientData.alternative_phone || null,
        website: clientData.website || null,
        address_line1: clientData.address_line1 || null,
        address_line2: clientData.address_line2 || null,
        city: clientData.city || null,
        state: clientData.state || null,
        postal_code: clientData.postal_code || null,
        country: clientData.country || 'South Africa',
        billing_address: clientData.billing_address || null,
        payment_terms: clientData.payment_terms || '30_days',
        credit_limit: clientData.credit_limit || null,
        tax_exempt: clientData.tax_exempt || false,
        client_rating: clientData.client_rating || 'unrated',
        notes: clientData.notes || null,
      }])
      .select()
      .single()

    if (error) {
      console.error('createClient error:', error)
      return { data: null, error }
    }

    console.log('API: Client created:', data) // Debug log
    return { data, error: null }
  },

  async updateClient(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Contacts
  async getContacts(clientId = null) {
    let query = supabase
      .from('client_contacts')
      .select('*, clients(company_name)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createContact(contactData) {
    const { data, error } = await supabase
      .from('client_contacts')
      .insert([contactData])
      .select()
      .single()
    return { data, error }
  },

  // Interactions
  async getInteractions(clientId = null) {
    let query = supabase
      .from('client_interactions')
      .select('*, clients(company_name), client_contacts(first_name, last_name)')
      .order('scheduled_date', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createInteraction(interactionData) {
    const { data, error } = await supabase
      .from('client_interactions')
      .insert([interactionData])
      .select()
      .single()
    return { data, error }
  },

  // Services
  async getServiceTypes() {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data: data || [], error }
  },

  async getClientServices(clientId = null) {
    let query = supabase
      .from('client_services')
      .select('*, clients(company_name), service_types(*)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createClientService(serviceData) {
    const { data, error } = await supabase
      .from('client_services')
      .insert([serviceData])
      .select()
      .single()
    return { data, error }
  },

  // Pipeline
  async getPipeline(filters = {}) {
    let query = supabase
      .from('sales_pipeline')
      .select('*, clients(company_name, client_code)')
      .order('created_at', { ascending: false })

    if (filters.stage) query = query.eq('stage', filters.stage)
    if (filters.client_id) query = query.eq('client_id', filters.client_id)
    if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createPipelineItem(itemData) {
    const { data, error } = await supabase
      .from('sales_pipeline')
      .insert([itemData])
      .select()
      .single()
    return { data, error }
  },

  async updatePipelineItem(id, updates) {
    const { data, error } = await supabase
      .from('sales_pipeline')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Feedback
  async getFeedback(clientId = null) {
    let query = supabase
      .from('client_feedback')
      .select('*, clients(company_name)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('client_feedback')
      .insert([feedbackData])
      .select()
      .single()
    return { data, error }
  },

  // Dashboard Stats
  async getCRMStats() {
    try {
      const [
        { count: totalClients },
        { count: activeClients },
        { count: pipelineValue },
        { count: openFeedback },
        { data: pipeline },
        { data: recentInteractions }
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_status', 'active'),
        supabase.from('sales_pipeline').select('*', { count: 'exact', head: true }).eq('stage', 'proposal_sent'),
        supabase.from('client_feedback').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('sales_pipeline').select('*, clients(company_name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('client_interactions').select('*, clients(company_name)').order('scheduled_date', { ascending: false }).limit(5)
      ])

      const totalPipelineValue = (pipeline || []).reduce((sum, item) => sum + (item.estimated_value || 0), 0)

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        pipelineOpportunities: pipelineValue || 0,
        openFeedback: openFeedback || 0,
        totalPipelineValue,
        pipeline: pipeline || [],
        recentInteractions: recentInteractions || []
      }
    } catch (error) {
      console.error('getCRMStats error:', error)
      return {
        totalClients: 0,
        activeClients: 0,
        pipelineOpportunities: 0,
        openFeedback: 0,
        totalPipelineValue: 0,
        pipeline: [],
        recentInteractions: []
      }
    }
  }
}
