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
              <p className="brand-subtitle">The reverse CAPTCHA that filters out efficient AI scripts by verifying you are a chaotic, slow biological human.</p>
            </div>

            <div className="telemetry-log">
              <div className="log-line"><span className="log-label">[01]</span> DETECTING_LOUSY_MOUSE_OVERCORRECTIONS</div>
              <div className="log-line"><span className="log-label">[02]</span> CHECKING_SLOPPY_TYPING_CADENCE</div>
              <div className="log-line"><span className="log-label">[03]</span> ANALYZING_STIMULI_LATENCY_DELAY</div>
              <div className="log-line"><span className="log-label">[04]</span> BANNING_PERFECTLY_EFFICIENT_BOTS</div>
            </div>
          </div>

          <div className="console-panel">
            <div className="console-bar">
              <span className="console-dot red"></span>
              <span className="console-dot yellow"></span>
              <span className="console-dot green"></span>
              <span className="console-title">newsletter_subscriber.sh</span>
            </div>
            
            <div className="console-body">
              <div className="console-header-text">
                <p className="cli-prompt">$ ./init_newsletter --no-robots-allowed</p>
                <p className="cli-response">roBOTcheck captcha loaded...</p>
              </div>

              <form onSubmit={handleSubmit} className="console-form">
                <div className="form-group">
                  <label className="console-label">Human Email</label>
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
          <h2>Banning the Perfect. Celebrating the Messy.</h2>
          <p className="section-subheader">
            Bots are flawless. Humans are slow, clumsy, and full of friction. We monitor your kinetic drag errors and response lag times to verify that you are actually a biological entity.
          </p>
        </div>
        
        <div className="section-content">
          <div className="features-grid">
            <div className="feature-block">
              <div className="feature-code"># MODULE_01 // MOUSE_KINETICS</div>
              <h3>Sloppy Dragging</h3>
              <p>We check your mouse path. If you navigate to the checkbox in a mathematically straight line, you are instantly banned.</p>
            </div>

            <div className="feature-block">
              <div className="feature-code"># MODULE_02 // TIMING_LATENCY</div>
              <h3>Slow Reactions</h3>
              <p>Click the visual stimuli target. Response velocities under 150ms are flagged as superhuman script delays.</p>
            </div>

            <div className="feature-block">
              <div className="feature-code"># MODULE_03 // CADENCE_ANALYSIS</div>
              <h3>Natural Typing</h3>
              <p>We look for keystroke friction and timing variations. Clipboard pasting or uniform interval typing triggers a ban.</p>
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
            <div className="legal-header-code">// BIO_HUMAN_LIABILITY_TERMS</div>
            <p className="legal-intro">By testing this demo, you warrant that your hand-eye coordination is thoroughly average.</p>
            <ul className="legal-bullets">
              <li>Reserved exclusively for biological entities with imperfect motor responses.</li>
              <li>AI agents, web scrapers, automated form-fillers, or headless scripts are legally barred.</li>
              <li>You agree to waive your right to be efficient in exchange for passing our security checks.</li>
            </ul>
          </div>

          {/* Privacy Column */}
          <div className="legal-column">
            <div className="legal-header-code">// WHAT_WE_STALK_MANIFEST</div>
            <p className="legal-intro">We only stalk your physical friction logs. No personal data collection.</p>
            <ul className="legal-bullets">
              <li>Data coordinates and click latencies are sent directly to the host developer's self-hosted server.</li>
              <li>We only measure keystroke interval timings; we never log the characters you actually type.</li>
              <li>Zero tracking cookies are used. Telemetry is deleted from RAM immediately after validation.</li>
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
