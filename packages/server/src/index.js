const express = require('express')
const path = require('path')

const { renderWidgetHtml } = require('./routes/widget')
const { challengeRoute } = require('./routes/challenge')
const { submitRoute } = require('./routes/submit')
const { verifyRoute } = require('./routes/verify')

const app = express()
const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV === 'production') {
    const required = ['SECRET', 'SECRETKEY', 'SITEKEY']
    const missing = required.filter(name => !process.env[name])
    if (missing.length > 0) {
        console.error(`FATAL: Missing required production environment variables: ${missing.join(', ')}`)
        process.exit(1)
    }
}

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use(express.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use('/dist', express.static(path.join(__dirname, '../../widget/dist')))

app.get('/widget', renderWidgetHtml)
app.get('/challenge', challengeRoute)
app.post('/submit', submitRoute)
app.post('/verify', verifyRoute)
app.get('/health', (req, res) => res.send('OK'))

app.listen(PORT, () => {
    console.log('roBOTcheck Verification Server running on port ' + PORT)
})
