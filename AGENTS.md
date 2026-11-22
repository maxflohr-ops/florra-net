# florra.net: read before you deploy

Since Nov 22 2026 florra.net is the management-only site, built from the GitHub branch `mgmt-only`
(`npm run build` = scripts/build-mgmt.mjs + scripts/geo-mgmt.mjs, output in public/).

- Do NOT run `vercel --prod` from the old local Codex branch `codex/show-uploader-info` or from `main`.
  Both hold the old full site and would put every archived page back on florra.net.
- The old site is kept, not deleted: `archive/production-2026-11-22/` (snapshot of what was live) and the
  branch `archive/full-site-2026-11-22`. Old URLs redirect to / (vercel.json).
- SEO/GEO for the management site lives in scripts/geo-mgmt.mjs. Change that file, not scripts/geo.mjs
  (geo.mjs targets the old full site and is kept only for reference).
- Publishing to production needs Max's yes. Rollback targets are in the Vercel dashboard.
