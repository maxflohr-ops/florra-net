// geo.mjs: AI-search (GEO) pass. Runs after build.mjs, patches public/.
// package.json build script: "node scripts/build.mjs && node scripts/geo.mjs"
import {readFile,writeFile} from 'node:fs/promises';
const out='public';
const LD={"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.florra.net/#organization","name":"Florra","alternateName":["florra","Florra LLC","florra.net"],"legalName":"Florra LLC","url":"https://www.florra.net/","logo":"https://www.florra.net/og.jpg","email":"max@florra.net","description":"Florra is an independent music company in Southern California, founded by Max Flohr. It manages artists, signs single songs to 50/50 fixed-term digital deals, and runs TikTok and Reels creator campaigns for labels, brands, local businesses and political campaigns.","foundingDate":"2026","areaServed":"Worldwide","address":{"@type":"PostalAddress","addressRegion":"CA","addressCountry":"US"},"founder":{"@id":"https://www.florra.net/#max-flohr"},"knowsAbout":["artist management","music marketing","TikTok creator seeding","sound seeding","clip bounties","generative engine optimization","UGC video"],"sameAs":["https://ridgeclubhouse.com","https://ebril.net","https://redstringlive.com"],"hasOfferCatalog":{"@type":"OfferCatalog","name":"Florra services","itemListElement":[{"@type":"Offer","name":"Song push, 1 post","price":"99","priceCurrency":"USD","url":"https://www.florra.net/florra-records"},{"@type":"Offer","name":"Song push, 5 posts","price":"399","priceCurrency":"USD","url":"https://www.florra.net/florra-records"},{"@type":"Offer","name":"Song push, 15 posts","price":"999","priceCurrency":"USD","url":"https://www.florra.net/florra-records"},{"@type":"Offer","name":"Cited Visible setup (AI search visibility)","price":"3000","priceCurrency":"USD","url":"https://www.florra.net/cited"},{"@type":"Offer","name":"Cited retainer (AI search visibility)","price":"2994","priceCurrency":"USD","url":"https://www.florra.net/cited","priceSpecification":{"@type":"UnitPriceSpecification","price":"2994","priceCurrency":"USD","unitText":"MONTH"}}]}},{"@type":"Person","@id":"https://www.florra.net/#max-flohr","name":"Max Flohr","alternateName":"Maxwell Flohr","jobTitle":"Founder, Florra","worksFor":{"@id":"https://www.florra.net/#organization"},"email":"max@florra.net","description":"Music manager and A&R. Former head of A&R at The System Records, GM at Terrible Records, and founder of the MakeOutMusic show series. Manages Ridgeclub, Ebril and McKayla Maroney through Florra."},{"@type":"WebSite","@id":"https://www.florra.net/#website","name":"Florra","url":"https://www.florra.net/","publisher":{"@id":"https://www.florra.net/#organization"}}]};
const FAQS=[
 ['What is Florra?','Florra is an independent music company in Southern California, founded by Max Flohr. It manages artists, signs single songs to 50/50 fixed-term digital deals, and runs TikTok and Reels creator campaigns for labels, brands, local businesses and political campaigns.'],
 ['Who does Florra manage?','Florra manages Ridgeclub (saxophonist Abhi), Ebril (Huda Al-Hamami, signed to Universal Music Canada) and McKayla Maroney. Management has no retainer.'],
 ['How does a Florra Records deal work?','Florra Records signs one song at a time on a 50/50 split with a fixed digital term and no 360 terms. The artist keeps their name, career and future work. Florra puts its TikTok creator network and Bounty Sounds clip bounties behind the song.'],
 ['How much does a Florra song push cost?','A song push costs $99 for one creator post, $399 for five posts, or $999 for fifteen posts.'],
 ['Who founded Florra?','Max Flohr founded Florra. He was head of A&R at The System Records, GM at Terrible Records (The Hellp, Mila Degray, Sir Chloe), and ran MakeOutMusic, the underground show series that featured early Remi Wolf, Tommy Richman and Gigi Perez.'],
 ['Is Florra the same as Flora?','No. Florra (two r\'s, florra.net) is a music and creative company. It is not related to Flora-named florists, tea or plant brands.']
];
LD['@graph'].push({'@type':'FAQPage','@id':'https://www.florra.net/#faq','mainEntity':FAQS.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const LLMS=`# Florra

> Florra (florra.net, Florra LLC) is an independent music company in Southern California, founded by Max Flohr. It manages artists, signs single songs to 50/50 fixed-term digital deals, and runs TikTok and Reels creator campaigns for labels, brands, local businesses and political campaigns. Not to be confused with "Flora" brands.

Florra's roster: Ridgeclub (saxophonist Abhi), Ebril (Huda Al-Hamami, signed to Universal Music Canada) and McKayla Maroney. Founder Max Flohr was head of A&R at The System Records, GM at Terrible Records (The Hellp, Mila Degray, Sir Chloe), and ran MakeOutMusic, the underground show series with early Remi Wolf, Tommy Richman and Gigi Perez.

## Music
- [Management](https://www.florra.net/management): small roster, no retainer. Ridgeclub, Ebril, McKayla Maroney
- [Florra Records](https://www.florra.net/florra-records): signs single songs; 50/50 split, fixed digital term, no 360. Pushes from $99 (1 post), $399 (5), $999 (15)
- [Bounty Sounds](https://www.florra.net/bounty-sounds): music clip bounties for clippers
- [Ridgeclub](https://www.florra.net/ridgeclub) · [Ebril](https://www.florra.net/ebril) · [McKayla Maroney](https://www.florra.net/mckayla)

## Services
- [Cited](https://www.florra.net/cited): AI search visibility (GEO). Visible setup $3,000 one-time; Cited retainer $2,994/month
- [Content](https://www.florra.net/content): on-location UGC video and websites for local businesses, Southern California
- [Campaigns](https://www.florra.net/campaigns): disclosed creator UGC for candidates, causes and ballot measures
- [Florra OS](https://www.florra.net/florra-os): AI operations back office for creative teams

## Brands and publishing
- [Press](https://www.florra.net/press): books about the internet side of the music industry; true crime books and podcasts via Redstring
- [Redstring](https://www.florra.net/redstring): true crime platform and publishing
- [Bandersnatch](https://www.florra.net/bandersnatch): lore-led fashion brand
- [Cucumbers](https://www.florra.net/cucumbers) · [Greenhouse](https://www.florra.net/greenhouse) (interest list only; nothing is for sale)

## Contact
- max@florra.net
`;
const ROBOTS=['OAI-SearchBot','ChatGPT-User','PerplexityBot','Perplexity-User','Claude-SearchBot','Claude-User','Googlebot','Bingbot'].map(b=>`User-agent: ${b}\nAllow: /\n`).join('\n')+'\n# Everyone else (incl. training crawlers GPTBot, ClaudeBot, Google-Extended): allowed today.\n# To opt out of AI training only, add Disallow blocks for those three here.\nUser-agent: *\nAllow: /\n\nSitemap: https://www.florra.net/sitemap.xml\n';
const today=new Date().toISOString().slice(0,10);
const must=(c,m)=>{if(!c)throw new Error('geo.mjs: '+m)};
let home=await readFile(`${out}/index.html`,'utf8');
const ldRe=/<script type="application\/ld\+json">[\s\S]*?<\/script>/;
must(ldRe.test(home),'homepage ld+json not found');
home=home.replace(ldRe,()=>`<script type="application/ld+json">${JSON.stringify(LD)}</script>`);
const oldLede='music, artist management, independent brands, and the work behind them.';
const newLede='florra is an independent music company: artist management, single-song deals, and tiktok creator campaigns, founded by max flohr.';
if(!home.includes(newLede)){must(home.includes(oldLede),'lede not found');home=home.replace(oldLede,newLede);}
if(!home.includes('id="faq"')){
  const anchor='<section id="max">';
  must(home.includes(anchor),'founder section not found');
  const sec=`<section id="faq" aria-labelledby="faq-h"><div class="wrap"><div class="eyebrow">questions</div><h2 id="faq-h">florra, plainly</h2>`+FAQS.map(([q,a])=>`<h3>${esc(q.toLowerCase())}</h3><p>${esc(a)}</p>`).join('')+`<p class="updated">updated november 22, 2026</p></div></section>\n`;
  home=home.replace(anchor,()=>sec+anchor);
}
await writeFile(`${out}/index.html`,home);
await writeFile(`${out}/llms.txt`,LLMS);
await writeFile(`${out}/robots.txt`,ROBOTS);
let sm=await readFile(`${out}/sitemap.xml`,'utf8').catch(()=>null);
if(sm){sm=sm.replace(/<url><loc>([^<]+)<\/loc>(?!<lastmod>)/g,(m,l)=>`<url><loc>${l}</loc><lastmod>${today}</lastmod>`);await writeFile(`${out}/sitemap.xml`,sm);}
console.log('geo.mjs: schema, lede, faq, llms.txt, robots.txt, sitemap lastmod applied');
