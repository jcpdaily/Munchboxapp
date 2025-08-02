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

    // Log the received amount for debugging
    console.log("Received amount for Payment Intent:", amount)

    // Validate the amount
    if (typeof amount !== "number" || amount <= 0) {
      console.error("Invalid amount provided:", amount)
      return NextResponse.json({ error: "Invalid amount provided." }, { status: 400 })
    }

    // Stripe expects amount in cents (or smallest currency unit)
    const amountInCents = Math.round(amount * 100)
    console.log("Amount in cents:", amountInCents)

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

    console.log("Payment Intent created successfully. Client Secret:", paymentIntent.client_secret)
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error("Error creating Payment Intent:", error)
    // Log specific Stripe error details if available
    if (error.type === "StripeCardError") {
      console.error("Stripe Card Error:", error.message, error.code, error.decline_code)
    } else if (error.type === "StripeInvalidRequestError") {
      console.error("Stripe Invalid Request Error:", error.message, error.param)
    } else if (error.type === "StripeAPIError") {
      console.error("Stripe API Error:", error.message, error.statusCode)
    }
    // Provide a more generic error message to the client for security
    return NextResponse.json({ error: "Failed to create payment intent." }, { status: 500 })
  }
}