import { supabase, getPublicUrl } from '../../../lib/supabaseClient'

export const hrApi = {
  // Employees
  async getEmployees(filters = {}) {
    let query = supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.department) query = query.eq('department', filters.department)
    if (filters.status) query = query.eq('employment_status', filters.status)
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    return { data, error }
  },

  async getEmployee(id) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, contracts(*), leave_requests(*), training_records(*), disciplinary_records(*)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createEmployee(employeeData) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single()
    return { data, error }
  },

  async updateEmployee(id, updates) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteEmployee(id) {
    const { error } = await supabase
      .from('employees')
      .update({ employment_status: 'terminated' })
      .eq('id', id)
    return { error }
  },

  // Contracts
  async getContracts(employeeId = null) {
    let query = supabase
      .from('contracts')
      .select('*, employees(first_name, last_name, employee_code)')
      .order('created_at', { ascending: false })

    if (employeeId) query = query.eq('employee_id', employeeId)

    const { data, error } = await query
    return { data, error }
  },

  async createContract(contractData) {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single()
    return { data, error }
  },

  async updateContract(id, updates) {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Leave Management
  async getLeaveRequests(filters = {}) {
    let query = supabase
      .from('leave_requests')
      .select('*, employees(first_name, last_name, employee_code), leave_types(name)')
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.employee_id) query = query.eq('employee_id', filters.employee_id)
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    return { data, error }
  },

  async createLeaveRequest(requestData) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([requestData])
      .select()
      .single()
    return { data, error }
  },

  async updateLeaveRequest(id, updates) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async getLeaveTypes() {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .order('name')
    return { data, error }
  },

  // Training Records
  async getTrainingRecords(employeeId = null) {
    let query = supabase
      .from('training_records')
      .select('*, employees(first_name, last_name)')
      .order('created_at', { ascending: false })

    if (employeeId) query = query.eq('employee_id', employeeId)

    const { data, error } = await query
    return { data, error }
  },

  async createTrainingRecord(trainingData) {
    const { data, error } = await supabase
      .from('training_records')
      .insert([trainingData])
      .select()
      .single()
    return { data, error }
  },

  async updateTrainingRecord(id, updates) {
    const { data, error } = await supabase
      .from('training_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Disciplinary Records
  async getDisciplinaryRecords(employeeId = null) {
    let query = supabase
      .from('disciplinary_records')
      .select('*, employees(first_name, last_name)')
      .order('created_at', { ascending: false })

    if (employeeId) query = query.eq('employee_id', employeeId)

    const { data, error } = await query
    return { data, error }
  },

  async createDisciplinaryRecord(recordData) {
    const { data, error } = await supabase
      .from('disciplinary_records')
      .insert([recordData])
      .select()
      .single()
    return { data, error }
  },

  async updateDisciplinaryRecord(id, updates) {
    const { data, error } = await supabase
      .from('disciplinary_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // STORAGE FUNCTIONS
  // ============================================

  // Upload employee photo
  async uploadEmployeePhoto(employeeId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${employeeId}/photo.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) return { error }
    
    // Get public URL
    const publicUrl = getPublicUrl('employee-photos', fileName)
    
    // Update employee record with photo URL
    await supabase
      .from('employees')
      .update({ profile_photo_url: publicUrl })
      .eq('id', employeeId)

    return { data: { path: fileName, url: publicUrl }, error: null }
  },

  // Upload employee document
  async uploadEmployeeDocument(employeeId, file) {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${employeeId}/${timestamp}_${file.name}`
    
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) return { error }

    const publicUrl = getPublicUrl('employee-documents', fileName)

    // Create document record
    const { data: docData, error: docError } = await supabase
      .from('employee_documents')
      .insert([{
        employee_id: employeeId,
        document_type: 'other',
        document_name: file.name,
        document_url: publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single()

    if (docError) return { error: docError }

    return { data: { ...docData, url: publicUrl }, error: null }
  },

  // Get employee documents
  async getEmployeeDocuments(employeeId) {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('uploaded_at', { ascending: false })

    return { data, error }
  },

  // Delete employee document
  async deleteEmployeeDocument(documentId) {
    // First get the document to find the storage path
    const { data: doc, error: fetchError } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError) return { error: fetchError }

    // Delete from storage
    const urlParts = doc.document_url.split('/')
    const storagePath = urlParts.slice(urlParts.indexOf('employee-documents') + 1).join('/')
    
    await supabase.storage
      .from('employee-documents')
      .remove([storagePath])

    // Delete record
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', documentId)

    return { error }
  },

  // Get file for viewing/downloading
  async getDocumentForView(documentId) {
    const { data: doc, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error) return { error }

    return { data: doc, error: null }
  },

  // Dashboard Stats
  async getHRStats() {
    const [
      { count: totalEmployees },
      { count: activeEmployees },
      { count: pendingLeave },
      { count: activeContracts },
      { count: ongoingTraining }
    ] = await Promise.all([
      supabase.from('employees').select('*', { count: 'exact', head: true }),
      supabase.from('employees').select('*', { count: 'exact', head: true }).eq('employment_status', 'active'),
      supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('training_records').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    ])

    return {
      totalEmployees: totalEmployees || 0,
      activeEmployees: activeEmployees || 0,
      pendingLeave: pendingLeave || 0,
      activeContracts: activeContracts || 0,
      ongoingTraining: ongoingTraining || 0,
    }
  }
}
