// artist-pages.mjs: one "<artist> management and contact" page per roster artist.
// Runs after build-mgmt.mjs and before geo-mgmt.mjs (which adds sitemap lastmod).
// Facts come from data/artists.json; keep to what Max has approved publicly.
import { readFileSync, writeFileSync } from 'node:fs';
const out = 'public';
const SITE = 'https://www.florra.net';
const MANAGER = 'Maxwell Flohr', MANAGER_ALT = 'Max Flohr', EMAIL = 'max@florra.net';
const artists = JSON.parse(readFileSync('data/artists.json', 'utf8'));
const src = readFileSync('mgmt/index.html', 'utf8');
const style = src.match(/<style>[\s\S]*?<\/style>/)[0];
const gtag = src.match(/<!-- Google tag[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/)[0];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const extra = `<style>
.artist-page{padding:150px 4.5vw 8vh;display:grid;grid-template-columns:.9fr 1.1fr;gap:5vw;align-items:start}
.artist-page figure{position:relative;aspect-ratio:4/5;overflow:hidden;border:1px solid var(--rule);background:#161d17}
.artist-page figure img{width:100%;height:100%;object-fit:cover;display:block}
.artist-page figcaption{position:absolute;right:10px;bottom:8px;font-size:11px;color:#efe9dc;background:rgba(20,26,21,.55);padding:2px 7px}
.artist-page h1{font-size:clamp(46px,6vw,96px);line-height:.98;margin:14px 0 22px}
.artist-page .bio{font-size:20px;color:#e4e1d2;max-width:620px}
.artist-page dl{margin-top:34px;display:grid;border-top:1px solid var(--rule)}
.artist-page dl div{display:grid;grid-template-columns:150px 1fr;gap:16px;padding:14px 0;border-bottom:1px solid var(--rule)}
.artist-page dt{color:var(--muted)}
.artist-page dd{font-size:18px}
.artist-page dd a{text-decoration:none;border-bottom:1px solid currentColor}
.artist-page .proof{margin-top:16px;font-size:16px;color:#cfd0c3}
.artist-page .proof a{color:inherit;text-decoration:none;border-bottom:1px dotted currentColor}
.artist-page dd.links a{border-bottom:none;text-decoration:underline;text-underline-offset:3px}
.back{display:inline-block;margin-top:30px;font-weight:600;font-size:14px;text-decoration:none}
@media (max-width:900px){.artist-page{grid-template-columns:1fr;padding-top:120px}.artist-page dl div{grid-template-columns:1fr;gap:4px}}
</style>`;

for (const a of artists) {
  const url = `${SITE}/${a.slug}`;
  const faqs = [
    [`Who manages ${a.name}?`, `${a.name}, ${a.kind}, is managed by ${MANAGER} (${MANAGER_ALT}) of Florra, a creator management company based online.`],
    [`How do I contact ${a.name}'s management?`, `Email ${MANAGER} at ${EMAIL}. That is the management contact for ${a.name}, for business, partnership, sync and press enquiries.`],
    [`Is ${a.name} on Florra's roster?`, `Yes. Florra's roster is Ridgeclub, Ebril and McKayla Maroney. Florra handles campaigns, touring, sync and the back office for each.`],
  ];
  const artistId = `${url}#artist`;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': a.type, '@id': artistId, name: a.name, alternateName: a.aliases, description: a.desc, url: a.site, sameAs: a.sameAs, image: SITE + a.img,
      ...(a.label ? { recordLabel: { '@type': 'Organization', name: a.label } } : {}),
      contactPoint: { '@type': 'ContactPoint', contactType: 'Management', name: `${MANAGER}, Florra`, email: EMAIL, url },
      subjectOf: { '@id': `${url}#webpage` } },
    { '@type': 'Person', '@id': `${SITE}/#max-flohr`, name: MANAGER, alternateName: MANAGER_ALT, jobTitle: 'Creator manager, founder of Florra', email: EMAIL,
      worksFor: { '@id': `${SITE}/#organization` }, knowsAbout: ['creator management'], sameAs: ['https://www.wikidata.org/wiki/Q142251150'] },
    { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Florra', legalName: 'Florra LLC', url: `${SITE}/`, email: EMAIL,
      founder: { '@id': `${SITE}/#max-flohr` }, sameAs: ['https://www.wikidata.org/wiki/Q142251143'],
      contactPoint: { '@type': 'ContactPoint', contactType: 'Creator management', email: EMAIL } },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: `${a.name} Management and Contact`, about: { '@id': artistId }, mainEntity: { '@id': artistId },
      isPartOf: { '@id': `${SITE}/#website` }, publisher: { '@id': `${SITE}/#organization` } },
    { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faqs.map(([q, t]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: t } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Florra', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: `${a.name} management`, item: url } ] },
  ] };
  const title = `${a.name} Management and Contact | Florra`;
  const description = `${a.name}, ${a.kind}, is managed by ${MANAGER} of Florra. Management contact: ${EMAIL}.`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="florra">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og/${a.slug}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(a.name)} management and contact: Maxwell Flohr, max@florra.net">
