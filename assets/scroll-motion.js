/* Native scroll choreography: no wheel interception, no continuous render loop. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');let dispose=()=>{};
 function setup(){
  dispose();if(preference.matches)return;
  const root=document.documentElement,stage=document.querySelector('.stage');
  const targets=[...document.querySelectorAll('.feature-intro,.feature-card,.section-heading,#worldList>a,.lane,#max .wrap,#contact .wrap,.chapter-content>.copy,.chapter-content>aside,.consultant-work,footer')];
  const visible=new Set(),plates=[...document.querySelectorAll('.feature-art,.chapter-plate')];let frame=0;
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('motion-entered');reveal.unobserve(entry.target);}
  }),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
  targets.forEach((el,i)=>{
   el.style.setProperty('--entrance-delay',el.matches('.feature-card,.lane,#worldList>a')?(i%3)*65+'ms':'0ms');
   if(el.getBoundingClientRect().top>innerHeight*.92){el.classList.add('motion-reveal');reveal.observe(el);}
  });
  const watch=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));schedule();},{rootMargin:'100px'});
  plates.forEach(el=>watch.observe(el));
  function draw(){
   frame=0;if(document.hidden)return;
   if(stage){const r=stage.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/r.height));
    stage.style.setProperty('--scroll-depth',p.toFixed(4));
   }
   visible.forEach(el=>{const r=el.getBoundingClientRect(),p=Math.max(-1,Math.min(1,(innerHeight*.5-r.top-r.height*.5)/innerHeight));el.style.setProperty('--plate-drift',(p*32).toFixed(2)+'px');});
   root.style.setProperty('--reading-progress',Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);
  root.classList.add('motion-ready');draw();
  dispose=()=>{cancelAnimationFrame(frame);reveal.disconnect();watch.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);root.classList.remove('motion-ready');targets.forEach(el=>el.classList.remove('motion-reveal','motion-entered'));stage?.style.removeProperty('--scroll-depth');};
 }
 setup();preference.addEventListener('change',setup);
})();
