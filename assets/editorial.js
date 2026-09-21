const nav=document.querySelector('body>nav');
const setNav=()=>nav?.classList.toggle('scrolled',scrollY>50);
addEventListener('scroll',setNav,{passive:true});setNav();
const filters=[...document.querySelectorAll('[data-filter]')];
filters.forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.filter;
 filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('#worldList>a').forEach(row=>row.hidden=category!=='all'&&row.dataset.category!==category);
 const count=document.querySelectorAll('#worldList>a:not([hidden])').length;
 document.querySelector('#filter-status').textContent=`${count} projects in view`;
}));
const dialog=document.querySelector('#panel');
if(dialog){
 const surface=[...document.body.children].filter(el=>el!==dialog&&!['SCRIPT','STYLE'].includes(el.tagName)&&!el.matches('#snd,.soundtrack-credit,.soundtrack-status'));
 const observer=new MutationObserver(()=>{
  const opened=dialog.classList.contains('open');
  surface.forEach(el=>el.inert=opened);
  if(!opened&&document.activeElement&&dialog.contains(document.activeElement)) (document.querySelector('.bloom-heart-button:not(:disabled)')||document.querySelector('a[href="#worlds"]'))?.focus({preventScroll:true});
 });
 observer.observe(dialog,{attributes:true,attributeFilter:['class']});
 if(dialog.classList.contains('open')) surface.forEach(el=>el.inert=true);
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
}

/* A visitor's garden follows real project visits, independently of the renderer. */
(()=>{
 const storageKey='florra:garden:discovered';
 const stage=document.querySelector('.stage');
 let worlds=[...document.querySelectorAll('#worldList>a[data-world-id]')].map(link=>({id:link.dataset.worldId,name:link.querySelector('.nm').textContent.trim()}));
 if(!worlds.length&&document.body.dataset.worldId){
  worlds=[...document.querySelectorAll('footer nav[aria-label="florra worlds"] a')].map(link=>({id:new URL(link.href).pathname.slice(1),name:link.textContent.trim()}));
  const index=Number(document.body.dataset.worldIndex);
  worlds.splice(Number.isInteger(index)?index:worlds.length,0,{id:document.body.dataset.worldId,name:document.querySelector('h1').textContent.trim()});
 }
 if(!worlds.length)return;
 const known=new Set(worlds.map(world=>world.id));
 let discovered=new Set();
 try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||'[]');if(Array.isArray(saved)){discovered=new Set(saved.map(id=>id==='capsule-01'?'bandersnatch':id).filter(id=>known.has(id)));sessionStorage.setItem(storageKey,JSON.stringify([...discovered]));}}catch{}
 const ids=()=>worlds.filter(world=>discovered.has(world.id)).map(world=>world.id);
 const progress=document.createElement('span');progress.className='garden-progress';progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');progress.setAttribute('aria-atomic','true');
 const progressPoem=document.createElement('span');progressPoem.setAttribute('aria-hidden','true');
 const progressCount=document.createElement('span');progressCount.className='editorial-sr-only';
 progress.append(progressPoem,progressCount);
 const encounter=()=>discovered.size===worlds.length?'the whole garden, explored':discovered.size===1?'a first encounter':discovered.size===0?'a garden to discover':`${discovered.size} stories found`;
 const trailLinks=[];
 let trail;
 if(stage){
  trail=document.createElement('details');trail.className='garden-trail';trail.hidden=true;
  const summary=document.createElement('summary');
  const toggle=document.createElement('span');toggle.className='garden-trail-toggle';toggle.textContent='your trail';
  summary.append(progress,toggle);
  trail.addEventListener('toggle',()=>{toggle.textContent=trail.open?'fold the trail':'your trail';});
  const links=document.createElement('nav');links.className='garden-trail-links';links.setAttribute('aria-label','Explore the garden projects');
  worlds.forEach((world,index)=>{
   const link=document.createElement('a');link.className='garden-trail-link';link.href='/'+world.id;link.dataset.worldId=world.id;link.textContent=String(index+1).padStart(2,'0');link.title=world.name;
   link.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(!document.querySelector('.rose-art.enchanted-ready')||typeof window.__pluckProject!=='function')return;
    event.preventDefault();trail.open=false;window.__pluckProject(index);
   });
   links.append(link);trailLinks.push({link,world,index});
  });
  trail.append(summary,links);stage.append(trail);
 }
 let note,chapter,chapterNumber,encounterNote;
 if(dialog){
  const closeButton=dialog.querySelector('#closeBtn');
  if(closeButton){
   const arrow=document.createElement('span');arrow.className='editorial-arrow';arrow.setAttribute('aria-hidden','true');
   const label=document.createElement('span');label.textContent='back to the bloom';
   closeButton.replaceChildren(arrow,label);closeButton.setAttribute('aria-label','Back to the bloom — close project and return to the garden');
  }
  note=document.createElement('p');note.className='garden-panel-note';
  chapter=document.createElement('span');chapter.className='garden-chapter-label';chapter.append('chapter ');
  chapterNumber=document.createElement('span');chapterNumber.className='garden-chapter-number';chapter.append(chapterNumber);
  encounterNote=document.createElement('span');encounterNote.className='garden-encounter';
  const rule=document.createElement('span');rule.className='garden-note-rule';rule.setAttribute('aria-hidden','true');
  note.append(chapter,encounterNote,rule);dialog.querySelector('.inner')?.prepend(note);
 }
 function render(){
  progressPoem.textContent=encounter();
  progressCount.textContent=`${discovered.size} of ${worlds.length} projects explored`;
  if(trail){
   if(!discovered.size){
    if(trail.contains(document.activeElement))(document.querySelector('.bloom-heart-button:not(:disabled)')||document.querySelector('.hero-index'))?.focus({preventScroll:true});
    trail.open=false;
   }
   trail.hidden=discovered.size===0;
  }
  trailLinks.forEach(({link,world,index})=>{
   const visited=discovered.has(world.id);link.classList.toggle('is-discovered',visited);
   link.setAttribute('aria-label',`${String(index+1).padStart(2,'0')} — ${world.name}${visited?' — explored':''}`);
  });
  document.querySelectorAll('#worldList>a[data-world-id]').forEach(link=>link.classList.toggle('is-discovered',discovered.has(link.dataset.worldId)));
  if(note){
   const index=worlds.findIndex(world=>world.id===dialog.dataset.w);
   note.hidden=index<0;
   if(index>=0){
    chapterNumber.textContent=`${String(index+1).padStart(2,'0')} / ${String(worlds.length).padStart(2,'0')}`;
    chapter.setAttribute('aria-label',`Chapter ${index+1} of ${worlds.length}`);
    encounterNote.textContent=encounter();
   }
  }
 }
 function changed(){
  try{sessionStorage.setItem(storageKey,JSON.stringify(ids()));}catch{}
  render();window.dispatchEvent(new CustomEvent('florra:garden-change',{detail:{ids:ids()}}));
 }
 function discover(id){if(id==='capsule-01')id='bandersnatch';if(!known.has(id)||discovered.has(id))return false;discovered.add(id);changed();return true;}
 window.FlorraGarden=Object.freeze({ids,discover,reset(){discovered.clear();changed();}});
 function discoverRoute(){
  if(document.body.dataset.worldId)discover(document.body.dataset.worldId);
  if(dialog?.classList.contains('open'))discover(dialog.dataset.w);
  if(stage)discover(location.hash.slice(1));
  render();
 }
 if(dialog)new MutationObserver(discoverRoute).observe(dialog,{attributes:true,attributeFilter:['class','data-w']});
 addEventListener('popstate',discoverRoute);addEventListener('hashchange',discoverRoute);
 discoverRoute();
 window.dispatchEvent(new CustomEvent('florra:garden-ready',{detail:{ids:ids()}}));
})();

