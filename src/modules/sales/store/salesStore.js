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
    try {
      const { data, error } = await salesApi.getQuotations(filters)
      if (error) throw error
      set({ quotations: data || [], loading: false })
      return { success: true, data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  fetchQuotation: async (id) => {
    try {
      const { data, error } = await salesApi.getQuotation(id)
      if (error) throw error
      set({ selectedQuotation: data })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  createQuotation: async (quotationData, items) => {
    try {
      const result = await salesApi.createQuotation(quotationData, items)
      if (result.error) throw result.error
      set(state => ({ quotations: [result.data, ...(state.quotations || [])] }))
      return { success: true, data: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  updateQuotation: async (id, updates) => {
    try {
      const { data, error } = await salesApi.updateQuotation(id, updates)
      if (error) throw error
      set(state => ({
        quotations: (state.quotations || []).map(q => q.id === id ? data : q),
        selectedQuotation: state.selectedQuotation?.id === id ? data : state.selectedQuotation
      }))
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Accept quotation - just updates status, no trigger calls
  acceptQuotation: async (id) => {
    try {
      const { data, error } = await salesApi.updateQuotation(id, {
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      if (error) throw error
      set(state => ({
        quotations: (state.quotations || []).map(q => q.id === id ? data : q),
        selectedQuotation: state.selectedQuotation?.id === id ? data : state.selectedQuotation
      }))
      return { success: true, data }
    } catch (error) {
      console.error('acceptQuotation error:', error)
      return { success: false, error: error.message }
    }
  },

  // Convert quotation to invoice
  convertToInvoice: async (quotationId) => {
    try {
      const result = await salesApi.convertQuotationToInvoice(quotationId)
      if (result.error) throw result.error
      return { success: true, data: result.data }
    } catch (error) {
      console.error('convertToInvoice error:', error)
      return { success: false, error: error.message }
    }
  },

  fetchInvoices: async (filters = {}) => {
    try {
      const { data, error } = await salesApi.getInvoices(filters)
      if (error) throw error
      set({ invoices: data || [] })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  fetchInvoice: async (id) => {
    try {
      const { data, error } = await salesApi.getInvoice(id)
      if (error) throw error
      set({ selectedInvoice: data })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  recordPayment: async (paymentData) => {
    try {
      const { data, error } = await salesApi.recordPayment(paymentData)
      if (error) throw error
      set(state => ({ payments: [data, ...(state.payments || [])] }))
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  fetchProductsServices: async () => {
    try {
      const { data, error } = await salesApi.getProductsServices()
      if (error) throw error
      set({ productsServices: data || [] })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  fetchSalesStats: async () => {
    try {
      const stats = await salesApi.getSalesStats()
      set({ stats })
      return stats
    } catch (error) {
      console.error('fetchSalesStats error:', error)
      return {}
    }
  },

  clearError: () => set({ error: null }),
}))

export default useSalesStore
