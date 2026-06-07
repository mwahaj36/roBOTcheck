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
    frame.style.width='320px'
    frame.style.height='150px'
    frame.style.overflow='hidden'
    robot.appendChild(frame)

    window.addEventListener('message',(e)=>{
        let expected=new URL(API_URL).origin
        if(e.origin!=expected){
            return
        }
        if(e.data.type==='robotcheck:pass'){
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
    const container=document.body
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
                desc.textContent = "Your delightfully slow, inconsistent, and error-prone behaviour has been verified. You may proceed.";
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
                if (round === 1) {
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
                desc.textContent = 'Escalating to next challenge round. Please wait...';
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

