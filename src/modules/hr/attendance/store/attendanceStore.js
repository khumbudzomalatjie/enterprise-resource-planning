import { create } from 'zustand'
import { attendanceApi } from '../api/attendanceApi'

const useAttendanceStore = create((set, get) => ({
  // State
  attendanceRecords: [],
  todayAttendance: null,
  shiftTypes: [],
  employeeShifts: [],
  approvedLocations: [],
  timesheets: [],
  selectedTimesheet: null,
  policies: [],
  holidays: [],
  stats: {},
  loading: false,
  error: null,

  // Attendance Actions
  fetchAttendanceRecords: async (filters = {}) => {
    set({ loading: true, error: null })
    const { data, error } = await attendanceApi.getAttendanceRecords(filters)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set({ attendanceRecords: data, loading: false })
    return { success: true, data }
  },

  clockIn: async (attendanceData) => {
    const { data, error } = await attendanceApi.clockIn(attendanceData)
    if (error) return { success: false, error: error.message }
    set({ todayAttendance: data })
    return { success: true, data }
  },

  clockOut: async (employeeId) => {
    const { data, error } = await attendanceApi.clockOut(employeeId)
    if (error) return { success: false, error: error.message }
    set({ todayAttendance: data })
    return { success: true, data }
  },

  getTodayAttendance: async (employeeId) => {
    const { data, error } = await attendanceApi.getTodayAttendance(employeeId)
    if (error && error.code !== 'PGRST116') { // Not found is okay
      return { success: false, error: error.message }
    }
    set({ todayAttendance: data })
    return { success: true, data }
  },

  // Shift Actions
  fetchShiftTypes: async () => {
    const { data, error } = await attendanceApi.getShiftTypes()
    if (error) return { success: false, error: error.message }
    set({ shiftTypes: data })
    return { success: true, data }
  },

  fetchEmployeeShifts: async (filters = {}) => {
    const { data, error } = await attendanceApi.getEmployeeShifts(filters)
    if (error) return { success: false, error: error.message }
    set({ employeeShifts: data })
    return { success: true, data }
  },

  assignShift: async (shiftData) => {
    const { data, error } = await attendanceApi.assignShift(shiftData)
    if (error) return { success: false, error: error.message }
    set(state => ({ employeeShifts: [data, ...state.employeeShifts.filter(s => s.id !== data.id)] }))
    return { success: true, data }
  },

  // QR Code Actions
  generateQRCode: async (employeeId) => {
    const { data, error } = await attendanceApi.generateQRCode(employeeId)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  },

  getQRCode: async (employeeId) => {
    const { data, error } = await attendanceApi.getQRCode(employeeId)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  },

  // Location Actions
  fetchApprovedLocations: async () => {
    const { data, error } = await attendanceApi.getApprovedLocations()
    if (error) return { success: false, error: error.message }
    set({ approvedLocations: data })
    return { success: true, data }
  },

  // Timesheet Actions
  fetchTimesheets: async (filters = {}) => {
    set({ loading: true })
    const { data, error } = await attendanceApi.getTimesheets(filters)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set({ timesheets: data, loading: false })
    return { success: true, data }
  },

  fetchTimesheet: async (id) => {
    const { data, error } = await attendanceApi.getTimesheet(id)
    if (error) return { success: false, error: error.message }
    set({ selectedTimesheet: data })
    return { success: true, data }
  },

  generateTimesheet: async (employeeId, periodStart, periodEnd) => {
    const { data, error }
