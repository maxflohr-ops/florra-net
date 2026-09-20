/* Botanical artwork with independent petal choreography and accessible project targets. */
(()=>{
 const art=document.querySelector('.rose-art');if(!art)return;
 const flower=art.querySelector('.rose-botanical'),targets=art.querySelector('.rose-targets');
 const petalPreload=new Image();petalPreload.src='/assets/rose-petal.png';
 const motion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const locations=[[62,19],[40,17],[74,29],[29,29],[61,40],[38,39]];
 const visited=new Set();let busy=false,gesture=null;
 const hint=document.querySelector('#hint'),label=document.querySelector('#label');
 const showLabel=i=>{label.textContent=WORLDS[i].name;label.classList.add('on');};
 function refresh(){
  const remaining=WORLDS.map((w,i)=>i).filter(i=>!visited.has(i));
  targets.replaceChildren();
  remaining.slice(0,6).forEach((index,slot)=>{
   const b=document.createElement('button');b.type='button';b.className='rose-target';
   b.style.left=locations[slot][0]+'%';b.style.top=locations[slot][1]+'%';b.dataset.world=index;
   b.setAttribute('aria-label','Pick a petal — '+WORLDS[index].name);
   b.addEventListener('pointerenter',()=>showLabel(index));
   b.addEventListener('pointerleave',()=>label.classList.remove('on'));
   b.addEventListener('focus',()=>showLabel(index));b.addEventListener('blur',()=>label.classList.remove('on'));
   b.addEventListener('pointerdown',e=>{if(busy||e.button>0)return;gesture={x:e.clientX,y:e.clientY,index};b.setPointerCapture(e.pointerId);});
   b.addEventListener('pointercancel',()=>gesture=null);
   b.addEventListener('pointerup',e=>{if(!gesture)return;const g=gesture;gesture=null;launch(index,e.clientX-g.x,e.clientY-g.y,slot);});
   b.addEventListener('click',e=>{if(e.detail===0)launch(index,0,0,slot);});targets.append(b);
  });
  art.querySelector('.rose-reset').hidden=visited.size===0;
 }
 async function launch(index,dx=0,dy=0,slot=0){
  if(busy)return;busy=true;label.classList.remove('on');
  if(motion){visited.add(index);refresh();busy=false;delete document.body.dataset.plucking;open(index);return;}
  const rect=art.getBoundingClientRect(),loc=locations[slot];
  const petal=document.createElement('img');petal.src='/assets/rose-petal.png';petal.alt='';petal.className='rose-flight';
  const size=Math.min(rect.width*.46,300);
  petal.style.width=size+'px';petal.style.left=(rect.left+rect.width*loc[0]/100-size/2)+'px';petal.style.top=(rect.top+rect.height*loc[1]/100-size/2)+'px';
  document.body.append(petal);
  const flick=Math.hypot(dx,dy)>24,angle=flick?Math.atan2(dy,dx):-.65+(visited.size%3)*.55;
  const reach=Math.max(innerWidth,innerHeight)*1.3,spin=dx<0?-1:1;
  flower.animate([{transform:'rotate(0deg)'},{transform:'rotate(-1.4deg)'},{transform:'rotate(.7deg)'},{transform:'rotate(0deg)'}],{duration:1100,easing:'ease-out'});
  hint.textContent='a world in every petal';
  try{await petal.animate([
   {transform:'translate3d(0,0,0) rotate(-12deg) scale(.45)',opacity:0,offset:0},
   {transform:'translate3d(0,-14px,0) rotate(-5deg) scale(.9)',opacity:1,offset:.18},
   {transform:'translate3d(12px,-40px,0) rotate(9deg) scale(1.55)',opacity:1,offset:.52},
   {transform:`translate3d(${Math.cos(angle)*reach}px,${Math.sin(angle)*reach}px,0) rotate(${spin*165}deg) scale(.65)`,opacity:0,offset:1}
  ],{duration:1250,easing:'cubic-bezier(.35,0,.35,1)',fill:'forwards'}).finished;}finally{petal.remove();}
  visited.add(index);refresh();busy=false;delete document.body.dataset.plucking;
  hint.textContent='pick another petal. discover another world.';open(index);
 }
 window.__pluckProject=index=>{if(busy)return;document.body.dataset.plucking='true';close(false);document.querySelector('.stage').scrollIntoView({behavior:'instant',block:'start'});launch(index);};
 art.querySelector('.rose-reset').addEventListener('click',()=>{visited.clear();refresh();hint.textContent='pick a petal. flick to explore.';});
 refresh();
})();
