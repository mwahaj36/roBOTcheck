import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, robotcheckToken, confirmEmail } = body

    // 1. Honeypot check: reject if bait field is filled
    if (confirmEmail && confirmEmail.trim() !== '') {
      return NextResponse.json(
        { success: false, error: 'Bot detected via Honeypot field!' },
        { status: 400 }
      )
    }

    // 2. Token presence check
    if (!robotcheckToken) {
      return NextResponse.json(
        { success: false, error: 'roBOTcheck token is missing. You must solve the challenges first!' },
        { status: 400 }
      )
    }

    // 3. Forward to local verification backend
    const r = await fetch('http://localhost:3000/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: 'rc_sec_x9y8z7w6v5u4',
        token: robotcheckToken
      })
    })
    const data = await r.json()

    if (data.success) {
      return NextResponse.json({
        success: true,
        email: email,
        score: data.score,
        roundsCompleted: data.roundsCompleted
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.error
      })
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Could not connect to verification server: ' + err.message },
      { status: 500 }
    )
  }
}
