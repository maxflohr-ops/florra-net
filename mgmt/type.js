/* typewriter strikes: each headline letter gets a tiny random lift, tilt and ink weight. Words stay whole; the heading keeps its text as aria-label. */
(()=>{function strike(el){/* uneven typewriter strikes: tiny random lift, tilt and ink weight per letter */
  if(el.dataset.struck)return;el.dataset.struck=1;el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
  const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();let w=null;for(const ch of c.textContent){if(/\s/.test(ch)){w=null;f.append(ch);continue}if(!w){w=document.createElement('span');w.className='word';w.setAttribute('aria-hidden','true');f.append(w)}const s=document.createElement('span');s.className='strike';s.textContent=ch;
    const r=Math.random;s.style.transform=`translateY(${((r()-.5)*.06).toFixed(3)}em) rotate(${((r()-.5)*2.4).toFixed(2)}deg)`;s.style.opacity=(0.82+r()*.18).toFixed(2);w.append(s)}c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};walk(el)}
addEventListener('DOMContentLoaded',()=>document.querySelectorAll('h1,h2,.artist h3').forEach(strike))})();
