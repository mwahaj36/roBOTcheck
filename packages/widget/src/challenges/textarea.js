const {signals,pageLoadTime}=require('../signals')

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
module.exports={renderTextArea}