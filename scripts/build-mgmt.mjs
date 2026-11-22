// management-only build (Nov 2026).
// The full collection build (scripts/build.mjs + WORLDS in index.html) is kept
// in the repo untouched, and the live site as it stood is snapshotted in
// archive/production-2026-11-22/. This script publishes only the management
// page plus the two working utility pages (/live and the show uploader).
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const out = 'public';
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/assets/roster`, { recursive: true });
mkdirSync(`${out}/assets/fonts`, { recursive: true });

cpSync('mgmt/index.html', `${out}/index.html`);
cpSync('mgmt/type.css', `${out}/type.css`);
for (const f of ['california-hills.jpg', 'rose-botanical.png']) cpSync(`assets/${f}`, `${out}/assets/${f}`);
cpSync('assets/roster', `${out}/assets/roster`, { recursive: true, filter: p => !p.includes('/candidates') && !p.includes('/archive') });
cpSync('assets/fonts/fable-dust.woff2', `${out}/assets/fonts/fable-dust.woff2`);
mkdirSync(`${out}/assets/og`, { recursive: true });
cpSync('assets/og', `${out}/assets/og`, { recursive: true });
cpSync('assets/og.jpg', `${out}/og.jpg`);
cpSync('assets/apple-touch-icon.png', `${out}/apple-touch-icon.png`);

// utility pages that the stream uses; unlisted, not linked from the site
const live = existsSync('archive/production-2026-11-22/live.html') ? 'archive/production-2026-11-22/live.html' : 'live/index.html';
if (existsSync(live)) { mkdirSync(`${out}/live`, { recursive: true }); cpSync(live, `${out}/live/index.html`); }
const uploader = 'archive/production-2026-11-22/the-make-it-show/uploader.html';
if (existsSync(uploader)) { mkdirSync(`${out}/the-make-it-show/uploader`, { recursive: true }); cpSync(uploader, `${out}/the-make-it-show/uploader/index.html`); }

writeFileSync(`${out}/404.html`, readFileSync('mgmt/index.html', 'utf8').replace('<title>florra — artist management</title>', '<title>florra</title>'));
writeFileSync(`${out}/robots.txt`, 'User-agent: *\nAllow: /\nDisallow: /live\nDisallow: /the-make-it-show/\nSitemap: https://www.florra.net/sitemap.xml\n');
writeFileSync(`${out}/sitemap.xml`, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://www.florra.net/</loc></url>\n</urlset>\n');
console.log('Built the management-only site.');
