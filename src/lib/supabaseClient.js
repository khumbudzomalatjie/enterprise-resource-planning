import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://tbiungnraurvislidiia.supabase.co',
  supabaseAnonKey || 'sb_publishable_I4hotAnpQLPlJ_8jF2sNhA_A7yUEYde',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'ndanduleni-auth',
    },
  }
)

// Storage bucket names
export const STORAGE_BUCKETS = {
  EMPLOYEE_PHOTOS: 'employee-photos',
  EMPLOYEE_DOCUMENTS: 'employee-documents',
  COMPANY_LOGOS: 'company-logos',
}

// Helper function to get public URL
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper function to upload file
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  return data
}

// Helper function to delete file
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
  return true
}

// Helper function to list files
export const listFiles = async (bucket, folderPath) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath)
  
  if (error) throw error
  return data
}

// Helper function to download file
export const downloadFile = async (bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)
  
  if (error) throw error
  return data
}