/* A chapter arrives like a page turning: one finite sequence per project. */
(()=>{
 if(!dialog)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let chapterKey='',frame=0,animations=[];
 function clearMotion(){cancelAnimationFrame(frame);frame=0;animations.forEach(animation=>animation.cancel());animations=[];}
 function decorateNavigation(){
  [['prevBtn','previous chapter'],['nextBtn','next chapter']].forEach(([id,label])=>{
   const button=document.getElementById(id);if(!button||button.querySelector('.chapter-nav-name'))return;
   const name=button.textContent.replace(/^[←↙]\s*|\s*[→↗]$/g,'').trim();
   const kicker=document.createElement('span');kicker.className='chapter-nav-kicker';kicker.textContent=label;
   const title=document.createElement('span');title.className='chapter-nav-name';title.textContent=name;
   const arrow=document.createElement('span');arrow.className='editorial-arrow';arrow.setAttribute('aria-hidden','true');
   button.replaceChildren(kicker,title,arrow);button.setAttribute('aria-label',`${label}: ${name}`);
  });
 }
 function animateChapter(){
  frame=0;if(!dialog.classList.contains('open'))return;
  decorateNavigation();if(preference.matches||typeof Element.prototype.animate!=='function')return;
  const targets=[dialog.querySelector('.garden-panel-note'),dialog.querySelector('#pTag'),dialog.querySelector('#pTitle'),dialog.querySelector('#pDeco'),dialog.querySelector('.body'),dialog.querySelector('.cta'),dialog.querySelector('.nextprev')].filter(Boolean);
  targets.forEach((element,index)=>{
   animations.push(element.animate([{opacity:0,transform:`translateY(${index<3?12:18}px)`},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:index*55,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  });
  const rule=dialog.querySelector('.garden-note-rule');
  if(rule)animations.push(rule.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:950,delay:80,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
 }
 function update(){
  const nextKey=dialog.classList.contains('open')?dialog.dataset.w||'open':'';
  if(nextKey===chapterKey){if(nextKey)decorateNavigation();return;}
  chapterKey=nextKey;clearMotion();
  if(nextKey)frame=requestAnimationFrame(animateChapter);
 }
 new MutationObserver(update).observe(dialog,{attributes:true,attributeFilter:['class','data-w']});
 preference.addEventListener('change',()=>{clearMotion();if(dialog.classList.contains('open'))decorateNavigation();});
 update();
})();
