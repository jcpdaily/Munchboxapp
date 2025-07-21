import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface MenuCategory {
  id: number
  name: string
  slug: string
  display_order: number
  is_active: boolean
}

export interface MenuItem {
  id: number
  category_id: number
  name: string
  description?: string
  base_price: number
  is_active: boolean
  has_options: boolean
  is_custom_builder: boolean
  display_order: number
  options?: MenuItemOption[]
}

export interface MenuItemOption {
  id: number
  menu_item_id: number
  option_name: string
  price: number
  display_order: number
  is_active: boolean
}

export interface Customer {
  id: number
  name: string
  phone: string
  email?: string
}

// Fix the Order interface to match the actual database schema
export interface Order {
  id: number
  order_number: string
  customer_id?: number
  customer_name: string
  customer_phone: string
  collection_time: string
  collection_date: string
  special_instructions?: string
  total_amount: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

// Fix the OrderItem interface
export interface OrderItem {
  id: number
  order_id: number
  menu_item_id?: number
  item_name: string
  selected_option?: string
  unit_price: number
  quantity: number
  total_price: number
  created_at?: string
}
