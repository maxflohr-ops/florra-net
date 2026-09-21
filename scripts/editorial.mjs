export const category=id=>['management','florra-records','ridgeclub','ebril','mckayla','bounty-sounds'].includes(id)?'music':['florra-os','content','campaigns','cited','bruce-flohr'].includes(id)?'services':'worlds';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function specimen(id){return `<div class="specimen" data-kind="${category(id)}" aria-hidden="true"><span class="stem-study"></span>${Array.from({length:8},(_,i)=>`<span class="petal-study" style="--i:${i}"></span>`).join('')}<span class="specimen-letter">f</span></div>`;}
const featured=`<section class="featured"><div class="wrap"><div class="feature-intro"><div><div class="eyebrow">a few things growing here</div><h2>different by nature.</h2></div><p>music, worlds, and the ideas<br>that grow between them.</p></div><div class="feature-grid">${[['management','01','the artists','sound first. always.'],['bandersnatch','02','bandersnatch','our first world of lore and fashion.'],['content','03','the work','ideas made tangible.']].map(([id,n,title,desc])=>`<a class="feature-card" href="/${id}"><div class="feature-art"><span class="plate-mark">florra / ${n}</span>${specimen(id)}<span class="plate-label">a study in ${category(id)}</span></div><div class="feature-info"><div><h3>${title}</h3><p>${desc}</p></div><span aria-hidden="true">↗</span></div></a>`).join('')}</div></div></section>`;
export function homeDesign(html,worlds){
 let output=html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>','').replace('</head>','<link rel="stylesheet" href="/assets/editorial.css"></head>')
 .replace('<div id="glwrap"><canvas id="gl"></canvas></div>','<div id="glwrap"><canvas id="gl" hidden></canvas><div class="rose-art"><img class="rose-botanical" src="/assets/rose-botanical.png" alt="A sculptural crimson rose above the California hills" fetchpriority="high" width="1024" height="1536"><div class="rose-targets" role="group" aria-label="Explore projects by picking a rose petal"></div><button class="rose-reset" type="button" hidden>bloom again ↺</button></div></div>')
 .replace("if(TOD==='night')hint.textContent='tap the f to wake the flower';",'')
 .replace('<body>','<body><a class="skip-link" href="#worlds">skip to the worlds</a>')
 .replace('<li><a href="#work">','<li><a href="#worlds">the worlds</a></li><li><a href="#work">')
 .replace('<a href="#contact">contact</a>','<a class="nav-contact" href="#contact">get in touch ↗</a>')
 .replace('<div class="hint" id="hint">pick a petal</div>',`<div class="hero-word" aria-hidden="true">florra</div><div class="hero-caption"><p class="micro">music · culture · possibility</p><p>be different<br>to be better.</p></div><a class="hero-index" href="#worlds">all worlds ↓</a><div class="hint" id="hint">pick a petal. flick to explore.</div>`)
 .replace('<section id="worlds">',featured+'<section id="worlds">')
 .replace('<div class="eyebrow reveal">florra, from flower</div>',`<div class="section-kicker"><span>the florra index</span><span>${worlds.length} worlds. one ecosystem.</span></div><div class="section-heading"><div><div class="eyebrow">florra, from flower</div>`)
 .replace(/(<h1[^>]*>one stem\. many worlds\.<\/h1>)/,'$1</div>')
 .replace("we're the bridge.</p>","we're the bridge.</p></div>")
 .replace('<div class="list" id="worldList">',`<div class="filters" role="group" aria-label="filter the worlds">${[['all','all worlds'],['music','music'],['services','creative services'],['worlds','brands & ventures']].map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${id==='all'}" aria-controls="worldList">${label}</button>`).join('')}</div><p id="filter-status" role="status" style="position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden">${worlds.length} worlds shown</p><div class="list" id="worldList">`)
 .replace('roughness:.6,metalness:.05','roughness:.88,metalness:.01')
 .replace("const amb=new THREE.AmbientLight(0x5a5348,1.5)","const amb=new THREE.AmbientLight(0x827b68,1.25)")
 .replace("const key=new THREE.DirectionalLight(0xfff2dc,1.7)","const key=new THREE.DirectionalLight(0xfff2dc,1.25)")
 .replace(/let R=null;[\s\S]*?requestAnimationFrame\(tick\);\n\n\/\* list fallback \*\//,'/* The enchanted bloom owns its animation lifecycle. */\n/* list fallback */')
 .replace('function tick(now){',`let stageVisible=true;new IntersectionObserver(entries=>{stageVisible=entries[0].isIntersecting;}).observe(stage);\nfunction tick(now){\n  if(document.hidden||!stageVisible){requestAnimationFrame(tick);return;}`)
 .replace("document.getElementById('glwrap').style.display='none';","/* Botanical artwork is the renderer-independent fallback. */")
 .replace('</body>','<script defer src="/assets/scroll-motion.js"></script><script defer src="/assets/vendor/three.min.js"></script><script defer src="/assets/enchanted-rose.js"></script><script defer src="/assets/editorial.js"></script></body>');
 worlds.forEach((w,i)=>{output=output.replace(`<a href="/${w.id}"><span class="nm">`,`<a href="/${w.id}" data-world-id="${escape(w.id)}" data-category="${category(w.id)}"><span class="row-index">${String(i+1).padStart(2,'0')}</span><span class="nm">`);output=output.replace(`<span class="st">${escape(w.status)}</span></a>`,`<span class="st">${escape(w.status)}</span><span class="row-arrow" aria-hidden="true">↗</span></a>`);});
 return output;
}
export function chapterDesign(html,w,index){
 let page=html.replace('</head>','<link rel="stylesheet" href="/assets/editorial.css"></head>')
 .replace("if(TOD==='night')hint.textContent='tap the f to wake the flower';",'')
 .replace('<body>',`<body class="chapter" data-world-id="${escape(w.id)}" data-world-index="${index}"><a class="skip-link" href="#chapter-content">skip to content</a>`)
 .replace('<main>','<main><div class="chapter-hero"><div class="chapter-heading">')
 .replace('<div class="copy">',`${w.one?`<p class="intro">${escape(w.one)}</p>`:''}</div><div class="chapter-plate"><div class="plate-top"><span>florra / ${String(index+1).padStart(2,'0')}</span><span>${category(w.id)}</span></div>${specimen(w.id)}<div class="plate-bottom"><span>independent by nature</span><span>↗</span></div></div></div><div class="chapter-content" id="chapter-content"><div class="copy">`)
 .replace(/(<div class="copy">)<p class="intro">[\s\S]*?<\/p>/,'$1')
 .replace('</div><dl>','</div><aside aria-label="details and enquiries"><dl>')
 .replace('<p><a href="/#','<p class="garden-link"><a href="/#')
 .replace('</main>','</aside></div></main>');
 if(w.id==='bruce-flohr'){
  page=page.replace('<body class="chapter"','<body class="chapter consultant"')
   .replace('<h1>bruce flohr</h1>','<h1>Bruce Flohr</h1>')
   .replace(specimen(w.id),'<div class="consultant-monogram" aria-hidden="true">bf<span>perspective shapes possibility.</span></div>')
   .replace('</main>','<section class="consultant-work" aria-labelledby="case-studies-title"><div class="eyebrow">selected work</div><h2 id="case-studies-title">Case studies</h2><p>A closer look at the work. Coming soon.</p></section></main>');
 }
 return page.replace('</body>','<script defer src="/assets/scroll-motion.js"></script><script defer src="/assets/editorial.js"></script></body>');
}
