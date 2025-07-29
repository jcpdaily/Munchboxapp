"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, X, LogOut } from 'lucide-react'
import { getMenuCategories, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/database"
import type { MenuCategory, MenuItem } from "@/lib/supabase"
import { useAdminAuth } from "@/lib/auth"
import { AdminLogin } from "@/components/admin-login"

interface MenuItemOption {
  id?: number
  option_name: string
  price: number
  display_order: number
  is_active: boolean
}

export default function AdminMenuPage() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    has_options: false,
  })
  const [itemOptions, setItemOptions] = useState<MenuItemOption[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      loadMenuData()
    }
  }, [isAuthenticated])

  const loadMenuData = async () => {
    setLoading(true)
    try {
      const [categoriesData, itemsData] = await Promise.all([getMenuCategories(), getMenuItems()])
      setCategories(categoriesData)
      setMenuItems(itemsData)
    } catch (error) {
      console.error("Error loading menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description || "",
        base_price: item.base_price.toString(),
        category_id: item.category_id.toString(),
        has_options: item.has_options,
      })
      // Set existing options
      setItemOptions(
        item.options?.map((opt) => ({
          id: opt.id,
          option_name: opt.option_name,
          price: opt.price,
          display_order: opt.display_order,
          is_active: opt.is_active,
        })) || [],
      )
    } else {
      setEditingItem(null)
      setFormData({
        name: "",
        description: "",
        base_price: "",
        category_id: categories[0]?.id.toString() || "",
        has_options: false,
      })
      setItemOptions([])
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      base_price: "",
      category_id: "",
      has_options: false,
    })
    setItemOptions([])
  }

  const addOption = () => {
    setItemOptions([
      ...itemOptions,
      {
        option_name: "",
        price: 0,
        display_order: itemOptions.length + 1,
        is_active: true,
      },
    ])
  }

  const updateOption = (index: number, field: keyof MenuItemOption, value: string | number | boolean) => {
    const updatedOptions = [...itemOptions]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setItemOptions(updatedOptions)
  }

  const removeOption = (index: number) => {
    setItemOptions(itemOptions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.base_price || !formData.category_id) {
      alert("Please fill in all required fields")
      return
    }

    // Validate options if has_options is true
    if (formData.has_options && itemOptions.length === 0) {
      alert("Please add at least one option or uncheck 'Has size/option variations'")
      return
    }

    if (formData.has_options) {
      const invalidOptions = itemOptions.filter((opt) => !opt.option_name.trim() || opt.price <= 0)
      if (invalidOptions.length > 0) {
        alert("Please fill in all option names and prices (prices must be greater than 0)")
        return
      }
    }

    const itemData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      base_price: Number.parseFloat(formData.base_price),
      category_id: Number.parseInt(formData.category_id),
      has_options: formData.has_options,
    }

    // Validate base_price is a valid number
    if (isNaN(itemData.base_price) || itemData.base_price <= 0) {
      alert("Please enter a valid price greater than 0")
      return
    }

    try {
      if (editingItem) {
        const success = await updateMenuItem(editingItem.id, itemData)
        if (success) {
          // Update options
          await updateMenuItemOptions(editingItem.id)
          alert("Menu item updated successfully!")
          loadMenuData()
          handleCloseDialog()
        } else {
          alert("Error updating menu item")
        }
      } else {
        const newItem = await createMenuItem(itemData)
        if (newItem) {
          // Add options
          await updateMenuItemOptions(newItem.id)
          alert("Menu item created successfully!")
          loadMenuData()
          handleCloseDialog()
        } else {
          alert("Error creating menu item")
        }
      }
    } catch (error) {
      console.error("Error saving menu item:", error)
      alert("Error saving menu item. Please try again.")
    }
  }

  const updateMenuItemOptions = async (menuItemId: number) => {
    if (!formData.has_options || itemOptions.length === 0) {
      return
    }

    // Delete existing options and add new ones
    // This is a simple approach - in production you might want to be more sophisticated
    try {
      // Delete existing options
      await fetch("/api/menu-options", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_item_id: menuItemId }),
      })

      // Add new options
      for (const option of itemOptions) {
        await fetch("/api/menu-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menu_item_id: menuItemId,
            option_name: option.option_name,
            price: option.price,
            display_order: option.display_order,
            is_active: option.is_active,
          }),
        })
      }
    } catch (error) {
      console.error("Error updating options:", error)
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const success = await deleteMenuItem(item.id)
      if (success) {
        alert("Menu item deleted successfully!")
        loadMenuData()
      } else {
        alert("Error deleting menu item")
      }
    }
  }

  const getCategoryName = (categoryId: number) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Unknown"
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-lime-400 text-slate-800 px-4 py-2 rounded font-bold text-xl inline-block mb-4">
            THE MUNCH BOX
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />
  }

  // Show loading while fetching menu data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-lime-400 text-slate-800 px-4 py-2 rounded font-bold text-xl inline-block mb-4">
            THE MUNCH BOX - MENU ADMIN
          </div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-white hover:text-lime-400">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="bg-lime-400 text-slate-800 px-3 py-1 rounded font-bold text-lg">
              THE MUNCH BOX - MENU ADMIN
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog()} className="bg-lime-400 hover:bg-lime-500 text-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
            <Button onClick={logout} variant="ghost" className="text-white hover:text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Menu Management</h1>

        {/* Menu Items by Category */}
        {categories.map((category) => {
          const categoryItems = menuItems.filter((item) => item.category_id === category.id)

          return (
            <Card key={category.id} className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryItems.length === 0 ? (
                  <p className="text-gray-500 italic">No items in this category</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map((item) => (
                      <Card key={item.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <span className="text-lg font-bold text-lime-600">£{item.base_price.toFixed(2)}</span>
                          </div>
                          {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}

                          {/* Show options if they exist */}
                          {item.has_options && item.options && item.options.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Options:</p>
                              <div className="space-y-1">
                                {item.options.map((option) => (
                                  <div key={option.id} className="text-xs text-gray-600 flex justify-between">
                                    <span>{option.option_name}</span>
                                    <span>£{option.price.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 mb-3">
                            {item.has_options && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Has Options</span>
                            )}
                            {/* Removed is_custom_builder badge */}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenDialog(item)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the details for this menu item and its options."
                  : "Create a new menu item by filling in the details below. You can add size/option variations if needed."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Item name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="base_price">Base Price *</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item description (optional)"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="category_id">Category *</Label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_options"
                  checked={formData.has_options}
                  onChange={(e) => {
                    setFormData({ ...formData, has_options: e.target.checked })
                    if (!e.target.checked) {
                      setItemOptions([])
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="has_options">Has size/option variations</Label>
              </div>

              {/* Options Section */}
              {formData.has_options && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Item Options</h3>
                    <Button
                      type="button"
                      onClick={addOption}
                      size="sm"
                      className="bg-lime-400 hover:bg-lime-500 text-slate-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>

                  {itemOptions.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No options added yet. Click "Add Option" to create size/variation options.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {itemOptions.map((option, index) => (
                        <div key={index} className="flex gap-2 items-end p-3 border rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <Label htmlFor={`option_name_${index}`}>Option Name</Label>
                            <Input
                              id={`option_name_${index}`}
                              value={option.option_name}
                              onChange={(e) => updateOption(index, "option_name", e.target.value)}
                              placeholder="e.g., Small, Large, Cold, Toasted"
                            />
                          </div>
                          <div className="w-24">
                            <Label htmlFor={`option_price_${index}`}>Price</Label>
                            <Input
                              id={`option_price_${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={option.price}
                              onChange={(e) => updateOption(index, "price", Number.parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <Button type="button" onClick={() => removeOption(index)} size="sm" variant="destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-lime-400 hover:bg-lime-500 text-slate-800">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}