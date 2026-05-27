import { create } from 'zustand'
import { salesApi } from '../api/salesApi'

const useSalesStore = create((set, get) => ({
  quotations: [],
  selectedQuotation: null,
  invoices: [],
  selectedInvoice: null,
  payments: [],
  productsServices: [],
  salesTargets: [],
  stats: {},
  loading: false,
  error: null,

  fetchQuotations: async (filters = {}) => {
    set({ loading: true })
    const { data, error } = await salesApi.getQuotations(filters)
    if (error) { set({ error: error.message, loading: false }); return { success: false, error: error.message } }
    set({ quotations: data, loading: false })
    return { success: true, data }
  },

  fetchQuotation: async (id) => {
    const { data, error } = await salesApi.getQuotation(id)
    if (error) return { success: false, error: error.message }
    set({ selectedQuotation: data })
    return { success: true, data }
  },

  createQuotation: async (quotationData, items) => {
    const result = await salesApi.createQuotation(quotationData, items)
    if (result.error) return { success: false, error: result.error.message }
    set(state => ({ quotations: [result.data, ...state.quotations] }))
    return { success: true, data: result.data }
  },

  updateQuotationStatus: async (id, status) => {
    const { data, error } = await salesApi.updateQuotationStatus(id, status)
    if (error) return { success: false, error: error.message }
    set(state => ({
      quotations: state.quotations.map(q => q.id === id ? data : q)
    }))
    return { success: true, data }
  },

  fetchInvoices: async (filters = {}) => {
    const { data, error } = await salesApi.getInvoices(filters)
    if (error) return { success: false, error: error.message }
    set({ invoices: data })
    return { success: true, data }
  },

  fetchInvoice: async (id) => {
    const { data, error } = await salesApi.getInvoice(id)
    if (error) return { success: false, error: error.message }
    set({ selectedInvoice: data })
    return { success: true, data }
  },

  convertToInvoice: async (quotationId) => {
    const result = await salesApi.convertQuotationToInvoice(quotationId)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  },

  recordPayment: async (paymentData) => {
    const { data, error } = await salesApi.recordPayment(paymentData)
    if (error) return { success: false, error: error.message }
    set(state => ({ payments: [data, ...state.payments] }))
    return { success: true, data }
  },

  fetchProductsServices: async () => {
    const { data, error } = await salesApi.getProductsServices()
    if (error) return { success: false, error: error.message }
    set({ productsServices: data })
    return { success: true, data }
  },

  fetchSalesStats: async () => {
    const stats = await salesApi.getSalesStats()
    set({ stats })
    return stats
  },

  clearError: () => set({ error: null }),
}))

export default useSalesStore
