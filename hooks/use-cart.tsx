"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  selectedOption?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: number, selectedOption?: string) => void
  updateQuantity: (id: number, quantity: number, selectedOption?: string) => void
  getCartTotal: () => number
  clearCart: () => void
}

// Define a default context value for when it's not yet initialized (e.g., during SSR)
const defaultCartContext: CartContextType = {
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  getCartTotal: () => 0,
  clearCart: () => {},
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("munchbox-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart)
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("munchbox-cart", JSON.stringify(cartItems))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [cartItems, isLoaded])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    if (!item.id || !item.name || item.price < 0) {
      console.error("Invalid item data:", item)
      return
    }

    setCartItems((prev) => {
      // Create a unique identifier for items with options
      const itemKey = item.selectedOption ? `${item.id}-${item.selectedOption}` : `${item.id}`

      const existingItem = prev.find((cartItem) => {
        const cartItemKey = cartItem.selectedOption ? `${cartItem.id}-${cartItem.selectedOption}` : `${cartItem.id}`
        return cartItemKey === itemKey
      })

      if (existingItem) {
        return prev.map((cartItem) => {
          const cartItemKey = cartItem.selectedOption ? `${cartItem.id}-${cartItem.selectedOption}` : `${cartItem.id}`
          return cartItemKey === itemKey ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        })
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number, selectedOption?: string) => {
    if (!id || id <= 0) {
      console.error("Invalid item ID:", id)
      return
    }

    setCartItems((prev) =>
      prev.filter((item) => {
        const itemKey = selectedOption ? `${id}-${selectedOption}` : `${id}`
        const cartItemKey = item.selectedOption ? `${item.id}-${item.selectedOption}` : `${item.id}`
        return cartItemKey !== itemKey
      }),
    )
  }

  const updateQuantity = (id: number, quantity: number, selectedOption?: string) => {
    if (!id || id <= 0) {
      console.error("Invalid item ID:", id)
      return
    }

    if (quantity < 0) {
      console.error("Invalid quantity:", quantity)
      return
    }

    if (quantity === 0) {
      removeFromCart(id, selectedOption)
      return
    }

    setCartItems((prev) =>
      prev.map((item) => {
        const itemKey = selectedOption ? `${id}-${selectedOption}` : `${id}`
        const cartItemKey = item.selectedOption ? `${item.id}-${item.selectedOption}` : `${item.id}`
        return cartItemKey === itemKey ? { ...item, quantity } : item
      }),
    )
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.price < 0 || item.quantity < 0) {
        console.error("Invalid item in cart:", item)
        return total
      }
      return total + item.price * item.quantity
    }, 0)
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  // Return default context if not yet initialized (e.g., during SSR)
  // This prevents the "useCart must be used within a CartProvider" error during prerendering
  if (context === undefined) {
    // In a real app, you might want to log a warning here or return a more sophisticated
    // "loading" state for the cart, but for now, returning the default prevents crashes.
    return defaultCartContext
  }
  return context
}
