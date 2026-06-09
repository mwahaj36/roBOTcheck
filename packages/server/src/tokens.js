const jwt = require('jsonwebtoken')

const SECRET = process.env.SECRET

function generateChallengeToken(sessionId, sitekey){
    return jwt.sign(
        { sessionId, sitekey, type: 'challenge' },
        SECRET,
        { expiresIn: '5m' }
    )
}

function generateResultToken(sessionId, sitekey, verdict){
    return jwt.sign(
        { sessionId, sitekey, verdict, type: 'result' },
        SECRET,
        { expiresIn: '10m' }
    )
}

function verifyToken(token){
    try {
        return jwt.verify(token, SECRET)
    } catch(err) {
        return null
    }
}

module.exports = {
    generateChallengeToken,
    generateResultToken,
    verifyToken
}
