'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function Home() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState({ show: false, type: '', html: '' })

  useEffect(() => {
    // Expose the global API URL config to the widget script
    window.ROBOTCHECK_CONFIG = {
      apiUrl: process.env.NEXT_PUBLIC_ROBOTCHECK_URL
    }

    // Set up a listener for the widget instance to load and bind
    const setupListener = () => {
      if (window.robotcheck) {
        window.robotcheck.onPass((passToken) => {
          setToken(passToken)
          console.log("Verification pass token recorded.")
        })
        clearInterval(pollInterval)
      }
    }

    const pollInterval = setInterval(setupListener, 100)
    return () => clearInterval(pollInterval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear status state
    setStatus({ show: false, type: '', html: '' })

    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, robotcheckToken: token })
      })
      const data = await res.json()

      if (data.success) {
        setStatus({
          show: true,
          type: 'success',
          html: `
            <h4>Subscription Successful</h4>
            <p>Welcome, human subscriber: <strong>${data.email}</strong>.</p>
            <p>roBOTcheck verification stats:</p>
            <ul>
              <li>Verdict Score: <strong>${data.score}/100</strong> (lower is more human)</li>
              <li>Rounds Completed: <strong>${data.roundsCompleted}</strong></li>
            </ul>
          `
        })
      } else {
        setStatus({
          show: true,
          type: 'error',
          html: `
            <h4>Verification Failed</h4>
            <p>${data.error}</p>
          `
        })
      }
    } catch (err) {
      setStatus({
        show: true,
        type: 'error',
        html: `
          <h4>System Error</h4>
          <p>Could not connect to verify endpoint: ${err.message}</p>
        `
      })
    }
  }

  return (
    <>
      <div className="form-container">
        <div className="header-title">
          <h2>Newsletter</h2>
          <p>Join the loop. No bots admitted.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="name@example.com"
            />
          </div>
          
          {/* Captcha placement element */}
          <div className="robotcheck" data-sitekey="rc_pub_a1b2c3d4e5f6"></div>
          
          <button type="submit">Subscribe</button>
        </form>

        {status.show && (
          <div 
            className={`status-box ${status.type}`}
            dangerouslySetInnerHTML={{ __html: status.html }}
          />
        )}
      </div>

      <Script 
        src="https://unpkg.com/@mwahaj36/robotcheck/dist/widget.js"
        strategy="afterInteractive" 
      />
    </>
  )
}
