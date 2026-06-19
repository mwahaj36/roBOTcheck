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

    console.log('[SERVER SUBMIT] Received signals.automationFlags:', signals?.automationFlags);

    // Anti-spoofing environment checks to instantly reject automated browsers
    if (signals && signals.automationFlags) {
        const { webdriver, pluginsLength, headlessUserAgent, chromeObjectMissing, webglRenderer, isWebView } = signals.automationFlags;
        const ua = req.headers['user-agent'] || '';

        const isWebdriver = webdriver === true;
        const isHeadlessUA = headlessUserAgent === true || /HeadlessChrome|headless/i.test(ua);

        // Validate WebView claim server-side.
        // Android WebViews often include BOTH "Chrome" and "Safari" in the UA (inherited from Blink),
        // so we can't rely on Chrome-without-Safari. Instead we check:
        //   1. Explicit WebView markers: "wv" token, "Capacitor" tag
        //   2. Mobile UA pattern: if the UA says Mobile/Android/iPhone AND the client reports
        //      isWebView + has touch events, it's a real mobile app, not a headless desktop bot.
        const isMobileUA = /Mobile|Android|iPhone|iPad/i.test(ua);
        const hasTouchEvents = (signals.touchEvents || 0) > 0;

        const serverConfirmsWebView = isWebView === true && (
            /wv\b/.test(ua) ||                                          // Android WebView marker  
            /\bCapacitor\b/i.test(ua) ||                                // Capacitor UA tag
            isMobileUA                                                  // Any mobile UA with client WebView flag
        );

        console.log('[WEBVIEW DEBUG]', {
            isWebView,
            serverConfirmsWebView,
            isMobileUA,
            hasTouchEvents,
            pluginsLength,
            chromeObjectMissing,
            ua: ua.substring(0, 200)
        });

        // Only flag "suspicious Chrome" if this is NOT a verified WebView context.
        // Capacitor/Cordova WebViews legitimately have 0 plugins and no window.chrome object.
        const isSuspiciousChrome = !serverConfirmsWebView && pluginsLength === 0 && chromeObjectMissing && /Chrome/i.test(ua);
        
        // Don't flag software WebGL on mobile devices — some low-end phones use software renderers
        const isSoftwareWebgl = !serverConfirmsWebView && typeof webglRenderer === 'string' && /SwiftShader|Mesa|software/i.test(webglRenderer);

        if (isWebdriver || isHeadlessUA || isSuspiciousChrome || isSoftwareWebgl) {
            let reason = 'Suspicious environment telemetry detected.';
            if (isWebdriver) reason = 'Automation signature detected (navigator.webdriver).';
            else if (isHeadlessUA) reason = 'Headless browser environment detected.';
            else if (isSuspiciousChrome) reason = 'Suspicious headless browser profile detected (0 plugins).';
            else if (isSoftwareWebgl) reason = `Software WebGL rasterizer detected (${webglRenderer}).`;

            console.log(`[BOT DETECTION] Anti-spoofing check triggered:`, {
                webdriver: isWebdriver,
                headlessUA: isHeadlessUA,
                suspiciousChrome: isSuspiciousChrome,
                softwareWebgl: isSoftwareWebgl,
                webglRenderer,
                isWebView,
                serverConfirmsWebView
            });
            return res.json({ verdict: 'robot', reason });
        }
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
