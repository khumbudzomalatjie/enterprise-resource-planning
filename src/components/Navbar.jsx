import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { USER_ROLES } from '../types/authTypes'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/login')
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Ndanduleni Group Logo"
                className="w-10 h-10 rounded-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <div>
              <Link to="/dashboard" className="text-slate-800 dark:text-white font-bold text-lg leading-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                NDANDULENI GROUP
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">ERP System</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                isActive('/dashboard') 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {profile?.role === USER_ROLES.SUPER_ADMIN && (
              <Link
                to="/users"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive('/users') 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2"></div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden lg:block">
                <div className="text-slate-800 dark:text-white text-sm font-medium">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs capitalize">
                  {profile?.role?.replace(/_/g, ' ') || 'User'}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-xl bg-slate-100 dark:bg-slate-700"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/dashboard"
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
              </Link>
              
              {profile?.role === USER_ROLES.SUPER_ADMIN && (
                <Link
                  to="/users"
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive('/users')
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>User Management</span>
                  </div>
                </Link>
              )}

              <button
                onClick={() => {
                  handleSignOut()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="text-slate-800 dark:text-white text-sm font-medium">
                {profile?.full_name || user?.email}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs capitalize mt-1">
                {profile?.role?.replace(/_/g, ' ') || 'User'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
