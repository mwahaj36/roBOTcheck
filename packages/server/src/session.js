const sessions = new Map()
const usedTokens = new Set()

function createSession(sessionId, sitekey){
    let session = {
        sessionId: sessionId,
        sitekey: sitekey,
        roundsCompleted: 0,
        attempts: [],
        maxRounds: parseInt(process.env.MAX_ROUNDS) || 3
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
    usedTokens.add(tokenId)
}

module.exports = {
    createSession,
    getSession,
    updateSession,
    deleteSession,
    isTokenUsed,
    markTokenUsed
}
