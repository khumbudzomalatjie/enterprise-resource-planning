import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import useMobileStore from '../store/mobileStore'
import BottomNav from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Clock, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ClockInOut() {
  const { user, profile } = useAuthStore()
  const { stats, clockIn, clockOut, fetchMobileStats, loading } = useMobileStore()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState(null)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    getLocation()
    return () => clearInterval(timer)
  }, [])

  const loadData = async () => {
    if (profile?.id) {
      const s = await fetchMobileStats(profile.id)
      setIsClockedIn(s.isClockedIn || false)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => toast.error('Location access needed for clock in/out')
      )
    }
  }

  const handleClockIn = async () => {
    if (!location) { toast.error('Waiting for GPS location...'); getLocation(); return }
    setProcessing(true)
    const result = await clockIn(profile.id, null, location.lat, location.lng)
    if (result.success) {
      toast.success('Clocked in successfully! 🎉')
      setIsClockedIn(true)
      loadData()
    } else {
      toast.error(result.error || 'Clock in failed')
    }
    setProcessing(false)
  }

  const handleClockOut = async () => {
    setProcessing(true)
    const result = await clockOut(profile.id)
    if (result.success) {
      toast.success('Clocked out! See you tomorrow 👋')
      setIsClockedIn(false)
      loadData()
    } else {
      toast.error(result.error || 'Clock out failed')
    }
    setProcessing(false)
  }

  const formatTime = (date) => date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formatDate = (date) => date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-500 to-amber-600 px-4 pt-8 pb-6 text-white">
        <button onClick={() => navigate('/mobile')} className="p-1 rounded-lg hover:bg-white/20 mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Clock In / Out</h1>
        <p className="text-amber-100 text-sm">{formatDate(currentTime)}</p>
      </div>

      <div className="px-4 -mt-4">
        {/* Time Display */}
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center mb-6">
          <p className="text-slate-500 text-sm mb-2">Current Time</p>
          <p className="text-5xl font-bold text-slate-800 font-mono">{formatTime(currentTime)}</p>
          {location && (
            <div className="flex items-center justify-center gap-1 mt-3 text-emerald-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>GPS Location Captured</span>
            </div>
          )}
        </div>

        {/* Clock Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleClockIn}
            disabled={isClockedIn || processing}
            className={`rounded-3xl p-6 text-center transition-all ${
              isClockedIn 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg active:scale-95'
            }`}
          >
            {processing ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
            ) : (
              <>
                <Clock className="w-10 h-10 mx-auto mb-2" />
                <p className="font-bold text-lg">Clock In</p>
                <p className="text-xs opacity-75">Start Work</p>
              </>
            )}
          </button>

          <button
            onClick={handleClockOut}
            disabled={!isClockedIn || processing}
            className={`rounded-3xl p-6 text-center transition-all ${
              !isClockedIn 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg active:scale-95'
            }`}
          >
            {processing ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                <p className="font-bold text-lg">Clock Out</p>
                <p className="text-xs opacity-75">End Work</p>
              </>
            )}
          </button>
        </div>

        {/* Status Card */}
        <div className={`rounded-3xl p-6 text-center ${isClockedIn ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100'}`}>
          <p className="text-lg font-semibold">
            Status: <span className={isClockedIn ? 'text-emerald-600' : 'text-slate-500'}>
              {isClockedIn ? '🟢 Clocked In' : '⚪ Not Clocked In'}
            </span>
          </p>
          {stats.clockInTime && (
            <p className="text-sm text-slate-500 mt-1">
              Clocked in at: {new Date(stats.clockInTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <BottomNav active="clock" />
    </div>
  )
}
