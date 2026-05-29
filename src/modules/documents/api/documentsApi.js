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

  async updateFolder(id, updates) {
    const { data, error } = await supabase.from('document_folders').update(updates).eq('id', id).select().single()
    return { data, error }
  },

  async deleteFolder(id) {
    const { error } = await supabase.from('document_folders').delete().eq('id', id)
    return { error }
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

  async getDocument(id) {
    const { data, error } = await supabase.from('managed_documents').select('*, document_versions(*), document_folders(*)').eq('id', id).single()
    return { data, error }
  },

  async createDocument(metadata) {
    const { data, error } = await supabase.from('managed_documents').insert([metadata]).select().single()
    return { data, error }
  },

  async updateDocument(id, updates) {
    const { data, error } = await supabase.from('managed_documents').update(updates).eq('id', id).select().single()
    return { data, error }
  },

  async createDocumentVersion(documentId, file, changeNotes) {
    const { data: doc } = await supabase.from('managed_documents').select('version_number').eq('id', documentId).single()
    const newVersion = (doc?.version_number || 0) + 1

    const fileExt = file.name.split('.').pop()
    const fileName = `docs/versions/${documentId}-v${newVersion}.${fileExt}`
    
    await supabase.storage.from('documents').upload(fileName, file)
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)

    await supabase.from('document_versions').insert([{
      document_id: documentId,
      version_number: newVersion,
      file_url: publicUrl,
      file_size: file.size,
      change_notes: changeNotes
    }])

    await supabase.from('managed_documents').update({ 
      version_number: newVersion, 
      file_url: publicUrl, 
      updated_at: new Date().toISOString() 
    }).eq('id', documentId)
    
    return { success: true }
  },

  async deleteDocument(id) {
    const { error } = await supabase.from('managed_documents').update({ 
      status: 'archived',
      updated_at: new Date().toISOString()
    }).eq('id', id)
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
