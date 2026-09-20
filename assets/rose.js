/* Each visible outer petal is the project control and the departing flight layer. */
(()=>{
 const art=document.querySelector('.rose-art');if(!art)return;
 const flower=art.querySelector('.rose-botanical'),targets=art.querySelector('.rose-targets');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const heart=flower.cloneNode();heart.className='rose-heart';heart.alt='';heart.setAttribute('aria-hidden','true');art.insertBefore(heart,targets);
 const inner=document.createElement('div');inner.className='rose-inner';inner.setAttribute('aria-hidden','true');art.insertBefore(inner,heart);
 for(let i=0;i<4;i++){const p=document.createElement('img');p.src='/assets/rose-petal.png';p.alt='';p.style.setProperty('--angle',(i*90+35)+'deg');inner.append(p);}
 const visited=new Set();let busy=false,gesture=null,slots=[],frame=0,visible=true,started=performance.now(),bloom=0;
 const hint=document.querySelector('#hint'),label=document.querySelector('#label');
 const showLabel=i=>{label.textContent=WORLDS[i].name;label.classList.add('on');};
 function fill(){
  const remaining=WORLDS.map((w,i)=>i).filter(i=>!visited.has(i));
  slots=remaining.slice(0,6).map((index,slot)=>({index,slot}));targets.replaceChildren();
  slots.forEach(({index,slot})=>{
   const b=document.createElement('button');b.type='button';b.className='rose-target rose-layer';b.dataset.world=index;
   b.style.setProperty('--angle',(slot*60-15)+'deg');b.style.setProperty('--lag',(slot*.055).toFixed(2));b.style.setProperty('--polarity',slot%2?'-1':'1');
   b.setAttribute('aria-label','Pick a petal — '+WORLDS[index].name);
   const img=document.createElement('img');img.src='/assets/rose-petal.png';img.alt='';b.append(img);
   b.addEventListener('pointerenter',()=>showLabel(index));b.addEventListener('pointerleave',()=>label.classList.remove('on'));
   b.addEventListener('focus',()=>showLabel(index));b.addEventListener('blur',()=>label.classList.remove('on'));
   b.addEventListener('pointerdown',e=>{if(busy||e.button>0)return;gesture={x:e.clientX,y:e.clientY,index,b};b.setPointerCapture(e.pointerId);b.classList.add('held');});
   b.addEventListener('pointermove',e=>{if(gesture?.b!==b)return;b.style.setProperty('--pull',Math.min(32,Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y))+'px');b.style.setProperty('--drag-x',Math.max(-20,Math.min(20,(e.clientX-gesture.x)*.25))+'px');});
   b.addEventListener('pointercancel',()=>{gesture=null;b.classList.remove('held');b.style.removeProperty('--pull');b.style.removeProperty('--drag-x');});
   b.addEventListener('pointerup',e=>{if(!gesture)return;const g=gesture;gesture=null;b.classList.remove('held');launch(index,e.clientX-g.x,e.clientY-g.y,b);});
   b.addEventListener('click',e=>{if(e.detail===0)launch(index,0,0,b);});targets.append(b);
  });
  art.querySelector('.rose-reset').hidden=visited.size===0;
 }
 async function launch(index,dx=0,dy=0,button){
  if(busy)return;busy=true;label.classList.remove('on');
  const b=button||targets.querySelector(`[data-world="${index}"]`);
  if(preference.matches){visited.add(index);b?.remove();art.querySelector('.rose-reset').hidden=false;if(!targets.children.length)fill();busy=false;delete document.body.dataset.plucking;open(index);return;}
  const rect=art.getBoundingClientRect(),size=rect.width*.44;
  const petal=document.createElement('img');petal.src='/assets/rose-petal.png';petal.alt='';petal.className='rose-flight';
  petal.style.width=size+'px';petal.style.left=(rect.left+rect.width*.56)+'px';petal.style.top=(rect.top+rect.height*.28)+'px';petal.style.transformOrigin='50% 92%';
  const pose=b?getComputedStyle(b).transform:'translate(-50%,-92%) rotate(-15deg)';
  if(b)b.style.visibility='hidden';document.body.append(petal);
  const angle=Math.hypot(dx,dy)>24?Math.atan2(dy,dx):-.8+(visited.size%3)*.45;
  const reach=Math.max(innerWidth,innerHeight)*1.5,spin=dx<0?-1:1;
  art.classList.add('plucking');hint.textContent='a world in every petal';
  try{await petal.animate([
   {transform:pose,opacity:1,offset:0},
   {transform:'translate(-50%,-108%) rotate(-8deg) scale(1.35)',opacity:1,offset:.42},
   {transform:`translate(${Math.cos(angle)*reach}px,${Math.sin(angle)*reach}px) rotate(${spin*205}deg) scale(.6)`,opacity:0,offset:1}
  ],{duration:1300,easing:'cubic-bezier(.3,0,.3,1)',fill:'forwards'}).finished;}finally{petal.remove();}
  visited.add(index);b?.remove();art.querySelector('.rose-reset').hidden=false;art.classList.remove('plucking');busy=false;delete document.body.dataset.plucking;
  if(!targets.children.length)fill();
  hint.textContent='pick another petal. discover another world.';open(index);
 }
 window.__pluckProject=index=>{if(busy)return;document.body.dataset.plucking='true';close(false);document.querySelector('.stage').scrollIntoView({behavior:'instant',block:'start'});launch(index);};
 art.querySelector('.rose-reset').addEventListener('click',()=>{visited.clear();started=performance.now();bloom=0;fill();hint.textContent='pick a petal. flick to explore.';});
 function tick(now){
  frame=0;if(!visible||document.hidden)return;
  const intro=Math.min(1,(now-started)/2600),scroll=Math.min(1,scrollY/(innerHeight*.7));
  const target=preference.matches?1:Math.min(1,intro*.78+scroll*.22);
  bloom=preference.matches?1:bloom+(target-bloom)*.045;
  art.style.setProperty('--bloom',bloom.toFixed(4));
  art.style.setProperty('--flutter',preference.matches?'0deg':(Math.sin(now/1800)*1.2).toFixed(3)+'deg');
  if(!preference.matches)frame=requestAnimationFrame(tick);
 }
 function resume(){if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(art);
 document.addEventListener('visibilitychange',resume);preference.addEventListener('change',resume);
 fill();resume();
})();
