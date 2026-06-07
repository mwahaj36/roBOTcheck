export default function Privacy() {
  return (
    <div className="text-container">
      <h1>Privacy Policy</h1>
      <p>Last updated: June 7, 2026</p>

      <p>
        Your privacy is important to us. Because roBOTcheck is a satirical reverse CAPTCHA, our data collection practices are entirely aimed at identifying chaotic human qualities.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        The client-side widget collects raw kinetic and cadence telemetries in order to verify your biological presence. This includes:
      </p>
      <ul>
        <li><strong>Mouse Trajectories:</strong> Your X and Y mouse coordinates sampled at 60fps to analyze deceleration curves, momentum signatures (autocorrelation), and target overshoots.</li>
        <li><strong>Interaction Timings:</strong> The millisecond intervals between clicks, checkbox selections, and visual stimuli.</li>
        <li><strong>Keyboard Cadence:</strong> The millisecond timestamps of keydown events while typing in our text areas to verify inconsistent speeds and natural typos.</li>
      </ul>

      <h2>2. What We Do NOT Collect</h2>
      <p>
        We do not collect or store:
      </p>
      <ul>
        <li>Your name, personal IP address, geographical location, or browsing history.</li>
        <li>The contents of what you type in the text fields (we only record keydown timing intervals, not the characters typed).</li>
      </ul>

      <h2>3. Where Your Data Goes</h2>
      <p>
        All raw telemetry data is posted directly to the self-hosted verification server running under the developer's infrastructure. We do not operate a centralized database. The developer has complete control over their backend storage configurations. Session tokens and pass signatures expire within minutes.
      </p>

      <h2>4. Cookies and Local Storage</h2>
      <p>
        roBOTcheck does not place persistent cookies on your browser. Once verification completes and you submit the parent form, all session variables are discarded from active memory.
      </p>
    </div>
  )
}
