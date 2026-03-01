import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

const inter = Inter({ 
  subsets: ['latin', 'greek'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'PAVLICEVITS - Expert Paint Solutions',
  description: 'Expert paint solutions for automotive & structural projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={`${inter.variable} font-sans bg-skeuo-bg text-skeuo-text antialiased`}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#F0F2F6',
              border: 'none',
              boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.06), -6px -6px 12px rgba(255, 255, 255, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.04), -1px -1px 2px rgba(255, 255, 255, 1)',
              color: '#1E293B',
              borderRadius: '1.5rem',
            },
          }}
        />
      </body>
    </html>
  )
}
