const pageLoadTime=performance.now()//get loadtime for calc

//Definition of all signals
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

let lastSample=0;//when was last sample taken for mouse move

document.addEventListener('mousemove',function(e){//check for mouse movements
    let now=performance.now();
    if(signals.loadToFirstMove===null){
        signals.loadToFirstMove=now-pageLoadTime;//initial
    }
    if((now-lastSample)>16){//not all movement only those that specify a specifc threshhold
        signals.mousePath.push({x:e.clientX,y:e.clientY,t:now});
        lastSample=now;
    }
})

document.addEventListener('click',function(e){//check for clicks
    let now=performance.now();
    if (signals.loadToFirstClick==null){
        signals.loadToFirstClick=now-pageLoadTime;//first click initializs
    }
    signals.clickTimings.push(now)
})
document.addEventListener('touchstart',function(e){//for touch screen, if touch we dont care about mouse movements
    signals.touchEvents++;
})
document.addEventListener('visibilitychange',function(e){document.hidden ? signals.pageHidden = true : null;})//visiblity

module.exports={signals,pageLoadTime}