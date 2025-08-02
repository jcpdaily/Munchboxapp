"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Phone, CheckCircle, LogOut, Calendar, TrendingUp, RefreshCw } from "lucide-react"
import {
  getOrders,
  updateOrderStatus,
  getTodayRevenue,
  getDailyRevenue,
  isDailyRevenueAvailable,
  resetDailyRevenueCache,
} from "@/lib/database"
import type { Order } from "@/lib/supabase"
import type { DailyRevenue } from "@/lib/database"
import Link from "next/link"
import { useAdminAuth } from "@/lib/auth"
import { AdminLogin } from "@/components/admin-login"

export default function AdminPage() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    readyOrders: 0,
  })
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [isDailyRevenueEnabled, setIsDailyRevenueEnabled] = useState(false)
  const [checkingRevenue, setCheckingRevenue] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    try {
      const [ordersData, todayRevenueData, revenueAvailable] = await Promise.all([
        getOrders(),
        getTodayRevenue(),
        isDailyRevenueAvailable(),
      ])

      setOrders(ordersData)
      setIsDailyRevenueEnabled(revenueAvailable)

      // Calculate today's stats from orders (for pending/ready counts)
      const todayOrders = ordersData.filter((order) => {
        const orderDate = new Date(order.collection_date).toDateString()
        const today = new Date().toDateString()
        return orderDate === today
      })

      setTodayStats({
        totalOrders: todayRevenueData.totalOrders,
        totalRevenue: todayRevenueData.totalRevenue,
        pendingOrders: todayOrders.filter((o) => o.status === "pending").length,
        readyOrders: todayOrders.filter((o) => o.status === "ready").length,
      })
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDailyRevenue = async () => {
    setRevenueLoading(true)
    try {
      const revenueData = await getDailyRevenue(30) // Last 30 days
      setDailyRevenue(revenueData)
    } catch (error) {
      console.error("Error loading daily revenue:", error)
    } finally {
      setRevenueLoading(false)
    }
  }

  const checkRevenueAvailability = async () => {
    setCheckingRevenue(true)
    try {
      // Reset the cache and check again
      resetDailyRevenueCache()
      const isAvailable = await isDailyRevenueAvailable()
      setIsDailyRevenueEnabled(isAvailable)

      if (isAvailable) {
        // If now available, reload the data
        await loadData()
        await loadDailyRevenue()
      }
    } catch (error) {
      console.error("Error checking revenue availability:", error)
    } finally {
      setCheckingRevenue(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: Order["status"]) => {
    const success = await updateOrderStatus(orderId, newStatus)
    if (success) {
      // Refresh data
      loadData()
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
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
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue History</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {/* Today's Stats Dashboard */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-slate-800">{todayStats.totalOrders}</div>
                  <div className="text-sm text-gray-600">Today's Orders</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-lime-600">£{todayStats.totalRevenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Today's Revenue</div>
                  {!isDailyRevenueEnabled && <div className="text-xs text-orange-600 mt-1">Calculated from orders</div>}
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

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{order.order_number}</span>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.customer_name} - {order.collection_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lime-600">£{order.total_amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
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
          </TabsContent>

          {/* Revenue History Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Daily Revenue History
                  </CardTitle>
                  <div className="flex gap-2">
                    {!isDailyRevenueEnabled && (
                      <Button
                        onClick={checkRevenueAvailability}
                        disabled={checkingRevenue}
                        variant="outline"
                        className="text-slate-800 bg-transparent"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${checkingRevenue ? "animate-spin" : ""}`} />
                        {checkingRevenue ? "Checking..." : "Check Again"}
                      </Button>
                    )}
                    {isDailyRevenueEnabled && (
                      <Button
                        onClick={loadDailyRevenue}
                        disabled={revenueLoading}
                        className="bg-lime-400 hover:bg-lime-500 text-slate-800"
                      >
                        {revenueLoading ? "Loading..." : "Refresh Data"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isDailyRevenueEnabled ? (
                  <div className="text-center py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Revenue Tracking Not Set Up</h3>
                      <p className="text-yellow-700 mb-4">
                        To enable detailed daily revenue tracking, you need to run the SQL setup script.
                      </p>
                      <div className="bg-white p-4 rounded border text-left">
                        <p className="text-sm font-semibold mb-2">Steps to enable:</p>
                        <ol className="text-sm text-gray-600 space-y-1">
                          <li>1. Go to your Supabase dashboard</li>
                          <li>2. Navigate to SQL Editor</li>
                          <li>
                            3. Run the script:{" "}
                            <code className="bg-gray-100 px-1 rounded">scripts/06-add-daily-revenue-tracking.sql</code>
                          </li>
                          <li>4. Click "Check Again" button above</li>
                        </ol>
                      </div>
                      <p className="text-sm text-yellow-600 mt-4">
                        <strong>Note:</strong> Today's revenue is still being calculated from your orders.
                      </p>
                    </div>
                  </div>
                ) : dailyRevenue.length === 0 && !revenueLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No revenue data loaded yet.</p>
                    <Button onClick={loadDailyRevenue} className="bg-slate-800 hover:bg-slate-700 text-white">
                      Load Revenue History
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailyRevenue.map((day) => (
                      <div
                        key={day.id}
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-semibold">{formatDate(day.date)}</div>
                            <div className="text-sm text-gray-600">{day.total_orders} orders</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-lime-600">£{day.total_revenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">
                            £{(day.total_revenue / Math.max(day.total_orders, 1)).toFixed(2)} avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {dailyRevenue.length > 0 && (
                  <div className="mt-6 p-4 bg-lime-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Summary (Last {dailyRevenue.length} days)</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-slate-800">
                          {dailyRevenue.reduce((sum, day) => sum + day.total_orders, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-lime-600">
                          £{dailyRevenue.reduce((sum, day) => sum + day.total_revenue, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          £
                          {(
                            dailyRevenue.reduce((sum, day) => sum + day.total_revenue, 0) / dailyRevenue.length
                          ).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Daily Average</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
