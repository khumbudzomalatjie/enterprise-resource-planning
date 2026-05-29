import { supabase } from '../../../lib/supabaseClient'

export const workflowApi = {
  async getWorkflows() {
    const { data, error } = await supabase.from('workflows').select('*').order('created_at', { ascending: false })
    return { data, error }
  },

  async createWorkflow(workflowData) {
    const { data, error } = await supabase.from('workflows').insert([workflowData]).select().single()
    return { data, error }
  },

  async updateWorkflow(id, updates) {
    const { data, error } = await supabase.from('workflows').update(updates).eq('id', id).select().single()
    return { data, error }
  },

  async deleteWorkflow(id) {
    const { error } = await supabase.from('workflows').delete().eq('id', id)
    return { error }
  },

  async getExecutions(workflowId = null) {
    let query = supabase.from('workflow_executions').select('*, workflows(workflow_name)').order('started_at', { ascending: false }).limit(50)
    if (workflowId) query = query.eq('workflow_id', workflowId)
    const { data, error } = await query
    return { data, error }
  },

  async getApprovalRules() {
    const { data, error } = await supabase.from('approval_rules').select('*').eq('is_active', true).order('priority')
    return { data, error }
  },

  async createApprovalRule(ruleData) {
    const { data, error } = await supabase.from('approval_rules').insert([ruleData]).select().single()
    return { data, error }
  },

  async getAutomatedTasks() {
    const { data, error } = await supabase.from('automated_tasks').select('*').order('created_at', { ascending: false })
    return { data, error }
  },

  async getStats() {
    const [{ count: totalWorkflows }, { count: activeWorkflows }, { count: totalExecutions }, { data: recentExecutions }] = await Promise.all([
      supabase.from('workflows').select('*', { count: 'exact', head: true }),
      supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('workflow_executions').select('*', { count: 'exact', head: true }),
      supabase.from('workflow_executions').select('*, workflows(workflow_name)').order('started_at', { ascending: false }).limit(10)
    ])
    return { totalWorkflows: totalWorkflows || 0, activeWorkflows: activeWorkflows || 0, totalExecutions: totalExecutions || 0, recentExecutions: recentExecutions || [] }
  }
}
