const pageLoadTime=performance.now()

const signals={
 mousePath:[],
 clickTimings:[],
 loadToFirstMove:null,
 loadToFirstClick:null,
 tileSelectOrder:[],
 hoverDwellTimes:[],
 checkboxDelay:null,
 totalTime:null,
pageHidden:false,
devicePixelRatio:window.devicePixelRatio,
touchEvents:0
}
let lastSample=0;
document.addEventListener('mousemove',function(e){
    let now=performance.now();
    if(signals.loadToFirstMove===null){
        signals.loadToFirstMove=now-pageLoadTime;
    }
    if((now-lastSample)>16){
        signals.mousePath.push({x:e.clientX,y:e.clientY,t:now});
        lastSample=now;
    }
})
document.addEventListener('click',function(e){
    let now=performance.now();
    if (signals.loadToFirstClick==null){
        signals.loadToFirstClick=now-pageLoadTime;
    }
    signals.clickTimings.push(now)
})
document.addEventListener('touchstart',function(e){
    signals.touchEvents++;
})
document.addEventListener('visibilitychange',function(e){document.hidden ? signals.pageHidden = true : null;})

module.exports={signals,pageLoadTime}