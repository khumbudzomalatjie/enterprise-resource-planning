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

    if (filters.status) query = query.eq('client_status', filters.status)
    if (filters.type) query = query.eq('client_type', filters.type)
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,trading_name.ilike.%${filters.search}%,client_code.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
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
    console.log('API: Creating client with data:', clientData)
    
    // Check for required fields based on client type
    if (clientData.client_type === 'personal') {
      if (!clientData.first_name && !clientData.last_name) {
        return { data: null, error: { message: 'First name or Last name is required for personal clients' } }
      }
    } else {
      if (!clientData.company_name) {
        return { data: null, error: { message: 'Company name is required for business clients' } }
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        // Basic Info - Common
        client_type: clientData.client_type || 'business',
        client_status: clientData.client_status || 'active',
        client_rating: clientData.client_rating || 'unrated',
        
        // Business Fields
        company_name: clientData.company_name || null,
        trading_name: clientData.trading_name || null,
        registration_number: clientData.registration_number || null,
        tax_number: clientData.tax_number || null,
        vat_number: clientData.vat_number || null,
        industry: clientData.industry || null,
        website: clientData.website || null,
        
        // Personal Fields
        first_name: clientData.first_name || null,
        last_name: clientData.last_name || null,
        gender: clientData.gender || null,
        date_of_birth: clientData.date_of_birth || null,
        nationality: clientData.nationality || null,
        id_number: clientData.id_number || null,
        
        // Primary Contact (Business)
        contact_full_name: clientData.contact_full_name || null,
        contact_position: clientData.contact_position || null,
        contact_mobile: clientData.contact_mobile || null,
        contact_email: clientData.contact_email || null,
        
        // Contact Information
        email: clientData.email || null,
        phone: clientData.phone || null,
        mobile: clientData.mobile || null,
        alternative_phone: clientData.alternative_phone || null,
        whatsapp_number: clientData.whatsapp_number || null,
        preferred_contact_method: clientData.preferred_contact_method || 'email',
        
        // Address Information
        address_line1: clientData.address_line1 || null,
        address_line2: clientData.address_line2 || null,
        city: clientData.city || null,
        state: clientData.state || null,
        postal_code: clientData.postal_code || null,
        country: clientData.country || 'South Africa',
        postal_address: clientData.postal_address || null,
        
        // Work/Business Information
        occupation: clientData.occupation || null,
        employer: clientData.employer || null,
        work_address: clientData.work_address || null,
        work_phone: clientData.work_phone || null,
        
        // Financial Information
        payment_terms: clientData.payment_terms || '30_days',
        credit_limit: clientData.credit_limit || null,
        preferred_payment_method: clientData.preferred_payment_method || null,
        tax_exempt: clientData.tax_exempt || false,
        currency: clientData.currency || 'ZAR',
        billing_cycle: clientData.billing_cycle || 'monthly',
        billing_address: clientData.billing_address || null,
        
        // Bank Details
        bank_name: clientData.bank_name || null,
        bank_account_number: clientData.bank_account_number || null,
        bank_branch_code: clientData.bank_branch_code || null,
        
        // CRM & Sales Information
        lead_source: clientData.lead_source || null,
        pipeline_stage: clientData.pipeline_stage || 'lead',
        estimated_value: clientData.estimated_value || null,
        assigned_to: clientData.assigned_to || null,
        contract_start_date: clientData.contract_start_date || null,
        contract_end_date: clientData.contract_end_date || null,
        renewal_date: clientData.renewal_date || null,
        
        // Business Additional Contacts
        accounts_contact: clientData.accounts_contact || null,
        hr_contact: clientData.hr_contact || null,
        technical_contact: clientData.technical_contact || null,
        support_contact: clientData.support_contact || null,
        
        // Services & Products
        products_purchased: clientData.products_purchased || null,
        services_subscribed: clientData.services_subscribed || null,
        support_package: clientData.support_package || null,
        sla_details: clientData.sla_details || null,
        
        // Notes & Tags
        notes: clientData.notes || null,
        tags: clientData.tags || null,
        
        // Additional fields
        annual_revenue: clientData.annual_revenue || null,
        contract_value: clientData.contract_value || null,
        account_manager_id: clientData.account_manager_id || null,
        acquired_date: clientData.acquired_date || null,
      }])
      .select()
      .single()

    if (error) {
      console.error('createClient error:', error)
      return { data: null, error }
    }

    console.log('API: Client created:', data)
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

  // ============================================
  // CONTACTS
  // ============================================
  async getContacts(clientId = null) {
    let query = supabase
      .from('client_contacts')
      .select('*, clients(company_name, first_name, last_name)')
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

  async updateContact(id, updates) {
    const { data, error } = await supabase
      .from('client_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteContact(id) {
    const { error } = await supabase
      .from('client_contacts')
      .update({ is_active: false })
      .eq('id', id)
    return { error }
  },

  // ============================================
  // INTERACTIONS
  // ============================================
  async getInteractions(clientId = null) {
    let query = supabase
      .from('client_interactions')
      .select('*, clients(company_name, first_name, last_name), client_contacts(first_name, last_name)')
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

  async updateInteraction(id, updates) {
    const { data, error } = await supabase
      .from('client_interactions')
      .update(updates)
      .eq('id', id)
      .select()
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
      .select('*, clients(company_name, first_name, last_name), service_types(*)')
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

  async updateClientService(id, updates) {
    const { data, error } = await supabase
      .from('client_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // PIPELINE
  // ============================================
  async getPipeline(filters = {}) {
    let query = supabase
      .from('sales_pipeline')
      .select('*, clients(company_name, client_code, first_name, last_name)')
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

  // ============================================
  // FEEDBACK
  // ============================================
  async getFeedback(clientId = null) {
    let query = supabase
      .from('client_feedback')
      .select('*, clients(company_name, first_name, last_name)')
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

  async updateFeedback(id, updates) {
    const { data, error } = await supabase
      .from('client_feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // DOCUMENTS
  // ============================================
  async getDocuments(clientId = null) {
    let query = supabase
      .from('client_documents')
      .select('*, clients(company_name, first_name, last_name)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    return { data: data || [], error }
  },

  async uploadDocument(documentData) {
    const { data, error } = await supabase
      .from('client_documents')
      .insert([documentData])
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getCRMStats() {
    try {
      const [
        { count: totalClients },
        { count: activeClients },
        { count: personalClients },
        { count: businessClients },
        { count: pipelineValue },
        { count: openFeedback },
        { count: wonDeals },
        { data: pipeline },
        { data: recentInteractions }
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_status', 'active'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_type', 'personal'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('client_type', 'business'),
        supabase.from('sales_pipeline').select('*', { count: 'exact', head: true }).eq('stage', 'proposal_sent'),
        supabase.from('client_feedback').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('sales_pipeline').select('*', { count: 'exact', head: true }).eq('stage', 'won'),
        supabase.from('sales_pipeline').select('*, clients(company_name, first_name, last_name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('client_interactions').select('*, clients(company_name, first_name, last_name)').order('scheduled_date', { ascending: false }).limit(5)
      ])

      const totalPipelineValue = (pipeline || []).reduce((sum, item) => sum + (item.estimated_value || 0), 0)

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        personalClients: personalClients || 0,
        businessClients: businessClients || 0,
        pipelineOpportunities: pipelineValue || 0,
        openFeedback: openFeedback || 0,
        wonDeals: wonDeals || 0,
        totalPipelineValue,
        pipeline: pipeline || [],
        recentInteractions: recentInteractions || []
      }
    } catch (error) {
      console.error('getCRMStats error:', error)
      return {
        totalClients: 0,
        activeClients: 0,
        personalClients: 0,
        businessClients: 0,
        pipelineOpportunities: 0,
        openFeedback: 0,
        wonDeals: 0,
        totalPipelineValue: 0,
        pipeline: [],
        recentInteractions: []
      }
    }
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  async searchClients(searchTerm) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, company_name, first_name, last_name, client_code, client_type')
      .or(`company_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,client_code.ilike.%${searchTerm}%`)
      .limit(20)
    return { data: data || [], error }
  },

  async getClientOptions() {
    const { data, error } = await supabase
      .from('clients')
      .select('id, company_name, first_name, last_name, client_code, client_type')
      .order('company_name')
    return { data: data || [], error }
  }
}
