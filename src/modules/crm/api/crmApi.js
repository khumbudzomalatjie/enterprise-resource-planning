import { supabase } from '../../../lib/supabaseClient'

export const crmApi = {
  // ============================================
  // CLIENTS
  // ============================================
  async getClients(filters = {}) {
    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') query = query.eq('client_status', filters.status)
    if (filters.type && filters.type !== 'all') query = query.eq('client_type', filters.type)
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
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
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createClient(clientData) {
    console.log('API createClient called with:', clientData)
    
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select('*')
      .single()

    if (error) {
      console.error('API createClient error:', error)
      return { data: null, error }
    }
    
    console.log('API createClient success:', data)
    return { data, error: null }
  },

  async updateClient(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    return { data, error }
  },

  async deleteClient(id) {
    const { error } = await supabase
      .from('clients')
      .update({ client_status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  },

  // ============================================
  // CONTACTS
  // ============================================
  async getContacts(clientId = null) {
    let query = supabase
      .from('client_contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createContact(contactData) {
    const { data, error } = await supabase
      .from('client_contacts')
      .insert([contactData])
      .select('*')
      .single()
    return { data, error }
  },

  async updateContact(id, updates) {
    const { data, error } = await supabase
      .from('client_contacts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    return { data, error }
  },

  // ============================================
  // INTERACTIONS
  // ============================================
  async getInteractions(clientId = null) {
    let query = supabase
      .from('client_interactions')
      .select('*')
      .order('scheduled_date', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createInteraction(interactionData) {
    const { data, error } = await supabase
      .from('client_interactions')
      .insert([interactionData])
      .select('*')
      .single()
    return { data, error }
  },

  // ============================================
  // SERVICES
  // ============================================
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
      .select('*')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createClientService(serviceData) {
    const { data, error } = await supabase
      .from('client_services')
      .insert([serviceData])
      .select('*')
      .single()
    return { data, error }
  },

  // ============================================
  // PIPELINE
  // ============================================
  async getPipeline(filters = {}) {
    let query = supabase
      .from('sales_pipeline')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.stage && filters.stage !== 'all') query = query.eq('stage', filters.stage)
    if (filters.client_id) query = query.eq('client_id', filters.client_id)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createPipelineItem(itemData) {
    const { data, error } = await supabase
      .from('sales_pipeline')
      .insert([itemData])
      .select('*')
      .single()
    return { data, error }
  },

  async updatePipelineItem(id, updates) {
    const { data, error } = await supabase
      .from('sales_pipeline')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    return { data, error }
  },

  // ============================================
  // FEEDBACK
  // ============================================
  async getFeedback(clientId = null) {
    let query = supabase
      .from('client_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async createFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('client_feedback')
      .insert([feedbackData])
      .select('*')
      .single()
    return { data, error }
  },

  // ============================================
  // DOCUMENTS
  // ============================================
  async getDocuments(clientId = null) {
    let query = supabase
      .from('client_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getCRMStats() {
    try {
      const { count: totalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true })
      const { count: activeClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_status', 'active')
      const { count: personalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_type', 'personal')
      const { count: businessClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_type', 'business')
      const { data: recentClients } = await supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(5)
      const { data: pipeline } = await supabase.from('sales_pipeline').select('*').order('created_at', { ascending: false }).limit(10)

      const totalPipelineValue = (pipeline || []).reduce((sum, item) => sum + (item.estimated_value || 0), 0)

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        personalClients: personalClients || 0,
        businessClients: businessClients || 0,
        pipelineOpportunities: (pipeline || []).length,
        totalPipelineValue,
        pipeline: pipeline || [],
        recentClients: recentClients || []
      }
    } catch (error) {
      console.error('getCRMStats error:', error)
      return {
        totalClients: 0,
        activeClients: 0,
        personalClients: 0,
        businessClients: 0,
        pipelineOpportunities: 0,
        totalPipelineValue: 0,
        pipeline: [],
        recentClients: []
      }
    }
  }
}
