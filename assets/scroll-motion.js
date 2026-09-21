/* Native scrolling, scored in layers. Layout is sampled before any visual writes;
   the animation clock runs only until the sampled positions have settled. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let dispose=()=>{};
 const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
 const revealClasses=['motion-reveal','motion-entered','motion-heading','motion-copy','motion-row','motion-card'];
 function setup(){
  dispose();
  if(preference.matches||typeof IntersectionObserver!=='function')return;
  const root=document.documentElement,panel=document.getElementById('panel'),stage=document.querySelector('.stage');
  const page={element:null,height:innerHeight,scroll:scrollY,base:0};
  const chapter={element:panel,height:0,scroll:0,base:0};
  const motion=new Set(),reveals=new Map(),pendingEntries=new Set(),observedSizes=new Set();
  const removers=[];let frame=0,lastTime=0,layoutDirty=true,sampleDirty=true,snap=true,alive=true,panelKey='';
  let pageObserver,panelObserver,resizeObserver,routeObserver,filterObserver;
  function listen(target,type,handler,options){target?.addEventListener(type,handler,options);removers.push(()=>target?.removeEventListener(type,handler,options));}
  function schedule(layout=false){
   if(!alive)return;sampleDirty=true;if(layout)layoutDirty=true;
   if(!document.hidden&&!frame)frame=requestAnimationFrame(draw);
  }
  function observeSize(element){if(!element||observedSizes.has(element))return;observedSizes.add(element);resizeObserver?.observe(element);}
  // offset geometry ignores the very transforms this controller supplies.
  function layoutTop(element){let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop||0;return top;}
  function newMotion(element,type,context=page){
   const names=type==='stage'?['--scroll-depth']:type==='plate'?['--plate-drift']:type==='section'?['--section-reveal','--section-drift']:type==='panel'?['--panel-progress','--panel-depth']:['--reading-progress'];
   const record={element,type,context,top:0,height:0,active:true,values:names.map(name=>({name,current:0,target:0,rendered:null}))};
   motion.add(record);if(type!=='progress'&&type!=='panel')observeSize(element);return record;
  }
  function observerFor(context){
   return new IntersectionObserver(entries=>{
    for(const entry of entries){if(!entry.isIntersecting)continue;const record=reveals.get(entry.target);if(record&&record.context===context)pendingEntries.add(record);}
    schedule();
   },{root:context.element,threshold:.06,rootMargin:'0px 0px -6% 0px'});
  }
  function revealKind(element){
   if(element.matches('h1,h2,h3'))return'motion-heading';
   if(element.matches('.feature-card,.lane'))return'motion-card';
   if(element.matches('p,.lede,.intro'))return'motion-copy';
   return'motion-row';
  }
  function registerReveals(elements,context){
   elements.forEach((element,index)=>{
    if(reveals.has(element))return;
    reveals.set(element,{element,context,kind:revealKind(element),index,top:0,height:0,initial:true,entered:false,observing:false});
   });
   schedule(true);
  }
  function clearReveal(record){
   (record.context===chapter?panelObserver:pageObserver)?.unobserve(record.element);
   record.element.classList.remove(...revealClasses);record.element.style.removeProperty('--entrance-delay');
   reveals.delete(record.element);pendingEntries.delete(record);
  }
  function clearPanel(){
   panelObserver?.disconnect();panelObserver=null;
   for(const record of [...reveals.values()])if(record.context===chapter)clearReveal(record);
   for(const record of [...motion])if(record.context===chapter){record.values.forEach(value=>record.element.style.removeProperty(value.name));motion.delete(record);}
  }
  function rebuildPanel(){
   const key=panel?.classList.contains('open')?panel.dataset.w||'open':'';
   if(key===panelKey)return;
   panelKey=key;clearPanel();
   if(key){
    panelObserver=observerFor(chapter);newMotion(panel,'panel',chapter);
    registerReveals([...panel.querySelectorAll('#pBody>p,#pFacts>div,#pCta>a,.nextprev>button')],chapter);
    observeSize(panel.querySelector('.inner'));
   }
   schedule(true);
  }
  function readLayout(){
   chapter.base=panel?layoutTop(panel):0;
   const geometry=new Map();
   function measure(element){
    if(!geometry.has(element))geometry.set(element,{top:layoutTop(element),height:element.offsetHeight||0});
    return geometry.get(element);
   }
   for(const record of motion){if(record.type==='progress'||record.type==='panel')continue;Object.assign(record,measure(record.element));}
   for(const record of reveals.values())Object.assign(record,measure(record.element));
  }
  function sample(){
   page.height=innerHeight||root.clientHeight;page.scroll=scrollY||0;
   chapter.height=panel?.clientHeight||page.height;chapter.scroll=panel?.scrollTop||0;
   const documentRange=Math.max(1,root.scrollHeight-page.height);
   const panelRange=panel?Math.max(1,panel.scrollHeight-chapter.height):1;
   const compact=innerWidth<=760;
   for(const record of motion){
    const {type,context,values}=record;
    const top=record.top-context.base-context.scroll,height=Math.max(1,record.height),viewport=context.height;
    record.active=type==='progress'||type==='panel'||(top<viewport*1.2&&top+height>-viewport*.2);
    if(type==='progress')values[0].target=clamp(page.scroll/documentRange);
    else if(type==='panel'){values[0].target=clamp(chapter.scroll/panelRange);values[1].target=clamp(chapter.scroll/Math.max(1,viewport*.8));}
    else if(type==='stage')values[0].target=clamp(-top/height);
    else{
     const drift=clamp((viewport*.5-top-height*.5)/Math.max(1,(viewport+height)*.5),-1,1);
     if(type==='plate')values[0].target=drift*(compact?25:46);
     else{values[0].target=clamp((viewport*.94-top)/Math.max(1,viewport*.8));values[1].target=drift*(compact?18:30);}
    }
   }
  }
  function enter(record){
   if(!reveals.has(record.element))return;
   record.entered=true;record.element.classList.add('motion-entered');
   (record.context===chapter?panelObserver:pageObserver)?.unobserve(record.element);record.observing=false;
  }
  function paintReveals(){
   for(const record of reveals.values()){
    if(!record.initial||!record.height)continue;
    const {element,context,kind,index}=record;
    const top=record.top-context.base-context.scroll;
    // Keep the viewport readable on load, deep links, and project changes.
    const alreadyVisible=top<=context.height*.94||element.contains(document.activeElement);
    element.classList.add('motion-reveal',kind);
    const delay=kind==='motion-heading'?0:kind==='motion-card'?(index%3)*85:(index%4)*35;
    element.style.setProperty('--entrance-delay',delay+'ms');record.initial=false;
    if(alreadyVisible||pendingEntries.has(record))enter(record);
    else{(context===chapter?panelObserver:pageObserver)?.observe(element);record.observing=true;}
   }
   for(const record of pendingEntries)enter(record);pendingEntries.clear();
  }
  function draw(time){
   frame=0;if(!alive||document.hidden)return;
   const delta=lastTime?clamp(time-lastTime,1,64):16.67;lastTime=time;
   // One read phase; easing-only frames reuse the preceding layout sample.
   if(layoutDirty)readLayout();
   if(sampleDirty||layoutDirty)sample();
   layoutDirty=false;sampleDirty=false;
   paintReveals();
   const blend=1-Math.exp(-delta/105);let moving=false;
   for(const record of motion){
    for(const value of record.values){
     const pixel=value.name.endsWith('-drift'),tolerance=pixel ? .035 : .00035;
     const difference=value.target-value.current;
     if(snap||!record.active||Math.abs(difference)<=tolerance)value.current=value.target;
     else{value.current+=difference*blend;moving=true;}
     const next=pixel?value.current.toFixed(2)+'px':value.current.toFixed(4);
     if(next!==value.rendered){record.element.style.setProperty(value.name,next);value.rendered=next;}
    }
   }
   snap=false;
   if(moving)frame=requestAnimationFrame(draw);else lastTime=0;
  }
  pageObserver=observerFor(page);
  if(typeof ResizeObserver==='function')resizeObserver=new ResizeObserver(()=>schedule(true));
  newMotion(root,'progress');if(stage)newMotion(stage,'stage');
  document.querySelectorAll('body>section,main>section:not(.stage),main>.chapter-hero,main>.chapter-content,.chapter main>.chapter-hero,.chapter main>.chapter-content').forEach(element=>newMotion(element,'section'));
  document.querySelectorAll('.feature-art,.chapter-plate').forEach(element=>newMotion(element,'plate'));
  registerReveals([...document.querySelectorAll('.feature-intro h2,.feature-intro p,.feature-card,.section-heading h1,.section-heading h2,.section-heading .lede,#worldList>a,#work>.wrap>h2,.lane,#max h2,#max .founder p,#max dl div,#contact h2,#contact .mail,#contact .small,body:not(.chapter)>footer,.chapter h1,.chapter .intro,.chapter-content>.copy>p,.chapter-content>aside dl div,.chapter-content>aside .actions>a,.consultant-work h2,.consultant-work p,.chapter footer h2,.chapter footer nav>a')],page);
  observeSize(document.body);if(panel)observeSize(panel);
  listen(window,'scroll',()=>schedule(),{passive:true});
  listen(window,'resize',()=>schedule(true),{passive:true});
  listen(panel,'scroll',()=>schedule(),{passive:true});
  listen(document,'focusin',event=>{
   for(let element=event.target;element&&element!==document;element=element.parentElement){const record=reveals.get(element);if(record)enter(record);}
  });
  listen(document,'visibilitychange',()=>{
   if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0;}
   else{snap=true;schedule(true);}
  });
  listen(window,'pageshow',()=>{snap=true;schedule(true);});
  listen(document.fonts,'loadingdone',()=>schedule(true));
  if(panel){routeObserver=new MutationObserver(rebuildPanel);routeObserver.observe(panel,{attributes:true,attributeFilter:['class','data-w']});rebuildPanel();}
  const list=document.getElementById('worldList');
  if(list){filterObserver=new MutationObserver(()=>schedule(true));filterObserver.observe(list,{subtree:true,attributes:true,attributeFilter:['hidden']});}
  root.classList.add('motion-ready');schedule(true);
  dispose=()=>{
   alive=false;cancelAnimationFrame(frame);frame=0;
   pageObserver.disconnect();panelObserver?.disconnect();resizeObserver?.disconnect();routeObserver?.disconnect();filterObserver?.disconnect();
   removers.forEach(remove=>remove());
   for(const record of [...reveals.values()])clearReveal(record);
   for(const record of motion)record.values.forEach(value=>record.element.style.removeProperty(value.name));
   root.classList.remove('motion-ready');pendingEntries.clear();motion.clear();observedSizes.clear();
  };
 }
 setup();preference.addEventListener('change',setup);
})();