<meta name="twitter:image" content="${SITE}/assets/og/${a.slug}.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#202c23">
<link rel="icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="/assets/fonts/fable-dust.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/special-elite.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${gtag}
${style}
${extra}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/type.css">
<script src="/type.js" defer></script>
</head>
<body>
<header>
  <a class="wordmark" href="/" aria-label="florra home">flo<span class="sticky-key">r</span>ra</a>
  <nav aria-label="primary"><a href="/#roster">roster</a><a href="#contact">contact ↗</a></nav>
</header>
<main>
  <section class="artist-page" aria-labelledby="title">
    <figure><img src="${a.img.replace(/\.jpg$/, '.webp')}" alt="${esc(a.alt)}" width="${a.w}" height="${a.h}" style="object-position:${a.pos}" fetchpriority="high" decoding="async">${a.credit ? `<figcaption>photo: ${esc(a.credit)}</figcaption>` : ''}</figure>
    <div>
      <p class="label">creator management · florra</p>
      <h1 id="title">${esc(a.lower)} management &amp; contact</h1>
      <p class="bio">${esc(a.bio)}</p>
      ${a.proof ? `<p class="proof">${a.proof.map(([t,u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ')}</p>` : ''}
      <dl>
        <div><dt class="label">manager</dt><dd>${MANAGER}, florra</dd></div>
        <div><dt class="label">management contact</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div>
        ${a.label ? `<div><dt class="label">label</dt><dd>${esc(a.label.toLowerCase())}</dd></div>` : ''}
        <div><dt class="label">follow</dt><dd class="links">${(a.links||[]).map(([l,u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join(' · ')}</dd></div>
        <div><dt class="label">official</dt><dd><a href="${a.site}" target="_blank" rel="noopener">${esc(a.siteLabel)} ↗</a></dd></div>
      </dl>
      <a class="back" href="/#roster">← the full roster</a>
    </div>
  </section>
  <section class="section faq" id="faq" aria-labelledby="faq-title"><h2 id="faq-title" class="label">questions</h2><div class="faq-list">${faqs.map(([q, t]) => `<div class="faq-item"><h3>${esc(q.toLowerCase())}</h3><p>${esc(t)}</p></div>`).join('')}</div></section>
  <section class="contact" id="contact" aria-labelledby="contact-title">
    <h2 id="contact-title">reach ${esc(a.lower)}'s management.</h2>
    <a class="mail" href="mailto:${EMAIL}">${EMAIL}</a>
    <p>${MANAGER.toLowerCase()}, florra</p>
  </section>
</main>
<footer class="label"><span>© <span class="tape">2026</span> florra llc</span> <span>creator management</span></footer>
</body>
</html>
`;
  writeFileSync(`${out}/${a.slug}.html`, html);
}
// sitemap: add the artist pages
let sm = readFileSync(`${out}/sitemap.xml`, 'utf8');
sm = sm.replace('</urlset>', artists.map(a => `<url><loc>${SITE}/${a.slug}</loc></url>\n`).join('') + '</urlset>');
writeFileSync(`${out}/sitemap.xml`, sm);
console.log(`artist-pages.mjs: ${artists.map(a => a.slug).join(', ')}`);
