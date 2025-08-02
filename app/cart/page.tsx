"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useState } from "react"
import React from "react"
import { MobileHeader } from "@/components/mobile-header"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/components/toast"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CheckoutForm } from "@/components/checkout-form" // Ensure this import is present
import { useRouter } from "next/navigation" // Import useRouter

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Add this new console log to see if the promise is created
console.log("Stripe Promise (after loadStripe call):", stripePromise)

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const { addToast } = useToast()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false) // This state is now primarily for the CheckoutForm
  const [collectionTime, setCollectionTime] = useState("")
  const [isOutsideHours, setIsOutsideHours] = useState(false)
  const router = useRouter() // Initialize useRouter

  // Check if we're currently open and can take orders
  const checkIfOpen = () => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour + currentMinute / 60

    // Sunday (0) - Closed
    if (currentDay === 0) {
      return false
    }

    // Monday to Friday (1-5) - 7:00am to 2:00pm
    if (currentDay >= 1 && currentDay <= 5) {
      return currentTime >= 7 && currentTime < 14
    }

    // Saturday (6) - 7:00am to 1:00pm
    if (currentDay === 6) {
      return currentTime >= 7 && currentTime < 13
    }

    return false
  }

  // Generate collection times for today only
  const generateTodayCollectionTimes = () => {
    const now = new Date()
    const currentDay = now.getDay()

    // If closed today, return empty array
    if (!checkIfOpen()) {
      return []
    }

    const times = []
    const currentTime = now.getHours() + now.getMinutes() / 60
    const minTime = currentTime + 0.25 // Add 15 minutes minimum prep time

    // Set end time based on day
    const endHour = currentDay === 6 ? 13 : 14 // Saturday until 1pm, weekdays until 2pm

    // If it's too late to order today
    if (minTime >= endHour) {
      return []
    }

    // Start from next 15-minute interval
    const startTime = Math.ceil(minTime * 4) / 4 // Round up to next 15-min interval

    // Generate 15-minute intervals until closing
    for (let time = startTime; time < endHour; time += 0.25) {
      const h = Math.floor(time)
      const m = (time % 1) * 60
      const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      times.push(timeString)
    }

    return times
  }

  // Get today's date string
  const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0]
  }

  // Get day name for display
  const getTodayDisplayName = () => {
    const today = new Date()
    return today.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  // Check opening hours on component mount
  React.useEffect(() => {
    setIsOutsideHours(!checkIfOpen())
  }, [])

  const handleOrderSuccess = (orderNumber: string, collectionTime: string) => {
    addToast({
      type: "success",
      title: "Order Placed Successfully!",
      description: `Your order number is ${orderNumber}. Please collect today at ${collectionTime}.`,
      duration: 8000,
    })
    clearCart() // Clear cart after successful order
    setCustomerInfo({ name: "", phone: "", notes: "" })
    setCollectionTime("")
    router.push(`/order-success?orderNumber=${orderNumber}&collectionTime=${collectionTime}`)
  }

  const handlePaymentError = (message: string) => {
    addToast({
      type: "error",
      title: "Payment Failed",
      description: message,
    })
  }

  const availableTimes = generateTodayCollectionTimes()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Cart" showBack backHref="/menu" />
        <EmptyState
          type="cart"
          title="Your Cart is Empty"
          description="Add some delicious items from our menu to get started!"
          actionLabel="Browse Menu"
          actionHref="/menu"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Your Order" showBack backHref="/menu" showPhone />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8">Your Order</h1>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedOption || "default"}`}
                    className="flex items-center justify-between p-3 sm:p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">£{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOption)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromCart(item.id, item.selectedOption)}
                        className="h-8 w-8 p-0 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-lime-600">£{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Your full name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="Your phone number"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Any special requests or dietary requirements"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Collection Time Section */}
                <div>
                  <Label htmlFor="collectionTime">Collection Time Today ({getTodayDisplayName()}) *</Label>
                  {isOutsideHours || availableTimes.length === 0 ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-800 font-semibold">We are currently closed</p>
                      <div className="text-sm text-red-600 mt-2">
                        <p>
                          <strong>Opening Hours:</strong>
                        </p>
                        <p>Monday - Friday: 7:00am - 2:00pm</p>
                        <p>Saturday: 7:00am - 1:00pm</p>
                        <p>Sunday: Closed</p>
                        <p className="mt-2">
                          {new Date().getDay() === 0
                            ? "We're closed on Sundays. Come back Monday!"
                            : "We're closed for today. Come back during opening hours!"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <select
                      id="collectionTime"
                      value={collectionTime}
                      onChange={(e) => setCollectionTime(e.target.value)}
                      disabled={isSubmitting} // Keep this disabled state for customer info fields
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select collection time for today</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-lime-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Collection Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Same-day collection only</strong> - All orders are for today
                    </p>
                    <p>Typical preparation time is 10-15 minutes</p>
                    <p>Our phone number is 07825368920 if you need to contact us</p>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <strong>Opening Hours:</strong>
                    </p>
                    <p>Monday - Friday: 7:00am - 2:00pm</p>
                    <p>Saturday: 7:00am - 1:00pm</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

                {/* Stripe Payment Form */}
                {stripePromise && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      mode: "payment",
                      amount: Math.round(getCartTotal() * 100), // Amount in cents
                      currency: "gbp",
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#a3e635", // lime-400
                          colorText: "#334155", // slate-800
                          colorBackground: "#ffffff",
                          colorDanger: "#ef4444",
                          fontFamily: "Inter, sans-serif",
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      customerInfo={customerInfo}
                      collectionTime={collectionTime}
                      collectionDate={getTodayDateString()}
                      onOrderSuccess={handleOrderSuccess}
                      onPaymentError={handlePaymentError}
                      totalAmount={getCartTotal()}
                      isOutsideHours={isOutsideHours}
                      availableTimes={availableTimes}
                      // The disabled prop here is passed to the CheckoutForm, which then controls its internal button
                      disabled={
                        isOutsideHours ||
                        availableTimes.length === 0 ||
                        !collectionTime ||
                        !customerInfo.name.trim() ||
                        !customerInfo.phone.trim()
                      }
                    />
                  </Elements>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
