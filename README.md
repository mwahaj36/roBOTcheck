# roBOTcheck

**⚠️ IMPORTANT DISCLAIMER: This is a SATIRICAL, conceptual project. It is perfect for small, low-traffic personal apps (like a personal blog or contact form). It is NOT intended for high-stakes or security-critical applications (like banking, massive enterprise apps, or anything handling sensitive data).**

roBOTcheck is a satirical reverse CAPTCHA that lets humans through while blocking bots. Instead of asking you to click traffic lights, it watches how you move, click, and type. Bots that are too fast, too precise, or too consistent get blocked. Humans, with all their glorious imperfection, pass.

---

## How It Works

When you add roBOTcheck to a page, two things happen:

1. A small **widget** loads on your page. It creates an invisible iframe that runs a series of behavioral challenges — tile selection, reaction timing, and typing cadence.
2. When the user completes the challenges, the **verification server** scores their behavior and issues a signed token. Your backend checks that token before accepting any form submission.

roBOTcheck runs as two components you deploy yourself:

- **Verification Server** — a Docker container you host. It manages sessions, scores telemetry, and signs tokens. Nobody else hosts this for you, which means you control your own data.
- **Widget** — a JavaScript file your users load in the browser. It handles the challenge UI and talks to your server.

---

## Efficacy, Use Cases & Limitations

roBOTcheck is designed to balance user experience with security. Below is a breakdown of when it is effective and its limitations.

### 👍 When It Works (Efficacy & Use Cases)
* **Bulk Automation & Scrapers:** Instantly blocks standard automated scripts, scrapers, and headless browsers (Puppeteer, Playwright, Selenium) that attempt to submit forms directly.
* **Rate Limiting Protection:** Implements a strict IP rate limiter (**5 attempts in 5 minutes = 5-minute IP ban**) protecting endpoints from brute-force bot spamming.
* **Frictionless Verification:** Ideal for newsletters, contact forms, or personal blogs where you want to minimize human friction (avoiding annoying "select the traffic light" grids) while filtering out 99% of background internet scripts.
* **Client-Side Anti-Spoofing:** Actively inspects the client browser environment for automation signatures, checking for `navigator.webdriver`, missing browser engines, and software-rasterized WebGL renderers (e.g., SwiftShader/Mesa).

### ⚠️ Limitations (Security Boundaries)
* **Targeted Human Mimicry Bots:** A dedicated attacker who writes a bot script specifically targeted at your page and implements custom Bezier curve mouse kinematics and human-like typing cadence (with randomized flight/dwell delay variations) can potentially bypass the scoring heuristics.
* **Stealth Frameworks:** Advanced stealth automation plugins (like `puppeteer-extra-plugin-stealth`) that successfully mask the browser environment signature may bypass initial client-side flags.
* **Human-in-the-Loop Solver Farms:** Like all CAPTCHA architectures, roBOTcheck cannot block actual human workers manually completing the challenges on behalf of a bot script.

---

## The Challenges & Scoring Mechanics

roBOTcheck doesn't care *if* you complete a challenge; it cares *how* you complete it. Bots are incredibly fast and perfectly precise. Humans are slow, jittery, and inconsistent. The Verification Server uses this biological imperfection to generate a **Robot Score (0-100)**. Lower is more human.

### 1. The Tiles Challenge
**The Task:** Click a sequence of highlighted tiles.
**How we catch bots:** 
- **Trajectory Analysis:** We track the cursor path. Bots draw perfect straight lines between targets. Humans draw subtle arcs with micro-corrections.
- **Click Variance:** Bots click the exact center of a target. Humans click randomly around the edges.
- **Speed:** Instantaneous snapping between tiles adds massive penalty points.

### 2. The Reaction Challenge
**The Task:** Wait for a red box to turn green, then click it.
**How we catch bots:** 
- **Reaction Time:** Average human reaction time is ~200-250ms. If a click registers in <50ms, it is physically impossible and immediately flagged as a script.
- **Anticipation:** If the click lands *exactly* on a perfectly round number (like exactly 100ms) repeatedly, it indicates a hardcoded `sleep()` timer.

