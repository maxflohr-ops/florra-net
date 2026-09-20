import {readFile,readdir,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const origin='https://www.florra.net';
const files=(await readdir('public')).filter(p=>p.endsWith('.html')&&p!=='404.html');
const titles=new Set(),descriptions=new Set();
const sitemap=await readFile('public/sitemap.xml','utf8');
assert.equal(files.length,19);
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
const home=await readFile('public/index.html','utf8');
assert.equal((home.match(/class="nm"/g)||[]).length,18);
assert(!home.includes('list.appendChild'));
assert((await readFile('public/greenhouse.html','utf8')).includes('nothing here is an offer of securities'));
assert((await readFile('public/robots.txt','utf8')).includes(origin+'/sitemap.xml'));
console.log('19 pages checked: unique metadata, canonical URLs, sitemap, schema, headings, scripts, local links and brand content.');
