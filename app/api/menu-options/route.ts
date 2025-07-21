import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { menu_item_id, option_name, price, display_order, is_active } = body

    const { data, error } = await supabase
      .from("menu_item_options")
      .insert({
        menu_item_id,
        option_name,
        price,
        display_order,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating menu option:", error)
      return NextResponse.json({ error: "Failed to create menu option" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/menu-options:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { menu_item_id } = body

    const { error } = await supabase.from("menu_item_options").delete().eq("menu_item_id", menu_item_id)

    if (error) {
      console.error("Error deleting menu options:", error)
      return NextResponse.json({ error: "Failed to delete menu options" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/menu-options:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
