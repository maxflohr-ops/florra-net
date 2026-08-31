# florra.net

the florra website — a WebGL flower where every petal is a door.

one self-contained file: `index.html`. no build step, no dependencies to install.
three.js loads from cdnjs and that is the only external request — Fable Dust is
embedded as a base64 woff2, and everything else (images, textures, styles,
scripts) is inline.

## worlds

fifteen petals + the greenhouse bud. each world is an entry in the `WORLDS` array
in `index.html` — copy, facts, buttons, and accent color (`.panel[data-w=...]`)
live there. the `TIER` map right below it decides which ring a world sits on:

- tier 0 — the roster, at the heart beside the f, in a pale pearl texture:
  ridgeclub, ebril, mckayla
- tier 1 — the flagships: florra os, redstring, bounty sounds, florra records,
  management
- tier 2 — the wider work: bandersnatch, press, content, campaigns, cleared,
  cucumbers, capsule 01
- greenhouse has no petal; it is the bud on the stem

decorative petals (a guard skirt + three filler rings) come from `DECO` and are
not clickable. never put a ring colour multiplier above 1 — three r128 overflows.

## behavior worth knowing before editing

- time of day changes the scene: day / dusk / night (night starts folded,
  fireflies, tap the f to wake it)
- petal brightness is driven by the `HEAT` array
- redstring's panel fetches the live top case from supabase (anon key, read-only)
- sound is synthesized (webaudio), opt-in via the bottom-right button
- the greenhouse is an interest list ONLY — keep the "nothing here is an offer
  of securities" line until counsel says otherwise

## deploying

**current live test URL:** https://247015855.hs-sites-na2.com/florra
— a HubSpot loader page that fetches the html from a Supabase edge function
(`florra` on project `fkkpymmshcnicretkisy`), which serves the `html` column of
`public.florra_site` row id=1.

to update the live site: upsert the new `index.html` into that row via the
passcode-gated RPC `set_florra_site(p_html, p_pass)` — grant execute to anon,
POST, revoke. (the cowork session holds the passcode; or run the SQL directly.)

**target:** vercel project + the florra.net domain, once the vercel token with
project-create scope exists. `vercel.json` is ready; deploy is just
`vercel deploy --prod` from this repo.

## brand

lowercase always. **Fable Dust** (softulka, licensed via Creative Market) is the
whole type system — display and body — embedded as a base64 woff2 in the
`@font-face` at the top of the file. Times New Roman is the fallback stack only.
To swap body copy back to Times, change `--serif` in `:root` and leave
`--display` alone.
logo kit lives in `logokit/` (12 marks, svg + png).