### 3. The Typing Challenge
**The Task:** Type a specific short phrase into a box.
**How we catch bots:** 
- **Paste Detection:** If the phrase appears instantly, it's a bot.
- **Keystroke Cadence:** We measure *Dwell Time* (how long a key is held down) and *Flight Time* (the gap between keys). A bot script usually types with a perfectly uniform 20ms gap between every character. Human typing has rhythmic variance (slower on difficult keys, faster on common combinations).

If your final telemetry looks "too perfect", the server rejects you. If you look like a messy, jittery human, you get a signed token!

---

## Step 1 — Set Up Your Keys

Create a `.env` file in the root of the project (you can copy the provided `.env.example`). This file is **strictly required** for the server to start. You will need to define three keys:

- **SECRET** — a long random string used internally to sign session tokens. Think of it like a password for the server itself. Example: `k7Xp2mNq9zLw4vRt`
- **SECRETKEY** — your private API key. Your backend uses this when calling `/verify`. Never put this in frontend code. Example: `rc_sec_myapp_k7x2`
- **SITEKEY** — your public key. This goes in your HTML on the widget element. It is safe to be visible to users. Example: `rc_pub_myapp_k7x2`

You can name these whatever you want — there is no central registry. They just have to match between your server config, your frontend HTML, and your backend code.

---

## Step 2 — Run the Verification Server

Because roBOTcheck requires secret keys and token cryptography, the verification step must happen on a secure backend server. You have two options for running this server:

### Option A: Use the Docker Container (Universal & Recommended)

The server is distributed as a Docker image. This means you do not install Node.js or any dependencies manually — Docker handles everything inside a container. It is perfect if you want to deploy to a VPS, Render, AWS, or Hugging Face Spaces.

**1. Pull the image**

```bash
docker pull mwahaj36/robotcheck:latest
```

**2. Run the container**

```bash
docker run -d -p 3000:3000 \
  -e SECRET=your_random_secret \
  -e SECRETKEY=rc_sec_yourkey \
  -e SITEKEY=rc_pub_yourkey \
  -e NODE_ENV=production \
  mwahaj36/robotcheck:latest
```

**3. Verify it is running**

Open your browser and go to `http://localhost:3000/health`. You should see `OK`.

### Option B: Native Integration (Merge into your backend)

If you already have a Node.js backend (like Express, Next.js, or NestJS), you can completely avoid running a second server! 

Instead of using Docker, simply copy the source files from `packages/server/src` in this repository and adapt the routing logic (`/verify`, `/challenge`, `/submit`) directly into your own backend application. 

- **Pros:** Zero extra hosting costs. Lower latency. Only one app to manage.
- **Cons:** Requires manual rewriting if you use a framework other than standard Express, or if you use a language other than JavaScript/TypeScript.

---

## Development vs. Production Environments

When integrating roBOTcheck, your setup will look slightly different depending on whether you are coding locally (Dev) or deployed (Prod):

**During Development:**
- You will run the Verification Server locally (either via `docker run` or by running `npm run dev --workspace=packages/server` in this repo).
- In your frontend HTML, you will set `window.ROBOTCHECK_CONFIG.apiUrl = "http://localhost:3000"`.
- Your backend will verify tokens by making `fetch` requests to `http://localhost:3000/verify`.

**In Production:**
- You will deploy the Verification Server Docker container to a live cloud host (like Hugging Face Spaces, Render, or a DigitalOcean VPS).
- In your frontend HTML, you must update the config to point to your live URL: `window.ROBOTCHECK_CONFIG.apiUrl = "https://your-deployed-server.com"`.
- Your backend will verify tokens by making `fetch` requests to `https://your-deployed-server.com/verify`.

### Deploying the Docker Container to Production

Running `docker run` on your personal computer is great for testing, but for a live application, the Verification Server must run 24/7 on the internet. Here is exactly how to deploy the container to various cloud hosts:

**Approach 1: Hugging Face Spaces (Easiest & Free)**
Hugging Face allows you to host Docker containers for free.
1. Create an account on Hugging Face and create a new **Space**.
2. Select **Docker** as your Space SDK.
3. In your Space's **Settings**, find the **Variables and secrets** section and add: `SECRET`, `SECRETKEY`, `SITEKEY`, and `NODE_ENV=production`.
4. Set your space to pull the `mwahaj36/robotcheck:latest` image.
5. Hugging Face will automatically boot the server and provide you with a live HTTPS URL. Use this URL in your frontend and backend configs!

