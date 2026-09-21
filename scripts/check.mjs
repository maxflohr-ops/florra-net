import {readFile,readdir,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const origin='https://www.florra.net';
const files=(await readdir('public')).filter(p=>p.endsWith('.html')&&p!=='404.html');
const titles=new Set(),descriptions=new Set();
const sitemap=await readFile('public/sitemap.xml','utf8');
assert.equal(files.length,17);
for(const file of files){
 const html=await readFile('public/'+file,'utf8');
 const path=file==='index.html'?'/':'/'+file.replace('.html','');
 const title=html.match(/<title>(.*?)<\/title>/)[1];
 const description=html.match(/<meta name="description" content="([^"]*)"/)[1];
 assert(!titles.has(title),'duplicate title');titles.add(title);
 assert(!descriptions.has(description),'duplicate description');descriptions.add(description);
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert(html.includes(`rel="canonical" href="${origin}${path}"`));
 assert(sitemap.includes(`<loc>${origin}${path}</loc>`));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert(!html.includes('noindex'));
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  if(!match[0].includes('application/ld+json')) new vm.Script(match[1]);
 }
 for(const [,href] of html.matchAll(/href="(\/[^"#]*)"/g)){
  const filePath=href==='/'?'index.html':href.slice(1)+(href.includes('.')?'':'.html');
  await access('public/'+filePath);
 }
 if(file!=='index.html') assert(html.includes('<dl>')&&html.includes('class="copy"'));
}
new vm.Script(await readFile('public/assets/editorial.js','utf8'));
new vm.Script(await readFile('public/assets/rose.js','utf8'));
new vm.Script(await readFile('public/assets/enchanted-rose.js','utf8'));
new vm.Script(await readFile('public/assets/scroll-motion.js','utf8'));
const home=await readFile('public/index.html','utf8');
assert.equal((home.match(/class="nm"/g)||[]).length,16);
assert(!files.includes('capsule-01.html'));
assert(!sitemap.includes('/capsule-01'));
const catalogue=vm.runInNewContext(home.match(/const WORLDS=(\[[\s\S]*?\n\]);/)[1]);
assert.equal(catalogue.filter(w=>w.id==='bandersnatch').length,1);
assert(!catalogue.some(w=>/capsule/i.test(w.id+' '+w.name)));
assert((await readFile('public/bandersnatch.html','utf8')).includes('our first brand built around lore and fashion.'));
const redirects=JSON.parse(await readFile('vercel.json','utf8')).redirects;
for(const source of ['/capsule-01','/capsule-01.html'])assert(redirects.some(r=>r.source===source&&r.destination==='/bandersnatch'&&r.permanent));
assert(!home.includes('list.appendChild'));
assert((await readFile('public/greenhouse.html','utf8')).includes('nothing here is an offer of securities'));
assert((await readFile('public/robots.txt','utf8')).includes(origin+'/sitemap.xml'));
console.log('17 pages checked: unique metadata, canonical URLs, sitemap, schema, headings, scripts, local links, brand content and Bandersnatch consolidation.');
