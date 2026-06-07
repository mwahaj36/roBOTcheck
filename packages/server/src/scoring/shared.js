function combinedScore(arr){
    let weightedTotal=0;
    let sumWeight=0;
    for(let i=0;i<arr.length;i++){
        weightedTotal=weightedTotal+((i+1)*arr[i]);
        sumWeight=sumWeight+(i+1);
    }
    return weightedTotal/sumWeight;
}

function getVerdict(session){
    let score=combinedScore(session.attempts);
    if(score<41){
        return "human";
    }
    else if(score>69){
        return "robot"
    }
    else if(session.roundsCompleted>=session.maxRounds){
        return "robot"
    }
    else{
        return "uncertain"
    }
}

module.exports = { combinedScore, getVerdict };
