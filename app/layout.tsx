import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/hooks/use-cart"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/components/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Munch Box - Food Truck Ordering App",
  description:
    "Order fresh food from The Munch Box food truck for quick collection. Skip the queue with our easy online ordering system.",
  keywords: "food truck, online ordering, The Munch Box, fresh food, quick collection, Crawley",
  authors: [{ name: "The Munch Box" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#a3e635", // lime-400
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="The Munch Box" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
