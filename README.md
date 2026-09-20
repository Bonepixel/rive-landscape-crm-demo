# OdinOps · Landscape office

Phone-testable **landscape contractor office** walkthrough. Chrome is **OdinOps** (purple / navy / electric cyan). Sample jobs stay landscaping: lawn, patio, irrigation, trees, garden beds.

UI is authored with the official [Rive App CLI](https://rive.app/docs/cli/overview) (reusable Components + view models, no Luau) and hosted in React with `@rive-app/react-webgl2`.

Live: **https://bonepixel.github.io/rive-landscape-crm-demo/**

## Roles (shared React store)

Actions in one role show up in the others.

| Role | Sees | Primary | Secondary |
|---|---|---|---|
| **Intake** | Inquiries + new leads | New walk-in | Send to sales |
| **Sales** | New / estimate / won | Send estimate | Call |
| **Scheduler** | Week slots | Assign crew | Next slot |
| **Office admin** | All jobs + status chips | Confirm status | Hold |
| **Owner** | KPI tiles | Refresh KPIs | Review week |
| **Foreman** | Booked / on site | Start job | Delay |
| **Workers** | Assigned tasks | Check off | Need help |

Happy path: **Intake** send Maya to sales → **Sales** estimate then won → **Scheduler** assign crew → **Foreman** start job → **Workers** check off → **Owner** KPIs and **Admin** chips update.

## Brand tokens

| Token | Hex | Use |
|---|---|---|
| Midnight | `#070612` | Dark shell |
| Navy | `#1A1240` | Surfaces |
| Purple | `#2A1B5C` | Idle chips |
| Royal violet | `#6E4AFF` | Booked / secondary accent |
| **Electric cyan** | `#00E5FF` | CTAs, active role, focus, motion flash |
| Hot cyan | `#5CFFF1` | Labels on dark |
| Magenta | `#FF3D8A` | Estimate / hold (sparing) |
| Lime | `#C6FF4D` | Won / success (sparing) |
| Paper | `#F4F1FF` | Cards + light text |

Light shell: paper / lavender (`#E8E2F8`) with navy type. Toggle **Light/Dark** in the status bar (defaults to the system scheme).

### Logos

| File | Where |
|---|---|
| `public/brand/odinops-light.svg` (+ `.png`) | Light lockup |
| `public/brand/odinops-dark.svg` (+ `.png`) | Dark lockup |
| `public/brand/odinops-mark.svg` (+ `.png`) | Raven mark |
| `rive/brand/odinops-mark.png` | Embedded Rive `ImageAsset` `LogoMark` |

Header uses the mark in Rive (`App.logo`) and the lockup in the HTML fallback.

## Rive Components

Reusable artboards (`isComponent` + `ComponentAsset`), each with its own state machine:

- **RoleChip** — press + selected (cyan)
- **JobCard** — list enter, press, select settle
- **KpiTile** — value-change tick
- **ActionButton** — press, primary breathe, success pulse
- **StatusPill** — idle pulse + tick
- **DaySlot** — press, select, assign highlight

## View models

`App` (root) · `Session.activeRole` · `Pipeline` · `Job` · `ScheduleDay` · `CrewMember` · `Kpis` · plus component VMs `RoleNav`, `KpiTile`, `Button`, `Pill`.

React owns the store and pushes values through `@rive-app/react-webgl2` (`autoBind`, `list()`, nested `viewModel()` / path writes, triggers).

## Motion

- Role switch: content slide + crossfade (`roleSwitch` trigger)
- Cards: enter scale/opacity, press, cyan select stroke
- Primary actions: success pulse on the button + cyan/magenta/lime burst
- KPI tiles + status pills: tick when values change
- Scheduler: slot highlight when a crew is assigned
- Idle: light logo + primary CTA breathe

## Try it on a phone

1. Open the Pages URL (or `npm run dev` on the same Wi‑Fi).
2. Toggle **Light/Dark**.
3. Walk Maya: Intake **Send to sales** → Sales **Send estimate** twice → Scheduler **Assign crew** → Foreman **Start job** → Crew **Check off**.
4. Open **Owner** and **Admin** — KPIs and chips should have moved.
5. `?fallback=1` forces the HTML shell (same store + CSS motion).

## Local run

```bash
npm install
npm run dev
```

Vite `base` is `/rive-landscape-crm-demo/`:

`http://localhost:5173/rive-landscape-crm-demo/`

```bash
npm run build
npm run preview
```

## Rebuild the `.riv`

```bash
curl -fsSL https://releases.rive.app/cli/install.sh | sh
export PATH="$HOME/.rive/bin:$PATH"
npm run verify:rive
npm run build:rive
```

Sources: [`rive/`](rive/) (`scene.rml`, `components/`, `data/models.rml`, `brand/`). **No Luau**, so unsigned `--once` is web-safe. Export lands at `public/assets/landscape-crm.riv`.

## GitHub Pages

- Vite `base`: `/rive-landscape-crm-demo/`
- Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
- Expected URL: https://bonepixel.github.io/rive-landscape-crm-demo/

If Pages is not enabled (admin): **Settings → Pages → Deploy from a branch → `gh-pages` / `/`**.

## Stack

- Rive CLI 1.1 + Components + view models
- React 19 + Vite + `@rive-app/react-webgl2`
- Sample data only — no auth, database, or SMS
