import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import { 
  Users, 
  Activity,
  Clock,
  UserCheck,
  Shield,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    lastLogin: null,
    roleDistribution: {}
  })

  useEffect(() => {
    // In production, fetch from API
    setStats({
      totalUsers: 125,
      activeSessions: 42,
      lastLogin: new Date(),
      roleDistribution: {
        super_admin: 1,
        operations_manager: 3,
        hr_manager: 2,
        finance_officer: 2,
        supervisor: 15,
        cleaner: 80,
        sales_agent: 10,
        customer: 12
      }
    })
  }, [])

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+12%'
    },
    {
      icon: Activity,
      label: 'Active Sessions',
      value: stats.activeSessions,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: '+5%'
    },
    {
      icon: UserCheck,
      label: 'Active Users',
      value: 98,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '98%'
    },
    {
      icon: Shield,
      label: 'Roles',
      value: 8,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      trend: 'Defined'
    },
  ]

  return (
    <div className="min-h-screen bg-[#333]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-400 flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                bg-[#3a3a3a] 
                rounded-[2em] 
                p-6
                shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
                hover:shadow-[-5px_-5px_20px_#2a2a2a,5px_5px_10px_#4a4a4a,3px_3px_15px_#99b9ff,-5px_-5px_25px_#2a2a2a]
                transition-all duration-300
              "
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-400">{stat.trend}</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-white text-3xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="
              bg-[#3a3a3a] 
              rounded-[2em] 
              p-6
              shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
            "
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-white text-xl font-semibold">Recent Activity</h2>
              </div>
              <button className="text-primary text-sm hover:text-white transition-colors">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { user: 'John Doe', action: 'Logged in successfully', time: '2 minutes ago', type: 'login' },
                { user: 'Jane Smith', action: 'Changed password', time: '15 minutes ago', type: 'security' },
                { user: 'Mike Johnson', action: 'Session expired', time: '1 hour ago', type: 'session' },
                { user: 'Sarah Wilson', action: 'Role updated to Supervisor', time: '2 hours ago', type: 'admin' },
                { user: 'Tom Brown', action: 'Account deactivated', time: '3 hours ago', type: 'warning' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
                  <div className="flex items-start space-x-3">
                    <div className={`
                      w-2 h-2 rounded-full mt-2
                      ${activity.type === 'login' ? 'bg-green-400' : ''}
                      ${activity.type === 'security' ? 'bg-yellow-400' : ''}
                      ${activity.type === 'session' ? 'bg-blue-400' : ''}
                      ${activity.type === 'admin' ? 'bg-purple-400' : ''}
                      ${activity.type === 'warning' ? 'bg-red-400' : ''}
                    `}></div>
                    <div>
                      <p className="text-white text-sm font-medium">{activity.user}</p>
                      <p className="text-gray-400 text-xs">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs whitespace-nowrap ml-4">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Role Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="
              bg-[#3a3a3a] 
              rounded-[2em] 
              p-6
              shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
            "
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-white text-xl font-semibold">Role Distribution</h2>
              </div>
              <span className="text-gray-400 text-sm">Total: {stats.totalUsers}</span>
            </div>
            
            <div className="space-y-4">
              {Object.entries(stats.roleDistribution).map(([role, count]) => {
                const percentage = ((count / stats.totalUsers) * 100).toFixed(1)
                const colors = {
                  super_admin: 'bg-red-500',
                  operations_manager: 'bg-blue-500',
                  hr_manager: 'bg-purple-500',
                  finance_officer: 'bg-yellow-500',
                  supervisor: 'bg-green-500',
                  cleaner: 'bg-cyan-500',
                  sales_agent: 'bg-pink-500',
                  customer: 'bg-orange-
