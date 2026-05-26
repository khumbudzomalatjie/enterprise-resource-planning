import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useHRStore from '../store/hrStore'
import useThemeStore from '../../../store/themeStore'
import { hrApi } from '../api/hrApi'
import toast from 'react-hot-toast'
import { 
  ChevronRight, Users, Camera, Paperclip,
  Eye, FolderOpen, Trash2, Save, Sun, Moon,
  Sparkles, Upload, FileText, X, File, FileImage,
  ExternalLink, Download, Loader
} from 'lucide-react'

export default function AddEmployee() {
  const navigate = useNavigate()
  const { createEmployee } = useHRStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('general')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedEmployeeId, setSavedEmployeeId] = useState(null)
  
  // Refs for file inputs
  const attachmentInputRef = useRef(null)
  const photoInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    email: '',
    phone: '',
    alternative_phone: '',
    employment_status: 'active',
    position: '',
    department: '',
    employment_type: 'full_time',
    date_of_hire: new Date().toISOString().split('T')[0],
    gender: 'male',
    marital_status: 'single',
    country: 'South Africa',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    bank_name: '',
    bank_account_number: '',
    bank_branch_code: '',
    id_number: '',
    tax_number: '',
  })

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'employment', label: 'Employment' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'banking', label: 'Banking' },
    { id: 'documents', label: 'Documents' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle photo upload click
  const handlePhotoClick = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click()
    }
  }

  // Handle photo file selection
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF)')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
    toast.success('Photo selected')
    
    // Reset input so same file can be selected again if needed
    e.target.value = ''
  }

  // Handle "Add Att." button click - OPENS FILE PICKER
  const handleAddAttachmentClick = () => {
    if (!savedEmployeeId) {
      toast.error('Please save the employee first before adding attachments')
      return
    }
    
    // Trigger the hidden file input
    if (attachmentInputRef.current) {
      attachmentInputRef.current.click()
    }
  }

  // Process files when selected from device
  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!savedEmployeeId) {
      toast.error('Please save the employee first')
      e.target.value = ''
      return
    }

    setUploadingFiles(true)
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB allowed.`)
        failCount++
        continue
      }

      try {
        const result = await hrApi.uploadEmployeeDocument(savedEmployeeId, file)
        
        if (result.error) {
          toast.error(`Failed to upload ${file.name}`)
          failCount++
        } else {
          // Add to local state immediately
          setAttachments(prev => [...prev, {
            id: result.data.id,
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.data.url || result.data.document_url,
            document_url: result.data.document_url,
            uploaded_at: new Date().toISOString()
          }])
          successCount++
        }
      } catch (error) {
        toast.error(`Error uploading ${file.name}`)
        failCount++
      }
    }

    setUploadingFiles(false)
    
    // Summary toast
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} file(s) failed to upload`)
    }
    
    // Reset file input so same files can be selected again
    e.target.value = ''
  }

  // View document in new tab
  const handleViewDocument = (attachment) => {
    const url = attachment.url || attachment.document_url
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error('Document URL not available')
    }
  }

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return

    const result = await hrApi.deleteEmployeeDocument(attachmentId)
    
    if (result.error) {
      toast.error('Failed to delete attachment')
    } else {
      setAttachments(prev => prev.filter(att => att.id !== attachmentId))
      toast.success('Attachment deleted')
    }
  }

  // Show all attachments from database
  const handleShowAllAttachments = async () => {
    if (!savedEmployeeId) {
      toast.error('No employee saved yet')
      return
    }

    const result = await hrApi.getEmployeeDocuments(savedEmployeeId)
    if (result.data && result.data.length > 0) {
      setAttachments(result.data.map(doc => ({
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        url: doc.document_url,
        document_url: doc.document_url,
        uploaded_at: doc.uploaded_at,
        uploaded_by: doc.uploaded_by,
        size: null
      })))
      toast.success(`${result.data.length} attachment(s) loaded`)
    } else if (result.data && result.data.length === 0) {
      setAttachments([])
      toast('No attachments found', { icon: '📂' })
    } else {
      toast.error('Failed to load attachments')
    }
  }

  // Save employee
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in required fields: First Name, Last Name, and Email')
      return
    }

    setSaving(true)

    // Create employee record
    const result = await createEmployee({
      ...formData,
      profile_photo_url: null
    })

    if (!result.success) {
      toast.error(result.error || 'Failed to add employee')
      setSaving(false)
      return
    }

    const employeeId = result.data.id
    setSavedEmployeeId(employeeId)
    toast.success('Employee saved! You can now upload photo and documents.')

    // Upload photo if selected
    if (photoFile) {
      const photoResult = await hrApi.uploadEmployeePhoto(employeeId, photoFile)
      if (photoResult.error) {
        toast.error('Failed to upload photo')
      } else {
        toast.success('Photo uploaded successfully')
      }
    }

    setSaving(false)
    
    // Auto-navigate after short delay
    toast.success('Redirecting to employee details...')
    setTimeout(() => {
      navigate(`/hr/employees/${employeeId}`)
    }, 2000)
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Get file icon
  const getFileIcon = (type) => {
    if (!type) return <File className="w-4 h-4" />
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    if (type.includes('word') || type.includes('document')) return <FileText className="w-4 h-4 text-blue-600" />
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="w-4 h-4 text-green-600" />
    return <File className="w-4 h-4" />
  }

  // Get file type label
  const getFileTypeLabel = (type) => {
    if (!type) return 'FILE'
    if (type.startsWith('image/')) return type.split('/')[1].toUpperCase()
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('word')) return 'DOC'
    if (type.includes('excel')) return 'XLS'
    return type.split('/')[1]?.toUpperCase() || 'FILE'
  }

  return (
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="fixed top-20 right-4 z-30 flex items-center gap-4">
        <div className="neu-inset px-5 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-200 hidden sm:inline">
            Enterprise Resource Planning
          </span>
        </div>
        <button onClick={toggleTheme} className="neu-raised neu-btn w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          {isDark ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/hr" className="text-slate-500 hover:text-emerald-600">HR Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/hr/employees" className="text-slate-500 hover:text-emerald-600">Employees</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-medium">Add Employee</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">👥</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-[#2c5f9b] dark:text-[#6ba3d6] uppercase"
                style={{ fontFamily: "'Alumni Sans Pinstripe', sans-serif", letterSpacing: '3px' }}>
                Employee Manager
              </h1>
              {savedEmployeeId && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ✅ Employee saved · Now you can add attachments
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neu-raised rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300">Employee:</span>
            <input 
              className="neu-inset rounded-xl px-4 py-2 text-slate-700 dark:text-slate-300 w-full sm:w-[340px]"
              value={`${formData.first_name} ${formData.last_name}`.trim() || 'New Employee'}
              readOnly
            />
            
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="neu-btn px-4 py-2 rounded-xl bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold hover:from-[#5a9ad6] hover:to-[#3569a3] transition-all disabled:opacity-50 flex items-center gap-2"
              style={{
                boxShadow: '3px 3px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.5)'
              }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : savedEmployeeId ? 'Update Employee' : '💾 Save Employee'}
            </button>

            <span className="font-bold text-slate-700 dark:text-slate-300">Empl. ID:</span>
            <input className="neu-inset rounded-xl px-4 py-2 text-slate-700 dark:text-slate-300 w-[180px]" 
              value={savedEmployeeId ? savedEmployeeId.slice(0, 8).toUpperCase() : 'Auto-generated'} 
              readOnly 
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-5 border border-[#2f77bb] dark:border-[#4a90c4] rounded-t-xl overflow-hidden"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 font-bold text-sm transition-colors border-r border-[#2f77bb] dark:border-[#4a90c4] last:border-r-0 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white'
                  : 'bg-[#d3e1ef] dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-[#e8eff7] dark:hover:bg-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-t-0 border-[#2f77bb] dark:border-[#4a90c4] bg-[#d7e5f2] dark:bg-slate-700 rounded-b-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_170px] gap-5 p-4">
            {/* Form Area */}
            <div>
              {/* General Info Tab */}
              {activeTab === 'general' && (
                <div className="grid grid-cols-[140px_1fr_140px_1fr] border-t border-l border-[#2f77bb] dark:border-[#4a90c4]">
                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Last Name:*
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="last_name" value={formData.last_name} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" required />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    First Name:*
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="first_name" value={formData.first_name} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" required />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Address:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600" style={{ gridColumn: 'span 3' }}>
                    <input name="address_line1" value={formData.address_line1} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    City:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="city" value={formData.city} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    State:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="state" value={formData.state} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Zip Code:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="postal_code" value={formData.postal_code} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Email:*
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="email" type="email" value={formData.email} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" required />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Cell Phone:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Status:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <select name="employment_status" value={formData.employment_status} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Other Phone:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="alternative_phone" value={formData.alternative_phone} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">
                    Type / Position:
                  </div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="position" value={formData.position} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" placeholder="e.g., Cleaner, Supervisor" />
                  </div>
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === 'employment' && (
                <div className="grid grid-cols-[140px_1fr_140px_1fr] border-t border-l border-[#2f77bb] dark:border-[#4a90c4]">
                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Department:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <select name="department" value={formData.department} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none">
                      <option value="">Select Department</option>
                      <option value="operations">Operations</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="administration">Administration</option>
                      <option value="sales">Sales</option>
                      <option value="hr">Human Resources</option>
                      <option value="finance">Finance</option>
                    </select>
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Emp. Type:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <select name="employment_type" value={formData.employment_type} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none">
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Date Hired:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input type="date" name="date_of_hire" value={formData.date_of_hire} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Gender:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Emergency Tab */}
              {activeTab === 'emergency' && (
                <div className="grid grid-cols-[140px_1fr_140px_1fr] border-t border-l border-[#2f77bb] dark:border-[#4a90c4]">
                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Contact Name:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Phone:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Relation:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600" style={{ gridColumn: 'span 3' }}>
                    <input name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === 'banking' && (
                <div className="grid grid-cols-[140px_1fr_140px_1fr] border-t border-l border-[#2f77bb] dark:border-[#4a90c4]">
                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Bank Name:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="bank_name" value={formData.bank_name} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Account No:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="bank_account_number" value={formData.bank_account_number} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">Branch Code:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="bank_branch_code" value={formData.bank_branch_code} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>

                  <div className="cell label-cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center justify-end px-4 bg-[#d7e5f2] dark:bg-slate-600 font-bold text-slate-700 dark:text-slate-200">ID Number:</div>
                  <div className="cell border-r border-b border-[#2f77bb] dark:border-[#4a90c4] min-h-[38px] flex items-center px-2 bg-[#dce8f5] dark:bg-slate-600">
                    <input name="id_number" value={formData.id_number} onChange={handleChange}
                      className="w-full border-none bg-[#f7f7c2] dark:bg-yellow-50 dark:text-slate-800 h-[25px] px-2 outline-none" />
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="p-4">
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {savedEmployeeId 
                      ? '📁 Click "Add Att." button below to upload documents from your device.'
                      : '⚠️ Please save the employee first, then upload documents.'}
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Supported: PDF, Word, Excel, Images (JPG, PNG, GIF) · Max 10MB per file
                  </p>
                  {savedEmployeeId && (
                    <button
                      onClick={handleAddAttachmentClick}
                      className="neu-btn px-6 py-3 rounded-xl bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold flex items-center gap-2"
                      style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.35)' }}
                    >
                      <Upload className="w-5 h-5" />
                      Select Files from Device
                    </button>
                  )}
                </div>
              )}

              {/* HIDDEN FILE INPUT - This is what opens when "Add Att." is clicked */}
              <input 
                type="file" 
                multiple 
                ref={attachmentInputRef}
                onChange={handleFileSelect}
                className="hidden" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv,.ppt,.pptx"
              />

              {/* Attachments Section */}
              <div className="mt-4 border border-[#2f77bb] dark:border-[#4a90c4] rounded-lg overflow-hidden">
                <div className="flex flex-wrap gap-2 p-3 bg-[#c9dff2] dark:bg-slate-600 border-b border-[#2f77bb] dark:border-[#4a90c4]">
                  <button 
                    onClick={handleAddAttachmentClick}
                    disabled={!savedEmployeeId || uploadingFiles}
                    className="neu-btn px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white text-sm font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.35)' }}
                  >
                    {uploadingFiles ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Paperclip className="w-4 h-4" /> Add Att.
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleShowAllAttachments}
                    disabled={!savedEmployeeId}
                    className="neu-btn px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white text-sm font-bold flex items-center gap-1 disabled:opacity-50"
                    style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.35)' }}
                  >
                    <Eye className="w-4 h-4" /> Show All Att.
                  </button>
                  
                  {!savedEmployeeId && (
                    <span className="text-amber-600 text-xs flex items-center gap-1 ml-2">
                      ⚠️ Save employee first
                    </span>
                  )}
                </div>

                <table className="w-full border-collapse bg-white dark:bg-slate-800">
                  <thead>
                    <tr>
                      <th className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 bg-[#d4e6f7] dark:bg-slate-600 text-sm text-left">File Name</th>
                      <th className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 bg-[#d4e6f7] dark:bg-slate-600 text-sm text-left">Type</th>
                      <th className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 bg-[#d4e6f7] dark:bg-slate-600 text-sm text-left">Size</th>
                      <th className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 bg-[#d4e6f7] dark:bg-slate-600 text-sm text-center">👁 View</th>
                      <th className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 bg-[#d4e6f7] dark:bg-slate-600 text-sm text-center">🗑 Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="border border-[#2f77bb] dark:border-[#4a90c4] p-4 text-center text-slate-500 italic bg-[#f7fbff] dark:bg-slate-700">
                          {savedEmployeeId 
                            ? 'No attachments yet. Click "Add Att." to upload files from your device.'
                            : 'Save the employee record first, then you can upload attachments.'}
                        </td>
                      </tr>
                    ) : (
                      attachments.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 text-sm">
                            <div className="flex items-center gap-2">
                              {getFileIcon(att.type)}
                              <span className="truncate max-w-[180px]" title={att.name}>{att.name}</span>
                            </div>
                          </td>
                          <td className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 text-sm">
                            {getFileTypeLabel(att.type)}
                          </td>
                          <td className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 text-sm">
                            {formatFileSize(att.size)}
                          </td>
                          <td className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 text-center">
                            <button 
                              onClick={() => handleViewDocument(att)}
                              className="text-[#0066cc] hover:text-[#004499] dark:text-[#6ba3d6] dark:hover:text-[#8fc4f0] inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Open document in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-xs font-medium">View</span>
                            </button>
                          </td>
                          <td className="border border-[#2f77bb] dark:border-[#4a90c4] p-2 text-center">
                            <button 
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="text-red-500 hover:text-red-700 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete attachment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Photo Panel */}
            <div className="border border-[#2f77bb] dark:border-[#4a90c4] bg-[#dce8f5] dark:bg-slate-600 flex flex-col items-center justify-center p-4 rounded-lg">
              <div className="w-[150px] h-[170px] border-[3px] border-[#3569a3] dark:border-[#4a90c4] bg-[#edf3f9] dark:bg-slate-700 flex items-center justify-center overflow-hidden rounded-lg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="Default" className="w-20 h-20 opacity-50" />
                )}
              </div>
              
              <button
                onClick={handlePhotoClick}
                className="mt-4 text-[#0066cc] dark:text-[#6ba3d6] font-bold cursor-pointer hover:underline flex items-center gap-1 bg-transparent border-none"
              >
                <Camera className="w-4 h-4" />
                Add Picture
              </button>
              
              {/* Hidden photo input */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
                ref={photoInputRef}
              />
              
              {photoFile && (
                <p className="text-xs text-emerald-600 mt-1">📷 Photo ready to upload</p>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