**Approach 2: Container Hosts (Render, Railway, Fly.io)**
These platforms are designed specifically for hosting Docker images with zero server maintenance.
1. Sign up for a service like Render or Railway.
2. Click **Create New Web Service** and choose **Deploy an existing image**.
3. Enter `mwahaj36/robotcheck:latest` as the image URL.
4. In the setup wizard, add your 4 Environment Variables (`SECRET`, `SECRETKEY`, `SITEKEY`, `NODE_ENV`).
5. Click **Deploy**. The platform will handle port mapping and instantly give you a secure `https://` URL.

---

## Step 3 — Add the Widget to Your Page

The widget is a JavaScript file that mounts the challenge UI inside your page. It detects the `.robotcheck` element, creates a sandboxed iframe pointing to your server, and runs the challenges there.

Choose the method that suits your project:

---

### Option A — CDN (recommended for plain HTML projects)

No installation needed. Just add script tags to your HTML.

```html
<!DOCTYPE html>
<html>
  <body>
    <form id="signup-form">
      <input type="email" name="email" placeholder="your@email.com" required />

      <!--
        This is where the widget mounts.
        data-sitekey must match the SITEKEY you set on your server.
    -->
      <div class="robotcheck" data-sitekey="rc_pub_yourkey"></div>

      <!--
        This hidden input will hold the pass token once the user
        completes the challenge. Your form submits it to your backend.
    -->
      <input type="hidden" name="robotcheckToken" id="rc-token" />

      <button type="submit">Sign Up</button>
    </form>

    <!--
    Tell the widget where your verification server lives.
    This must come BEFORE the widget script tag.
-->
    <script>
      window.ROBOTCHECK_CONFIG = {
        apiUrl: "http://localhost:3000",
        // In production, replace with your deployed server URL:
        // apiUrl: 'https://your-server.example.com'
      };
    </script>

    <!-- Load the widget from the CDN -->
    <script src="https://unpkg.com/@mwahaj36/robotcheck/dist/widget.js"></script>

    <!--
    When the user passes the challenge, store the token in the hidden input.
    The form will include it when submitted.
-->
    <script>
      robotcheck.onPass(function (token) {
        document.getElementById("rc-token").value = token;
      });
    </script>
  </body>
</html>
```

---

### Option B — npm (for Node.js / bundler projects)

If you are using a framework like Express, Next.js, or a bundler like Webpack:

**Install the package:**

```bash
npm install @mwahaj36/robotcheck
```

**Serve the widget file as a static asset from your Express server:**

```js
// In your Express app (e.g. server.js or app.js)
const express = require("express");
const path = require("path");
const app = express();

// This makes the widget script available at /robotcheck/widget.js
// It serves directly from the installed npm package — no manual copying needed.
app.use(
  "/robotcheck",
  express.static(
    path.join(__dirname, "node_modules/@mwahaj36/robotcheck/dist"),
  ),
);
```

**Then reference it in your HTML:**

```html
<form id="signup-form">
  <input type="email" name="email" placeholder="your@email.com" required />

  <div class="robotcheck" data-sitekey="rc_pub_yourkey"></div>
  <input type="hidden" name="robotcheckToken" id="rc-token" />

  <button type="submit">Sign Up</button>
</form>

<script>
  window.ROBOTCHECK_CONFIG = {
    apiUrl: "http://localhost:3000",
  };
</script>

<!-- Now loads from your own server instead of an external CDN -->
<script src="/robotcheck/widget.js"></script>

<script>
  robotcheck.onPass(function (token) {
    document.getElementById("rc-token").value = token;
  });
</script>
```

---

## Step 4 — Verify the Token on Your Backend

When a user submits your form, their browser sends a `robotcheckToken` along with the rest of the form data. **Do not trust this token on its own.** Your backend must verify it with your server before accepting the submission.

This is a server-to-server call — it never happens in the browser. The user never sees your `SECRETKEY`.

The verification endpoint is:

```
POST https://your-server.example.com/verify
```

It expects a JSON body:

```json
{
  "secret": "rc_sec_yourkey",
  "token": "the token from the form submission"
}
```

Choose your backend language:

---

### Node.js (Express & Next.js)

**Pro-Tip for easier integration:** Create a reusable helper function in your project so you don't have to rewrite the `fetch` logic in every route!

