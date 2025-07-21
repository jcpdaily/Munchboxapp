"use client"

import { ShoppingCart, Utensils, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  type: "cart" | "menu" | "orders" | "error"
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ type, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const icons = {
    cart: ShoppingCart,
    menu: Utensils,
    orders: ShoppingCart,
    error: AlertCircle,
  }

  const Icon = icons[type]

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>

      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white">{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction} className="bg-slate-800 hover:bg-slate-700 text-white">
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
