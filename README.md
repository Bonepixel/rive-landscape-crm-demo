# OdinOps · phone demo

Phone-testable walkthrough of **real OdinOps** — the contract-neutral sales system at [Bonepixel/odinops](https://github.com/Bonepixel/odinops).

> Estimate sells and hands off. Service finishes the job.

Landscaping is only sample data (lawn, patio, irrigation). Information architecture, staff roles, home lenses, and the Estimate → Service handoff match the Next.js app — not a generic CRM.

Live: **https://bonepixel.github.io/rive-landscape-crm-demo/**

HTML-only shell: add `?fallback=1`.

## Screens → live OdinOps routes

| Demo tab / surface | Live route | What it is |
|---|---|---|
| Home | `/home` | Role lens (`homeLens`) — pulse / sales / schedule / crew / stops |
| Jobs | `/jobs` | Shared job book (Estimate and Service stay distinct) |
| Create | `/create` | Intake — New estimate (`Site visit / quote`) or New service (`Install / service call`) |
| Alerts | `/alerts` | Assignment / signed / shout (and ready / awaiting) |
| More | menu | Role-gated drawer from `src/lib/nav.ts` |
| More → Invoices | `/invoices` | Stub |
| More → Customers | `/customers` | Stub |
| More → Catalog | `/catalog` | Stub |
| More → Share self-book | `/book` | Stub |
| More → Forms | `/forms` | Stub |
| More → Reports | `/reports` | Stub |
| More → Team | `/team` | Stub |
| More → Crews | `/crews` | Stub |
| More → Sales | `/sales` | Stub |
| More → Permissions | `/settings` | Stub (owner / admin) |

Primary dock is always **Home · Jobs · Create · Alerts · More**. Demo role lives in the status-bar switcher (same idea as `DemoRoleSwitcher`).

## Role × home matrix

| Role | Label | `homeLens` | Home feels like |
|---|---|---|---|
| `owner` | Owner | pulse | Agenda + pipeline $ / jobs moving |
| `admin` | Admin | pulse | Same pulse, admin More items |
| `scheduling` | Office | schedule | Day board + Ready to schedule queue |
| `sales` | Sales lead | sales | Leads, drafts to write/send, awaiting deposit |
| `foreman` | Foreman | crew | Crew day / assignments |
| `worker` | Worker | stops | My jobs today |

`intakeDefaults`: sales / owner / admin open **Estimate · write**; Office opens **Service · later** (unscheduled queue); foreman / worker open **Service · schedule** (booked today).

## Shared-state tap-through

One React store (`src/odinops.ts`). A step in one seat is the same job in every other seat.

1. **Sales** — Hale is a lead → **Write estimate**. Maya is a draft → **Send for sign + deposit** → awaiting.
2. Rivera is awaiting → **Collect deposit** → Ready to schedule (signed ping).
3. **Office** — Patel (or the won Rivera) → **Schedule install** + crew (assignment ping).
4. **Foreman** — June (or the newly booked job) → **Start job**.
5. **Worker** — West Park (or the in-progress stop) → **Check off**.
6. **Owner** — Home pulse: open pipeline $, won / booked, scheduled count, ready queue.
7. **Alerts** — assignment / signed / shout so the tab is never empty.

Kinds stay distinct: **Estimate** (`Site visit / quote`) vs **Service** (`Install / service call`). After sign + deposit the same estimate record becomes a committed job the office books.

## What was removed (off-brand)

The previous demo invented a landscape CRM:

- Primary IA as **Intake / Sales / Sched / Admin / Owner / Foreman / Workers**
- Stages `inquiry → newLead → estimateSent → won`
- Walk-in “send to sales” desk flow
- `office.ts` / `OfficeFallback` / `OfficeRive` role model

Those are gone. Dock, seats, lenses, and Create kinds now follow OdinOps.

## Brand

Official sheets + live app tokens:

| Token | Hex | Use |
|---|---|---|
| Void | `#0B0A14` | Dark shell |
| Card | `#15122C` | Surfaces |
| Navy | `#1E1B4B` | Secondary / dock idle |
| Purple | `#6D28D9` / `#A78BFA` | Accents |
| **Electric cyan** | `#22D3EE` / `#2EEBFA` | CTAs, selected dock, focus |
| Gold | `#D4AF37` | Estimate kind |
| Teal | `#2DD4BF` | Committed job |
| Orange | `#FB923C` | Service |

Light + dark. Lockup in the HTML header (`public/brand/odinops-light.jpg` / `odinops-dark.jpg`); raven mark in Rive (`LogoMark`).

## Rive

Reusable Components (`isComponent`):

- **DockItem** — Home / Jobs / Create / Alerts / More
- **JobCard** — job row, alert row, More row
- **KpiTile** — owner pulse
- **ActionButton** — cyan primary / navy secondary
- **StatusPill**
- **DaySlot** — schedule board (bound when the lens needs it)

View models: `Session` (role) · `Home` (lens) · `Job` · `Quote` · `ScheduleDay` · `Alert` · `Kpis` · `App`.

React owns the office store and binds into Rive (`autoBind`, lists, nested VMs, triggers). **No Luau.**

Motion is for role switches (`roleSwitch`) and status changes (`fireSuccess` / button pulse / KPI tick) — not decoration.

## Try it on a phone

1. Open the Pages URL (or `npm run dev` on the same Wi‑Fi).
2. Status bar: **Demo role** + Light/Dark.
3. Walk the tap-through above. Switch seats between steps — the same jobs move.
4. Dock stays Home / Jobs / Create / Alerts / More on every seat.
5. `?fallback=1` is the same store without WebGL2.

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

Sources: [`rive/`](rive/). Export: `public/assets/landscape-crm.riv`.

## GitHub Pages

- Vite `base`: `/rive-landscape-crm-demo/`
- Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
- URL: https://bonepixel.github.io/rive-landscape-crm-demo/

If Pages is not enabled: **Settings → Pages → Deploy from a branch → `gh-pages` / `/`**.

## Stack

- Rive CLI 1.1 + Components + view models
- React 19 + Vite + `@rive-app/react-webgl2`
- Sample data only — no auth, database, or SMS
