import { create } from 'zustand'
import { payrollApi } from '../api/payrollApi'

const usePayrollStore = create((set, get) => ({
  // State
  salaryStructures: [],
  payslips: [],
  selectedPayslip: null,
  overtimeRecords: [],
  payrollPeriods: [],
  currentPeriod: null,
  taxBrackets: [],
  deductionTypes: [],
  employeeDeductions: [],
  bonusRecords: [],
  stats: {},
  loading: false,
  error: null,

  // Salary Structure Actions
  fetchSalaryStructures: async (filters = {}) => {
    const { data, error } = await payrollApi.getSalaryStructures(filters)
    if (error) return { success: false, error: error.message }
    set({ salaryStructures: data })
    return { success: true, data }
  },

  createSalaryStructure: async (salaryData) => {
    const { data, error } = await payrollApi.createSalaryStructure(salaryData)
    if (error) return { success: false, error: error.message }
    set(state => ({ salaryStructures: [data, ...state.salaryStructures] }))
    return { success: true, data }
  },

  updateSalaryStructure: async (id, updates) => {
    const { data, error } = await payrollApi.updateSalaryStructure(id, updates)
    if (error) return { success: false, error: error.message }
    set(state => ({
      salaryStructures: state.salaryStructures.map(s => s.id === id ? data : s)
    }))
    return { success: true, data }
  },

  // Payslip Actions
  fetchPayslips: async (filters = {}) => {
    set({ loading: true })
    const { data, error } = await payrollApi.getPayslips(filters)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set({ payslips: data, loading: false })
    return { success: true, data }
  },

  fetchPayslip: async (id) => {
    const { data, error } = await payrollApi.getPayslip(id)
    if (error) return { success: false, error: error.message }
    set({ selectedPayslip: data })
    return { success: true, data }
  },

  createPayslip: async (payslipData) => {
    const { data, error } = await payrollApi.createPayslip(payslipData)
    if (error) return { success: false, error: error.message }
    set(state => ({ payslips: [data, ...state.payslips] }))
    return { success: true, data }
  },

  // Overtime Actions
  fetchOvertimeRecords: async (filters = {}) => {
    const { data, error } = await payrollApi.getOvertimeRecords(filters)
    if (error) return { success: false, error: error.message }
    set({ overtimeRecords: data })
    return { success: true, data }
  },

  createOvertimeRecord: async (overtimeData) => {
    const { data, error } = await payrollApi.createOvertimeRecord(overtimeData)
    if (error) return { success: false, error: error.message }
    set(state => ({ overtimeRecords: [data, ...state.overtimeRecords] }))
    return { success: true, data }
  },

  updateOvertimeRecord: async (id, updates) => {
    const { data, error } = await payrollApi.updateOvertimeRecord(id, updates)
    if (error) return { success: false, error: error.message }
    set(state => ({
      overtimeRecords: state.overtimeRecords.map(o => o.id === id ? data : o)
    }))
    return { success: true, data }
  },

  // Payroll Period Actions
  fetchPayrollPeriods: async () => {
    const { data, error } = await payrollApi.getPayrollPeriods()
    if (error) return { success: false, error: error.message }
    set({ payrollPeriods: data, currentPeriod: data?.[0] || null })
    return { success: true, data }
  },

  createPayrollPeriod: async (periodData) => {
    const { data, error } = await payrollApi.createPayrollPeriod(periodData)
    if (error) return { success: false, error: error.message }
    set(state => ({ payrollPeriods: [data, ...state.payrollPeriods] }))
    return { success: true, data }
  },

  // Tax Actions
  fetchTaxBrackets: async (taxYear) => {
    const { data, error } = await payrollApi.getTaxBrackets(taxYear)
    if (error) return { success: false, error: error.message }
    set({ taxBrackets: data })
    return { success: true, data }
  },

  // Deduction Actions
  fetchDeductionTypes: async () => {
    const { data, error } = await payrollApi.getDeductionTypes()
    if (error) return { success: false, error: error.message }
    set({ deductionTypes: data })
    return { success: true, data }
  },

  fetchEmployeeDeductions: async (employeeId) => {
    const { data, error } = await payrollApi.getEmployeeDeductions(employeeId)
    if (error) return { success: false, error: error.message }
    set({ employeeDeductions: data })
    return { success: true, data }
  },

  createEmployeeDeduction: async (deductionData) => {
    const { data, error } = await payrollApi.createEmployeeDeduction(deductionData)
    if (error) return { success: false, error: error.message }
    set(state => ({ employeeDeductions: [data, ...state.employeeDeductions] }))
    return { success: true, data }
  },

  // Bonus Actions
  fetchBonusRecords: async (filters = {}) => {
    const { data, error } = await payrollApi.getBonusRecords(filters)
    if (error) return { success: false, error: error.message }
    set({ bonusRecords: data })
    return { success: true, data }
  },

  createBonusRecord: async (bonusData) => {
    const { data, error } = await payrollApi.createBonusRecord(bonusData)
    if (error) return { success: false, error: error.message }
    set(state => ({ bonusRecords: [data, ...state.bonusRecords] }))
    return { success: true, data }
  },

  // Stats
  fetchPayrollStats: async () => {
    const stats = await payrollApi.getPayrollStats()
    set({ stats })
    return stats
  },

  clearError: () => set({ error: null }),
}))

export default usePayrollStore
