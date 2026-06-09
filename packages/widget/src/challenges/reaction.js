function renderReaction(container,onComplete){
    let round=0;
    let reactionTimes=[];
    let isRed=false;
    let startTime=0;
    let timeoutID=null;

    container.innerHTML='';
    const instructions=document.createElement('h1');
    instructions.textContent="Click the box the moment it turns red";
    container.append(instructions);

    let box=document.createElement('div');
    box.className="reaction-box";
    container.append(box);
    box.addEventListener('click',function(){
                 if(isRed){
                let elapsed=performance.now()-startTime;
                reactionTimes.push(elapsed);
                round++
                if (round===3){
                    container.innerText='';
                    onComplete(reactionTimes);
                }
                else{
                    startRound()
                }
            }else{
                clearTimeout(timeoutID);
                box.innerText="Too early, restarting...";
                setTimeout(startRound,1000);
            }
            })
    const startRound=()=>{
        isRed=false;
        box.innerText="Wait...";
        box.classList.remove('red');
        let delay=1000+Math.random()*3000;

        timeoutID=setTimeout(function(){
            isRed=true;
            box.innerText="CLICK NOW !";
            box.classList.add('red');
            startTime=performance.now();
            
        },delay)
    }


startRound();

}

module.exports={renderReaction}