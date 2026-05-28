import { supabase } from '../../../lib/supabaseClient'

export const inventoryApi = {
  // ============================================
  // ITEMS
  // ============================================
  async getItems(filters = {}) {
    let query = supabase
      .from('inventory_items')
      .select('*, item_categories(name, color), warehouses(name), suppliers(company_name)')
      .order('name')

    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.low_stock) query = query.lte('current_stock', supabase.raw('reorder_point')).gt('current_stock', 0)
    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)

    const { data, error } = await query
    return { data, error }
  },

  async getItem(id) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, item_categories(*), warehouses(*), suppliers(*), stock_batches(*), stock_movements(*)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createItem(itemData) {
    // Clean up empty strings to null for UUID fields
    const cleanedData = { ...itemData }
    if (cleanedData.category_id === '') cleanedData.category_id = null
    if (cleanedData.default_warehouse_id === '') cleanedData.default_warehouse_id = null
    if (cleanedData.preferred_supplier_id === '') cleanedData.preferred_supplier_id = null

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([cleanedData])
      .select()
      .single()
    return { data, error }
  },

  async updateItem(id, updates) {
    // Clean up empty strings to null for UUID fields
    const cleanedData = { ...updates }
    if (cleanedData.category_id === '') cleanedData.category_id = null
    if (cleanedData.default_warehouse_id === '') cleanedData.default_warehouse_id = null
    if (cleanedData.preferred_supplier_id === '') cleanedData.preferred_supplier_id = null

    const { data, error } = await supabase
      .from('inventory_items')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteItem(id) {
    const { error } = await supabase
      .from('inventory_items')
      .update({ status: 'discontinued' })
      .eq('id', id)
    return { error }
  },

  // ============================================
  // STOCK MOVEMENTS
  // ============================================
  async getStockMovements(filters = {}) {
    let query = supabase
      .from('stock_movements')
      .select('*, inventory_items(name, item_code, unit), warehouses(name)')
      .order('created_at', { ascending: false })

    if (filters.item_id) query = query.eq('item_id', filters.item_id)
    if (filters.movement_type) query = query.eq('movement_type', filters.movement_type)
    if (filters.date_from) query = query.gte('movement_date', filters.date_from)
    if (filters.date_to) query = query.lte('movement_date', filters.date_to)
    if (filters.warehouse_id) query = query.eq('warehouse_id', filters.warehouse_id)

    const { data, error } = await query.limit(100)
    return { data, error }
  },

  async createStockMovement(movementData) {
    // Clean up empty strings to null for UUID fields
    const cleanedData = { ...movementData }
    if (cleanedData.warehouse_id === '') cleanedData.warehouse_id = null
    if (cleanedData.batch_id === '') cleanedData.batch_id = null
    if (cleanedData.source_warehouse_id === '') cleanedData.source_warehouse_id = null
    if (cleanedData.destination_warehouse_id === '') cleanedData.destination_warehouse_id = null
    if (cleanedData.job_id === '') cleanedData.job_id = null

    const { data, error } = await supabase
      .from('stock_movements')
      .insert([cleanedData])
      .select()
      .single()
    return { data, error }
  },

  async bulkStockMovements(movements) {
    const cleanedMovements = movements.map(m => {
      const cleaned = { ...m }
      if (cleaned.warehouse_id === '') cleaned.warehouse_id = null
      if (cleaned.batch_id === '') cleaned.batch_id = null
      if (cleaned.source_warehouse_id === '') cleaned.source_warehouse_id = null
      if (cleaned.destination_warehouse_id === '') cleaned.destination_warehouse_id = null
      if (cleaned.job_id === '') cleaned.job_id = null
      return cleaned
    })

    const { data, error } = await supabase
      .from('stock_movements')
      .insert(cleanedMovements)
      .select()
    return { data, error }
  },

  // ============================================
  // WAREHOUSES
  // ============================================
  async getWarehouses() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data, error }
  },

  async createWarehouse(warehouseData) {
    const warehouseCode = 'WH-' + Date.now().toString(36).toUpperCase().slice(-4)
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ ...warehouseData, warehouse_code: warehouseCode }])
      .select()
      .single()
    return { data, error }
  },

  async updateWarehouse(id, updates) {
    const { data, error } = await supabase
      .from('warehouses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // CATEGORIES
  // ============================================
  async getCategories() {
    const { data, error } = await supabase
      .from('item_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data, error }
  },

  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('item_categories')
      .insert([categoryData])
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // SUPPLIERS
  // ============================================
  async getSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('company_name')
    return { data, error }
  },

  async getSupplier(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createSupplier(supplierData) {
    const supplierCode = 'SUP-' + Date.now().toString(36).toUpperCase().slice(-6)
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ ...supplierData, supplier_code: supplierCode }])
      .select()
      .single()
    return { data, error }
  },

  async updateSupplier(id, updates) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteSupplier(id) {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('id', id)
    return { error }
  },

  // ============================================
  // BATCHES
  // ============================================
  async getBatches(itemId = null) {
    let query = supabase
      .from('stock_batches')
      .select('*, inventory_items(name, item_code)')
      .order('expiry_date', { ascending: true })

    if (itemId) query = query.eq('item_id', itemId)

    const { data, error } = await query
    return { data, error }
  },

  async createBatch(batchData) {
    const { data, error } = await supabase
      .from('stock_batches')
      .insert([batchData])
      .select()
      .single()
    return { data, error }
  },

  async updateBatch(id, updates) {
    const { data, error } = await supabase
      .from('stock_batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // STOCK COUNTS
  // ============================================
  async getStockCounts(filters = {}) {
    let query = supabase
      .from('stock_counts')
      .select('*, warehouses(name), stock_count_items(*, inventory_items(name, item_code))')
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.warehouse_id) query = query.eq('warehouse_id', filters.warehouse_id)

    const { data, error } = await query
    return { data, error }
  },

  async createStockCount(countData) {
    const { data, error } = await supabase
      .from('stock_counts')
      .insert([countData])
      .select()
      .single()
    return { data, error }
  },

  async updateStockCountItem(id, updates) {
    const { data, error } = await supabase
      .from('stock_count_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // ============================================
  // PURCHASE ORDERS
  // ============================================
  async getPurchaseOrders(filters = {}) {
    let query = supabase
      .from('purchase_orders')
      .select('*, suppliers(company_name), purchase_order_items(*, inventory_items(name, item_code))')
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.supplier_id) query = query.eq('supplier_id', filters.supplier_id)

    const { data, error } = await query
    return { data, error }
  },

  async createPurchaseOrder(poData, items) {
    // Clean up UUID fields
    const cleanedPO = { ...poData }
    if (cleanedPO.supplier_id === '') cleanedPO.supplier_id = null

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert([cleanedPO])
      .select()
      .single()

    if (poError) return { error: poError }

    if (items && items.length > 0) {
      const cleanedItems = items.map(item => {
        const cleaned = { ...item, purchase_order_id: po.id }
        if (cleaned.item_id === '') cleaned.item_id = null
        return cleaned
      })
      await supabase.from('purchase_order_items').insert(cleanedItems)
    }

    return { data: po }
  },

  async receivePurchaseOrder(poId) {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', poId)
      .single()

    if (po && po.purchase_order_items) {
      for (const item of po.purchase_order_items) {
        if (item.item_id) {
          await inventoryApi.createStockMovement({
            item_id: item.item_id,
            movement_type: 'purchase',
            quantity: item.quantity_ordered,
            unit_cost: item.unit_price,
            reference_type: 'purchase_order',
            reference_id: poId,
            reference_number: po.po_number,
            notes: 'Purchase order received'
          })
        }
      }
      await supabase
        .from('purchase_orders')
        .update({
          status: 'received',
          actual_delivery_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', poId)
    }
    return { success: true }
  },

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getInventoryStats() {
    const [
      { count: totalItems },
      { count: lowStockItems },
      { count: outOfStockItems },
      { count: totalSuppliers },
      { count: totalWarehouses },
      { data: recentMovements },
      { data: expiringBatches }
    ] = await Promise.all([
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }),
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }).lte('current_stock', supabase.raw('reorder_point')).gt('current_stock', 0),
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('current_stock', 0),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('warehouses').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('stock_movements').select('*, inventory_items(name)').order('created_at', { ascending: false }).limit(10),
      supabase.from('stock_batches').select('*, inventory_items(name)').lt('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).gt('remaining_quantity', 0).limit(10)
    ])

    const totalValue = await supabase.from('inventory_items').select('current_stock, unit_cost')
    const totalStockValue = totalValue.data?.reduce((sum, item) => sum + (item.current_stock || 0) * (item.unit_cost || 0), 0) || 0

    // Get monthly movements summary
    const thisMonth = new Date().toISOString().slice(0, 7)
    const { data: monthlyMovements } = await supabase
      .from('stock_movements')
      .select('movement_type, quantity')
      .gte('movement_date', `${thisMonth}-01`)

    const stockInThisMonth = monthlyMovements
      ?.filter(m => ['purchase', 'return', 'transfer_in'].includes(m.movement_type))
      ?.reduce((sum, m) => sum + (m.quantity || 0), 0) || 0

    const stockOutThisMonth = monthlyMovements
      ?.filter(m => ['sale', 'transfer_out', 'write_off', 'damage', 'job_usage'].includes(m.movement_type))
      ?.reduce((sum, m) => sum + (m.quantity || 0), 0) || 0

    return {
      totalItems: totalItems || 0,
      lowStockItems: lowStockItems || 0,
      outOfStockItems: outOfStockItems || 0,
      totalSuppliers: totalSuppliers || 0,
      totalWarehouses: totalWarehouses || 0,
      totalStockValue,
      stockInThisMonth,
      stockOutThisMonth,
      recentMovements: recentMovements || [],
      expiringBatches: expiringBatches || []
    }
  }
}
