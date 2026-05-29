import { supabase } from '../../../lib/supabaseClient'

export const mobileApi = {
  // Get assigned jobs for cleaner
  async getMyJobs(employeeId, date = null) {
    const today = date || new Date().toISOString().split('T')[0]
    
    // Get the actual employee record ID from user_id
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', employeeId)
      .single()

    if (!employee) {
      console.log('No employee record found for user:', employeeId)
      return { data: [] }
    }

    // Get jobs assigned to this employee
    const { data: assignments } = await supabase
      .from('job_assignments')
      .select('job_id')
      .eq('employee_id', employee.id)
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

  // Clock in/out - FIXED to use employee record ID
  async clockIn(userId, jobId, latitude, longitude) {
    // First get the employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!employee) {
      return { success: false, error: 'No employee record found. Please contact HR.' }
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert([{
        employee_id: employee.id, // Use employee.id NOT user_id
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

  async clockOut(userId) {
    // First get the employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!employee) {
      return { success: false, error: 'No employee record found. Please contact HR.' }
    }

    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ 
        clock_out_time: new Date().toISOString(), 
        check_out_method: 'gps' 
      })
      .eq('employee_id', employee.id)
      .eq('attendance_date', today)
      .select()
      .single()

    return { data, error }
  },

  // Photos - FIXED
  async uploadJobPhoto(jobId, userId, file, photoType, caption) {
    // Get employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!employee) {
      return { success: false, error: 'No employee record found.' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `job-photos/${jobId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('fleet')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      // Try creating bucket
      if (uploadError.message?.includes('not found')) {
        await supabase.storage.createBucket('fleet', { public: true, fileSizeLimit: 10485760 })
        const { error: retryError } = await supabase.storage
          .from('fleet')
          .upload(fileName, file, { upsert: true })
        if (retryError) return { error: retryError.message }
      } else {
        return { error: uploadError.message }
      }
    }

    const { data: { publicUrl } } = supabase.storage.from('fleet').getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('job_photos')
      .insert([{ 
        job_id: jobId, 
        employee_id: employee.id, 
        photo_type: photoType, 
        photo_url: publicUrl, 
        caption 
      }])
      .select()
      .single()

    return { data, error }
  },

  // Signature - FIXED
  async saveSignature(jobId, signatureUrl, clientName, rating) {
    const { data, error } = await supabase
      .from('client_signatures')
      .insert([{ 
        job_id: jobId, 
        signature_url: signatureUrl, 
        signed_by: clientName, 
        client_name: clientName, 
        satisfaction_rating: rating 
      }])
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

  // Supplies request - FIXED
  async createSuppliesRequest(requestData, items) {
    // Get employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', requestData.employee_id)
      .single()

    const { data: request, error } = await supabase
      .from('supplies_requests')
      .insert([{ 
        ...requestData, 
        employee_id: employee?.id || requestData.employee_id 
      }])
      .select()
      .single()

    if (error) return { error }
    if (items?.length) {
      await supabase.from('supplies_request_items').insert(
        items.map(item => ({ ...item, request_id: request.id }))
      )
    }
    return { data: request }
  },

  // Incident report - FIXED
  async reportIncident(incidentData) {
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', incidentData.employee_id)
      .single()

    const { data, error } = await supabase
      .from('incident_reports')
      .insert([{ ...incidentData, employee_id: employee?.id || incidentData.employee_id }])
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

  // Stats
  async getMobileStats(userId) {
    const today = new Date().toISOString().split('T')[0]
    
    // Get employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!employee) {
      return { jobsToday: 0, isClockedIn: false, clockInTime: null, completedJobs: 0 }
    }

    const { data: todayJobs } = await mobileApi.getMyJobs(userId, today)
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employee.id)
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
