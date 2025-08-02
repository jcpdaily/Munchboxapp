import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/error-boundary" // Import the ErrorBoundary

export const metadata: Metadata = {
  title: "The Munch Box",
  description: "Order fresh food from The Munch Box food truck for quick collection",
  generator: "v0.dev",
  manifest: "/manifest.json", // Link to your PWA manifest
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* The manifest and apple-touch-icon are now handled by metadata.icons and metadata.manifest */}
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ErrorBoundary>
          {" "}
          {/* Wrap children with ErrorBoundary */}
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}