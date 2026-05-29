import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useHRStore from '../store/hrStore'
import useThemeStore from '../../../store/themeStore'
import toast from 'react-hot-toast'
import { 
  User, Edit, Trash2, Save, X, ChevronRight, ArrowLeft,
  Mail, Phone, MapPin, Calendar, Briefcase, Shield,
  CreditCard, Users, Clock, FileText, Building
} from 'lucide-react'

export default function EmployeeDetail() {
  const { id } = useParams()
  const { selectedEmployee, fetchEmployee, updateEmployee, deleteEmployee, loading } = useHRStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    if (id && id !== 'new') {
      fetchEmployee(id)
    }
  }, [id])

  useEffect(() => {
    if (selectedEmployee) {
      setEditData({ ...selectedEmployee })
    }
  }, [selectedEmployee])

  const handleSave = async () => {
    if (!editData.first_name || !editData.last_name || !editData.email) {
      toast.error('Name and email are required')
      return
    }

    const result = await updateEmployee(id, editData)
    if (result.success) {
      toast.success('Employee updated!')
      setIsEditing(false)
      fetchEmployee(id)
    } else {
      toast.error(result.error || 'Failed to update employee')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to terminate this employee?')) {
      const result = await deleteEmployee(id)
      if (result.success) {
        toast.success('Employee terminated')
        navigate('/hr/employees')
      } else {
        toast.error('Failed to delete employee')
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({ ...selectedEmployee })
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      terminated: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    }
    return badges[status] || 'bg-slate-100 text-slate-600'
  }

  // Loading State
  if (loading) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Loading employee details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not Found
  if (!selectedEmployee) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <Users className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">Employee not found</p>
            <button onClick={() => navigate('/hr/employees')} className="neu-raised neu-btn px-6 py-3 rounded-2xl bg-emerald-600 text-white">
              Back to Employees
            </button>
          </div>
        </div>
      </div>
    )
  }

  const employee = selectedEmployee

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/hr" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">HR Management</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/hr/employees" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">Employees</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">
            {isEditing ? 'Edit' : employee.first_name} {employee.last_name}
          </span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="neu-raised rounded-3xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                {isEditing ? (
                  <div className="flex gap-2 mb-1">
                    <input type="text" value={editData.first_name} onChange={e => setEditData({...editData, first_name: e.target.value})} 
                      className="p-2 neu-inset rounded-lg text-xl font-bold w-40" placeholder="First Name" />
                    <input type="text" value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})}
                      className="p-2 neu-inset rounded-lg text-xl font-bold w-40" placeholder="Last Name" />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {employee.first_name} {employee.last_name}
                  </h1>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-slate-500">{employee.employee_code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(employee.employment_status)}`}>
                    {employee.employment_status?.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                    {employee.employment_type?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2 text-sm">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={handleCancelEdit} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-slate-600 text-white flex items-center gap-2 text-sm">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-blue-600 text-white flex items-center gap-2 text-sm">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  {employee.employment_status !== 'terminated' && (
                    <button onClick={handleDelete} className="neu-raised neu-btn px-4 py-2 rounded-xl bg-red-600 text-white flex items-center gap-2 text-sm">
                      <Trash2 className="w-4 h-4" /> Terminate
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Personal Information
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <input type="email" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Phone</label>
                  <input type="text" value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Date of Birth</label>
                  <input type="date" value={editData.date_of_birth || ''} onChange={e => setEditData({...editData, date_of_birth: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Gender</label>
                    <select value={editData.gender || ''} onChange={e => setEditData({...editData, gender: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Marital Status</label>
                    <select value={editData.marital_status || ''} onChange={e => setEditData({...editData, marital_status: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1">
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span className="text-slate-600 dark:text-slate-400">{employee.email || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span className="text-slate-600 dark:text-slate-400">{employee.phone || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-slate-600 dark:text-slate-400">DOB: {formatDate(employee.date_of_birth)}</span></div>
                <div className="flex gap-4">
                  <span className="text-slate-500">Gender: <span className="text-slate-700 dark:text-slate-300 capitalize">{employee.gender || 'N/A'}</span></span>
                  <span className="text-slate-500">Status: <span className="text-slate-700 dark:text-slate-300 capitalize">{employee.marital_status || 'N/A'}</span></span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Employment Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Employment Details
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Department</label>
                  <input type="text" value={editData.department || ''} onChange={e => setEditData({...editData, department: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Position</label>
                  <input type="text" value={editData.position || ''} onChange={e => setEditData({...editData, position: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Type</label>
                    <select value={editData.employment_type || ''} onChange={e => setEditData({...editData, employment_type: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1">
                      <option value="">Select</option>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Status</label>
                    <select value={editData.employment_status || ''} onChange={e => setEditData({...editData, employment_status: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Date of Hire</label>
                  <input type="date" value={editData.date_of_hire || ''} onChange={e => setEditData({...editData, date_of_hire: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Department:</span><span className="font-medium text-slate-700 dark:text-slate-300">{employee.department || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Position:</span><span className="font-medium text-slate-700 dark:text-slate-300">{employee.position || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Type:</span><span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{employee.employment_type?.replace('_', ' ') || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date Hired:</span><span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(employee.date_of_hire)}</span></div>
              </div>
            )}
          </motion.div>

          {/* Address */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Address
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Address Line 1</label>
                  <input type="text" value={editData.address_line1 || ''} onChange={e => setEditData({...editData, address_line1: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Address Line 2</label>
                  <input type="text" value={editData.address_line2 || ''} onChange={e => setEditData({...editData, address_line2: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">City</label>
                    <input type="text" value={editData.city || ''} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Postal Code</label>
                    <input type="text" value={editData.postal_code || ''} onChange={e => setEditData({...editData, postal_code: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {employee.address_line1 && <p>{employee.address_line1}</p>}
                {employee.address_line2 && <p>{employee.address_line2}</p>}
                <p>{[employee.city, employee.state, employee.postal_code].filter(Boolean).join(', ') || 'No address'}</p>
              </div>
            )}
          </motion.div>

          {/* Emergency Contact & Banking */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="neu-raised rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" /> Emergency & Banking
            </h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Emergency Contact Name</label>
                  <input type="text" value={editData.emergency_contact_name || ''} onChange={e => setEditData({...editData, emergency_contact_name: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Emergency Phone</label>
                  <input type="text" value={editData.emergency_contact_phone || ''} onChange={e => setEditData({...editData, emergency_contact_phone: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Bank Name</label>
                  <input type="text" value={editData.bank_name || ''} onChange={e => setEditData({...editData, bank_name: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Account Number</label>
                  <input type="text" value={editData.bank_account_number || ''} onChange={e => setEditData({...editData, bank_account_number: e.target.value})} className="w-full p-2 neu-inset rounded-lg text-sm mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Emergency Contact</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{employee.emergency_contact_name || 'N/A'}</p>
                  <p className="text-slate-600 dark:text-slate-400">{employee.emergency_contact_phone || 'N/A'}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-600">
                  <p className="text-slate-500 text-xs">Banking</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{employee.bank_name || 'N/A'}</p>
                  <p className="text-slate-600 dark:text-slate-400">{employee.bank_account_number || 'N/A'}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Notes */}
        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neu-raised rounded-3xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Notes</h3>
            <textarea value={editData.notes || ''} onChange={e => setEditData({...editData, notes: e.target.value})} 
              rows={3} className="w-full p-3 neu-inset rounded-xl text-sm" placeholder="Add notes about this employee..." />
          </motion.div>
        )}
      </main>
    </div>
  )
}
