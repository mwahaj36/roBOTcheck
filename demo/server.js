const express = require('express')
const path = require('path')

const app = express()
const PORT = 4000

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/submit-form', (req, res) => {
    let email = req.body.email
    let robotcheckToken = req.body.robotcheckToken
    let confirmEmail = req.body.confirmEmail

    if(confirmEmail && confirmEmail.trim() !== ''){
        return res.status(400).json({ success: false, error: 'Bot detected via Honeypot field!' })
    }

    if(robotcheckToken == null || robotcheckToken === ''){
        return res.status(400).json({ success: false, error: 'roBOTcheck token is missing. You must solve the challenges first!' })
    }

    fetch('http://localhost:3000/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            secret: 'rc_sec_x9y8z7w6v5u4',
            token: robotcheckToken
        })
    })
    .then(r => r.json())
    .then(data => {
        if(data.success){
            res.json({
                success: true,
                email: email,
                score: data.score,
                roundsCompleted: data.roundsCompleted
            })
        } else {
            res.json({
                success: false,
                error: data.error
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            success: false,
            error: 'Could not connect to verification server: ' + err.message
        })
    })
})

app.listen(PORT, () => {
    console.log('Demo site running on http://localhost:' + PORT)
})
