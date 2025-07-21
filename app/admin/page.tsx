"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Phone, CheckCircle, LogOut } from "lucide-react"
import { getOrders, updateOrderStatus } from "@/lib/database"
import type { Order } from "@/lib/supabase"
import Link from "next/link"
import { useAdminAuth } from "@/lib/auth"
import { AdminLogin } from "@/components/admin-login"

export default function AdminPage() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const ordersData = await getOrders()
      setOrders(ordersData)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: Order["status"]) => {
    const success = await updateOrderStatus(orderId, newStatus)
    if (success) {
      // Refresh orders
      loadOrders()
    } else {
      alert("Error updating order status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "preparing":
        return "bg-blue-500"
      case "ready":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    return order.status === activeTab
  })

  const todayStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    readyOrders: orders.filter((o) => o.status === "ready").length,
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

  // Show loading while fetching orders
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-lime-400 text-slate-800 px-4 py-2 rounded font-bold text-xl inline-block mb-4">
            THE MUNCH BOX - ADMIN
          </div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="bg-lime-400 text-slate-800 px-3 py-1 rounded font-bold text-xl inline-block">
            THE MUNCH BOX - ADMIN
          </div>
          <div className="flex gap-2">
            <Link href="/admin/menu">
              <Button className="bg-lime-400 hover:bg-lime-500 text-slate-800">Manage Menu</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-lime-400">
                Back to Site
              </Button>
            </Link>
            <Button onClick={logout} variant="ghost" className="text-white hover:text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-800">{todayStats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-lime-600">£{todayStats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Today's Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{todayStats.pendingOrders}</div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{todayStats.readyOrders}</div>
              <div className="text-sm text-gray-600">Ready for Collection</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="all">All Orders</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-lime-400">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{order.order_number}</h3>
                              <Badge className={`${getStatusColor(order.status)} text-white`}>
                                {order.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {order.collection_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {order.customer_phone}
                              </span>
                            </div>
                            <p className="font-semibold mt-1">{order.customer_name}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-lime-600">£{order.total_amount.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Order Items:</h4>
                          <div className="space-y-1">
                            {order.order_items?.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>
                                  {item.quantity}x {item.item_name}
                                  {item.selected_option && ` (${item.selected_option})`}
                                </span>
                                <span>£{item.total_price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.special_instructions && (
                          <div className="mb-4 p-2 bg-yellow-50 rounded">
                            <p className="text-sm">
                              <strong>Notes:</strong> {order.special_instructions}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button
                              onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button
                              onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Ready
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button
                              onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              Mark Collected
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => window.open(`tel:${order.customer_phone}`)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call Customer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No orders found for this status.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
