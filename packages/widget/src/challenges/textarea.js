const {signals,pageLoadTime}=require('../signals')

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

function scoreTyping(signals){
    let score=0;
    if(signals.keystrokeTimings.length===0){return 100;}

    if(signals.pasteDetected){score+=40;}
    if(signals.typingDelay<200){score+=20;}
    if(signals.keystrokeTimings.length>3){
        let intervals=[]
        for(let i=1;i<signals.keystrokeTimings.length;i++){
            intervals.push(signals.keystrokeTimings[i]-signals.keystrokeTimings[i-1])
        }
        let consistency=stdev(intervals);
        if(consistency<15){
            score+=30;
        }
        if(avg(intervals)<30){
            score+=20
        }
    }

    return Math.min(score,100)
}

function renderTextArea(container,onComplete){
    container.innerHTML='';
    const instructions=document.createElement('h1');
    instructions.textContent="Briefly describe what you had for your last meal";
    container.append(instructions);

    let textArea=document.createElement('textarea');
    container.append(textArea);
    textArea.addEventListener('keydown',(e)=>{
        let now=performance.now()
        if (signals.typingDelay==null){
            signals.typingDelay=now-pageLoadTime;
        }
        signals.keystrokeTimings.push(now)
    })
    textArea.addEventListener('paste',(e)=>{
        signals.pasteDetected=true;
    })
    let submitBtn=document.createElement('button');
    submitBtn.innerText="Submit";

    submitBtn.addEventListener('click',(e)=>{
        if(textArea.value==""){
            window.alert("Enter Text First ");
            return
        }
        onComplete()
    })
    container.append(submitBtn)



}
module.exports={scoreTyping,renderTextArea}