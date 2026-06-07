function avg(arr){//average
    if (arr.length === 0) {
    return 0;
    }
    else{
        let sum=0
        for(let i=0;i<arr.length;i++){
            sum+=arr[i];
        }
        return sum/arr.length
    }
}

function stdev(arr){//standard deviation
    let mean=avg(arr);
    let squaredDiffs=[];
    for(let i=0;i<arr.length;i++){
        squaredDiffs.push(Math.pow(arr[i] - mean, 2))
    }
    return Math.sqrt(avg(squaredDiffs));
}

function scoreReaction(reactionTimes){
    let mean=avg(reactionTimes);
    let sd=stdev(reactionTimes);

    let score=0;
    if (mean<80){
        score+=35;
    }
    else if(mean<135){
        score+=20;
    }
    else if (mean>800){
        score+=15;
    }
    if(sd<15){
        score+=25;
    }
    else if(sd<30){ score+=10;}

    return Math.min(100,score);
}

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

module.exports={scoreReaction,renderReaction}