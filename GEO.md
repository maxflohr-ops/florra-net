> **Superseded Nov 22 2026.** florra.net is now the management-only site from branch `mgmt-only` (this branch has it merged in). See AGENTS.md. Do not `vercel --prod` from the Codex branch: it would restore the old full site. The management version of this GEO pass is scripts/geo-mgmt.mjs.

# GEO pass (AI search visibility), Nov 22 2026

Production builds from the local Codex branch `codex/show-uploader-info`, which is not on GitHub.
This branch only carries the patch. Apply it on the Codex branch:

1. Copy `scripts/geo.mjs` into the repo.
2. Copy `scripts/indexnow.mjs` too. In package.json, set: `"build": "node scripts/build.mjs && node scripts/geo.mjs && node scripts/indexnow.mjs"`
3. Deploy as usual (`vercel --prod`).

What geo.mjs does after build (it fails the build loudly if an anchor moves):
- Homepage JSON-LD: full Organization (alternateName Florra/Florra LLC, description, sameAs, OfferCatalog with live prices), founder Person, WebSite, FAQPage
- Lede under the H1 now carries the definition: "florra is an independent music company: artist management, single-song deals, and tiktok creator campaigns, founded by max flohr."
- Visible six-question FAQ section ("florra, plainly") before the founder block
- /llms.txt, AI-search-crawler robots.txt, lastmod on every sitemap URL

LIVE in production Nov 22 2026 as dpl_HT5PsHXg2VvKpiUvWKZdqALNHnvm (live source + these two scripts). The next `vercel --prod` from the Codex branch will drop these fixes unless both scripts are added there.
Do NOT merge this branch to main: main is the Aug 31 site and would roll production back.
