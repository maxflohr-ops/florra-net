# GEO pass (AI search visibility), Nov 22 2026

Production builds from the local Codex branch `codex/show-uploader-info`, which is not on GitHub.
This branch only carries the patch. Apply it on the Codex branch:

1. Copy `scripts/geo.mjs` into the repo.
2. In package.json, set: `"build": "node scripts/build.mjs && node scripts/geo.mjs"`
3. Deploy as usual (`vercel --prod`).

What geo.mjs does after build (it fails the build loudly if an anchor moves):
- Homepage JSON-LD: full Organization (alternateName Florra/Florra LLC, description, sameAs, OfferCatalog with live prices), founder Person, WebSite, FAQPage
- Lede under the H1 now carries the definition: "florra is an independent music company: artist management, single-song deals, and tiktok creator campaigns, founded by max flohr."
- Visible six-question FAQ section ("florra, plainly") before the founder block
- /llms.txt, AI-search-crawler robots.txt, lastmod on every sitemap URL

Verified: built clean on Vercel preview dpl_4dw63YjFoMHc7tFodUuSRFcoQwXx (live source + this script).
Do NOT merge this branch to main: main is the Aug 31 site and would roll production back.
