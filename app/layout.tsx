import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ToastProvider } from '@/components/ui/toast-provider'
import { RealTimeInitializer } from '@/components/real-time-initializer'
import { useDataStore } from '@/lib/core/data-store'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

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
      <body className={`font-sans antialiased ${geist.className} ${geistMono.className}`}>
        <RealTimeInitializer />
        {children}
        <ToastProvider />
        <Analytics />
      </body>
    </html>
  )
}
