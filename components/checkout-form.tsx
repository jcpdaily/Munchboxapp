"use client"

import type React from "react"
import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/toast"
import { useCart } from "@/hooks/use-cart"
import { createOrder } from "@/lib/database"

interface CheckoutFormProps {
  customerInfo: {
    name: string
    phone: string
    notes: string
  }
  collectionTime: string
  collectionDate: string
  onOrderSuccess: (orderNumber: string, collectionTime: string) => void
  onPaymentError: (message: string) => void
  totalAmount: number
  isOutsideHours: boolean
  availableTimes: string[]
}

export function CheckoutForm({
  customerInfo,
  collectionTime,
  collectionDate,
  onOrderSuccess,
  onPaymentError,
  totalAmount,
  isOutsideHours,
  availableTimes,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { cartItems, clearCart } = useCart()
  const { addToast } = useToast()

  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      onPaymentError("Please fill in your name and phone number.")
      return
    }

    if (!collectionTime) {
      onPaymentError("Please select a collection time.")
      return
    }

    if (isOutsideHours || availableTimes.length === 0) {
      onPaymentError("Sorry, we are currently closed. Please place your order during opening hours.")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // 1. Create the order in your database first
      const orderData = {
        customer_name: customerInfo.name.trim(),
        customer_phone: customerInfo.phone.trim(),
        collection_time: collectionTime,
        collection_date: collectionDate,
        special_instructions: customerInfo.notes.trim() || undefined,
        total_amount: totalAmount,
        items: cartItems.map((item) => ({
          menu_item_id: item.id,
          item_name: item.name,
          selected_option: item.selectedOption,
          unit_price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
        })),
      }

      const order = await createOrder(orderData)

      if (!order) {
        throw new Error("Failed to create order in database.")
      }

      // 2. Confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your production URL when deploying
          return_url: `${window.location.origin}/order-success?orderNumber=${order.order_number}&collectionTime=${collectionTime}`,
        },
      })

      // This point will only be reached if there's an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (stripeError.type === "card_error" || stripeError.type === "validation_error") {
        setMessage(stripeError.message)
        onPaymentError(stripeError.message || "Payment failed. Please try again.")
      } else {
        setMessage("An unexpected error occurred.")
        onPaymentError("An unexpected error occurred. Please try again.")
      }
    } catch (dbError: any) {
      console.error("Database order creation error:", dbError)
      setMessage(dbError.message || "Failed to create order. Please try again.")
      onPaymentError(dbError.message || "Failed to create order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitButtonText = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          Processing Payment...
        </div>
      )
    }
    if (isOutsideHours || availableTimes.length === 0) {
      return new Date().getDay() === 0 ? "Closed on Sundays" : "Closed - See Opening Hours Above"
    }
    if (!collectionTime) {
      return "Select Collection Time"
    }
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      return "Fill in Required Details"
    }
    return `Pay Now - £${totalAmount.toFixed(2)}`
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <Button
        type="submit"
        disabled={
          isLoading ||
          !stripe ||
          !elements ||
          isOutsideHours ||
          availableTimes.length === 0 ||
          !collectionTime ||
          !customerInfo.name.trim() ||
          !customerInfo.phone.trim()
        }
        className="w-full bg-lime-400 hover:bg-lime-500 text-slate-800 font-bold text-lg py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitButtonText()}
      </Button>
      {/* Show any error or success messages */}
      {message && <div className="text-red-600 text-sm text-center mt-4">{message}</div>}
    </form>
  )
}