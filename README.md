# LeadGrid — local setup

A single-file B2B lead-generation prototype: interactive Google Maps view, CRM, Lead Finder
(Google Places), routes, calendar, reps, and an AI outreach drawer. Everything lives in `index.html`
(HTML + CSS + JS, dependencies loaded from CDN). No build step required, though this repo also has a
minimal Vite dev server set up (`npm run dev`) for live reload while editing.

## Google Cloud setup (required — the map won't load without this)

1. Create/select a project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable billing on the project — required even within the free-tier monthly allowances.
3. Enable **Maps JavaScript API** and **Places API (New)** (APIs & Services → Library).
4. Create an API key (APIs & Services → Credentials → Create Credentials → API key).
5. Restrict it:
   - Application restriction: HTTP referrers — add `http://localhost:5173/*` for this repo's Vite
     dev server, plus any deployed URL later.
   - API restriction: limit the key to the two APIs above.
   - Note: a referrer-restricted key rejects `file://` origins — use `npm run dev` rather than
     double-clicking `index.html` once the key is restricted.
6. Recommended (~2 min, free): create one real Map ID (Google Maps Platform → Map Management →
   Create Map ID → Vector → default style) and turn off the "Points of interest" layer in its Style
   Editor, so Google's own business icons don't clash with LeadGrid's custom pins. Leaving the Map ID
   field blank in the app falls back to Google's public `DEMO_MAP_ID`, which works immediately but is
   documented by Google as testing-only.

Paste the API key (and Map ID, if you made one) into the "Connect Google Maps" card shown on first
load — it's saved in your browser's `localStorage` from then on, and the same key is shared with
Lead Finder's search.

## Run it locally

```bash
cd path/to/this/folder
npm install
npm run dev    # open the printed http://localhost:5173
```

## Live business search
The **Lead Finder** tab searches Google Places directly from the browser using the same API key you
entered for the map. Type a business type + area and hit **Find leads** — results include exact
coordinates, address, phone, rating, and website presence, and can be added straight to the CRM.

For production you should not expose the key in the browser — use the server route in
`places-search-route.ts` (a Next.js App Router handler) and point the app's `searchPlaces()` at
`/api/places/search` instead of calling Google directly.

## Deploy (when you want a shareable URL)
Drag this folder onto **Vercel** or **Netlify**, or:
```bash
npx vercel        # or: npx netlify deploy
```
Remember to add the deployed URL to the API key's HTTP referrer restriction in Google Cloud Console.

## Files
- `index.html` — the whole app
- `places-search-route.ts` — secure server-side Google Places route for a Next.js build
- `CLAUDE_CODE_PROMPT.md` — paste into Claude Code to scaffold the local dev server
