import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import vm from 'node:vm';
import {homeDesign,chapterDesign} from './editorial.mjs';
const origin='https://www.florra.net';
const source=await readFile('index.html','utf8');
const worlds=vm.runInNewContext(source.match(/const WORLDS=(\[[\s\S]*?\n\]);/)[1],{}, {timeout:1000});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const metadata={
 'florra-os':['florra os — ai operations for creative teams','Explore Florra OS: agent-run research, CRM, outreach and reporting supporting Florra’s music, media and creative projects. Partner access by invitation.'],
 'florra-records':['florra records — independent label & music promotion','Florra Records signs individual songs and supports releases with creator seeding, clip campaigns and the Florra network. Send a song or explore promotion.'],
 'bounty-sounds':['bounty sounds — music clip bounties | florra','Bounty Sounds connects artists, labels and clippers through funded sound bounties and verified views. Explore Florra’s pre-launch music promotion platform.'],
 redstring:['redstring — true crime platform & publishing | florra','Explore Redstring, Florra’s true crime case board, podcast and book publishing network. Discover case heat readings, verdict polls and promotion opportunities.'],
 cleared:['cleared — game completion companion | florra','Meet Cleared, Florra’s gaming companion in development: a shelf of completed games, records and planned rewards. Join the early list or discuss a partnership.'],
 management:['artist management — ridgeclub, ebril & mckayla | florra','Florra manages Ridgeclub, Ebril and Mckayla Maroney with music campaigns, creator seeding and artist operations. Explore the roster and get in touch.'],
 content:['ugc video production & websites in southern california | florra','Florra creates on-location UGC video and mobile-first websites for Southern California businesses. Book a shoot, a batch of edits or a website build.'],
 campaigns:['political ugc & creator campaigns | florra','Florra produces creator-led UGC for candidates, causes and ballot measures across TikTok, Reels and YouTube. Explore campaign services and send a brief.'],
 press:['florra press — books & independent publishing','Florra Press publishes practical books on music and internet culture, with true crime books and podcasts through Redstring. Explore publishing partnerships.'],
 cucumbers:['cucumbers — florra’s small-batch pickle project','Meet Florra’s homegrown cucumber and small-batch pickle project. The first consumer brand is in development; join the list for news about the first jars.'],
 greenhouse:['the greenhouse — florra project interest list','The Greenhouse is an interest list for future Florra developments. Nothing is for sale, no token exists, and nothing here is an offer of securities.'],
 bandersnatch:['bandersnatch — southern gothic world & clothing | florra','Explore Bandersnatch, Florra’s Southern Gothic fictional estate, clothing and print project. Visit the world or talk to Florra about building a brand universe.'],
 'capsule-01':['capsule 01 — florra slogan t-shirts','Explore Florra Capsule 01: six printed-to-order slogan tees in lowercase Times New Roman, including “be different to be better” and “where songs break.”'],
 cited:['cited — ai search visibility services | florra','Cited by Florra helps businesses improve AI search visibility through structured data, readable site content, answer-ready pages and citation tracking.'],
 ridgeclub:['ridgeclub — artist roster & management | florra','Meet Ridgeclub, the saxophone project by Abhi on Florra’s artist roster. Explore the music, artist website and Florra’s management work.'],
 ebril:['ebril — artist roster & management | florra','Meet Ebril, Huda Al-Hamami’s Iraqi-Canadian music project on Florra’s artist roster. Explore the artist’s music, website and management.'],
 mckayla:['mckayla maroney — music & artist management | florra','Explore Mckayla Maroney’s music project on Florra’s artist roster, listen to her songs and discover her work on the Bandersnatch world.']
};
const homeTitle='florra — artist management, records & creative campaigns';
const homeDescription='Florra connects music, creator campaigns and independent brands. Explore artist management, record releases, UGC video, publishing and creative tools.';
const organization={'@type':'Organization','@id':origin+'/#organization',name:'florra',legalName:'florra llc',url:origin+'/',email:'max@florra.net',founder:{'@type':'Person',name:'Max Flohr'}};
const website={'@type':'WebSite','@id':origin+'/#website',name:'florra',url:origin+'/',publisher:{'@id':organization['@id']}};
const jsonld=nodes=>`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':nodes}).replace(/</g,'\\u003c')}</script>`;
const head=(title,description,path)=>`<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin}${path}"><meta property="og:type" content="website"><meta property="og:site_name" content="florra"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="florra — be different to be better"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${origin}/og.jpg"><link rel="icon" href="/apple-touch-icon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
await rm('public',{recursive:true,force:true});await mkdir('public/assets',{recursive:true});
for(const file of ['og.jpg','apple-touch-icon.png']) await copyFile('assets/'+file,'public/'+file);
for(const file of ['editorial.css','editorial.js']) await copyFile('assets/'+file,'public/assets/'+file);
const roseData=source.match(/const ROSE="data:image\/jpeg;base64,([^"]+)/)[1];
await writeFile('public/assets/rose-texture.jpg',Buffer.from(roseData,'base64'));
const font=source.match(/@font-face\s*\{[\s\S]*?\}/)[0];
await writeFile('public/assets/brand.css',font+`\n*{box-sizing:border-box}body{margin:0;background:#0e100e;color:#eee9dc;font-family:'Fable Dust',Georgia,serif;font-size:20px;line-height:1.6}a{color:inherit;text-underline-offset:5px}a:focus-visible{outline:2px solid #c9e8b0;outline-offset:7px}header,main,footer{max-width:1000px;margin:auto;padding:28px clamp(22px,6vw,80px)}header{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #ffffff29}header a{text-decoration:none}main{padding-top:70px;padding-bottom:70px}h1{font-size:clamp(46px,9vw,100px);line-height:1.05;font-weight:400;margin:20px 0 32px;overflow-wrap:anywhere}h2{font-size:32px;font-weight:400}.eyebrow{font-size:14px;letter-spacing:.12em;color:#bdc6b5}.intro{font-size:clamp(24px,4vw,36px);line-height:1.35}.copy{max-width:700px}dl{border-top:1px solid #ffffff29;margin:42px 0}dl div{display:grid;grid-template-columns:100px 1fr;gap:20px;padding:15px 0;border-bottom:1px solid #ffffff29}dt{color:#bdc6b5}dd{margin:0}.actions{display:flex;flex-wrap:wrap;gap:14px}.actions a{padding:12px 20px;border:1px solid #b3bba9;border-radius:3px;text-decoration:none}.actions a:hover{background:#252d24}footer{border-top:1px solid #ffffff29;font-size:16px}footer nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin:20px 0}.breadcrumb{font-size:15px} @media(max-width:500px){dl div{grid-template-columns:1fr;gap:2px}.actions a{width:100%}}`);
let home=source.replace(/<title>[\s\S]*?<\/title>/,`<title>${homeTitle}</title>`)
 .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${homeDescription}">`)
 .replace(/<meta (property="og:title"|name="twitter:title") content="[^"]*">/g,`<meta $1 content="${homeTitle}">`)
 .replace(/<meta (property="og:description"|name="twitter:description") content="[^"]*">/g,`<meta $1 content="${homeDescription}">`)
 .replaceAll('https://florra.net','https://www.florra.net')
 .replace('one stem. nine petals.','one stem. many worlds.')
 .replace('<h2 class="reveal">one stem. many worlds.</h2>','<h1 class="reveal" style="font:inherit;font-size:clamp(38px,5.5vw,70px);line-height:1.05;margin:0">one stem. many worlds.</h1>')
 .replace('<div class="list reveal" id="worldList"></div>',`<div class="list" id="worldList">${worlds.map(w=>`<a href="/${w.id}"><span class="nm">${esc(w.name)}</span><span class="st">${esc(w.status)}</span></a>`).join('\n')}</div>`)
 .replace('.list button{','.list > a{').replace('.list button:hover','.list > a:hover')
 .replace(/WORLDS\.forEach\(\(w,i\)=>\{const b=document.createElement\('button'\);[^\n]+/,'// Brand links are rendered at build time; the flower still opens interactive panels.')
 .replace("document.getElementById('pCta').innerHTML=w.cta.map", "document.getElementById('pCta').innerHTML=[{t:'explore '+w.name,h:'/'+w.id},...w.cta].map")
 .replace('</head>',jsonld([organization,website])+'<noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript></head>');
await writeFile('public/index.html',homeDesign(home,worlds));
for(const w of worlds){
 const [title,description]=metadata[w.id];const path='/'+w.id;
 const page={'@type':'WebPage','@id':origin+path+'#webpage',url:origin+path,name:title,description,isPartOf:{'@id':website['@id']},publisher:{'@id':organization['@id']}};
 const breadcrumbs={'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'florra',item:origin+'/'},{'@type':'ListItem',position:2,name:w.name,item:origin+path}]};
 const href=h=>h.startsWith('#')?'/'+h:h;
 const analytics=source.match(/<!-- Google tag[\s\S]*?<\/script>[\s\S]*?<\/script>/)?.[0]||'';
 const html=`<!doctype html><html lang="en"><head>${head(title,description,path)}<meta name="theme-color" content="#0e100e"><link rel="stylesheet" href="/assets/brand.css">${jsonld([organization,website,page,breadcrumbs])}${analytics}</head><body><header><a href="/">florra</a><a href="/#contact">work with us ↗</a></header><main><nav class="breadcrumb" aria-label="breadcrumb"><a href="/">florra</a> / ${esc(w.name)}</nav><p class="eyebrow">${esc(w.tag)} · ${esc(w.status)}</p><h1>${esc(w.name)}</h1><div class="copy">${w.one?`<p class="intro">${esc(w.one)}</p>`:''}${w.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div><dl>${w.facts.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="actions">${w.cta.map(c=>`<a href="${esc(href(c.h))}"${c.x?' target="_blank" rel="noopener"':''}>${esc(c.t)}</a>`).join('')}</div><p><a href="/#${w.id}">see ${esc(w.name)} in the garden →</a></p></main><footer><h2>more from florra</h2><nav aria-label="florra worlds">${worlds.filter(o=>o.id!==w.id).map(o=>`<a href="/${o.id}">${esc(o.name)}</a>`).join('')}</nav><p><a href="mailto:max@florra.net">max@florra.net</a> · florra llc</p></footer></body></html>`;
 await writeFile('public/'+w.id+'.html',chapterDesign(html,w,worlds.indexOf(w)));
}
await writeFile('public/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['',...worlds.map(w=>w.id)].map(id=>`<url><loc>${origin}/${id}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('public/404.html',`<!doctype html><html lang="en"><head>${head('page not found | florra','This Florra page could not be found.','/404')}<meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/brand.css"></head><body><main><h1>this path ends here.</h1><p><a href="/">return to florra →</a></p></main></body></html>`);
console.log(`Built homepage and ${worlds.length} brand pages.`);
