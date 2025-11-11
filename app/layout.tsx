import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RPG Adventure',
  description: 'An epic RPG adventure game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
