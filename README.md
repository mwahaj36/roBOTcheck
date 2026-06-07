# roBOTcheck

roBOTcheck is a satirical reverse CAPTCHA system designed to allow humans through while filtering out bots. Instead of verifying that you are a human by doing automated-friendly checks, roBOTcheck evaluates timing, mouse behaviors, and typing cadences. Bots that behave too fast, too precisely, or too consistently are blocked, while humans with slow, inconsistent, and error-prone behaviors are passed.

## Repository Structure

The project is structured as a monorepo containing:
- packages/widget: The frontend client SDK and challenge interface.
- packages/server: The Express verification server that orchestrates challenges and validates telemetry data.
- demo: A sample newsletter signup form showing integration with roBOTcheck.

## Setup and Installation

Install dependencies from the root directory:

```bash
npm install
```

## Running the Servers

To test the project, you need to run both the verification backend and the developer integration demo site.

### 1. Start the Verification Server
Runs on http://localhost:3000 by default.

```bash
npm run dev --workspace=packages/server
```

### 2. Start the Demo Site
Runs on http://localhost:4000 by default.

```bash
node --watch demo/server.js
```

Open your browser and visit http://localhost:4000 to interact with the signup form and complete the verification challenges.

## Integration Guide

To protect a web page with roBOTcheck:

### 1. Client Integration

Add the mounting point and load the script:

```html
<form id="your-form">
    <!-- Mounting element -->
    <div class="robotcheck" data-sitekey="YOUR_PUBLIC_SITEKEY"></div>

    <!-- Hidden input to hold the pass token -->
    <input type="hidden" name="robotcheckToken" id="rc-token-input">

    <button type="submit">Submit</button>
</form>

<script>
    window.ROBOTCHECK_CONFIG = {
        apiUrl: 'http://localhost:3000'
    }
</script>
<script src="http://localhost:3000/dist/widget.js"></script>
<script>
    // Listen for pass tokens
    robotcheck.onPass((token) => {
        document.getElementById('rc-token-input').value = token;
    });
</script>
```

### 2. Server-to-Server Verification

When your form is submitted, send a POST request from your backend server to verify the token:

- Endpoint: POST http://localhost:3000/verify
- Content-Type: application/json
- Payload:
  ```json
  {
      "secret": "YOUR_SECRET_KEY",
      "token": "TOKEN_FROM_SUBMITTED_FORM"
  }
  ```

Response format:
```json
{
    "success": true,
    "score": 14,
    "roundsCompleted": 3
}
```
If success is false, the request should be rejected.
