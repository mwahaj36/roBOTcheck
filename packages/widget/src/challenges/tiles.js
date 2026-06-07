const { signals, pageLoadTime } = require('../signals');

const humanOpt=["need coffee","oversleeps","stares into fridge","eats food","misses deadlines","loses keys"]
const robotOpt=["perfect memory","pushes api keys","never tired","instant maths","never distracted"]

function scoreQuizAnswer(selected,correctIndices){
    let correct=selected.filter(f=>correctIndices.includes(f)).length;
    let incorrect=selected.filter(i => !correctIndices.includes(i)).length;

    if(correct===correctIndices.length && incorrect===0){
        return 5;
    }
    return Math.max(0,incorrect*3-correct*2)
}
function renderTiles(container,onComplete){

    let human=humanOpt.sort(()=>Math.random()-0.5).slice(0,5)
    let robot=robotOpt.sort(()=>Math.random()-0.5).slice(0,4)
    let combined=human.concat(robot)
    combined.sort(()=>Math.random()-0.5)
    let correct=[]
    for(let i=0;i<combined.length;i++){
        if (human.includes(combined[i])){correct.push(i);}
    }
    
    container.innerHTML='';
    let title = document.createElement('h1')
    title.innerText = 'Select human behaviors:'
    container.appendChild(title)

    let tileContainer = document.createElement('div')
    tileContainer.className = 'tile-container'
    container.appendChild(tileContainer)
    let selected=[];
    let clickTargets=[];
    let lastClickTime = pageLoadTime;
    combined.forEach((word,index)=>{
        let tile=document.createElement('div');
        tile.className='tile';
        tile.innerText=word;

        let hoverStart=0;
        tile.addEventListener('mouseenter',(e)=>{hoverStart=performance.now()})
        tile.addEventListener('mouseleave',(e)=>{
            if(hoverStart>0){
                signals.hoverDwellTimes.push(performance.now()-hoverStart);
            }
        })
        tile.addEventListener('click',(e)=>{
            lastClickTime = performance.now();
            tile.classList.toggle('selected')
            let rect=tile.getBoundingClientRect();
            let centerX=rect.left+rect.width /2;
            let centerY=rect.top+rect.height /2;
            clickTargets.push({ x: centerX, y: centerY, mouseIndex: signals.mousePath.length });
       
 
            let selectedIndex = selected.indexOf(index);
        if(selectedIndex >-1){
            selected.splice(selectedIndex, 1);
        }
        else{
            selected.push(index);
            signals.tileSelectOrder.push(index);
        }
        })
        

        tileContainer.appendChild(tile);
    })
    let verifyBtn=document.createElement('button')
    verifyBtn.innerText='Verify';
    verifyBtn.className='verify-btn';
    verifyBtn.addEventListener('click', function(e) { 
        signals.totalTime = performance.now() - pageLoadTime;
        signals.checkboxDelay = performance.now() - lastClickTime;
        onComplete(selected, correct, clickTargets);

    });
container.appendChild(verifyBtn);
}

module.exports = { scoreQuizAnswer, renderTiles };