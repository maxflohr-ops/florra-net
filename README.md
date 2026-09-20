# florra.net

Florra's interactive flower and 17 crawlable brand pages. The production site is https://www.florra.net/.

## Build and check

Run `npm run build` and `npm test` with Node.js 22 or newer. No dependencies are needed. Vercel publishes `public/`; clean URLs serve each brand page without `.html`.

`index.html` contains the flower, brand content in `WORLDS`, current payment links, and Google Analytics. `scripts/build.mjs` generates the homepage, brand pages, search metadata, structured data, sitemap and robots file. Edit the shared `WORLDS` data to update both panels and pages. Edit the metadata map in the build script for search descriptions. Keep the greenhouse's interest-list and securities disclaimer intact.

The source was synchronized with production deployment `dpl_AAp6p5oP6NrF55MUoFdoXeQaLKg7` before the SEO changes, preserving its newer Cited section, payment links, Redstring domain, social artwork and security headers. Assets now live in the repository; builds do not fetch and patch an older GitHub page or depend on Supabase to assemble artwork. The existing live Redstring case feed still uses its public read-only endpoint.

## Design system

`scripts/editorial.mjs` creates the editorial homepage and brand layouts. `assets/editorial.css` controls the shared paper, forest-green and terracotta palette, typography, floral studies and responsive layouts. `assets/editorial.js` handles directory filters and accessible panel focus. The hero combines botanical image textures with an articulated WebGL flower in `assets/enchanted-rose.js`. The local Three.js runtime and license are in `assets/vendor/`. It includes accessible project controls, reduced-motion support, loading fallbacks, and pauses offscreen or behind a project panel. The build removes the obsolete inline renderer and background animation loop.

## Search Console

The domain property was verified on September 20, 2026. The sitemap was submitted successfully with 18 discovered URLs. Search Console reported the homepage indexed, and a fresh indexing request was submitted. Search Console access is required to confirm indexing, selected canonicals, queries, impressions and Core Web Vitals. These changes do not guarantee ranking or indexing. Separate brand websites are outside this change.
