import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'
import useMobileStore from '../store/mobileStore'
import BottomNav from '../components/BottomNav'
import toast from 'react-hot-toast'
import { Package, Plus, Trash2, ArrowLeft, Send } from 'lucide-react'

export default function SuppliesRequest() {
  const { profile } = useAuthStore()
  const { createSuppliesRequest, myJobs, fetchMyJobs } = useMobileStore()
  const navigate = useNavigate()
  const [selectedJob, setSelectedJob] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ item_name: '', quantity: 1, unit: 'each', notes: '' }])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (profile?.id) fetchMyJobs(profile.id)
  }, [])

  const addItem = () => setItems([...items, { item_name: '', quantity: 1, unit: 'each', notes: '' }])
  
  const removeItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i))
  }

  const updateItem = (i, field, value) => {
    const newItems = [...items]
    newItems[i] = { ...newItems[i], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async () => {
    if (!items[0].item_name.trim()) { toast.error('Please add at least one item'); return }
    
    setSubmitting(true)
    const result = await createSuppliesRequest(
      { employee_id: profile.id, job_id: selectedJob || null, notes },
      items
    )
    
    if (result.success) {
      toast.success('Supplies request submitted! ✅')
      setItems([{ item_name: '', quantity: 1, unit: 'each', notes: '' }])
      setNotes('')
      setSelectedJob('')
    } else {
      toast.error('Failed to submit request')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] pb-20">
      <div className="bg-gradient-to-b from-purple-500 to-purple-600 px-4 pt-8 pb-6 text-white">
        <button onClick={() => navigate('/mobile')} className="p-1 rounded-lg hover:bg-white/20 mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Request Supplies</h1>
        <p className="text-purple-100 text-sm">Order cleaning materials</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm font-semibold text-slate-500 mb-2 block">Related Job (optional)</label>
          <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <option value="">No specific job</option>
            {myJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-700">Items</h3>
            <button onClick={addItem} className="text-purple-500 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Item {i + 1}</span>
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" value={item.item_name} onChange={e => updateItem(i, 'item_name', e.target.value)} placeholder="Item name" className="w-full p-2 rounded-lg bg-white border border-slate-200 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} placeholder="Qty" className="p-2 rounded-lg bg-white border border-slate-200 text-sm" />
                  <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="p-2 rounded-lg bg-white border border-slate-200 text-sm">
                    <option value="each">Each</option><option value="box">Box</option><option value="bottle">Bottle</option><option value="pack">Pack</option><option value="litre">Litre</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm font-semibold text-slate-500 mb-2 block">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any additional notes..." className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm resize-none" />
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-purple-500 text-white rounded-2xl p-4 font-bold text-lg hover:bg-purple-600 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2">
          <Send className="w-5 h-5" />
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  )
}
