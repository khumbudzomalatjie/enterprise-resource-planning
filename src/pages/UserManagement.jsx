import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'
import { USER_ROLES } from '../types/authTypes'
import toast from 'react-hot-toast'
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  ChevronDown,
  Plus,
  X
} from 'lucide-react'

export default function UserManagement() {
  const { profile, getAllUsers } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success) {
      setUsers(result.data)
    } else {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-[#333]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">Manage all system users and their roles</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
                placeholder="Search users..."
                className="
                  w-full
                  pl-12 pr-4 py-3
                  bg-[rgba(255,255,255,0.05)]
                  text-white
                  placeholder-gray-400
                  rounded-[25px]
                  shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#4a4a4a]
                "
              />
            </div>
            
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
                {Object.values(USER_ROLES).map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="
            bg-[#3a3a3a] 
            rounded-[2em] 
            p-6
            shadow-[5px_5px_20px_#2a2a2a,-5px_-5px_20px_#4a4a4a]
          "
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-4">User</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-4">Email</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-4">Role</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-4">Status</th>
                    <th className="text-right text-gray-400 text-sm font-medium py-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700/50 hover:bg-[#444] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.full_name || 'Unnamed User'}</p>
                            <p className="text-gray-400 text-xs">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className="
                          px-3 py-1 
                          rounded-full 
                          text-xs 
                          font-medium
                          bg-primary/20 
                          text-primary
                        ">
                          {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          <span className="text-green-400 text-sm">Active</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 rounded-lg hover:bg-primary/20 text-gray-400 hover:text-primary transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
