import { create } from 'zustand'
import { reportsApi } from '../api/reportsApi'

const useReportsStore = create((set, get) => ({
  overview: {},
  salesReport: {},
  operationsReport: {},
  financialReport: {},
  hrReport: {},
  fleetReport: {},
  kpiTargets: [],
  savedReports: [],
  loading: false,
  error: null,

  fetchOverview: async (dateFrom, dateTo) => {
    set({ loading: true })
    const data = await reportsApi.getDashboardOverview(dateFrom, dateTo)
    set({ overview: data, loading: false })
    return data
  },

  fetchSalesReport: async (dateFrom, dateTo) => {
    set({ loading: true })
    const data = await reportsApi.getSalesReport(dateFrom, dateTo)
    set({ salesReport: data, loading: false })
    return data
  },

  fetchOperationsReport: async (dateFrom, dateTo) => {
    const data = await reportsApi.getOperationsReport(dateFrom, dateTo)
    set({ operationsReport: data })
    return data
  },

  fetchFinancialReport: async (dateFrom, dateTo) => {
    const data = await reportsApi.getFinancialReport(dateFrom, dateTo)
    set({ financialReport: data })
    return data
  },

  fetchHRReport: async () => {
    const data = await reportsApi.getHRReport()
    set({ hrReport: data })
    return data
  },

  fetchFleetReport: async (dateFrom, dateTo) => {
    const data = await reportsApi.getFleetReport(dateFrom, dateTo)
    set({ fleetReport: data })
    return data
  },

  fetchKPITargets: async () => {
    const { data } = await reportsApi.getKPITargets()
    set({ kpiTargets: data || [] })
    return data
  },

  updateKPI: async (id, updates) => {
    const { data } = await reportsApi.updateKPI(id, updates)
    if (data) {
      set(state => ({ kpiTargets: state.kpiTargets.map(k => k.id === id ? data : k) }))
    }
  },

  fetchSavedReports: async () => {
    const { data } = await reportsApi.getSavedReports()
    set({ savedReports: data || [] })
    return data
  },

  saveReport: async (reportData) => {
    const { data } = await reportsApi.saveReport(reportData)
    if (data) set(state => ({ savedReports: [data, ...state.savedReports] }))
    return data
  },

  deleteReport: async (id) => {
    await reportsApi.deleteReport(id)
    set(state => ({ savedReports: state.savedReports.filter(r => r.id !== id) }))
  },

  exportReport: async (reportId, exportType) => {
    return await reportsApi.exportReport(reportId, exportType)
  },

  clearError: () => set({ error: null }),
}))

export default useReportsStore
