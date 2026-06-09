// Vercel serverless function endpoint mapping for the demo form verification
module.exports = async (req, res) => {
    // Vercel automatically parses req.body if request header is application/json
    let email = req.body.email
    let robotcheckToken = req.body.robotcheckToken

    if (robotcheckToken == null || robotcheckToken === '') {
        return res.status(400).json({ success: false, error: 'roBOTcheck token is missing. You must solve the challenges first!' })
    }

    try {
        // Forward verification check to verification server.
        // In local development: http://localhost:3000/verify
        // In production: Configure to point to your live verification server.
        const apiBaseUrl = process.env.ROBOTCHECK_API_URL || 'http://localhost:3000'
        const r = await fetch(`${apiBaseUrl}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: process.env.ROBOTCHECK_SECRET || 'rc_sec_x9y8z7w6v5u4',
                token: robotcheckToken
            })
        })
        const data = await r.json()

        if (data.success) {
            return res.json({
                success: true,
                email: email,
                score: data.score,
                roundsCompleted: data.roundsCompleted
            })
        } else {
            return res.json({
                success: false,
                error: data.error
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Could not connect to verification server: ' + err.message
        })
    }
}
