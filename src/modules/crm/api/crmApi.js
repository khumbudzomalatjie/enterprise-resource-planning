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
    return { data, error }
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
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()
    return { data, error }
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
    return { data, error }
  },

  async createContact(contactData) {
    const { data, error } = await supabase
      .from('client_contacts')
      .insert([contactData])
      .select()
      .single()
    return { data, error }
  },

  async updateContact(id, updates) {
    const { data, error } = await supabase
      .from('client_contacts')
      .update(updates)
      .eq('id', id)
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
    return { data, error }
  },

  async createInteraction(interactionData) {
    const { data, error } = await supabase
      .from('client_interactions')
      .insert([interactionData])
      .select()
      .single()
    return { data, error }
  },

  async updateInteraction(id, updates) {
    const { data, error } = await supabase
      .from('client_interactions')
      .update(updates)
      .eq('id', id)
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
    return { data, error }
  },

  async getClientServices(clientId = null) {
    let query = supabase
      .from('client_services')
      .select('*, clients(company_name), service_types(*)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data, error }
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
    return { data, error }
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
    return { data, error }
  },

  async createFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('client_feedback')
      .insert([feedbackData])
      .select()
      .single()
    return { data, error }
  },

  // Documents
  async getDocuments(clientId = null) {
    let query = supabase
      .from('client_documents')
      .select('*, clients(company_name)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data, error }
  },

  // Dashboard Stats
  async getCRMStats() {
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

    const totalPipelineValue = pipeline?.reduce((sum, item) => sum + (item.estimated_value || 0), 0) || 0

    return {
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      pipelineOpportunities: pipelineValue || 0,
      openFeedback: openFeedback || 0,
      totalPipelineValue,
      pipeline: pipeline || [],
      recentInteractions: recentInteractions || []
    }
  }
}
