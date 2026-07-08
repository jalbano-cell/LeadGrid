# LeadGrid — local setup

A single-file B2B lead-generation prototype: interactive MapLibre + CARTO map, CRM, Lead Finder
(Google Places), routes, calendar, reps, and an AI outreach drawer. Everything lives in `index.html`
(HTML + CSS + JS, dependencies loaded from CDN). No build step required.

## See it locally

Pick whichever is easiest — all three work.

### 1. Just open it (fastest)
Double-click `index.html`, or drag it into a browser tab. The map, styles, and fonts load from CDN,
so you need an internet connection. Live Google Places search also works here.

> Note: a couple of browsers are strict about `fetch()` on `file://` pages. If the live Places search
> misbehaves, use option 2 or 3 (serving over `http://localhost` fixes it).

### 2. Serve it with Python (no install)
```bash
cd path/to/this/folder
python3 -m http.server 8000
# open http://localhost:8000
```

### 3. Serve it with Node (live reload while you edit)
```bash
cd path/to/this/folder
npx serve .        # static, no reload
# — or, with hot reload —
npm i -D vite && npx vite    # open the printed http://localhost:5173
```

## Live business search (optional)
Open the **Lead Finder** tab and paste a **Google Places API key** to pull real businesses onto the map
at exact coordinates. In Google Cloud you need:
- **Places API (New)** enabled
- **Billing** turned on
- The key **restricted by HTTP referrer** (so it can't be abused if someone views source)

Leave the key blank to use built-in demo data.

For production you should not expose the key in the browser — use the server route in
`places-search-route.ts` (a Next.js App Router handler) and point the app's `searchPlaces()` at
`/api/places/search` instead of calling Google directly.

## Deploy (when you want a shareable URL)
Drag this folder onto **Vercel** or **Netlify**, or:
```bash
npx vercel        # or: npx netlify deploy
```
Tiles/map need internet, which any host provides — so the map always renders once deployed.

## Files
- `index.html` — the whole app
- `places-search-route.ts` — secure server-side Google Places route for a Next.js build
- `CLAUDE_CODE_PROMPT.md` — paste into Claude Code to scaffold the local dev server
