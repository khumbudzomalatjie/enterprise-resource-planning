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
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.getJobs(filters)
    if (error) { 
      console.error('fetchJobs error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set({ jobs: data || [], loading: false })
    return { success: true, data: data || [] }
  },

  fetchJob: async (id) => {
    set({ loading: true, error: null })
    console.log('fetchJob called with id:', id)
    const { data, error } = await operationsApi.getJob(id)
    if (error) { 
      console.error('fetchJob error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    if (!data) {
      console.error('fetchJob: No data returned for id:', id)
      set({ error: 'Job not found', loading: false })
      return { success: false, error: 'Job not found' }
    }
    console.log('fetchJob success:', data)
    set({ selectedJob: data, loading: false })
    return { success: true, data }
  },

  createJob: async (jobData) => {
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.createJob(jobData)
    if (error) {
      console.error('createJob error:', error)
      set({ loading: false })
      return { success: false, error: error.message }
    }
    set(state => ({ jobs: [data, ...state.jobs], loading: false }))
    return { success: true, data }
  },

  updateJob: async (id, updates) => {
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.updateJob(id, updates)
    if (error) {
      console.error('updateJob error:', error)
      set({ loading: false })
      return { success: false, error: error.message }
    }
    set(state => ({
      jobs: state.jobs.map(j => j.id === id ? data : j),
      selectedJob: state.selectedJob?.id === id ? data : state.selectedJob,
      loading: false
    }))
    return { success: true, data }
  },

  updateJobStatus: async (id, status) => {
    set({ loading: true, error: null })
    const { data, error } = await operationsApi.updateJobStatus(id, status)
    if (error) {
      console.error('updateJobStatus error:', error)
      set({ loading: false })
      return { success: false, error: error.message }
    }
    set(state => ({
      jobs: state.jobs.map(j => j.id === id ? data : j),
      selectedJob: state.selectedJob?.id === id ? data : state.selectedJob,
      loading: false
    }))
    return { success: true, data }
  },

  deleteJob: async (id) => {
    set({ loading: true, error: null })
    const { error } = await operationsApi.deleteJob(id)
    if (error) {
      console.error('deleteJob error:', error)
      set({ loading: false })
      return { success: false, error: error.message }
    }
    set(state => ({
      jobs: state.jobs.filter(j => j.id !== id),
      selectedJob: state.selectedJob?.id === id ? null : state.selectedJob,
      loading: false
    }))
    return { success: true }
  },

  fetchJobCategories: async () => {
    const { data, error } = await operationsApi.getJobCategories()
    if (error) {
      console.error('fetchJobCategories error:', error)
      return { success: false, error: error.message }
    }
    set({ jobCategories: data || [] })
    return { success: true, data: data || [] }
  },

  fetchTeams: async () => {
    const { data, error } = await operationsApi.getTeams()
    if (error) {
      console.error('fetchTeams error:', error)
      return { success: false }
    }
    set({ teams: data || [] })
    return { success: true, data: data || [] }
  },

  createTeam: async (teamData) => {
    const { data, error } = await operationsApi.createTeam(teamData)
    if (error) return { success: false, error: error.message }
    set(state => ({ teams: [data, ...state.teams] }))
    return { success: true, data }
  },

  assignEmployee: async (jobId, employeeId, teamId) => {
    const { data, error } = await operationsApi.assignEmployee(jobId, employeeId, teamId)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  },

  fetchRoutes: async (filters = {}) => {
    const { data, error } = await operationsApi.getRoutes(filters)
    if (error) {
      console.error('fetchRoutes error:', error)
      return { success: false }
    }
    set({ routes: data || [] })
    return { success: true, data: data || [] }
  },

  createRoute: async (routeData, stops) => {
    const result = await operationsApi.createRoute(routeData, stops)
    if (result.error) return { success: false, error: result.error.message }
    return { success: true, data: result.data }
  },

  fetchQualityInspections: async (jobId = null) => {
    const { data, error } = await operationsApi.getQualityInspections(jobId)
    if (error) {
      console.error('fetchQualityInspections error:', error)
      return { success: false }
    }
    set({ qualityInspections: data || [] })
    return { success: true, data: data || [] }
  },

  createQualityInspection: async (inspectionData) => {
    const { data, error } = await operationsApi.createQualityInspection(inspectionData)
    if (error) return { success: false, error: error.message }
    set(state => ({ qualityInspections: [data, ...state.qualityInspections] }))
    return { success: true, data }
  },

  fetchSupplies: async () => {
    const { data, error } = await operationsApi.getEquipmentSupplies()
    if (error) {
      console.error('fetchSupplies error:', error)
      return { success: false }
    }
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
