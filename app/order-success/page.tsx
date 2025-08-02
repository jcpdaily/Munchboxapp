"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileHeader } from "@/components/mobile-header"
import { useCart } from "@/hooks/use-cart" // Import useCart to clear it

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  const collectionTime = searchParams.get("collectionTime")
  const [isClient, setIsClient] = useState(false)
  const { clearCart } = useCart() // Get clearCart from hook

  useEffect(() => {
    setIsClient(true)
    // Clear the cart once the success page is loaded
    clearCart()
  }, [clearCart])

  if (!isClient) {
    return null // Render nothing on server side
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Order Confirmed" showBack={false} />

      <div className="max-w-md mx-auto p-4 flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)]">
        <Card className="w-full">
          <CardHeader>
            <CheckCircle className="w-16 h-16 text-lime-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-slate-800">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 text-lg">Thank you for your order from **THE MUNCH BOX**!</p>
            {orderNumber && (
              <p className="text-xl font-semibold text-slate-800">
                Your Order Number: <span className="text-lime-600">{orderNumber}</span>
              </p>
            )}
            {collectionTime && (
              <p className="text-lg text-gray-600">Please collect your order today at **{collectionTime}**.</p>
            )}
            <p className="text-sm text-gray-500">You can show your order number at the truck for collection.</p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/menu">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Order More Food</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
