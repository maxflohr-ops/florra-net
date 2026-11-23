// geo-mgmt.mjs: AI-search (GEO) pass for the management-only site.
// Adapted from scripts/geo.mjs on branch geo/ai-search (Nov 22 2026), trimmed
// to what the one-page management site actually says. Runs after build-mgmt.
import { readFile, writeFile } from 'node:fs/promises';
const out = 'public';
const must = (c, m) => { if (!c) throw new Error('geo-mgmt.mjs: ' + m); };

const FAQS = [
  ['Who does Florra manage?', 'Florra manages Ridgeclub (saxophonist Abhi), Ebril (Huda Al-Hamami, signed to Universal Music Canada) and McKayla Maroney. Management has no retainer.'],
  ['Who runs Florra?', 'Maxwell (Max) Flohr founded Florra. He was head of A&R at The System Records, GM at Terrible Records (The Hellp, Mila Degray, Sir Chloe), and ran MakeOutMusic, the underground show series that featured early Remi Wolf, Tommy Richman and Gigi Perez.'],
  ['How do I contact management for Ridgeclub, Ebril or McKayla Maroney?', 'Email Maxwell Flohr at max@florra.net. He manages all three creators through Florra.'],
  ['Is Florra the same as Flora?', "No. Florra (two r's, florra.net) is a creator management company. It is not related to Flora-named florists, tea or plant brands."],
];

const LD = { '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': 'https://www.florra.net/#organization', name: 'Florra', alternateName: ['florra', 'Florra LLC', 'florra.net'], legalName: 'Florra LLC', url: 'https://www.florra.net/', logo: 'https://www.florra.net/assets/og/florra.jpg', email: 'max@florra.net',
    description: 'Florra is a creator management company based online, founded by Max Flohr, for multi-talented, digital-native musicians who also stream, post and build online. It manages Ridgeclub, Ebril and McKayla Maroney, with no retainer, covering music management, campaigns, touring and sync.',
    founder: { '@id': 'https://www.florra.net/#max-flohr' },
    knowsAbout: ['creator management', 'music management', 'music marketing', 'TikTok creator seeding', 'touring', 'sync'],
    sameAs: ['https://www.wikidata.org/wiki/Q142251143'] },
  { '@type': 'Person', '@id': 'https://www.florra.net/#max-flohr', name: 'Maxwell Flohr', alternateName: 'Max Flohr', jobTitle: 'Creator manager, founder of Florra', worksFor: { '@id': 'https://www.florra.net/#organization' }, email: 'max@florra.net',
    description: 'Music manager and A&R. Former head of A&R at The System Records, GM at Terrible Records, and founder of the MakeOutMusic show series. Manages Ridgeclub, Ebril and McKayla Maroney through Florra.', sameAs: ['https://www.wikidata.org/wiki/Q142251150'] },
  { '@type': 'WebSite', '@id': 'https://www.florra.net/#website', name: 'Florra', url: 'https://www.florra.net/', publisher: { '@id': 'https://www.florra.net/#organization' } },
  { '@type': 'FAQPage', '@id': 'https://www.florra.net/#faq', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
] };

const LLMS = `# Florra

> Florra (florra.net, Florra LLC) is a creator management company based online, founded by Maxwell (Max) Flohr. Music at the core: it works with multi-talented, digital-native musicians who also stream, post and build online, covering music management, campaigns, touring and sync. A small roster, growing with purpose, with no retainer. Not to be confused with "Flora" brands.

## Roster (all managed by Maxwell Flohr, management contact max@florra.net)
- Ridgeclub: saxophonist Abhi. Debut EP "Crawlspace" is out. Management and contact: https://www.florra.net/ridgeclub . Official site: https://ridgeclubhouse.com
- Ebril: Huda Al-Hamami, signed to Universal Music Canada. Debut album "In Copula", led by "Stranger in You". Management and contact: https://www.florra.net/ebril . Official site: https://www.ebril.net
- McKayla Maroney: music, livestreaming and writing. Management and contact: https://www.florra.net/mckayla-maroney . Twitch: https://twitch.tv/mckaylamaroney007

## How Florra works
Campaigns, touring, sync and the back office, handled closely. Sound-first and internet-native: creator seeding at volume and fast informal deals.

## Founder
Maxwell (Max) Flohr was head of A&R at The System Records, GM at Terrible Records (The Hellp, Mila Degray, Sir Chloe), and ran MakeOutMusic, the underground show series with early Remi Wolf, Tommy Richman and Gigi Perez.

## Contact
- Maxwell Flohr, creator management: max@florra.net
`;

const ROBOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'Googlebot', 'Bingbot']
  .map(b => `User-agent: ${b}\nAllow: /\nDisallow: /live\nDisallow: /the-make-it-show/\n`).join('\n')
  + '\n# Everyone else (incl. training crawlers GPTBot, ClaudeBot, Google-Extended): allowed today.\nUser-agent: *\nAllow: /\nDisallow: /live\nDisallow: /the-make-it-show/\n\nSitemap: https://www.florra.net/sitemap.xml\n';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let home = await readFile(`${out}/index.html`, 'utf8');
const ldRe = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
must(ldRe.test(home), 'homepage ld+json not found');
home = home.replace(ldRe, () => `<script type="application/ld+json">${JSON.stringify(LD)}</script>`);
if (!home.includes('id="faq"')) {
  const anchor = '<section class="contact" id="contact"';
  must(home.includes(anchor), 'contact section not found');
  const sec = `<section class="section faq" id="faq" aria-labelledby="faq-title"><h2 id="faq-title" class="label">questions</h2><div class="faq-list">`
    + FAQS.map(([q, a]) => `<div class="faq-item"><h3>${esc(q.toLowerCase())}</h3><p>${esc(a)}</p></div>`).join('')
    + `</div></section>\n  `;
  home = home.replace(anchor, () => sec + anchor);
}
await writeFile(`${out}/index.html`, home);
await writeFile(`${out}/llms.txt`, LLMS);
await writeFile(`${out}/robots.txt`, ROBOTS);
const today = new Date().toISOString().slice(0, 10);
let sm = await readFile(`${out}/sitemap.xml`, 'utf8');
sm = sm.replace(/<url><loc>([^<]+)<\/loc>(?!<lastmod>)/g, (m, l) => `<url><loc>${l}</loc><lastmod>${today}</lastmod>`);
await writeFile(`${out}/sitemap.xml`, sm);
// IndexNow key file (Bing, Yandex, Seznam, Naver), same key as the GEO pass
const KEY = '54f4235983673f3596a344a87cd91396';
await writeFile(`${out}/${KEY}.txt`, KEY);
console.log('geo-mgmt.mjs: schema, faq, llms.txt, robots.txt, sitemap lastmod, indexnow key applied');