```js
// lib/robotcheck.js
export async function verifyRobotcheck(token) {
  if (!token) return { success: false, error: 'No token provided' };
  try {
    const res = await fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: "rc_sec_yourkey", token })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Connection failed' };
  }
}
```

Then simply use it in your route:

```js
import { verifyRobotcheck } from './lib/robotcheck';

app.post("/signup", async (req, res) => {
  const { email, robotcheckToken } = req.body;

  // Step 1: Verify the token
  const result = await verifyRobotcheck(robotcheckToken);

  // Step 2: Check the result
  if (!result.success) {
    // The token was invalid, expired, or the user was flagged as a bot
    return res
      .status(403)
      .json({ error: "Bot detected. Submission rejected." });
  }

  // Step 3: Token is valid — safe to process the form
  console.log(
    `Human verified. Score: ${result.score}, Rounds: ${result.roundsCompleted}`,
  );
  res.json({ success: true, message: `Welcome, ${email}!` });
});
```

---

### Python (Flask + requests)

```python
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    token = data.get('robotcheckToken')
    email = data.get('email')

    # Step 1: Verify the token with your roBOTcheck server
    result = requests.post('http://localhost:3000/verify', json={
        'secret': 'rc_sec_yourkey',   # Your SECRETKEY from Step 1
        'token': token                 # The token from the submitted form
    }).json()

    # Step 2: Check the result
    if not result.get('success'):
        return jsonify({'error': 'Bot detected. Submission rejected.'}), 403

    # Step 3: Token is valid — safe to process the form
    return jsonify({'success': True, 'message': f'Welcome, {email}!'})
```

---

### PHP

```php
<?php
$token = $_POST['robotcheckToken'];
$email = $_POST['email'];

// Step 1: Verify the token with your roBOTcheck server
$response = file_get_contents('http://localhost:3000/verify', false,
    stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/json',
        'content' => json_encode([
            'secret' => 'rc_sec_yourkey',  // Your SECRETKEY from Step 1
            'token'  => $token              // The token from the submitted form
        ])
    ]])
);

$result = json_decode($response, true);

// Step 2: Check the result
if (!$result['success']) {
    http_response_code(403);
    echo json_encode(['error' => 'Bot detected. Submission rejected.']);
    exit;
}

// Step 3: Token is valid — safe to process the form
echo json_encode(['success' => true, 'message' => "Welcome, $email!"]);
```

---

### Verify response format

```json
{
  "success": true,
  "score": 14,
  "roundsCompleted": 3
}
```

| Field             | Description                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `success`         | `true` if the token is valid and the user passed. `false` if the token is invalid, expired, already used, or the user was flagged as a bot |
| `score`           | A robot score from 0–100. Lower is more human. Above ~60 is flagged as a bot                                                               |
| `roundsCompleted` | How many challenge rounds the user completed (1–3)                                                                                         |

---

## SDK API Reference

Once the widget script loads, `window.robotcheck` is available globally:

| Method                  | Description                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| `robotcheck.onPass(fn)` | Register a callback. Called with the signed token string when the user passes |
| `robotcheck.getToken()` | Returns the current pass token, or `null` if not yet passed                   |
| `robotcheck.isReady()`  | Returns `true` once the widget has fully initialized in the iframe            |
| `robotcheck.reset()`    | Clears the current token and restarts the challenge from the beginning        |

---

## Repository Structure

This is a monorepo containing:

- `packages/widget` — the client SDK and challenge UI (published to npm as [`@mwahaj36/robotcheck`](https://www.npmjs.com/package/@mwahaj36/robotcheck))
- `packages/server` — the Express verification server (published to Docker Hub as [`mwahaj36/robotcheck`](https://hub.docker.com/r/mwahaj36/robotcheck))
- `demo` — a Next.js demo app showing a full integration

---

## Running Locally

First, ensure you have created your `.env` file in the root of the project (you can copy `.env.example`). The server will crash if it is missing the required variables.

Install dependencies:

```bash
npm install
```

Start the verification server (runs on http://localhost:3000):

```bash
npm run dev --workspace=packages/server
```

Start the demo site (runs on http://localhost:4000):

```bash
npm run demo:dev
```

Build the widget bundle:

```bash
npm run build
```
