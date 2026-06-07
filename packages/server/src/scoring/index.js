const {scoreMousePath}=require('./mouse')
const {scoreTimings}=require('./timings')

function computeRobotScore(signals,clickTargets){
    let scM=scoreMousePath(signals.mousePath,clickTargets);
    let scT=scoreTimings(signals)

    return Math.min(scM+scT,100)
}

module.exports={computeRobotScore}
