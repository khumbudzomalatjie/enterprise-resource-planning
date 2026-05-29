import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import useHRStore from '../store/hrStore'
import useThemeStore from '../../../store/themeStore'
import { supabase } from '../../../lib/supabaseClient'
import toast from 'react-hot-toast'
import { 
  User, Save, Plus, Trash2, Upload, ChevronRight, ArrowLeft,
  Mail, Phone, MapPin, Calendar, Briefcase, Shield, Users,
  Clock, CreditCard, FileText, Eye, Download, X, Paperclip
} from 'lucide-react'

export default function EmployeeDetail() {
  const { id } = useParams()
  const { selectedEmployee, fetchEmployee, updateEmployee, deleteEmployee, loading } = useHRStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('general')
  const [uploading, setUploading] = useState(false)
  const [attachments, setAttachments] = useState([])

  useEffect(() => {
    if (id && id !== 'new') {
      fetchEmployee(id)
      loadAttachments()
    }
  }, [id])

  useEffect(() => {
    if (selectedEmployee) {
      setEditData({ ...selectedEmployee })
    }
  }, [selectedEmployee])

  const loadAttachments = async () => {
    // Load employee documents
    const { data } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', id)
      .order('uploaded_at', { ascending: false })
    setAttachments(data || [])
  }

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
      toast.error(result.error || 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Terminate this employee?')) {
      const result = await deleteEmployee(id)
      if (result.success) {
        toast.success('Employee terminated')
        navigate('/hr/employees')
      }
    }
  }

  // Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `employee-photos/${id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('fleet')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('fleet').getPublicUrl(fileName)
      
      await updateEmployee(id, { profile_photo_url: publicUrl })
      fetchEmployee(id)
      toast.success('Photo updated!')
    } catch (error) {
      toast.error('Failed to upload photo')
    }
    setUploading(false)
  }

  // Attachment Upload
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `employee-docs/${id}/${Date.now()}-${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)

      await supabase.from('employee_documents').insert([{
        employee_id: id,
        document_type: 'other',
        document_name: file.name,
        document_url: publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      }])

      toast.success('Document attached!')
      loadAttachments()
    } catch (error) {
      toast.error('Failed to upload document')
    }
  }

  const handleDeleteAttachment = async (docId) => {
    if (window.confirm('Delete this attachment?')) {
      await supabase.from('employee_documents').delete().eq('id', docId)
      toast.success('Attachment deleted')
      loadAttachments()
    }
  }

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  // Loading
  if (loading) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2c5f9b]"></div>
        </div>
      </div>
    )
  }

  if (!selectedEmployee) {
    return (
      <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Employee not found</p>
            <button onClick={() => navigate('/hr/employees')} className="mt-4 px-6 py-3 rounded-xl bg-[#2d5f98] text-white">Back to Employees</button>
          </div>
        </div>
      </div>
    )
  }

  const employee = selectedEmployee
  const inputClass = "w-full border border-[#2c73b6] bg-[#f7f7c2] h-[30px] px-2 outline-none text-sm"
  const labelCellClass = "cell label-cell justify-end font-bold bg-[#d7e5f2] dark:bg-slate-700"
  const valueCellClass = "cell bg-[#dce8f5] dark:bg-slate-600"

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'attendance', label: 'Time Clock History' },
    { id: 'payroll', label: 'Payroll History' },
    { id: 'details', label: 'Payroll & Details' },
    { id: 'schedule', label: 'Scheduling' },
    { id: 'leave', label: 'Leave' },
    { id: 'events', label: 'Events' },
  ]

  return (
    <div className="min-h-screen bg-[#d8d8d8] dark:bg-slate-900 font-['Inter'] transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 pt-4 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2 text-sm px-2">
          <Link to="/hr" className="text-[#2c5f9b] hover:underline">HR Management</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to="/hr/employees" className="text-[#2c5f9b] hover:underline">Employees</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">{employee.first_name} {employee.last_name}</span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center relative mb-3">
          <div className="absolute left-4 text-[50px] text-[#2f5f9b]">👥</div>
          <h1 className="text-[60px] md:text-[70px] text-[#2c5f9b] tracking-wider font-black uppercase" 
            style={{ fontFamily: "'Alumni Sans Pinstripe', sans-serif" }}>
            Employee Manager
          </h1>
        </div>

        {/* Top Bar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap px-2">
          <span className="text-base font-bold text-slate-700 dark:text-slate-300">Employee:</span>
          <input 
            value={`${editData?.first_name || employee.first_name} ${editData?.last_name || employee.last_name}`}
            onChange={e => {
              const [first, ...last] = e.target.value.split(' ')
              setEditData({...editData, first_name: first || '', last_name: last.join(' ') || ''})
            }}
            className="border border-[#2c73b6] bg-white dark:bg-slate-700 h-7 px-2 outline-none w-[340px] text-sm"
            readOnly={!isEditing}
          />

          {isEditing ? (
            <>
              <button onClick={handleSave} className="neo-btn h-8 px-4 rounded-md bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold text-sm hover:opacity-90 flex items-center gap-1">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => { setIsEditing(false); setEditData({...employee}) }} className="neo-btn h-8 px-4 rounded-md bg-gradient-to-b from-gray-400 to-gray-600 text-white font-bold text-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="neo-btn h-8 px-4 rounded-md bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold text-sm">
                ✏️ Edit
              </button>
              <button onClick={handleDelete} className="neo-btn h-8 px-4 rounded-md bg-gradient-to-b from-red-500 to-red-700 text-white font-bold text-sm">
                🗑 Terminate
              </button>
            </>
          )}

          <span className="text-base font-bold text-slate-700 dark:text-slate-300 ml-4">Empl. ID:</span>
          <input value={employee.employee_code || ''} className="border border-[#2c73b6] bg-white dark:bg-slate-700 h-7 px-2 outline-none w-[140px] text-sm" readOnly />
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-7 border border-[#2f77bb] mb-0">
          {tabs.map(tab => (
            <div key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`text-center py-2 text-sm font-bold cursor-pointer border-r border-[#2f77bb] last:border-r-0 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#f4f4f4] dark:bg-slate-600 text-slate-800 dark:text-white' 
                  : 'bg-[#d3e1ef] dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#c5d8ec]'
              }`}>
              {tab.label}
            </div>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'general' && (
          <div className="border border-[#2f77bb] bg-[#d7e5f2] dark:bg-slate-800 grid grid-cols-1 lg:grid-cols-[1fr_170px] gap-5 p-2.5">
            {/* Form Grid */}
            <div>
              <div className="grid grid-cols-[140px_1fr_140px_1fr] border-t border-l border-[#2f77bb]">
                {/* Last Name */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Last Name:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.last_name || ''} onChange={e => setEditData({...editData, last_name: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.last_name}</span>}
                </div>

                {/* First Name */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>First Name:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.first_name || ''} onChange={e => setEditData({...editData, first_name: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.first_name}</span>}
                </div>

                {/* Address */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Address:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"} style={{gridColumn: 'span 3'}}>
                  {isEditing ? <input value={editData?.address_line1 || ''} onChange={e => setEditData({...editData, address_line1: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.address_line1 || '-'}</span>}
                </div>

                {/* City */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>City:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.city || ''} onChange={e => setEditData({...editData, city: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.city || '-'}</span>}
                </div>

                {/* State */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>State:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.state || ''} onChange={e => setEditData({...editData, state: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.state || '-'}</span>}
                </div>

                {/* Zip Code */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Zip Code:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.postal_code || ''} onChange={e => setEditData({...editData, postal_code: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.postal_code || '-'}</span>}
                </div>

                {/* Email */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Email:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"} style={{gridColumn: 'span 3'}}>
                  {isEditing ? <input value={editData?.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.email}</span>}
                </div>

                {/* Cell Phone */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Cell Phone:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.phone || '-'}</span>}
                </div>

                {/* Status */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Status:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? (
                    <select value={editData?.employment_status || ''} onChange={e => setEditData({...editData, employment_status: e.target.value})} className={inputClass}>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  ) : (
                    <span className="text-sm capitalize">{employee.employment_status?.replace('_', ' ') || '-'}</span>
                  )}
                </div>

                {/* Other Phone */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Other Phone:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.alternative_phone || ''} onChange={e => setEditData({...editData, alternative_phone: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.alternative_phone || '-'}</span>}
                </div>

                {/* Type / Position */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Type / Position:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.position || ''} onChange={e => setEditData({...editData, position: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.position || '-'}</span>}
                </div>

                {/* Department */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Department:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.department || ''} onChange={e => setEditData({...editData, department: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.department || '-'}</span>}
                </div>

                {/* Date Hired */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Date Hired:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input type="date" value={editData?.date_of_hire || ''} onChange={e => setEditData({...editData, date_of_hire: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{formatDate(employee.date_of_hire)}</span>}
                </div>

                {/* ID Number */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>ID Number:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.id_number || ''} onChange={e => setEditData({...editData, id_number: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.id_number || '-'}</span>}
                </div>

                {/* Tax Number */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Tax Number:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.tax_number || ''} onChange={e => setEditData({...editData, tax_number: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.tax_number || '-'}</span>}
                </div>

                {/* Bank Name */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Bank Name:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.bank_name || ''} onChange={e => setEditData({...editData, bank_name: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.bank_name || '-'}</span>}
                </div>

                {/* Account Number */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Account #:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.bank_account_number || ''} onChange={e => setEditData({...editData, bank_account_number: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.bank_account_number || '-'}</span>}
                </div>

                {/* Emergency Contact */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Emerg. Contact:</div>
                <div className={valueCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.emergency_contact_name || ''} onChange={e => setEditData({...editData, emergency_contact_name: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.emergency_contact_name || '-'}</span>}
                </div>

                {/* Emergency Phone */}
                <div className={labelCellClass + " border-r border-b border-[#2f77bb] min-h-[38px] flex items-center justify-end px-2"}>Emerg. Phone:</div>
                <div className={valueCellClass + " border-b border-[#2f77bb] min-h-[38px] flex items-center px-2"}>
                  {isEditing ? <input value={editData?.emergency_contact_phone || ''} onChange={e => setEditData({...editData, emergency_contact_phone: e.target.value})} className={inputClass} /> 
                    : <span className="text-sm">{employee.emergency_contact_phone || '-'}</span>}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="mt-4 border border-[#2f77bb]">
                <div className="flex gap-1.5 p-1.5 bg-[#c9dff2] dark:bg-slate-700 border-b border-[#2f77bb] flex-wrap">
                  <button onClick={() => fileInputRef.current?.click()} className="neo-btn h-8 px-3 rounded-md bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold text-xs flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> Add Att.
                  </button>
                  <button className="neo-btn h-8 px-3 rounded-md bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold text-xs">👁 Show All</button>
                  <button className="neo-btn h-8 px-3 rounded-md bg-gradient-to-b from-[#4f8fd0] to-[#2d5f98] text-white font-bold text-xs">📂 Open</button>
                  <button className="neo-btn h-8 px-3 rounded-md bg-gradient-to-b from-red-500 to-red-700 text-white font-bold text-xs">❌ Delete Att.</button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttachmentUpload} />
                </div>

                <table className="w-full border-collapse bg-white dark:bg-slate-800">
                  <thead>
                    <tr>
                      <th className="bg-[#d4e6f7] dark:bg-slate-600 border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">File Name</th>
                      <th className="bg-[#d4e6f7] dark:bg-slate-600 border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">File Type</th>
                      <th className="bg-[#d4e6f7] dark:bg-slate-600 border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">File Path</th>
                      <th className="bg-[#d4e6f7] dark:bg-slate-600 border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">Added On</th>
                      <th className="bg-[#d4e6f7] dark:bg-slate-600 border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.length > 0 ? attachments.map(doc => (
                      <tr key={doc.id}>
                        <td className="border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">{doc.document_name}</td>
                        <td className="border border-[#2f77bb] dark:border-slate-500 p-2 text-sm capitalize">{doc.document_type}</td>
                        <td className="border border-[#2f77bb] dark:border-slate-500 p-2 text-sm truncate max-w-[200px]">
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">{doc.document_url?.slice(0, 50)}...</a>
                        </td>
                        <td className="border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">{formatDate(doc.uploaded_at)}</td>
                        <td className="border border-[#2f77bb] dark:border-slate-500 p-2 text-sm">
                          <div className="flex gap-1">
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30" title="View"><Eye className="w-4 h-4 text-blue-600" /></a>
                            <a href={doc.document_url} download className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30" title="Download"><Download className="w-4 h-4 text-emerald-600" /></a>
                            <button onClick={() => handleDeleteAttachment(doc.id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="border border-[#2f77bb] dark:border-slate-500 p-4 text-center text-slate-400 italic bg-[#f7fbff] dark:bg-slate-700">
                          No attachments available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Photo Panel */}
            <div className="border border-[#2f77bb] bg-[#dce8f5] dark:bg-slate-700 flex flex-col items-center justify-center p-2.5">
              <div className="w-[150px] h-[170px] border-[3px] border-[#3569a3] dark:border-slate-500 bg-[#edf3f9] dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                {employee.profile_photo_url ? (
                  <img src={employee.profile_photo_url} alt="Employee" className="w-full h-full object-cover" />
                ) : (
                  <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="Default" className="w-full h-full object-contain p-4" />
                )}
              </div>
              <button 
                onClick={() => photoInputRef.current?.click()} 
                className="mt-2.5 text-[#0066cc] dark:text-blue-400 font-bold cursor-pointer text-sm hover:underline flex items-center gap-1"
              >
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Add Picture'}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </div>
        )}

        {/* Other Tabs - Placeholder */}
        {activeTab !== 'general' && (
          <div className="border border-[#2f77bb] bg-[#d7e5f2] dark:bg-slate-800 p-10 text-center min-h-[400px] flex items-center justify-center">
            <div>
              <Clock className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-semibold">{tabs.find(t => t.id === activeTab)?.label}</p>
              <p className="text-slate-400 text-sm mt-2">This section will display {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} data.</p>
              <p className="text-slate-400 text-xs mt-1">Linked to the relevant module in the ERP system.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
