import { supabase, type MenuCategory, type MenuItem, type Order } from "./supabase"

// Add DailyRevenue type
export interface DailyRevenue {
  id: number
  date: string
  total_orders: number
  total_revenue: number
  created_at: string
  updated_at: string
}

// Menu functions
export async function getMenuCategories(): Promise<MenuCategory[]> {
  try {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")

    if (error) {
      console.error("Error fetching categories:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getMenuCategories:", error)
    return []
  }
}

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        *,
        options:menu_item_options(
          id,
          menu_item_id,
          option_name,
          price,
          display_order,
          is_active
        )
      `)
      .eq("is_active", true)
      .order("display_order")

    if (error) {
      console.error("Error fetching menu items:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getMenuItems:", error)
    return []
  }
}

export async function getMenuItemsByCategory(categorySlug: string): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        *,
        options:menu_item_options(*),
        category:menu_categories(slug)
      `)
      .eq("is_active", true)
      .eq("menu_categories.slug", categorySlug)
      .order("display_order")

    if (error) {
      console.error("Error fetching menu items by category:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getMenuItemsByCategory:", error)
    return []
  }
}

// Order functions
export async function createOrder(orderData: {
  customer_name: string
  customer_phone: string
  collection_time: string
  collection_date: string
  special_instructions?: string
  total_amount: number
  items: Array<{
    menu_item_id?: number
    item_name: string
    selected_option?: string
    unit_price: number
    quantity: number
    total_price: number
  }>
}): Promise<Order | null> {
  try {
    // Validate required fields
    if (!orderData.customer_name?.trim() || !orderData.customer_phone?.trim()) {
      throw new Error("Customer name and phone are required")
    }

    if (!orderData.collection_time || !orderData.collection_date) {
      throw new Error("Collection time and date are required")
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item")
    }

    if (orderData.total_amount <= 0) {
      throw new Error("Order total must be greater than 0")
    }

    // Generate a more unique order number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const orderNumber = `#${timestamp.toString().slice(-6)}${random.slice(-2)}`

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name.trim(),
        customer_phone: orderData.customer_phone.trim(),
        collection_time: orderData.collection_time,
        collection_date: orderData.collection_date,
        special_instructions: orderData.special_instructions?.trim() || null,
        total_amount: orderData.total_amount,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw orderError
    }

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id || null,
      item_name: item.item_name.trim(),
      selected_option: item.selected_option?.trim() || null,
      unit_price: item.unit_price,
      quantity: item.quantity,
      total_price: item.total_price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Try to clean up the order if items failed
      await supabase.from("orders").delete().eq("id", order.id)
      throw itemsError
    }

    return order
  } catch (error) {
    console.error("Error in createOrder:", error)
    return null
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getOrders:", error)
    return []
  }
}

export async function updateOrderStatus(orderId: number, status: Order["status"]): Promise<boolean> {
  try {
    if (!orderId || orderId <= 0) {
      throw new Error("Invalid order ID")
    }

    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status")
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return false
  }
}

// Check if daily revenue tracking is available (cached result)
let dailyRevenueAvailable: boolean | null = null

export async function isDailyRevenueAvailable(): Promise<boolean> {
  // Return cached result if we already checked
  if (dailyRevenueAvailable !== null) {
    return dailyRevenueAvailable
  }

  try {
    // Try a simple query to see if the table exists
    const { error } = await supabase.from("daily_revenue").select("id").limit(1)

    // If no error, table exists
    if (!error) {
      dailyRevenueAvailable = true
      return true
    }

    // Check for specific "table does not exist" error
    if (error.message && error.message.includes('relation "public.daily_revenue" does not exist')) {
      dailyRevenueAvailable = false
      return false
    }

    // For other errors, assume table exists but there's another issue
    dailyRevenueAvailable = true
    return true
  } catch (error) {
    console.warn("Could not check daily revenue availability:", error)
    dailyRevenueAvailable = false
    return false
  }
}

// Fallback function to calculate today's revenue from orders table
async function calculateTodayRevenueFromOrders(): Promise<{ totalOrders: number; totalRevenue: number }> {
  try {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("collection_date", today)
      .neq("status", "cancelled")

    if (error) {
      console.error("Error calculating today's revenue from orders:", error)
      return { totalOrders: 0, totalRevenue: 0 }
    }

    const totalOrders = data?.length || 0
    const totalRevenue = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    return { totalOrders, totalRevenue }
  } catch (error) {
    console.error("Error in calculateTodayRevenueFromOrders:", error)
    return { totalOrders: 0, totalRevenue: 0 }
  }
}

