import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useOperationsStore from '../store/operationsStore'
import useThemeStore from '../../../store/themeStore'
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, MapPin,
  Clock, Sun, Moon, Sparkles, Briefcase
} from 'lucide-react'

export default function SchedulingCalendar() {
  const { jobs, fetchJobs, jobCategories, fetchJobCategories } = useOperationsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDateJobs, setSelectedDateJobs] = useState([])

  useEffect(() => {
    loadData()
  }, [currentMonth, currentYear])

  const loadData = async () => {
    const dateFrom = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const dateTo = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
    await fetchJobs({ date_from: dateFrom, date_to: dateTo })
    await fetchJobCategories()
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const today = new Date().toISOString().split('T')[0]

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else { setCurrentMonth(currentMonth - 1) }
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else { setCurrentMonth(currentMonth + 1) }
  }

  const getJobsForDate = (date) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return jobs.filter(job => job.scheduled_date === dateStr)
  }

  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setSelectedDateJobs(getJobsForDate(day))
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-slate-400',
      scheduled: 'bg-blue-500',
      in_progress: 'bg-amber-500',
      completed: 'bg-emerald-500',
      cancelled: 'bg-red-500',
      overdue: 'bg-red-600',
    }
    return colors[status] || 'bg-slate-400'
  }

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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/operations" className="text-slate-500 hover:text-emerald-600">Operations</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Calendar</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-600" />
              Scheduling Calendar
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">View all booked jobs and available dates</p>
          </div>
          <button onClick={() => navigate('/operations/jobs/new')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /><span>New Job</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neu-raised rounded-3xl p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month start */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-xl"></div>
                ))}
                
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayJobs = getJobsForDate(day)
                  const isToday = dateStr === today
                  const isSelected = dateStr === selectedDate

                  return (
                    <div
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`
                        aspect-square rounded-xl p-1.5 cursor-pointer transition-all relative
                        ${isToday ? 'ring-2 ring-emerald-500' : ''}
                        ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}
                      `}
                    >
                      <span className={`text-sm font-medium ${isToday ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                      </span>
                      
                      {/* Job indicators */}
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayJobs.slice(0, 3).map(job => (
                          <div
                            key={job.id}
                            className={`w-1.5 h-1.5 rounded-full ${getStatusColor(job.status)}`}
                            title={job.title}
                          ></div>
                        ))}
                        {dayJobs.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{dayJobs.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {[
                  { label: 'Scheduled', color: 'bg-blue-500' },
                  { label: 'In Progress', color: 'bg-amber-500' },
                  { label: 'Completed', color: 'bg-emerald-500' },
                  { label: 'Cancelled', color: 'bg-red-500' },
                  { label: 'Available', color: 'bg-slate-200 dark:bg-slate-600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Selected Date Jobs */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neu-raised rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a date'}
              </h2>
              
              {selectedDate && selectedDateJobs.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Available - No jobs booked</p>
                  <button onClick={() => navigate('/operations/jobs/new')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    + Book a job on this date
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {selectedDateJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/operations/jobs/${job.id}`)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}></span>
                      <p className="font-medium text-slate-800 dark:text-white text-sm">{job.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 ml-4">{job.clients?.company_name}</p>
                    <div className="flex items-center gap-3 ml-4 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.scheduled_start_time?.slice(0,5) || '?'} - {job.scheduled_end_time?.slice(0,5) || '?'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.site_city || 'N/A'}</span>
                    </div>
                    {job.job_categories && (
                      <span className="inline-block ml-4 mt-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: job.job_categories.color + '20', color: job.job_categories.color }}>
                        {job.job_categories.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
