import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with your secret key
// Ensure STRIPE_SECRET_KEY is set in your Vercel Environment Variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Use a recent API version
})

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    // Validate the amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount provided." }, { status: 400 })
    }

    // Stripe expects amount in cents (or smallest currency unit)
    const amountInCents = Math.round(amount * 100)

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "gbp", // Assuming GBP for The Munch Box. Change if needed.
      automatic_payment_methods: {
        enabled: true,
      },
      // Optionally, add metadata for better tracking in Stripe Dashboard
      metadata: {
        order_id: "temp_order_id_placeholder", // Replace with actual order ID later
        customer_name: "temp_customer_name_placeholder", // Replace with actual customer name later
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating Payment Intent:", error)
    // Provide a more generic error message to the client for security
    return NextResponse.json({ error: "Failed to create payment intent." }, { status: 500 })
  }
}