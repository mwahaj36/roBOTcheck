function dist(p1,p2){
    return Math.sqrt((Math.pow((p2.x-p1.x),2))+(Math.pow((p2.y-p1.y),2)))
}

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

function pearsonCorrelation(a,b){
    let aAvg=avg(a);
    let bAvg=avg(b);
    let numerator=0;let denomA=0;let denomB=0

    let shorter=a.length>b.length?b:a

    for(let i=0;i<shorter.length;i++){
        numerator+=(a[i]-aAvg)*(b[i]-bAvg);
        denomA+=Math.pow((a[i]-aAvg),2)
        denomB+=Math.pow((b[i]-bAvg),2)
    }
    return numerator/Math.sqrt(denomA*denomB)
}

function velocityProfile(points){
    let speedArray=[]
    for(let i=1;i<points.length;i++){
        let p1={
            x:points[i-1].x,
            y:points[i-1].y
        }

        let p2={
            x:points[i].x,
            y:points[i].y
        }
        let distance=dist(p1,p2); 
        let time=points[i].t-points[i-1].t;
        time=Math.max(time,1);
        let speed=distance/time;

        speedArray.push(speed)
    }
    return speedArray;
}

function scoreFittsLaw(points,clickTarget){  
    let speeds = velocityProfile(points);
    let midpoint = Math.floor(speeds.length / 2);
    let firstHalf = speeds.slice(0, midpoint);
    let secondHalf = speeds.slice(midpoint);
    let fAvg = avg(firstHalf);let sAvg = avg(secondHalf);
    if(sAvg<fAvg*0.7){
        return 0;
    }
    else{
        return 18;
    }
}

function approachDeceleration(points,clickTarget){
    let totalDist=dist(points[0],clickTarget);
    let threshold=totalDist*0.2;
    let approaching=points.filter(p=>dist(p,clickTarget)<threshold)
    if (approaching.length<3){
        return 0;
    }
    let speeds=velocityProfile(approaching);
    let decreasing=0;
    for (let i=1;i<speeds.length;i++){
        if(speeds[i]<speeds[i-1]){
            decreasing++;
        }
    }
    let ratio=decreasing/(speeds.length-1)
    if(ratio>0.6){
        return 0;
    }
    else{
        return 15;
    }
}

function microCorrections(points){
    let reversals=[];
    for(let i=2;i<points.length;i++){   
        let xDiff1=points[i-1].x-points[i-2].x;
        let yDiff1=points[i-1].y-points[i-2].y;
        let prevAngle= Math.atan2(yDiff1,xDiff1)
        
        let xDiff2=points[i].x-points[i-1].x;
        let yDiff2=points[i].y-points[i-1].y;
        let currAngle= Math.atan2(yDiff2,xDiff2)

        let delta=(Math.abs(prevAngle-currAngle))*180/Math.PI; 

        delta>10 && delta<170 ? reversals.push(delta):null; 
    }
    if (reversals.length<2){ 
        return 20;
    }
    let angleStdev=stdev(reversals);
    if (angleStdev<8){
        return 15;
    }
    else{
        return 0;
    }
}

function autocorrelationScore(points,lag=4){
    let dx=points.slice(1).map((p,i)=>p.x-points[i].x)
    let r = pearsonCorrelation(dx.slice(0,-lag),dx.slice(lag))
    if(r<0.15){
        return 20;
    }
    else if(r>0.85){
        return 10;
    }
    else{
        return 0;
    }
}

function overshootDetection(points,clickTarget,clickIndex){
    let preClick=points.slice(Math.max(0,clickIndex-8),clickIndex);
    for(const p of preClick){
        let d=dist(p,clickTarget);
        if(d<5){
            return 0;
        }
    }
    return 8;
}

function scoreMousePath(points, clickTargets){
    if(points.length<5){
        return 40;
    }
    let score=0;
    score+=scoreFittsLaw(points,clickTargets[0]);
    score += approachDeceleration(points, clickTargets[clickTargets.length - 1]);
    score += autocorrelationScore(points);
    score += microCorrections(points);
    clickTargets.forEach(t => { score += overshootDetection(points, t, t.mouseIndex); });
    return Math.min(score, 50);
}

module.exports = { scoreMousePath };
