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

function scoreTimings(signals){
    let score=0;

    if (signals.totalTime<800){score+=15;}
    if(signals.loadToFirstMove<100){score+=10;}
    if(signals.loadToFirstClick<200){score+=10;}

    let intervals=[]
    for(let i=1;i<signals.clickTimings.length;i++){
        intervals.push(signals.clickTimings[i] - signals.clickTimings[i - 1]);
    }
    if (intervals.length>1){
        let sd=stdev(intervals)
        if(sd<30){score+=15}
    }
    if(signals.checkboxDelay<50){
        score+=10;
    }
    let hovered=signals.hoverDwellTimes.filter(t=>t>80).length;
    if (hovered===0){score+=10;}

    return Math.min(score,50);
}

module.exports={scoreTimings};