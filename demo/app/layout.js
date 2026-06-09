import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600']
})

export const metadata = {
  title: 'roBOTcheck — Satirical Reverse CAPTCHA Demo',
  description: 'Proving biological human presence through timing and gesture anomalies.',
  icons: {
    icon: '/logo.png',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <main>
          {children}
        </main>

        <footer>
          <p>protected by roBOTcheck — all rights reserved 2026</p>
        </footer>
      </body>
    </html>
  )
}
