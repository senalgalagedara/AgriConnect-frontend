import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'User Management Dashboard',
  description: 'Manage farmers, consumers, and drivers efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}