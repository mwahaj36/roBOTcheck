const sessions = new Map()
const usedTokens = new Map()

// Cleanup interval: runs every 5 minutes
setInterval(() => {
    const now = Date.now()
    
    // Cleanup old sessions (older than 10 minutes)
    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.createdAt > 10 * 60 * 1000) {
            sessions.delete(sessionId)
        }
    }
    
    // Cleanup expired tokens
    for (const [tokenId, expiresAt] of usedTokens.entries()) {
        if (now > expiresAt) {
            usedTokens.delete(tokenId)
        }
    }
}, 5 * 60 * 1000)

function createSession(sessionId, sitekey){
    let session = {
        sessionId: sessionId,
        sitekey: sitekey,
        roundsCompleted: 0,
        attempts: [],
        maxRounds: 3,
        createdAt: Date.now()
    }
    sessions.set(sessionId, session)
    return session
}

function getSession(sessionId){
    return sessions.get(sessionId)
}

function updateSession(sessionId, updates){
    let session = sessions.get(sessionId)
    if(session != null){
        Object.assign(session, updates)
    }
    return session
}

function deleteSession(sessionId){
    sessions.delete(sessionId)
}

function isTokenUsed(tokenId){
    return usedTokens.has(tokenId)
}

function markTokenUsed(tokenId){
    // Token valid for 10 mins matching the result token expiration
    usedTokens.set(tokenId, Date.now() + 10 * 60 * 1000)
}

module.exports = {
    createSession,
    getSession,
    updateSession,
    deleteSession,
    isTokenUsed,
    markTokenUsed
}
