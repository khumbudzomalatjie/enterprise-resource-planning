import { supabase } from '../../../lib/supabaseClient'

export const inventoryApi = {
  // Items
  async getItems(filters = {}) {
    let query = supabase
      .from('inventory_items')
      .select('*, item_categories(name, color), warehouses(name), suppliers(company_name)')
      .order('name')

    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.low_stock) query = query.lte('current_stock', supabase.raw('reorder_point'))
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
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemData])
      .select()
      .single()
    return { data, error }
  },

  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Stock Movements
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

    const { data, error } = await query.limit(50)
    return { data, error }
  },

  async createStockMovement(movementData) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([movementData])
      .select()
      .single()
    return { data, error }
  },

  async bulkStockIn(movements) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert(movements)
      .select()
    return { data, error }
  },

  // Stock Counts
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

  // Warehouses
  async getWarehouses() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data, error }
  },

  async createWarehouse(warehouseData) {
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ ...warehouseData, warehouse_code: 'WH-' + Date.now().toString(36).toUpperCase() }])
      .select()
      .single()
    return { data, error }
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('item_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data, error }
  },

  // Suppliers
  async getSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('company_name')
    return { data, error }
  },

  async createSupplier(supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ ...supplierData, supplier_code: 'SUP-' + String(Date.now()).slice(-6) }])
      .select()
      .single()
    return { data, error }
  },

  // Batches
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

  // Purchase Orders
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
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert([poData])
      .select()
      .single()
    if (poError) return { error: poError }

    if (items?.length) {
      const itemsWithPO = items.map(item => ({ ...item, purchase_order_id: po.id }))
      await supabase.from('purchase_order_items').insert(itemsWithPO)
    }
    return { data: po }
  },

  async receivePurchaseOrder(poId) {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', poId)
      .single()

    if (po) {
      for (const item of po.purchase_order_items) {
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
      await supabase.from('purchase_orders').update({ status: 'received', actual_delivery_date: new Date().toISOString().split('T')[0] }).eq('id', poId)
    }
    return { success: true }
  },

  // Dashboard Stats
  async getInventoryStats() {
    const [
      { count: totalItems },
      { count: lowStockItems },
      { count: outOfStockItems },
      { count: totalSuppliers },
      { data: recentMovements },
      { data: expiringBatches }
    ] = await Promise.all([
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }),
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }).lte('current_stock', supabase.raw('reorder_point')).gt('current_stock', 0),
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('current_stock', 0),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('stock_movements').select('*, inventory_items(name)').order('created_at', { ascending: false }).limit(10),
      supabase.from('stock_batches').select('*, inventory_items(name)').lt('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).gt('remaining_quantity', 0).limit(10)
    ])

    const totalValue = await supabase
      .from('inventory_items')
      .select('current_stock, unit_cost')

    const totalStockValue = totalValue.data?.reduce((sum, item) => sum + (item.current_stock || 0) * (item.unit_cost || 0), 0) || 0

    return {
      totalItems: totalItems || 0,
      lowStockItems: lowStockItems || 0,
      outOfStockItems: outOfStockItems || 0,
      totalSuppliers: totalSuppliers || 0,
      totalStockValue,
      recentMovements: recentMovements || [],
      expiringBatches: expiringBatches || []
    }
  }
}
