import './globals.css'
import { AuthProvider } from '../components/AuthProvider'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Assam Innovates — The Electronic Tinkerspace',
  description: 'A hands-on electronics community rooted in the Brahmaputra Valley. Projects, tutorials, and makers from across Assam.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
