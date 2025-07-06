import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '../contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Merg',
  description: 'Find content across hidden corners of the internet using intelligent AI agents',
  icons: {
    icon: '/logo1.png',
    shortcut: '/logo1.png',
    apple: '/logo1.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

