import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600']
})

export const metadata = {
  title: 'roBOTcheck — Satirical Reverse CAPTCHA Demo',
  description: 'Proving biological human presence through timing and gesture anomalies.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <header>
          <div className="nav-container">
            <a href="/" className="logo-link">
              <img 
                src="/logo.png" 
                alt="roBOTcheck Logo" 
                width="32" 
                height="32" 
                className="logo-img" 
              />
              <span>roBOTcheck</span>
            </a>
            <nav className="nav-links">
              <a href="/">Demo</a>
              <a href="/about">About</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </nav>
          </div>
        </header>

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
