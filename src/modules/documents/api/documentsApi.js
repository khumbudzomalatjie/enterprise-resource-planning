import { supabase } from '../../../lib/supabaseClient'

export const documentsApi = {
  // Folders
  async getFolders() {
    const { data, error } = await supabase.from('document_folders').select('*').order('folder_name')
    return { data, error }
  },

  async createFolder(folderData) {
    const { data, error } = await supabase.from('document_folders').insert([folderData]).select().single()
    return { data, error }
  },

  // Documents
  async getDocuments(folderId = null, filters = {}) {
    let query = supabase.from('managed_documents').select('*, document_folders(folder_name)').neq('status', 'archived').order('updated_at', { ascending: false })
    if (folderId) query = query.eq('folder_id', folderId)
    if (filters.type) query = query.eq('document_type', filters.type)
    if (filters.search) query = query.or(`document_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    const { data, error } = await query
    return { data, error }
  },

  async uploadDocument(file, metadata) {
    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `docs/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { error: uploadError.message || 'Upload failed' }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Save document record to database
      const { data, error } = await supabase
        .from('managed_documents')
        .insert([{
          document_name: metadata.document_name || file.name,
          folder_id: metadata.folder_id || null,
          document_type: metadata.document_type || 'other',
          description: metadata.description || '',
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          status: 'published'
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('Upload error:', error)
      return { error: error.message || 'Upload failed' }
    }
  },

  async updateDocument(id, updates) {
    const { data, error } = await supabase
      .from('managed_documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteDocument(id) {
    const { error } = await supabase
      .from('managed_documents')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    return { error }
  },

  async getStats() {
    const [{ count: totalDocs }, { count: contracts }, { count: policies }, { count: sops }] = await Promise.all([
      supabase.from('managed_documents').select('*', { count: 'exact', head: true }).neq('status', 'archived'),
      supabase.from('managed_documents').select('*', { count: 'exact', head: true }).eq('document_type', 'contract').neq('status', 'archived'),
      supabase.from('managed_documents').select('*', { count: 'exact', head: true }).eq('document_type', 'policy').neq('status', 'archived'),
      supabase.from('managed_documents').select('*', { count: 'exact', head: true }).eq('document_type', 'sop').neq('status', 'archived')
    ])
    return { totalDocs: totalDocs || 0, contracts: contracts || 0, policies: policies || 0, sops: sops || 0 }
  }
}
