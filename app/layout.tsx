import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ToastProvider } from '@/components/ui/toast-provider'
import { DataProvider } from '@/components/data-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoOps AI - AI-Driven Business Action Agent',
  description: 'Automate high-value business workflows with AI that analyzes data, predicts needs, and executes solutions',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DataProvider enableRealTime={true}>
          {children}
          <ToastProvider />
          <Analytics />
        </DataProvider>
      </body>
    </html>
  )
}