// Daily revenue functions with improved error handling
export async function getTodayRevenue(): Promise<{ totalOrders: number; totalRevenue: number }> {
  // Check if daily revenue tracking is available first
  const isAvailable = await isDailyRevenueAvailable()

  if (!isAvailable) {
    // Use fallback calculation from orders table
    return await calculateTodayRevenueFromOrders()
  }

  try {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("daily_revenue")
      .select("total_orders, total_revenue")
      .eq("date", today)
      .single()

    if (error) {
      // If no data found for today, return zeros
      if (error.code === "PGRST116") {
        return { totalOrders: 0, totalRevenue: 0 }
      }

      // For other errors, fall back to orders calculation
      console.warn("Error fetching from daily_revenue, using fallback:", error)
      return await calculateTodayRevenueFromOrders()
    }

    return {
      totalOrders: data?.total_orders || 0,
      totalRevenue: data?.total_revenue || 0,
    }
  } catch (error) {
    console.error("Error in getTodayRevenue:", error)
    // Fallback to calculating from orders table
    return await calculateTodayRevenueFromOrders()
  }
}

export async function getDailyRevenue(limit = 30): Promise<DailyRevenue[]> {
  // Check if daily revenue tracking is available first
  const isAvailable = await isDailyRevenueAvailable()

  if (!isAvailable) {
    console.warn("Daily revenue table not available")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("daily_revenue")
      .select("*")
      .order("date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching daily revenue:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getDailyRevenue:", error)
    return []
  }
}

export async function getRevenueByDateRange(startDate: string, endDate: string): Promise<DailyRevenue[]> {
  // Check if daily revenue tracking is available first
  const isAvailable = await isDailyRevenueAvailable()

  if (!isAvailable) {
    console.warn("Daily revenue table not available")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("daily_revenue")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching revenue by date range:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getRevenueByDateRange:", error)
    return []
  }
}

// Reset the cache when needed (call this after running the SQL script)
export function resetDailyRevenueCache() {
  dailyRevenueAvailable = null
}

// Admin functions for menu management
export async function createMenuItem(item: {
  category_id: number
  name: string
  description?: string
  base_price: number
  has_options?: boolean
}): Promise<MenuItem | null> {
  try {
    // Validate required fields
    if (!item.name?.trim()) {
      throw new Error("Menu item name is required")
    }

    if (!item.category_id || item.category_id <= 0) {
      throw new Error("Valid category ID is required")
    }

    if (!item.base_price || item.base_price <= 0) {
      throw new Error("Base price must be greater than 0")
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        category_id: item.category_id,
        name: item.name.trim(),
        description: item.description?.trim() || null,
        base_price: item.base_price,
        has_options: item.has_options || false,
        is_custom_builder: false, // Always false now
        display_order: 999, // Put new items at the end
      })
      .select(`
        *,
        options:menu_item_options(*)
      `)
      .single()

    if (error) {
      console.error("Error creating menu item:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createMenuItem:", error)
    return null
  }
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("Invalid menu item ID")
    }

    // Clean up the updates object
    const cleanUpdates: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) {
      cleanUpdates.name = updates.name.trim()
    }
    if (updates.description !== undefined) {
      cleanUpdates.description = updates.description?.trim() || null
    }
    if (updates.base_price !== undefined) {
      cleanUpdates.base_price = updates.base_price
    }
    if (updates.has_options !== undefined) {
      cleanUpdates.has_options = updates.has_options
    }
    // Remove is_custom_builder from updates - we don't want to change this anymore

    const { error } = await supabase.from("menu_items").update(cleanUpdates).eq("id", id)

    if (error) {
      console.error("Error updating menu item:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in updateMenuItem:", error)
    return false
  }
}

export async function deleteMenuItem(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("Invalid menu item ID")
    }

    const { error } = await supabase.from("menu_items").update({ is_active: false }).eq("id", id)

    if (error) {
      console.error("Error deleting menu item:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in deleteMenuItem:", error)
    return false
  }
}

// Menu options functions
export async function createMenuItemOption(option: {
  menu_item_id: number
  option_name: string
  price: number
  display_order: number
}): Promise<boolean> {
  try {
    if (!option.menu_item_id || option.menu_item_id <= 0) {
      throw new Error("Invalid menu item ID")
    }

    if (!option.option_name?.trim()) {
      throw new Error("Option name is required")
    }

    if (!option.price || option.price <= 0) {
      throw new Error("Option price must be greater than 0")
    }

    const { error } = await supabase.from("menu_item_options").insert({
      menu_item_id: option.menu_item_id,
      option_name: option.option_name.trim(),
      price: option.price,
      display_order: option.display_order || 1,
      is_active: true,
    })

    if (error) {
      console.error("Error creating menu item option:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in createMenuItemOption:", error)
    return false
  }
}

export async function deleteMenuItemOptions(menuItemId: number): Promise<boolean> {
  try {
    if (!menuItemId || menuItemId <= 0) {
      throw new Error("Invalid menu item ID")
    }

    const { error } = await supabase.from("menu_item_options").delete().eq("menu_item_id", menuItemId)

    if (error) {
      console.error("Error deleting menu item options:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in deleteMenuItemOptions:", error)
    return false
  }
}