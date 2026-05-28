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
    console.log('API createClient raw data:', clientData)
    
    // Helper function to convert empty strings to null for UUID fields
    const nullIfEmpty = (value) => {
      if (value === '' || value === undefined || value === 'undefined' || value === null) {
        return null
      }
      return value
    }

    // Build a clean object with only non-empty values
    const cleanData = {}

    // Only add fields that have values (not undefined, not empty string for non-text fields)
    const fields = [
      // String fields - can be empty string
      'client_type', 'client_status', 'client_rating',
      'company_name', 'trading_name', 'registration_number', 'tax_number', 'vat_number',
      'industry', 'website',
      'first_name', 'last_name', 'gender', 'nationality', 'id_number',
      'contact_full_name', 'contact_position', 'contact_mobile', 'contact_email',
      'email', 'phone', 'mobile', 'alternative_phone', 'whatsapp_number',
      'preferred_contact_method',
      'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'postal_address',
      'occupation', 'employer', 'work_address', 'work_phone',
      'payment_terms', 'preferred_payment_method', 'currency', 'billing_cycle', 'billing_address',
      'bank_name', 'bank_account_number', 'bank_branch_code',
      'lead_source', 'pipeline_stage',
      'accounts_contact', 'hr_contact', 'technical_contact', 'support_contact',
      'products_purchased', 'services_subscribed', 'support_package', 'sla_details',
      'notes', 'tags'
    ]

    // Add string fields
    fields.forEach(field => {
      if (clientData[field] !== undefined && clientData[field] !== null) {
        cleanData[field] = clientData[field]
      }
    })

    // Date fields - convert empty to null
    const dateFields = ['date_of_birth', 'contract_start_date', 'contract_end_date', 'renewal_date', 'acquired_date']
    dateFields.forEach(field => {
      const value = nullIfEmpty(clientData[field])
      if (value) cleanData[field] = value
    })

    // Numeric fields - convert empty/NaN to null
    const numericFields = ['credit_limit', 'estimated_value', 'contract_value', 'annual_revenue']
    numericFields.forEach(field => {
      const value = clientData[field]
      if (value !== undefined && value !== null && value !== '' && !isNaN(Number(value))) {
        cleanData[field] = Number(value)
      }
    })

    // Boolean fields
    if (clientData['tax_exempt'] !== undefined) {
      cleanData['tax_exempt'] = clientData['tax_exempt'] === true || clientData['tax_exempt'] === 'true'
    }

    // UUID fields - MUST be null if empty, never empty string
    const uuidFields = ['assigned_to', 'account_manager_id', 'created_by']
    uuidFields.forEach(field => {
      const value = nullIfEmpty(clientData[field])
      if (value && value !== '') {
        cleanData[field] = value
      }
      // If empty, don't include the field at all - let database handle default
    })

    console.log('API createClient clean data:', cleanData)

    const { data, error } = await supabase
      .from('clients')
      .insert([cleanData])
      .select('*')
      .single()

    if (error) {
      console.error('API createClient error:', error)
      console.error('Error details:', error.message, error.details, error.hint)
      return { data: null, error }
    }
    
    console.log('API createClient success:', data)
    return { data, error: null }
  },

  async updateClient(id, updates) {
    // Clean UUID fields in updates too
    const cleanUpdates = { ...updates }
    
    // Remove empty UUID fields
    const uuidFields = ['assigned_to', 'account_manager_id', 'created_by']
    uuidFields.forEach(field => {
      if (cleanUpdates[field] === '' || cleanUpdates[field] === undefined) {
        delete cleanUpdates[field]
      }
    })

    const { data, error } = await supabase
      .from('clients')
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
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
    // Clean UUID fields
    const cleanData = { ...contactData }
    if (cleanData.client_id === '' || cleanData.client_id === undefined) {
      delete cleanData.client_id
    }

    const { data, error } = await supabase
      .from('client_contacts')
      .insert([cleanData])
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
    const cleanData = { ...interactionData }
    const uuidFields = ['client_id', 'contact_id', 'attended_by', 'created_by']
    uuidFields.forEach(field => {
      if (cleanData[field] === '' || cleanData[field] === undefined) {
        delete cleanData[field]
      }
    })

    const { data, error } = await supabase
      .from('client_interactions')
      .insert([cleanData])
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
    const cleanData = { ...serviceData }
    const uuidFields = ['client_id', 'service_type_id', 'created_by']
    uuidFields.forEach(field => {
      if (cleanData[field] === '' || cleanData[field] === undefined) {
        delete cleanData[field]
      }
    })

    const { data, error } = await supabase
      .from('client_services')
      .insert([cleanData])
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
    const cleanData = { ...itemData }
    const uuidFields = ['client_id', 'assigned_to', 'created_by']
    uuidFields.forEach(field => {
      if (cleanData[field] === '' || cleanData[field] === undefined) {
        delete cleanData[field]
      }
    })

    const { data, error } = await supabase
      .from('sales_pipeline')
      .insert([cleanData])
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
    const cleanData = { ...feedbackData }
    const uuidFields = ['client_id', 'resolved_by']
    uuidFields.forEach(field => {
      if (cleanData[field] === '' || cleanData[field] === undefined) {
        delete cleanData[field]
      }
    })

    const { data, error } = await supabase
      .from('client_feedback')
      .insert([cleanData])
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
