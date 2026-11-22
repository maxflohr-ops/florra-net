/* A cinematic interlude without scroll hijacking or a permanent animation loop. */
(()=>{
 const scene=document.querySelector('.growth-scene');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,visible=false;
 const paint=()=>{frame=0;if(!scene||!visible||document.hidden||preference.matches)return;const bounds=scene.getBoundingClientRect();const range=Math.max(1,bounds.height-innerHeight);scene.style.setProperty('--growth',Math.max(0,Math.min(1,-bounds.top/range)).toFixed(4));};
 const schedule=()=>{if(!frame&&visible&&!document.hidden&&!preference.matches)frame=requestAnimationFrame(paint);};
 if(scene&&typeof IntersectionObserver==='function'){
  document.documentElement.classList.add('immersive-ready');
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{rootMargin:'100px'}).observe(scene);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  preference.addEventListener('change',()=>{scene.style.removeProperty('--growth');schedule();});
 }
 const list=document.getElementById('worldList');
 if(!list)return;
 const rows=[...list.querySelectorAll('a[data-world-id]')];
 if(!rows.length)return;
 const layout=document.createElement('div');layout.className='collection-layout';list.before(layout);layout.append(list);
 const preview=document.createElement('aside');preview.className='collection-preview';preview.setAttribute('aria-label','Project preview');
 const index=document.createElement('span');index.className='preview-index';
 const art=document.querySelector('.feature-art .specimen')?.cloneNode(true);
 const bottom=document.createElement('div');const name=document.createElement('p');name.className='preview-name';
 const category=document.createElement('p');category.className='preview-category';
 const description=document.createElement('p');description.className='preview-description';
 const visit=document.createElement('a');visit.className='preview-visit';visit.textContent='explore this world ↗';
 bottom.append(name,category,description,visit);preview.append(index);if(art)preview.append(art);preview.append(bottom);layout.append(preview);
 const labels={music:'music & artists',services:'creative practice',worlds:'independent brands & ideas'};
 function select(row){const kind=row.dataset.category;preview.dataset.kind=kind;name.textContent=row.querySelector('.nm').textContent;index.textContent='specimen / '+row.querySelector('.row-index').textContent;category.textContent=labels[kind];const project=typeof WORLDS!=='undefined'?WORLDS.find(world=>world.id===row.dataset.worldId):null;description.textContent=project?.one||row.querySelector('.st')?.textContent||'';visit.href=row.getAttribute('href');visit.setAttribute('aria-label','Explore '+name.textContent);if(art){art.dataset.kind=kind;art.style.transform=`rotate(${rows.indexOf(row)*17-20}deg)`;}}
 rows.forEach(row=>{row.addEventListener('pointerenter',()=>select(row));row.addEventListener('focus',()=>select(row));});
 new MutationObserver(()=>{const first=rows.find(row=>!row.hidden);if(first)select(first);}).observe(list,{subtree:true,attributes:true,attributeFilter:['hidden']});
 select(rows[0]);
})();
