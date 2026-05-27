import { create } from 'zustand'
import { crmApi } from '../api/crmApi'

const useCRMStore = create((set, get) => ({
  // State
  clients: [],
  selectedClient: null,
  contacts: [],
  interactions: [],
  serviceTypes: [],
  clientServices: [],
  pipeline: [],
  feedback: [],
  documents: [],
  stats: {},
  loading: false,
  error: null,

  // Client Actions
  fetchClients: async (filters = {}) => {
    set({ loading: true, error: null })
    const { data, error } = await crmApi.getClients(filters)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set({ clients: data, loading: false })
    return { success: true, data }
  },

  fetchClient: async (id) => {
    set({ loading: true })
    const { data, error } = await crmApi.getClient(id)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set({ selectedClient: data, loading: false })
    return { success: true, data }
  },

  createClient: async (clientData) => {
    const { data, error } = await crmApi.createClient(clientData)
    if (error) return { success: false, error: error.message }
    set(state => ({ clients: [data, ...state.clients] }))
    return { success: true, data }
  },

  updateClient: async (id, updates) => {
    const { data, error } = await crmApi.updateClient(id, updates)
    if (error) return { success: false, error: error.message }
    set(state => ({
      clients: state.clients.map(c => c.id === id ? data : c),
      selectedClient: state.selectedClient?.id === id ? data : state.selectedClient
    }))
    return { success: true, data }
  },

  // Contact Actions
  fetchContacts: async (clientId = null) => {
    const { data, error } = await crmApi.getContacts(clientId)
    if (error) return { success: false, error: error.message }
    set({ contacts: data })
    return { success: true, data }
  },

  createContact: async (contactData) => {
    const { data, error } = await crmApi.createContact(contactData)
    if (error) return { success: false, error: error.message }
    set(state => ({ contacts: [data, ...state.contacts] }))
    return { success: true, data }
  },

  // Interaction Actions
  fetchInteractions: async (clientId = null) => {
    const { data, error } = await crmApi.getInteractions(clientId)
    if (error) return { success: false, error: error.message }
    set({ interactions: data })
    return { success: true, data }
  },

  createInteraction: async (interactionData) => {
    const { data, error } = await crmApi.createInteraction(interactionData)
    if (error) return { success: false, error: error.message }
    set(state => ({ interactions: [data, ...state.interactions] }))
    return { success: true, data }
  },

  // Service Actions
  fetchServiceTypes: async () => {
    const { data, error } = await crmApi.getServiceTypes()
    if (error) return { success: false, error: error.message }
    set({ serviceTypes: data })
    return { success: true, data }
  },

  fetchClientServices: async (clientId = null) => {
    const { data, error } = await crmApi.getClientServices(clientId)
    if (error) return { success: false, error: error.message }
    set({ clientServices: data })
    return { success: true, data }
  },

  createClientService: async (serviceData) => {
    const { data, error } = await crmApi.createClientService(serviceData)
    if (error) return { success: false, error: error.message }
    set(state => ({ clientServices: [data, ...state.clientServices] }))
    return { success: true, data }
  },

  // Pipeline Actions
  fetchPipeline: async (filters = {}) => {
    const { data, error } = await crmApi.getPipeline(filters)
    if (error) return { success: false, error: error.message }
    set({ pipeline: data })
    return { success: true, data }
  },

  createPipelineItem: async (itemData) => {
    const { data, error } = await crmApi.createPipelineItem(itemData)
    if (error) return { success: false, error: error.message }
    set(state => ({ pipeline: [data, ...state.pipeline] }))
    return { success: true, data }
  },

  updatePipelineItem: async (id, updates) => {
    const { data, error } = await crmApi.updatePipelineItem(id, updates)
    if (error) return { success: false, error: error.message }
    set(state => ({
      pipeline: state.pipeline.map(p => p.id === id ? data : p)
    }))
    return { success: true, data }
  },

  // Stats
  fetchCRMStats: async () => {
    const stats = await crmApi.getCRMStats()
    set({ stats })
    return stats
  },

  clearError: () => set({ error: null }),
}))

export default useCRMStore
