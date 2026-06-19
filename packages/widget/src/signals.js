const pageLoadTime=performance.now()//get loadtime for calc

const getAutomationFlags = () => {
    if (typeof window === 'undefined') return {};
    
    // WebGL Renderer check (software rasterizers like SwiftShader are flags of headless browsers)
    let webglRenderer = 'unknown';
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            webglRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_ID) : 'unknown';
        } else {
            webglRenderer = 'no-webgl';
        }
    } catch (e) {
        webglRenderer = 'error';
    }

    // Detect if running inside a mobile WebView (Capacitor, Cordova, etc.)
    // WebViews share the same fingerprint as headless Chrome (no plugins, no window.chrome)
    // but they are legitimate app contexts, not bots.
    const ua = navigator.userAgent || '';
    const isWebView = !!(
        window.Capacitor ||                          // Capacitor global
        window.cordova ||                            // Cordova global
        /wv\b/.test(ua) ||                           // Android WebView marker
        (ua.includes('Mobile') && !ua.includes('Safari') && ua.includes('Chrome')) || // Android WebView (Chrome without Safari token)
        /\bCapacitor\b/i.test(ua)                    // Capacitor UA tag
    );

    return {
        webdriver: navigator.webdriver || false,
        pluginsLength: navigator.plugins ? navigator.plugins.length : 0,
        languages: navigator.languages ? navigator.languages.length : 0,
        headlessUserAgent: /HeadlessChrome|headless/i.test(navigator.userAgent),
        chromeObjectMissing: !window.chrome,
        webglRenderer: webglRenderer,
        isWebView: isWebView
    };
};

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
touchEvents:0,
 automationFlags: getAutomationFlags()
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