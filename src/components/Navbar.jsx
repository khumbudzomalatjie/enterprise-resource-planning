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
  Sun,
  Moon,
  Shield
} from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/login')
    }
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('light')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-[#2a2a2a] shadow-lg border-b border-[#444]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-[inset_2px_2px_5px_#111011,inset_-2px_-2px_5px_#444]">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-white font-bold text-lg hidden sm:block leading-tight">
                  NDANDULENI GROUP
                </span>
                <span className="text-gray-400 text-xs hidden sm:block leading-tight">
                  ERP System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                isActive('/dashboard') 
                  ? 'bg-primary/20 text-primary shadow-[inset_2px_2px_5px_#111011,inset_-2px_-2px_5px_#444]' 
                  : 'text-gray-300 hover:text-primary hover:bg-[#333]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {profile?.role === USER_ROLES.SUPER_ADMIN && (
              <Link
                to="/users"
                className={`px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive('/users') 
                    ? 'bg-primary/20 text-primary shadow-[inset_2px_2px_5px_#111011,inset_-2px_-2px_5px_#444]' 
                    : 'text-gray-300 hover:text-primary hover:bg-[#333]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-8 bg-[#444] mx-2"></div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden lg:block">
                <div className="text-white text-sm font-medium">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </div>
                <div className="text-gray-400 text-xs capitalize">
                  {profile?.role?.replace(/_/g, ' ') || 'User'}
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[#333] hover:bg-[#444] transition-all duration-200 text-gray-300 hover:text-primary shadow-[2px_2px_5px_#1a1a1a,-2px_-2px_5px_#444]"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-[#333] hover:bg-red-500/20 transition-all duration-200 text-gray-300 hover:text-red-400 shadow-[2px_2px_5px_#1a1a1a,-2px_-2px_5px_#444]"
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
              className="text-gray-300 hover:text-primary p-2 rounded-xl bg-[#333] shadow-[2px_2px_5px_#1a1a1a,-2px_-2px_5px_#444]"
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
            className="md:hidden bg-[#2a2a2a] border-t border-[#444] overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/dashboard"
                className={`block px-4 py-3 rounded-[20px] text-base font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-300 hover:text-primary'
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
                  className={`block px-4 py-3 rounded-[20px] text-base font-medium transition-all duration-200 ${
                    isActive('/users')
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray-300 hover:text-primary'
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
                className="w-full text-left px-4 py-3 rounded-[20px] text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
            
            <div className="px-6 py-4 border-t border-[#444] bg-[#333]">
              <div className="text-white text-sm font-medium">
                {profile?.full_name || user?.email}
              </div>
              <div className="text-gray-400 text-xs capitalize mt-1">
                {profile?.role?.replace(/_/g, ' ') || 'User'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
