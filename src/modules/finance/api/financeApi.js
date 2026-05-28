import { supabase } from '../../../lib/supabaseClient'

export const financeApi = {
  // Approvals
  async getPendingApprovals() {
    const { data, error } = await supabase
      .from('approvals_queue')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
    return { data, error }
  },

  async approveRequest(approvalId, approvedBy) {
    const { error } = await supabase.rpc('process_approval', {
      p_approval_id: approvalId,
      p_status: 'approved',
      p_approved_by: approvedBy
    })
    
    if (!error) {
      // Get the approval to know what was approved
      const { data: approval } = await supabase
        .from('approvals_queue')
        .select('*')
        .eq('id', approvalId)
        .single()
      
      if (approval?.approval_type === 'vendor') {
        await supabase.from('vendors')
          .update({ status: 'active', approved_by: approvedBy, approved_at: new Date().toISOString() })
          .eq('id', approval.reference_id)
      }
    }
    
    return { error }
  },

  async rejectRequest(approvalId, approvedBy, reason) {
    const { error } = await supabase.rpc('process_approval', {
      p_approval_id: approvalId,
      p_status: 'rejected',
      p_approved_by: approvedBy,
      p_rejection_reason: reason
    })
    return { error }
  },

  async createApprovalRequest(approvalData) {
    const { data, error } = await supabase
      .from('approvals_queue')
      .insert([approvalData])
      .select()
      .single()
    return { data, error }
  },

  // Get pending vendors for approval
  async getPendingVendors() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Accounts Payable
  async getAccountsPayable(filters = {}) {
    let query = supabase
      .from('accounts_payable')
      .select('*, vendors(company_name, vendor_code), purchase_orders(po_number)')
      .order('due_date', { ascending: true })

    if (filters.status) query = query.eq('status', filters.status)
    const { data, error } = await query
    return { data, error }
  },

  async createPayable(payableData) {
    const { data, error } = await supabase
      .from('accounts_payable')
      .insert([payableData])
      .select()
      .single()
    return { data, error }
  },

  async updatePayable(id, updates) {
    const { data, error } = await supabase
      .from('accounts_payable')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Accounts Receivable
  async getAccountsReceivable(filters = {}) {
    let query = supabase
      .from('accounts_receivable')
      .select('*, clients(company_name)')
      .order('due_date', { ascending: true })

    if (filters.status) query = query.eq('status', filters.status)
    const { data, error } = await query
    return { data, error }
  },

  // Payments
  async getPayments() {
    const { data, error } = await supabase
      .from('finance_payments')
      .select('*')
      .order('payment_date', { ascending: false })
      .limit(50)
    return { data, error }
  },

  async recordPayment(paymentData) {
    const { data, error } = await supabase
      .from('finance_payments')
      .insert([paymentData])
      .select()
      .single()
    
    // Update payable/receivable balance
    if (!error && paymentData.reference_id) {
      if (paymentData.payment_type === 'accounts_payable') {
        const { data: payable } = await supabase
          .from('accounts_payable')
          .select('amount_paid')
          .eq('id', paymentData.reference_id)
          .single()
        
        if (payable) {
          const newPaid = (payable.amount_paid || 0) + paymentData.amount
          const { data: updated } = await supabase
            .from('accounts_payable')
            .select('amount')
            .eq('id', paymentData.reference_id)
            .single()
          
          await supabase.from('accounts_payable')
            .update({ 
              amount_paid: newPaid,
              status: newPaid >= (updated?.amount || 0) ? 'paid' : 'pending'
            })
            .eq('id', paymentData.reference_id)
        }
      }
    }
    
    return { data, error }
  },

  // Budgets
  async getBudgets(fiscalYear = null) {
    let query = supabase
      .from('finance_budgets')
      .select('*')
      .order('fiscal_year', { ascending: false })

    if (fiscalYear) query = query.eq('fiscal_year', fiscalYear)
    const { data, error } = await query
    return { data, error }
  },

  async createBudget(budgetData) {
    const { data, error } = await supabase
      .from('finance_budgets')
      .insert([{ ...budgetData, budget_code: 'BUD-' + Date.now().toString(36).toUpperCase().slice(-6) }])
      .select()
      .single()
    return { data, error }
  },

  // General Ledger
  async getLedger(filters = {}) {
    let query = supabase
      .from('general_ledger')
      .select('*, chart_of_accounts(account_name, account_code)')
      .order('transaction_date', { ascending: false })

    if (filters.account_id) query = query.eq('account_id', filters.account_id)
    if (filters.date_from) query = query.gte('transaction_date', filters.date_from)
    if (filters.date_to) query = query.lte('transaction_date', filters.date_to)
    
    const { data, error } = await query.limit(100)
    return { data, error }
  },

  // Dashboard Stats
  async getFinanceStats() {
    const [
      { count: pendingApprovals },
      { data: payables },
      { data: receivables },
      { data: recentPayments },
      { data: budgets }
    ] = await Promise.all([
      supabase.from('approvals_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('accounts_payable').select('amount, amount_paid').neq('status', 'paid'),
      supabase.from('accounts_receivable').select('amount, amount_received').neq('status', 'paid'),
      supabase.from('finance_payments').select('amount').order('payment_date', { ascending: false }).limit(50),
      supabase.from('finance_budgets').select('*').eq('status', 'active')
    ])

    const totalPayables = payables?.reduce((sum, p) => sum + (p.amount - (p.amount_paid || 0)), 0) || 0
    const totalReceivables = receivables?.reduce((sum, r) => sum + (r.amount - (r.amount_received || 0)), 0) || 0
    const totalBudget = budgets?.reduce((sum, b) => sum + (b.total_budget || 0), 0) || 0
    const totalSpent = budgets?.reduce((sum, b) => sum + (b.spent_amount || 0), 0) || 0

    return {
      pendingApprovals: pendingApprovals || 0,
      totalPayables,
      totalReceivables,
      totalBudget,
      totalSpent,
      monthlyPayments: recentPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    }
  }
}
