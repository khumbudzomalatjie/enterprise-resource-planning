import { supabase } from '../../../lib/supabaseClient'

export const mobileApi = {
  // Get assigned jobs for cleaner
  async getMyJobs(employeeId, date = null) {
    const today = date || new Date().toISOString().split('T')[0]
    
    // Get jobs assigned to this employee
    const { data: assignments } = await supabase
      .from('job_assignments')
      .select('job_id')
      .eq('employee_id', employeeId)
      .eq('status', 'assigned')

    const jobIds = assignments?.map(a => a.job_id) || []

    if (jobIds.length === 0) return { data: [] }

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, clients(company_name, phone), job_categories(name, color)')
      .in('id', jobIds)
      .eq('scheduled_date', today)
      .order('scheduled_start_time', { ascending: true })

    return { data: jobs, error }
  },

  // Clock in/out
  async clockIn(employeeId, jobId, latitude, longitude) {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert([{
        employee_id: employeeId,
        attendance_date: new Date().toISOString().split('T')[0],
        clock_in_time: new Date().toISOString(),
        check_in_method: 'gps',
        check_in_latitude: latitude,
        check_in_longitude: longitude,
        status: 'present'
      }], { onConflict: 'employee_id,attendance_date' })
      .select()
      .single()
    return { data, error }
  },

  async clockOut(employeeId) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ clock_out_time: new Date().toISOString(), check_out_method: 'gps' })
      .eq('employee_id', employeeId)
      .eq('attendance_date', today)
      .select()
      .single()
    return { data, error }
  },

  // Photos
  async uploadJobPhoto(jobId, employeeId, file, photoType, caption) {
    const fileExt = file.name.split('.').pop()
    const fileName = `job-photos/${jobId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('fleet')
      .upload(fileName, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage.from('fleet').getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('job_photos')
      .insert([{ job_id: jobId, employee_id: employeeId, photo_type: photoType, photo_url: publicUrl, caption }])
      .select()
      .single()

    return { data, error }
  },

  // Signatures
  async saveSignature(jobId, signatureUrl, clientName, rating) {
    const { data, error } = await supabase
      .from('client_signatures')
      .insert([{ job_id: jobId, signature_url: signatureUrl, signed_by: clientName, client_name: clientName, satisfaction_rating: rating }])
      .select()
      .single()
    return { data, error }
  },

  // Task checklist
  async getJobTasks(jobId) {
    const { data, error } = await supabase
      .from('job_task_items')
      .select('*')
      .eq('job_id', jobId)
      .order('task_number')
    return { data, error }
  },

  async updateTaskItem(id, updates) {
    const { data, error } = await supabase
      .from('job_task_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Supplies request
  async createSuppliesRequest(requestData, items) {
    const { data: request, error } = await supabase
      .from('supplies_requests')
      .insert([requestData])
      .select()
      .single()

    if (error) return { error }
    if (items?.length) {
      await supabase.from('supplies_request_items').insert(items.map(item => ({ ...item, request_id: request.id })))
    }
    return { data: request }
  },

  // Incident report
  async reportIncident(incidentData) {
    const { data, error } = await supabase
      .from('incident_reports')
      .insert([incidentData])
      .select()
      .single()
    return { data, error }
  },

  // Profile
  async getMyProfile(userId) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Stats for mobile home
  async getMobileStats(employeeId) {
    const today = new Date().toISOString().split('T')[0]
    const { data: todayJobs } = await mobileApi.getMyJobs(employeeId, today)
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('attendance_date', today)
      .single()

    return {
      jobsToday: todayJobs?.length || 0,
      isClockedIn: !!attendance?.clock_in_time && !attendance?.clock_out_time,
      clockInTime: attendance?.clock_in_time || null,
      completedJobs: todayJobs?.filter(j => j.status === 'completed').length || 0
    }
  }
}
