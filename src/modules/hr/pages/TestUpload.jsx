import { useState } from 'react'
import { hrApi } from '../api/hrApi'
import toast from 'react-hot-toast'

export default function TestUpload() {
  const [employeeId, setEmployeeId] = useState('')
  const [uploading, setUploading] = useState(false)

  const testPhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !employeeId) {
      toast.error('Select a file and enter employee ID')
      return
    }

    setUploading(true)
    console.log('Testing photo upload...')
    
    const result = await hrApi.uploadEmployeePhoto(employeeId, file)
    console.log('Photo upload result:', result)
    
    if (result.error) {
      toast.error(`Photo upload failed: ${result.error.message || JSON.stringify(result.error)}`)
    } else {
      toast.success('Photo uploaded!')
    }
    
    setUploading(false)
  }

  const testDocUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !employeeId) {
      toast.error('Select a file and enter employee ID')
      return
    }

    setUploading(true)
    console.log('Testing document upload...')
    
    const result = await hrApi.uploadEmployeeDocument(employeeId, file)
    console.log('Document upload result:', result)
    
    if (result.error) {
      toast.error(`Document upload failed: ${result.error.message || JSON.stringify(result.error)}`)
    } else {
      toast.success('Document uploaded!')
    }
    
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Storage Upload Test</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Employee ID:</label>
        <input 
          type="text" 
          value={employeeId} 
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border p-2 rounded w-96"
          placeholder="Enter employee UUID"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Test Photo Upload:</label>
          <input type="file" accept="image/*" onChange={testPhotoUpload} disabled={uploading} />
        </div>

        <div>
          <label className="block mb-2">Test Document Upload:</label>
          <input type="file" onChange={testDocUpload} disabled={uploading} />
        </div>
      </div>

      {uploading && <p className="mt-4 text-blue-600">Uploading...</p>}
    </div>
  )
}
