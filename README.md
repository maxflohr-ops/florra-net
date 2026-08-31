# florra.net

the florra website — a WebGL flower where every petal is a door.

one self-contained file: `index.html`. no build step, no dependencies to install.
three.js loads from cdnjs, IM Fell English from Google Fonts (stand-in until the
Fable Dust files are added), everything else — images, textures, styles, scripts —
is inline.

## worlds

ten petals + the greenhouse bud: florra os, florra records, bounty sounds,
redstring, cleared, management, studio, campaigns, press, cucumbers, greenhouse.
each world is an entry in the `WORLDS` array in `index.html` — copy, facts,
buttons, and accent color (`.panel[data-w=...]` CSS) live there.

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

lowercase always. times new roman body, display face IM Fell English (to be
replaced by Fable Dust — licensed, file pending from creative market).
logo kit lives in `logokit/` (12 marks, svg + png).
