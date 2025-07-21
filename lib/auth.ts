"use client"

import { useState, useEffect } from "react"

const ADMIN_PASSWORD = "munchbox2024" // You can change this to whatever you want

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== "undefined") {
      const adminAuth = localStorage.getItem("munchbox_admin_auth")
      if (adminAuth === "authenticated") {
        setIsAuthenticated(true)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      if (typeof window !== "undefined") {
        localStorage.setItem("munchbox_admin_auth", "authenticated")
      }
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("munchbox_admin_auth")
    }
    setIsAuthenticated(false)
  }

  return { isAuthenticated, isLoading, login, logout }
}
