(()=>{const v=new URLSearchParams(location.search).get('type');if(v==='tw'||v==='lp')document.documentElement.dataset.type=v;
function strike(el){/* uneven typewriter strikes: tiny random lift, tilt and ink weight per letter */
  if(el.dataset.struck)return;el.dataset.struck=1;el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
  const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();let w=null;for(const ch of c.textContent){if(/\s/.test(ch)){w=null;f.append(ch);continue}if(!w){w=document.createElement('span');w.className='word';w.setAttribute('aria-hidden','true');f.append(w)}const s=document.createElement('span');s.className='strike';s.textContent=ch;
    const r=Math.random;s.style.transform=`translateY(${((r()-.5)*.06).toFixed(3)}em) rotate(${((r()-.5)*2.4).toFixed(2)}deg)`;s.style.opacity=(0.82+r()*.18).toFixed(2);w.append(s)}c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};walk(el)}
addEventListener('DOMContentLoaded',()=>{if(document.documentElement.dataset.type==='tw')document.querySelectorAll('h1,h2,.artist h3').forEach(strike);
  const n=document.createElement('nav');n.className='press-switch';n.setAttribute('aria-label','type options');
  [['now',''],['typewriter','tw'],['letterpress','lp']].forEach(([l,k])=>{const a=document.createElement('a');a.textContent=l;a.href=location.pathname+(k?'?type='+k:'');if((v||'')===k)a.setAttribute('aria-current','true');n.append(a)});document.body.append(n);
  if(v)document.querySelectorAll('a[href^="/"]').forEach(a=>{if(!a.closest('.press-switch')&&!a.href.includes('type=')){const u=new URL(a.href);u.searchParams.set('type',v);a.href=u.pathname+u.search+u.hash}})})})();
