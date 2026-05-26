import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import { USER_ROLES, ROLE_LABELS } from '../types/authTypes'
import toast from 'react-hot-toast'
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  ChevronDown,
  Plus,
  Mail,
  Phone,
  Calendar,
  Filter
} from 'lucide-react'

export default function UserManagement() {
  const { getAllUsers } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success) {
      setUsers(result.data || [])
    } else {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.is_active) ||
      (selectedStatus === 'inactive' && !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEditUser = (user) => {
    toast.success(`Editing ${user.full_name || user.email}`)
    // Implement edit functionality
  }

  const handleDeleteUser = (user) => {
    toast.error(`Delete functionality will be implemented`)
    // Implement delete functionality
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-red-500/20 text-red-400',
      operations_manager: 'bg-blue-500/20 text-blue-400',
      hr_manager: 'bg-purple-500/20 text-purple-400',
      finance_officer: 'bg-yellow-500/20 text-yellow-400',
      supervisor: 'bg-green-500/20 text-green-400',
      cleaner: 'bg-cyan-500/20 text-cyan-400',
      sales_agent: 'bg-pink-500/20 text-pink-400',
      customer: 'bg-orange-500/20 text-orange-400',
    }
    return colors[role] || 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="min-h-screen bg-[#333]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">Manage all system users and their roles</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Add user functionality will be implemented')}
            className="
              px-6 py-3
              bg-primary/20
              text-primary
              rounded-[25px]
              shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
              hover:shadow-[-5px_-5px_20px_#2a2a2a,3px_3px_10px_#99b9ff]
              hover:text-white
              transition-all duration-300
              flex items-center space-x-2
              whitespace-nowrap
            "
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            bg-[#3a3a3a] 
            rounded-[2em] 
            p-6
            shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
            mb-8
          "
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="
                  w-full
                  pl-12 pr-4 py-3
                  bg-[rgba(255,255,255,0.05)]
                  text-white
                  placeholder-gray-400
                  rounded-[25px]
                  shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#4a4a4a]
                  focus:shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#4a4a4a]
                  transition-all duration-300
                "
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="
                    appearance-none
                    px-4 py-3 pr-10
                    bg-[rgba(255,255,255,0.05)]
                    text-white
                    rounded-[25px]
                    shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#4a4a4a]
                    cursor-pointer
                  "
                >
                  <option value="all">All Roles</option>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="
                    appearance-none
                    px-4 py-3 pr-10
                    bg-[rgba(255,255,255,0.05)]
                    text-white
                    rounded-[25px]
                    shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#4a4a4a]
                    cursor-pointer
                  "
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-gray-400 text-sm">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </motion.div>

        {/* Users Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="bg-[#3a3a3a] rounded-[2em] p-12 shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-[#3a3a3a] rounded-[2em] p-12 shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No users found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="
                    bg-[#3a3a3a] 
                    rounded-[2em] 
                    p-6
                    shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
                    hover:shadow-[-5px_-5px_20px_#2a2a2a,5px_5px_10px_#4a4a4a,3px_3px_15px_#99b9ff,-5px_-5px_25px_#2a2a2a]
                    transition-all duration-300
                  "
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#4a4a4a]">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {user.full_name || 'Unnamed User'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 rounded-xl hover:bg-primary/20 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className={`text-sm ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </span>
                      {user.last_login && (
                        <span className="text-gray-500 text-xs">
                          Last login: {new Date(user.last_login).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
