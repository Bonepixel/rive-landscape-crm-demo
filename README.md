# OdinOps · phone

FrozenV1 OdinOps on a phone. Same Estimate → Service store as the web app. Chrome is a real mobile shell — not a labeled prototype.

> Estimate sells and hands off. Service finishes the job.

Live: **https://bonepixel.github.io/rive-landscape-crm-demo/**

HTML shell (always): `?fallback=1`  
Deep link: `?role=sales&tab=home&job=maya`

## Screens → live routes

| Demo | Live |
|---|---|
| Home | `/home` |
| Jobs | `/jobs` |
| Create | `/create` |
| Alerts | `/alerts` |
| More | drawer |
| More items | `/invoices` `/customers` `/catalog` `/book` `/forms` `/reports` `/team` `/crews` `/sales` `/settings` |

Dock is always **Home · Jobs · Create · Alerts · More**. Account switcher is **Switch account** at the bottom of More — visually quiet, no demo chrome.

## Role × home

| Role | Lens | Home |
|---|---|---|
| owner / admin | pulse | 3 KPIs (Pipeline · Won · To schedule) + next stack + Do this now |
| Office | schedule | Today’s jobs + Ready to schedule |
| Sales lead | sales | Leads · Estimates · Awaiting deposit |
| Foreman | crew | Crew day |
| Worker | stops | Next job |

Header is `HomeRunHeader`: large title, muted date, cyan stop pill.

## CTA dictionary

| State | Primary |
|---|---|
| Lead | Own lead |
| Draft | Send estimate |
| Awaiting | Deposit paid |
| Ready | Schedule |
| Scheduled | Start |
| In progress | Complete |
| Done | Close |

Secondary only in `···`: Reschedule, Reassign, Note. Disabled CTAs show a reason (e.g. Sales sees Start greyed: “Crew starts this stop”).

## Create

Chooser page: **What do you want?** Role-filtered lanes — Lead / Estimate / Service / Inspection (+ Share self-book). **Also:** invoice, team, open jobs. Kind-colored icon wells. Creating opens the job sheet + toast (“Estimate created”).

## Phone QA

1. Open Pages or `?fallback=1`. Status bar is org chrome only — no role carnival.
2. Sales home: featured Estimates widget, Maya **Send estimate**.
3. Rivera **Deposit paid** → Ready. Office **Schedule**. Foreman June **Start**. Worker West **Complete**.
4. Owner pulse: three KPI tiles, not a wall of buttons.
5. Create: four primary lanes, not two fat tiles.
6. Jobs: SegTabs All / Estimate / Job / Service / Inspection. Kind pins gold / teal / orange / violet.
7. Alerts: unread cyan dock dot. Tap marks read.
8. More → Switch account. Reload: localStorage keeps jobs. `?role=worker&tab=home` deep-links.

## Brand (FrozenV1)

void `#0B0A14` · card `#15122C` · cyan `#2EEBFA` · violet `#6B3DFF` · idle zinc  
Estimate gold `#D4AF37` · Job teal `#2DD4BF` · Service orange `#FB923C` · Inspection violet `#A78BFA`  
Flat dock `3.5rem` + safe area. No raised Create FAB.

## Rive · production craft

Rive owns the pixels (WebGL2). React is store + data binding + routing. `?fallback=1` keeps the HTML shell.

**Particle / light path: pure RML + Feather + state machines.** No Luau, no unsigned WGSL — web runtimes reject those. No `rive publish` / signing step. Particles are 16 / 12 / 6 / 5 feathered ellipses (CTA burst, deposit/close confetti, ambient dust, dock alert spark) driven by solos-free SM layers.

Atmosphere: void `#0B0A14`, violet hero bloom, vignette, cyan iris breathe on the raven mark. Cards use top-left key light + feathered highlight. Press scale 0.97. Dock active springs 2px with cyan feather glow.

Splash is a Rive overlay (`booting`) plus a short HTML shimmer until the `.riv` binds. Empty states are illustrated in-file. Vibration API fires 12ms on primary success.

## Local

```bash
npm install
npm run dev
npm run check:workflow
npm run build
```

Vite base: `/rive-landscape-crm-demo/`
