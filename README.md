# GreenField Landscapes · Sales CRM

Phone-testable landscape contractor **sales CRM** mock. The UI is authored with the official [Rive App CLI](https://rive.app/docs/cli/overview) (RML + view models, no Luau) and hosted in React with `@rive-app/react-webgl2`.

Live: **https://bonepixel.github.io/rive-landscape-crm-demo/**

This is a field/office sales board, not a backend: leads → estimate → follow-up, with local sample jobs only.

## Try it on a phone

1. Open the Pages URL (or `npm run dev` on the same Wi‑Fi).
2. Tap **New Lead / Estimate Sent / Won** — the tab highlight and toast change.
3. Tap a job card (lawn, patio, irrigation, trees, garden beds) — the selected card scales, the chip pulses on the hero, and the detail panel updates.
4. Tap **Send estimate** — that job moves New → Estimate → Won, counts and pipeline dollars update.
5. Tap **Call** — toast shows `Calling {customer}…` (no real dialer).
6. Tap **New lead** — a walk-in consult is added to the list.

If WebGL2 is unavailable, the same interactions run on an HTML fallback (`?fallback=1` forces it).

## Local run

```bash
npm install
npm run dev
```

Vite `base` is `/rive-landscape-crm-demo/`, so the app is at:

`http://localhost:5173/rive-landscape-crm-demo/`

Production build:

```bash
npm run build
npm run preview
```

## Rebuild the `.riv`

Install the official CLI (Linux x86_64 / macOS Apple Silicon / Windows):

```bash
curl -fsSL https://releases.rive.app/cli/install.sh | sh
export PATH="$HOME/.rive/bin:$PATH"
```

Sources live in [`rive/`](rive/) (`scene.rml`, `lead_card.rml`, `data/models.rml`). There is **no Luau**, so an unsigned `--once` build is valid for the web runtime.

```bash
npm run verify:rive
npm run build:rive
```

That writes `rive/build/landscape-crm.riv` and copies it to `public/assets/landscape-crm.riv`.

```bash
rive rive --verify
rive inspect rive --summary
```

`rive rive` opens the live preview window (needs a display + libEGL).

## GitHub Pages

- Vite `base`: `/rive-landscape-crm-demo/`
- Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds on `main` and publishes `dist/` to the `gh-pages` branch.
- Expected URL: https://bonepixel.github.io/rive-landscape-crm-demo/

If Pages is not enabled yet (admin):

1. Repo **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `/ (root)`

Or:

```bash
gh api -X PUT repos/Bonepixel/rive-landscape-crm-demo/pages \
  -f build_type=legacy \
  -f source[branch]=gh-pages \
  -f source[path]='/'
```

## Stack

- Rive CLI 1.1 + RML view models / `ArtboardComponentList` / listeners
- React 19 + Vite + `@rive-app/react-webgl2`
- Sample data only — no auth, database, or SMS
