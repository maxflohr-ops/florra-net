/* Opt-in music. No media URL is assigned until the visitor presses sound. */
(()=>{
 const button=document.getElementById('snd');if(!button)return;
 const track='/assets/audio/biting-bullets.m4a',volume=.35;
 const audio=new Audio();audio.id='florra-soundtrack';audio.hidden=true;audio.preload='none';audio.autoplay=false;audio.loop=false;audio.volume=0;button.insertAdjacentElement('afterend',audio);
 const credit=document.createElement('p');credit.className='soundtrack-credit';credit.textContent='ridgeclub — biting bullets';credit.hidden=true;
 const status=document.createElement('span');status.id='soundtrack-status';status.className='soundtrack-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
 button.insertAdjacentElement('afterend',status);button.insertAdjacentElement('afterend',credit);button.setAttribute('aria-describedby',status.id);
 const panel=document.getElementById('panel');
 if(panel){
  const anchor=document.createComment('soundtrack controls');button.before(anchor);
  const placeControls=()=>{
   const focused=document.activeElement===button;
   if(panel.classList.contains('open')){if(button.parentNode!==panel)panel.append(button,credit,status);}
   else if(button.parentNode===panel)anchor.after(button,credit,status);
   if(focused)button.focus({preventScroll:true});
  };
  new MutationObserver(placeControls).observe(panel,{attributes:true,attributeFilter:['class']});placeControls();
 }
 let enabled=false,audible=false,pending=false,loaded=false,suspended=false,epoch=0,frame=0;
 const visible=()=>!document.hidden&&!suspended;
 function render(){
  button.textContent=enabled?(pending?'sound · loading':audible&&visible()?'sound · on':'sound · paused'):'sound · off';
  button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-busy',String(pending));
  button.setAttribute('aria-label',enabled?'Turn sound off':'Play Biting Bullets by Ridgeclub');
  credit.hidden=!(enabled&&audible&&visible());
 }
 function stopFade(){if(frame)cancelAnimationFrame(frame);frame=0;}
 function fadeTo(target,duration,done){
  stopFade();const token=epoch,from=audio.volume,start=performance.now();
  const step=now=>{
   frame=0;if(token!==epoch)return;
   const p=Math.min(1,Math.max(0,(now-start)/duration)),ease=p*p*(3-2*p);
   audio.volume=Math.max(0,Math.min(volume,from+(target-from)*ease));
   if(p<1)frame=requestAnimationFrame(step);else done?.();
  };frame=requestAnimationFrame(step);
 }
 function fail(error,token=epoch){
  if(token!==epoch||!enabled)return;
  enabled=false;pending=false;audible=false;epoch++;stopFade();audio.loop=false;audio.volume=0;audio.pause();render();
  status.textContent=error?.name==='NotAllowedError'?'Playback was blocked. Tap sound to try again.':'Biting Bullets could not play. Tap sound to try again.';
 }
 function start(){
  if(!enabled||!visible())return;
  const token=++epoch;stopFade();pending=true;audible=false;audio.loop=true;render();status.textContent='Loading Biting Bullets by Ridgeclub.';
  try{
   if(!loaded||audio.error){audio.src=track;loaded=true;}
   Promise.resolve(audio.play()).then(()=>{
    if(token!==epoch||!enabled||!visible()){
     if(!enabled||!visible()){audio.volume=0;audio.pause();}
     return;
    }
    pending=false;audible=true;render();status.textContent='Playing Biting Bullets by Ridgeclub.';fadeTo(volume,650);
   },error=>fail(error,token));
  }catch(error){fail(error,token);}
 }
 function turnOff(){
  const wasPending=pending;enabled=false;pending=false;audible=false;epoch++;audio.loop=false;render();status.textContent='Sound off.';
  if(wasPending||audio.paused||!visible()){stopFade();audio.volume=0;audio.pause();}
  else fadeTo(0,350,()=>audio.pause());
 }
 function suspend(){
  epoch++;stopFade();pending=false;audible=false;audio.volume=0;audio.pause();render();
 }
 button.addEventListener('click',()=>{if(enabled)turnOff();else{enabled=true;start();}});
 document.addEventListener('visibilitychange',()=>{if(!visible())suspend();else if(enabled)start();});
 addEventListener('pagehide',()=>{suspended=true;suspend();});
 addEventListener('pageshow',event=>{suspended=false;if(event.persisted&&enabled&&visible())start();});
 audio.addEventListener('error',()=>{if(audio.error)fail(audio.error);});
 audio.addEventListener('pause',()=>{
  if(audio.paused&&enabled&&audible&&!pending&&visible()){
   enabled=false;audible=false;epoch++;stopFade();audio.loop=false;audio.volume=0;render();status.textContent='Music paused. Tap sound to resume.';
  }
 });
 render();
})();
