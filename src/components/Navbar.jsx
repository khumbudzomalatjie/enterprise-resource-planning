import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { USER_ROLES } from '../types/authTypes'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('light')
  }

  return (
    <nav className="bg-dark-darker shadow-neomorphic-inset border-b border-dark-lighter/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white font-bold text-lg hidden sm:block">
                NDANDULENI GROUP
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {profile?.role === USER_ROLES.SUPER_ADMIN && (
              <Link
                to="/users"
                className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1"
              >
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </Link>
            )}
            
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* User Info */}
            <div className="flex items-center space-x-3 ml-4">
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {profile?.full_name || user?.email}
                </div>
                <div className="text-gray-400 text-xs capitalize">
                  {profile?.role?.replace('_', ' ') || 'User'}
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-dark hover:bg-dark-lighter transition-all duration-200 text-gray-300 hover:text-primary"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-dark hover:bg-dark-lighter transition-all duration-200 text-gray-300 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-primary p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-dark-darker border-t border-dark-lighter/20"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            {profile?.role === USER_ROLES.SUPER_ADMIN && (
              <Link
                to="/users"
                className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                User Management
              </Link>
            )}

            <button
              onClick={() => {
                handleSignOut()
                setIsOpen(false)
              }}
              className="text-gray-300 hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Sign Out
            </button>
          </div>
          
          <div className="px-4 py-3 border-t border-dark-lighter/20">
            <div className="text-white text-sm font-medium">
              {profile?.full_name || user?.email}
            </div>
            <div className="text-gray-400 text-xs capitalize">
              {profile?.role?.replace('_', ' ') || 'User'}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
