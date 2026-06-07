# roBOTcheck

roBOTcheck is a satirical reverse CAPTCHA that lets humans through while blocking bots. Instead of asking you to click traffic lights, it watches how you move, click, and type. Bots that are too fast, too precise, or too consistent get blocked. Humans, with all their glorious imperfection, pass.

---

## How It Works

roBOTcheck runs as two components:

- **Verification Server** — a self-hosted Docker container that runs challenges, scores behavior, and issues signed tokens.
- **Widget** — a JavaScript snippet you drop into your page that loads the challenge iframe and returns a token on pass.

---

## Quick Start for Users

### Step 1 — Run the verification server

Pull and run the Docker image:

```bash
docker pull mwahaj36/robotcheck:latest

docker run -d -p 3000:3000 \
  -e SECRET=your_random_secret \
  -e SECRETKEY=rc_sec_yourkey \
  -e SITEKEY=rc_pub_yourkey \
  -e NODE_ENV=production \
  mwahaj36/robotcheck:latest
```

Your server is now live at `http://localhost:3000` (or your deployed URL).

**Environment variables:**

| Variable | Description |
|----------|-------------|
| `SECRET` | Random string used to sign session tokens |
| `SECRETKEY` | Your private secret key (shared with your backend only) |
| `SITEKEY` | Your public site key (used on the client) |
| `PORT` | Port to listen on (default: `3000`) |
| `NODE_ENV` | Set to `production` to enforce all required variables |

---

### Step 2 — Add the widget to your page

Install the client script via npm:

```bash
npm install @mwahaj36/robotcheck
```

Or load it directly from a CDN:

```html
<script src="https://unpkg.com/@mwahaj36/robotcheck/dist/widget.js"></script>
```

Add a mounting element inside your form and configure the API URL:

```html
<form id="your-form">
    <!-- roBOTcheck mounts here -->
    <div class="robotcheck" data-sitekey="rc_pub_yourkey"></div>

    <button type="submit">Submit</button>
</form>

<!-- Tell the widget where your server lives -->
<script>
    window.ROBOTCHECK_CONFIG = {
        apiUrl: 'https://your-server.example.com'
    }
</script>
<script src="https://unpkg.com/@mwahaj36/robotcheck/dist/widget.js"></script>
<script>
    // Store the pass token when the user completes verification
    robotcheck.onPass((token) => {
        document.getElementById('rc-token').value = token;
    });
</script>
```

---

### Step 3 — Verify the token on your backend

When your form is submitted, send the token from your backend to the verification server:

```js
const response = await fetch('https://your-server.example.com/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        secret: 'rc_sec_yourkey',
        token: req.body.robotcheckToken
    })
});

const result = await response.json();

if (!result.success) {
    return res.status(403).json({ error: 'Bot detected.' });
}

// Proceed with form handling
```

**Response format:**

```json
{
    "success": true,
    "score": 14,
    "roundsCompleted": 3
}
```

A lower score means more human. If `success` is `false`, reject the request.

---

## SDK API Reference

The widget exposes a global `robotcheck` object after the script loads:

| Method | Description |
|--------|-------------|
| `robotcheck.onPass(fn)` | Called with the signed token when the user passes |
| `robotcheck.getToken()` | Returns the current token, or `null` if not yet passed |
| `robotcheck.isReady()` | Returns `true` once the widget has initialized |
| `robotcheck.reset()` | Resets the widget to start the challenge again |

---

## Repository Structure

This is a monorepo containing:

- `packages/widget` — the client SDK and challenge UI (published to npm as `@mwahaj36/robotcheck`)
- `packages/server` — the Express verification server (published to Docker Hub as `mwahaj36/robotcheck`)
- `demo` — a Next.js demo app showing a full integration

---

## Running Locally (for contributors)

Install dependencies:

```bash
npm install
```

Start the verification server:

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
