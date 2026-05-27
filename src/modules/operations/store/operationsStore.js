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
    if (error) { set({ error: error.message, loading: false }); return { success: false, error: error.message } }
    set({ jobs: data, loading: false })
    return { success: true, data }
  },

  fetchJob: async (id) => {
    set({ loading: true })
    const { data, error } = await operationsApi.getJob(id)
    if (error) { set({ error: error.message, loading: false }); return { success: false } }
    set({ selectedJob: data, loading: false })
    return { success: true, data }
  },

  createJob: async (jobData) => {
    const { data, error } = await operationsApi.createJob(jobData)
    if (error) return { success: false, error: error.message }
    set(state => ({ jobs: [data, ...state.jobs] }))
    return { success: true, data }
  },

  updateJob: async (id, updates) => {
    const { data, error } = await operationsApi.updateJob(id, updates)
    if (error) return { success: false, error: error.message }
    set(state => ({
      jobs: state.jobs.map(j => j.id === id ? data : j),
      selectedJob: state.selectedJob?.id === id ? data : state.selectedJob
    }))
    return { success: true, data }
  },

  updateJobStatus: async (id, status) => {
    const { data, error } = await operationsApi.updateJobStatus(id, status)
    if (error) return { success: false, error: error.message }
    set(state => ({
      jobs: state.jobs.map(j => j.id === id ? data : j)
    }))
    return { success: true, data }
  },

  fetchJobCategories: async () => {
    const { data, error } = await operationsApi.getJobCategories()
    if (error) return { success: false }
    set({ jobCategories: data })
    return { success: true, data }
  },

  fetchTeams: async () => {
    const { data, error } = await operationsApi.getTeams()
    if (error) return { success: false }
    set({ teams: data })
    return { success: true, data }
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
    if (error) return { success: false }
    set({ routes: data })
    return { success: true, data }
  },

  createRoute: async (routeData, stops) => {
    const result = await operationsApi.createRoute(routeData, stops)
    if (result.error) return { success: false, error: result.error.message }
    return { success: true, data: result.data }
  },

  fetchQualityInspections: async (jobId = null) => {
    const { data, error } = await operationsApi.getQualityInspections(jobId)
    if (error) return { success: false }
    set({ qualityInspections: data })
    return { success: true, data }
  },

  createQualityInspection: async (inspectionData) => {
    const { data, error } = await operationsApi.createQualityInspection(inspectionData)
    if (error) return { success: false, error: error.message }
    set(state => ({ qualityInspections: [data, ...state.qualityInspections] }))
    return { success: true, data }
  },

  fetchSupplies: async () => {
    const { data, error } = await operationsApi.getEquipmentSupplies()
    if (error) return { success: false }
    set({ supplies: data })
    return { success: true, data }
  },

  fetchOperationsStats: async () => {
    const stats = await operationsApi.getOperationsStats()
    set({ stats })
    return stats
  },

  clearError: () => set({ error: null }),
}))

export default useOperationsStore
