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
    <div className="landing-wrapper">
      <div className="hero-section">
        <div className="hero-grid">
          
          <div className="brand-panel">
            
            <div className="brand-header">
              <img 
                src="/logo.png" 
                alt="roBOTcheck Logo" 
                width="84" 
                height="84" 
                className="hero-logo"
              />
              <h1 className="brand-title">roBOTcheck_</h1>
              <p className="brand-subtitle">An adversarial timing and kinetic telemetry suite designed to verify organic human presence.</p>
            </div>

            <div className="telemetry-log">
              <div className="log-line"><span className="log-label">[01]</span> MOUSE_TRAJECTORY_SAMPLING @ 60HZ</div>
              <div className="log-line"><span className="log-label">[02]</span> KEYDOWN_INTERVAL_AUTOCORRELATION</div>
              <div className="log-line"><span className="log-label">[03]</span> REFLEX_STIMULI_LATENCY_VERIFIER</div>
              <div className="log-line"><span className="log-label">[04]</span> REJECT_MATHEMATICALLY_PERFECT_INPUTS</div>
            </div>
          </div>

          {/* Right Column: Console Terminal Signup Form */}
          <div className="console-panel">
            <div className="console-bar">
              <span className="console-dot red"></span>
              <span className="console-dot yellow"></span>
              <span className="console-dot green"></span>
              <span className="console-title">newsletter_subscriber.sh</span>
            </div>
            
            <div className="console-body">
              <div className="console-header-text">
                <p className="cli-prompt">$ ./init_subscription --admit-humans-only</p>
                <p className="cli-response">roBOTcheck captcha initialised...</p>
              </div>

              <form onSubmit={handleSubmit} className="console-form">
                <div className="form-group">
                  <label className="console-label">Subscriber Address</label>
                  <div className="input-with-prompt">
                    <span className="input-prompt">&gt;</span>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      placeholder="name@example.com"
                      className="console-input"
                    />
                  </div>
                </div>
                
                {/* Captcha placement element */}
                <div className="robotcheck-container">
                  <div className="robotcheck" data-sitekey="rc_pub_a1b2c3d4e5f6"></div>
                </div>
                
                <button type="submit" className="console-submit">SUBMIT_FORM</button>
              </form>

              {status.show && (
                <div 
                  className={`status-box console-status ${status.type}`}
                  dangerouslySetInnerHTML={{ __html: status.html }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>
          <span>DIAGNOSTICS</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="section-container about-section">
        <div className="section-header">
          <span className="section-tag">[ENG_MANIFESTO]</span>
          <h2>The Reverse Verification Suite</h2>
          <p className="section-subheader">
            Bots solve image-recognition puzzles in milliseconds. roBOTcheck shifts security parameters to measure organic cognitive friction, motor limits, and keystroke timing.
          </p>
        </div>
        
        <div className="section-content">
          <div className="features-grid">
            <div className="feature-block">
              <div className="feature-code"># MODULE_01 // MOUSE_KINETICS</div>
              <h3>Kinetic Velocity</h3>
              <p>We sample pointer coordinates to measure approach vectors, deceleration anomalies, and micro-corrections.</p>
            </div>

            <div className="feature-block">
              <div className="feature-code"># MODULE_02 // TIMING_LATENCY</div>
              <h3>Reflex Latency</h3>
              <p>Monitors response velocity to randomized visual stimuli. Uniform or near-instant responses trigger lockouts.</p>
            </div>

            <div className="feature-block">
              <div className="feature-code"># MODULE_03 // CADENCE_ANALYSIS</div>
              <h3>Typing Cadence</h3>
              <p>Measures standard deviation of keystroke delays. Automated scripts and clipboard pastes are instantly blocked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Privacy Section */}
      <section id="legal" className="section-container legal-section">
        <div className="section-header">
          <span className="section-tag">[SYSTEM_POLICIES]</span>
          <h2>Terms & Privacy</h2>
        </div>
        <div className="section-content legal-grid">
          {/* Terms Column */}
          <div className="legal-column">
            <div className="legal-header-code">// LICENSE_TERMS_OF_USE</div>
            <p className="legal-intro">By interacting with the suite, you authorize kinetic verification telemetry.</p>
            <ul className="legal-bullets">
              <li>Reserved exclusively for biological human users with sloppy hand-eye response patterns.</li>
              <li>Synthetic web agents, scrapers, headless browsers, and API macros are legally barred.</li>
              <li>You accept timing delays and validation friction in exchange for identity confirmation.</li>
            </ul>
          </div>

          {/* Privacy Column */}
          <div className="legal-column">
            <div className="legal-header-code">// TELEMETRY_PRIVACY_MANIFEST</div>
            <p className="legal-intro">Telemetry protocols are strictly focused on checking friction anomalies.</p>
            <ul className="legal-bullets">
              <li>All kinetic telemetry maps are posted directly to the self-hosted verification server of the host developer.</li>
              <li>We never log or capture user keystroke letters; only keydown timestamps are recorded.</li>
              <li>No tracking cookies are written. Sessions expire in RAM memory immediately after form POST verification.</li>
            </ul>
          </div>
        </div>
      </section>

      <Script 
        src="https://unpkg.com/@mwahaj36/robotcheck/dist/widget.js"
        strategy="afterInteractive" 
      />
    </div>
  )
}
