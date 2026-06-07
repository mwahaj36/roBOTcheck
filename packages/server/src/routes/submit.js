const { getSession } = require('../session')
const { verifyToken, generateResultToken } = require('../tokens')
const { computeRobotScore } = require('../scoring/index')
const { scoreReaction } = require('../scoring/reaction')
const { scoreTyping } = require('../scoring/typing')
const { getVerdict } = require('../scoring/shared')

function scoreQuizAnswer(selected, correctIndices){
    let correct = selected.filter(f => correctIndices.includes(f)).length
    let incorrect = selected.filter(i => !correctIndices.includes(i)).length

    if(correct === correctIndices.length && incorrect === 0){
        return 5
    }
    return Math.max(0, incorrect * 3 - correct * 2)
}

function submitRoute(req, res){
    let { token, round, signals } = req.body
    if(token == null || round == null || signals == null){
        return res.status(400).json({ error: 'missing parameters' })
    }

    let decoded = verifyToken(token)
    if(decoded == null){
        return res.status(400).json({ error: 'invalid challenge token' })
    }

    let session = getSession(decoded.sessionId)
    if(session == null){
        return res.status(400).json({ error: 'session not found or expired' })
    }

    let score = 0
    if(round === 1){
        let baseScore = computeRobotScore(signals, signals.clickTargets || [])
        let quizScore = scoreQuizAnswer(signals.selected || [], signals.correct || [])
        score = Math.min(baseScore + quizScore, 100)
    }
    else if(round === 2){
        score = scoreReaction(signals.reactionTimes || [])
    }
    else if(round === 3){
        score = scoreTyping(signals)
    }
    else {
        return res.status(400).json({ error: 'invalid round index' })
    }

    session.attempts.push(score)
    session.roundsCompleted++

    let verdict = getVerdict(session)
    if(verdict === 'human'){
        let resultToken = generateResultToken(session.sessionId, session.sitekey, 'human')
        res.json({ verdict: 'human', resultToken })
    }
    else if(verdict === 'robot'){
        res.json({ verdict: 'robot' })
    }
    else {
        res.json({ verdict: 'uncertain', nextRound: session.roundsCompleted + 1 })
    }
}

module.exports = { submitRoute }
