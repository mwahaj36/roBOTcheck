const { signals, pageLoadTime } = require("./signals");
const{renderTiles} =require("./challenges/tiles")
const{renderReaction} =require("./challenges/reaction")
const{renderTextArea} =require("./challenges/textarea")

function initHost(){
    let currentVerificationToken=null;
    let callbacks=[];
    let robot=document.querySelector('.robotcheck')
    if(robot==null){
        return;
    }
    const sitekey=robot.dataset.sitekey;
    const API_URL=window.ROBOTCHECK_CONFIG?.apiUrl;
    if(!sitekey || !API_URL){
        console.warn("CANT PROCESS Without API URL AND SITEKEY")
        return
    }

    let frame=document.createElement('iframe')
    frame.src=`${API_URL}/widget?sitekey=${sitekey}&origin=${encodeURIComponent(window.location.origin)}`
    frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms')
    frame.style.border='none'
    frame.style.width='100%'
    frame.style.maxWidth='380px'
    frame.style.height='280px'
    frame.style.overflow='hidden'

    let hp = document.createElement('input')
    hp.type = 'text'
    hp.name = 'confirmEmail'
    hp.setAttribute('autocomplete', 'off')
    hp.tabIndex = -1
    hp.style.position = 'absolute'
    hp.style.left = '-9999px'
    hp.style.opacity = '0'
    hp.style.width = '0'
    hp.style.height = '0'
    hp.style.border = 'none'

    robot.appendChild(hp)
    robot.appendChild(frame)

    window.addEventListener('message',(e)=>{
        let expected=new URL(API_URL).origin
        if(e.origin!=expected){
            return
        }
        if(e.data.type==='robotcheck:pass'){
            if(hp && hp.value !== ''){
                console.warn("Secondary trap filled. Pass token blocked.")
                return
            }
            currentVerificationToken=e.data.token;
            callbacks.forEach(i => {
                i(currentVerificationToken)
                
            });
        }
    })

    window.robotcheck={
        getToken(){
            return currentVerificationToken
        },
        onPass(cb){
            callbacks.push(cb)
            if(currentVerificationToken!=null){
                cb(currentVerificationToken);
            }
        },
        isReady(){
            return true
        },
        reset(){
            currentVerificationToken=null;
            if(frame.contentWindow){
                frame.contentWindow.postMessage({
                    type:'robotcheck:reset'
                },new URL(API_URL).origin)
            }
        }
    }


    
}
function initSandbox(){
    let params=new URLSearchParams(window.location.search)
    let sitekey= params.get('sitekey')
    let origin= params.get('origin')

    let challengeToken=null;
    
    document.body.innerHTML = ''
    const container = document.createElement('div')
    container.style.height = '240px'
    document.body.appendChild(container)

    let branding = document.createElement('div')
    branding.style.marginTop = '4px'
    branding.style.fontSize = '10px'
    
    let link = document.createElement('a')
    link.href = 'https://ro-bot-check.vercel.app/'
    link.target = '_blank'
    link.innerText = 'protected by roBOTcheck'
    link.style.color = '#8b949e'
    link.style.textDecoration = 'none'
    
    branding.appendChild(link)
    document.body.appendChild(branding)

    startChallenge()
    function runRound(round){
        switch(round){
            case 1:
                renderTiles(container, (selected, correct, clickTargets) => {
                    signals.selected = selected;
                    signals.correct = correct;
                    signals.clickTargets = clickTargets;
                    submitRound(1, signals);
                });
                break;
            case 2:
                renderReaction(container, (reactionTimes) => {
                    signals.reactionTimes = reactionTimes;
                    submitRound(2, signals);
                });
                break;
            case 3:
                renderTextArea(container, () => {
                    submitRound(3, signals);
                });
                break;
        }
    }
    function submitRound(round, roundSignals){
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: challengeToken,
                round: round,
                signals: roundSignals
            })
        })
        .then(res => res.json())
        .then(res => {
            if(res.verdict === 'human'){
                container.innerHTML = '';
                const title = document.createElement('h1');
                title.textContent = 'Welcome, Human.';
                const desc = document.createElement('p');
                desc.textContent = "Your slow, inconsistent, and error-prone behaviour has been verified. You may proceed.";
                container.appendChild(title);
                container.appendChild(desc);

                window.parent.postMessage({
                    type: 'robotcheck:pass',
                    token: res.resultToken
                }, origin);
            }
            else if(res.verdict === 'robot'){
                container.innerHTML = '';
                const title = document.createElement('h1');
                title.textContent = 'Access Denied.';
                const desc = document.createElement('p');
                if (res.reason) {
                    desc.textContent = res.reason;
                } else if (round === 1) {
                    desc.textContent = 'Suspicious signals detected: Click patterns, speeds, or paths are not chaotic enough.';
                } else if (round === 2) {
                    desc.textContent = 'Reaction data collected: Physically impossible reaction speeds or robotic variance.';
                } else {
                    desc.textContent = 'Typing analysis: Cadence is too consistent and typing speeds are superhuman.';
                }
                container.appendChild(title);
                container.appendChild(desc);
            }
            else if(res.verdict === 'uncertain'){
                challengeToken = res.token || res.challengeToken || challengeToken;
                container.innerHTML = '';
                const title = document.createElement('h1');
                title.textContent = 'Uncertain Heuristics...';
                const desc = document.createElement('p');
                desc.textContent = 'please try again';
                container.appendChild(title);
                container.appendChild(desc);

                setTimeout(() => {
                    runRound(res.nextRound);
                }, 2000);
            }
        })
        .catch(err => console.error(err));
    }


    function startChallenge(){
        fetch('/challenge?sitekey=' + sitekey).then(res=>res.json()).then(data=>{
            challengeToken=data.challengeToken
            runRound(1)
        }).catch(err=>console.error(err))

    }

}

if(window===window.parent){
    initHost()
}
else{
    initSandbox()
}

