const crypto = require('crypto')
const { createSession } = require('../session')
const { generateChallengeToken } = require('../tokens')

function challengeRoute(req, res){
    let sitekey = req.query.sitekey
    if(sitekey == null || sitekey === ''){
        return res.status(400).json({ error: 'sitekey required' })
    }

    let sessionId = crypto.randomUUID()
    createSession(sessionId, sitekey)

    let token = generateChallengeToken(sessionId, sitekey)
    res.json({ challengeToken: token })
}

module.exports = { challengeRoute }
