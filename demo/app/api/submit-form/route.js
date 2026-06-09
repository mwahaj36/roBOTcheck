import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, robotcheckToken, confirmEmail } = body

    // 1. Secondary email check: reject if bait field is filled
    if (confirmEmail && confirmEmail.trim() !== '') {
      return NextResponse.json(
        { success: false, error: 'Bot detected via secondary field!' },
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

    // 3. Forward to verification backend
    console.log('Attempting to fetch verify from:', process.env.ROBOTCHECK_API_URL);
    
    const r = await fetch(`${process.env.ROBOTCHECK_API_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.ROBOTCHECK_SECRET,
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
    console.error('VERIFY FETCH ERROR:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: `Fetch failed! URL was: "${process.env.ROBOTCHECK_API_URL}". Error message: ${err.message}` 
      },
      { status: 500 }
    )
  }
}
