import { create } from 'zustand'
import { operationsApi } from '../api/operationsApi'

const useOperationsStore = create((set, get) => ({
  jobs: [],
  selectedJob: null,
  jobCategories: [],
  teams: [],
  routes: [],
  qualityInspections: [],
  supplies: [],
  stats: {},
  loading: false,
  error: null,

  fetchJobs: async (filters = {}) => {
    console.log('Store fetchJobs called with filters:', filters)
    set({ loading: true, error: null })
    
    const { data, error } = await operationsApi.getJobs(filters)
    
    console.log('Store fetchJobs result:', { data, error, count: data?.length })
    
    if (error) {
      console.error('fetchJobs error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message, data: [] }
    }
    
    set({ jobs: data || [], loading: false })
    return { success: true, data: data || [] }
  },

  fetchJob: async (id) => {
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.getJob(id)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    if (!data) {
      set({ error: 'Job not found', loading: false })
      return { success: false, error: 'Job not found' }
    }
    set({ selectedJob: data, loading: false })
    return { success: true, data }
  },

  createJob: async (jobData) => {
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.createJob(jobData)
    if (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
    set(state => ({ jobs: [data, ...(state.jobs || [])], loading: false }))
    return { success: true, data }
  },

  updateJob: async (id, updates) => {
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.updateJob(id, updates)
    if (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
    set(state => ({
      jobs: (state.jobs || []).map(j => j.id === id ? data : j),
      selectedJob: state.selectedJob?.id === id ? data : state.selectedJob,
      loading: false
    }))
    return { success: true, data }
  },

  updateJobStatus: async (id, status) => {
    const { data, error } = await operationsApi.updateJobStatus(id, status)
    if (error) return { success: false, error: error.message }
    set(state => ({
      jobs: (state.jobs || []).map(j => j.id === id ? { ...j, status: data.status } : j),
      selectedJob: state.selectedJob?.id === id ? { ...state.selectedJob, status: data.status } : state.selectedJob
    }))
    return { success: true, data }
  },

  deleteJob: async (id) => {
    const { error } = await operationsApi.deleteJob(id)
    if (error) return { success: false, error: error.message }
    set(state => ({
      jobs: (state.jobs || []).filter(j => j.id !== id),
      selectedJob: state.selectedJob?.id === id ? null : state.selectedJob
    }))
    return { success: true }
  },

  fetchJobCategories: async () => {
    const { data, error } = await operationsApi.getJobCategories()
    if (error) return { success: false, error: error.message }
    set({ jobCategories: data || [] })
    return { success: true, data: data || [] }
  },

  fetchTeams: async () => {
    const { data, error } = await operationsApi.getTeams()
    if (error) return { success: false, error: error.message }
    set({ teams: data || [] })
    return { success: true, data: data || [] }
  },

  createTeam: async (teamData) => {
    const { data, error } = await operationsApi.createTeam(teamData)
    if (error) return { success: false, error: error.message }
    set(state => ({ teams: [data, ...(state.teams || [])] }))
    return { success: true, data }
  },

  fetchRoutes: async (filters = {}) => {
    const { data, error } = await operationsApi.getRoutes(filters)
    if (error) return { success: false, error: error.message }
    set({ routes: data || [] })
    return { success: true, data: data || [] }
  },

  fetchQualityInspections: async (jobId = null) => {
    const { data, error } = await operationsApi.getQualityInspections(jobId)
    if (error) return { success: false, error: error.message }
    set({ qualityInspections: data || [] })
    return { success: true, data: data || [] }
  },

  createQualityInspection: async (inspectionData) => {
    const { data, error } = await operationsApi.createQualityInspection(inspectionData)
    if (error) return { success: false, error: error.message }
    set(state => ({ qualityInspections: [data, ...(state.qualityInspections || [])] }))
    return { success: true, data }
  },

  fetchSupplies: async () => {
    const { data, error } = await operationsApi.getEquipmentSupplies()
    if (error) return { success: false, error: error.message }
    set({ supplies: data || [] })
    return { success: true, data: data || [] }
  },

  fetchOperationsStats: async () => {
    const stats = await operationsApi.getOperationsStats()
    set({ stats })
    return stats
  },

  clearError: () => set({ error: null }),
}))

export default useOperationsStore
