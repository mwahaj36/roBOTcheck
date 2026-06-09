const { getSession, isTokenUsed, markTokenUsed } = require('../session')
const { verifyToken } = require('../tokens')
const { combinedScore } = require('../scoring/shared')

const SECRETKEY = process.env.SECRETKEY

function verifyRoute(req, res){
    let { secret, token } = req.body
    if(secret == null || token == null){
        return res.status(400).json({ success: false, error: 'missing secret or token' })
    }

    if(secret !== SECRETKEY){
        return res.status(401).json({ success: false, error: 'invalid secret key' })
    }

    let decoded = verifyToken(token)
    if(decoded == null || decoded.type !== 'result' || decoded.verdict !== 'human'){
        return res.status(400).json({ success: false, error: 'invalid or expired result token' })
    }

    if(isTokenUsed(token)){
        return res.status(400).json({ success: false, error: 'token already verified' })
    }
    markTokenUsed(token)

    let session = getSession(decoded.sessionId)
    let score = 20
    let roundsCompleted = 1
    if(session != null){
        score = Math.round(combinedScore(session.attempts))
        roundsCompleted = session.roundsCompleted
    }

    res.json({
        success: true,
        score: score,
        roundsCompleted: roundsCompleted,
        timestamp: Date.now()
    })
}

module.exports = { verifyRoute }
