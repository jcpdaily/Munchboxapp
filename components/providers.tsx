"use client"

import { CartProvider } from "@/hooks/use-cart"
import { ToastProvider } from "@/components/toast"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>{children}</ToastProvider>
    </CartProvider>
  )
}
