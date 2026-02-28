import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin', 'greek'] })

export const metadata: Metadata = {
  title: 'PAVLICEVITS | Expert Paint Solutions',
  description: 'AI-powered expert guidance for automotive and structural paint solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'hsl(0 0% 10%)',
              border: '1px solid hsl(0 0% 20%)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  )
}
