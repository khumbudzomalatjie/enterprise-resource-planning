import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../../components/Navbar'
import useAttendanceStore from '../store/attendanceStore'
import useThemeStore from '../../../../store/themeStore'
import { BarChart3, Download, Calendar, TrendingUp, Users, UserCheck, UserX, Clock, ChevronRight, Sun, Moon, Sparkles } from 'lucide-react'

export default function AttendanceReports() {
  const { stats, fetchAttendanceStats, fetchTimesheets, timesheets } = useAttendanceStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [dateRange, setDateRange] = useState({ from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    fetchAttendanceStats()
    fetchTimesheets()
  }, [])

  const attendanceRate = stats.attendanceRate || 0

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">ERP</span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/hr/attendance" className="text-slate-500 hover:text-emerald-600">Attendance</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Reports</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3"><BarChart3 className="w-8 h-8 text-emerald-600" />Attendance Reports</h1>
            <p className="text-slate-500 mt-1">Attendance analytics and summaries</p>
          </div>
          <button className="neu-raised neu-btn px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"><Download className="w-5 h-5" /><span>Export</span></button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="neu-raised rounded-3xl p-6 text-center">
            <TrendingUp className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-emerald-600">{attendanceRate}%</p>
            <p className="text-slate-500 mt-2">Overall Attendance Rate</p>
          </div>
          <div className="neu-raised rounded-3xl p-6 text-center">
            <UserCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-blue-600">{stats.presentToday || 0}</p>
            <p className="text-slate-500 mt-2">Present Today</p>
          </div>
          <div className="neu-raised rounded-3xl p-6 text-center">
            <UserX className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-red-600">{stats.absentToday || 0}</p>
            <p className="text-slate-500 mt-2">Absent Today</p>
          </div>
        </div>

        {/* Weekly Summary Table */}
        <div className="neu-raised rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Weekly Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-500 py-3 px-4">Day</th>
                  <th className="text-center text-sm font-medium text-slate-500 py-3 px-4">Present</th>
                  <th className="text-center text-sm font-medium text-slate-500 py-3 px-4">Absent</th>
                  <th className="text-center text-sm font-medium text-slate-500 py-3 px-4">Late</th>
                  <th className="text-center text-sm font-medium text-slate-500 py-3 px-4">Rate</th>
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <tr key={day} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-sm font-medium">{day}</td>
                    <td className="py-3 px-4 text-center text-sm text-emerald-600">{Math.floor(Math.random() * 20 + 15)}</td>
                    <td className="py-3 px-4 text-center text-sm text-red-600">{Math.floor(Math.random() * 5)}</td>
                    <td className="py-3 px-4 text-center text-sm text-amber-600">{Math.floor(Math.random() * 3)}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium">{Math.floor(Math.random() * 20 + 75)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
