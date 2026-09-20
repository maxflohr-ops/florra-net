const nav=document.querySelector('body>nav');
const setNav=()=>nav?.classList.toggle('scrolled',scrollY>50);
addEventListener('scroll',setNav,{passive:true});setNav();
const filters=[...document.querySelectorAll('[data-filter]')];
filters.forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.filter;
 filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('#worldList>a').forEach(row=>row.hidden=category!=='all'&&row.dataset.category!==category);
 const count=document.querySelectorAll('#worldList>a:not([hidden])').length;
 document.querySelector('#filter-status').textContent=`${count} worlds shown`;
}));
const dialog=document.querySelector('#panel');
if(dialog){
 const surface=[...document.body.children].filter(el=>el!==dialog&&!['SCRIPT','STYLE'].includes(el.tagName));
 const observer=new MutationObserver(()=>{
  const opened=dialog.classList.contains('open');
  surface.forEach(el=>el.inert=opened);
  if(!opened&&document.activeElement&&dialog.contains(document.activeElement)) document.querySelector(document.body.dataset.plucking?'.bloom-project-target':'a[href="#worlds"]')?.focus({preventScroll:true});
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
