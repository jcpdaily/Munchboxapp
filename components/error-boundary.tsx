"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-lime-400 text-slate-800 px-4 py-2 rounded font-bold text-xl inline-block mb-4">
                THE MUNCH BOX
              </div>
              <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Refresh Page
                </Button>
                <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
                  Go to Homepage
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-left text-xs bg-gray-100 p-2 rounded">
                  <summary className="cursor-pointer font-semibold">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
