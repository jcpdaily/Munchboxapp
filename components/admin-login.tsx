"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

interface AdminLoginProps {
  onLogin: (password: string) => boolean
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const success = onLogin(password)

    if (!success) {
      setError("Invalid password. Please try again.")
      setPassword("")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-lime-400 text-slate-800 px-4 py-2 rounded font-bold text-xl inline-block mb-4">
            THE MUNCH BOX
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                disabled={isSubmitting}
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Need access? Contact the owner for the admin password.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
