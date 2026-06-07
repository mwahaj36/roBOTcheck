function avg(arr){
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

function stdev(arr){
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
    else if(sd<30){ 
        score+=10;
    }

    return Math.min(100,score);
}

module.exports = { scoreReaction }
