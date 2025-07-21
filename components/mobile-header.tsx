"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Phone, ShoppingCart, Menu, X } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/hooks/use-cart"

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  backHref?: string
  showCart?: boolean
  showPhone?: boolean
}

export function MobileHeader({
  title,
  showBack = false,
  backHref = "/",
  showCart = false,
  showPhone = false,
}: MobileHeaderProps) {
  const { cartItems } = useCart()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <header className="bg-slate-800 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {showBack && (
              <Link href={backHref}>
                <Button variant="ghost" size="sm" className="text-white hover:text-lime-400 p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <div className="bg-lime-400 text-slate-800 px-3 py-1 rounded font-bold text-sm sm:text-base">
              THE MUNCH BOX
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {showPhone && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-lime-400 hidden sm:flex"
                onClick={() => window.open("tel:07825368920")}
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">07825368920</span>
              </Button>
            )}

            {showCart && (
              <Link href="/cart">
                <Button className="bg-lime-400 hover:bg-lime-500 text-slate-800 relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-lime-400 sm:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {showMobileMenu && (
          <div className="sm:hidden mt-4 pt-4 border-t border-slate-700">
            <div className="space-y-2">
              {showPhone && (
                <Button
                  variant="ghost"
                  className="w-full text-white hover:text-lime-400 justify-start"
                  onClick={() => {
                    window.open("tel:07825368920")
                    setShowMobileMenu(false)
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call: 07825368920
                </Button>
              )}
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full text-white hover:text-lime-400 justify-start"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </Button>
              </Link>
              <Link href="/menu">
                <Button
                  variant="ghost"
                  className="w-full text-white hover:text-lime-400 justify-start"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Menu
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
