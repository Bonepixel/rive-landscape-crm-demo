import { useState } from 'react'
import {
  DOCK,
  HOME_DATE_LINE,
  JOB_FILTERS,
  KIND_HEX,
  MORE_NAV,
  ORG,
  OVERFLOW,
  ROLE_LABEL,
  SEATS,
  alertTone,
  createLanes,
  deriveKpis,
  displayKind,
  emptyCopy,
  featuredJob,
  flowLabel,
  groupedMoreNav,
  homeLens,
  homeNextActions,
  homeStopCountLabel,
  homeTitle,
  initials,
  jobCta,
  jobsForLens,
  kindHex,
  kindLabel,
  laneHex,
  money,
  filterJobs,
  type Alert,
  type CreateLane,
  type Job,
  type JobFilter,
  type Seat,
  type StaffRole,
  type Tab,
} from './odinops'

type Props = {
  jobs: Job[]
  alerts: Alert[]
  selectedId: string
  role: StaffRole
  tab: Tab
  moreRoute: string | null
  toast: string
  canUndo: boolean
  darkMode: boolean
  sheetOpen: boolean
  burst: boolean
  onSelect: (id: string) => void
  onTab: (tab: Tab) => void
  onRole: (role: StaffRole) => void
  onPrimary: () => void
  onOverflow: (action: string) => void
  onCreate: (lane: CreateLane) => void
  onMore: (route: string | null) => void
  onAck: (id: string) => void
  onUndo: () => void
  onTheme: () => void
  onOpenSheet: (open: boolean) => void
}

const ICONS: Record<string, string> = {
  home: '⌂',
  jobs: '☰',
  create: '+',
  alerts: '⌁',
  more: '···',
}

function MoreStub({ route, onBack }: { route: string; onBack: () => void }) {
  const item = MORE_NAV.find((row) => row.route === route)
  return (
    <section className="now">
      <span className="kicker">{item?.href ?? `/${route}`}</span>
      <h2>{item?.label ?? route}</h2>
      <p className="reason">{item?.hint}</p>
      <button type="button" className="cta" onClick={onBack}>
        Back
      </button>
    </section>
  )
}

function JobRow({
  job,
  selected,
  pulse,
  onClick,
}: {
  job: Job
  selected?: boolean
  pulse?: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className={`row ${selected ? 'selected' : ''}`} onClick={onClick}>
      <span className={`pin ${pulse ? 'pulse' : ''}`} style={{ background: kindHex(job), color: kindHex(job) }} />
      <span className="copy">
        <b>{job.customerName}</b>
        <small>
          {kindLabel(job)} · {job.title}
        </small>
      </span>
      <span className="meta">
        <b>{job.estimate ? money(job.estimate) : '—'}</b>
        <span className="pill" style={{ background: kindHex(job) }}>
          {flowLabel(job)}
        </span>
      </span>
      <span className="chev" aria-hidden>
        ›
      </span>
    </button>
  )
}

export function AppFallback({
  jobs,
  alerts,
  selectedId,
  role,
  tab,
  moreRoute,
  toast,
  canUndo,
  darkMode,
  sheetOpen,
  burst,
  onSelect,
  onTab,
  onRole,
  onPrimary,
  onOverflow,
  onCreate,
  onMore,
  onAck,
  onUndo,
  onTheme,
  onOpenSheet,
}: Props) {
  const lens = homeLens(role)
  const seat = SEATS.find((item) => item.role === role) as Seat
  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0]
  const homeList = jobsForLens(jobs, lens, 'home')
  const [filter, setFilter] = useState<JobFilter>('all')
  const jobList = filterJobs(jobs, filter)
  const widgets = homeNextActions(jobs, lens)
  const unread = alerts.filter((alert) => alert.unread).length
  const now = featuredJob(jobs, lens, role)
  const cta = (sheetOpen ? selected : now) ? jobCta((sheetOpen ? selected : now) as Job, role) : null
  const groups = groupedMoreNav(role)
  const lanes = createLanes(role)
  const kpis = deriveKpis(jobs)
  const mark = `${import.meta.env.BASE_URL}brand/odinops-mark.png`
  const [menu, setMenu] = useState(false)
  const [seatsOpen, setSeatsOpen] = useState(false)
  const empty = emptyCopy(lens, tab)

  const openJob = (id: string) => {
    onSelect(id)
    onOpenSheet(true)
    setMenu(false)
  }

  return (
    <div className={`fallback ${darkMode ? 'dark' : 'light'}`} role="application" aria-label="OdinOps">
      <header className="topbar">
        <span className="avatar">{initials(seat.name)}</span>
        <div className="who">
          <b>{seat.name}</b>
          <small>
            {ORG} · {ROLE_LABEL[role]}
          </small>
        </div>
        <img className="mark" src={mark} alt="" />
      </header>

      {tab === 'jobs' && (
        <div className="segs" role="tablist" aria-label="Kind">
          {JOB_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={filter === item.id ? 'on' : ''}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className={`scroll ${tab === 'home' ? 'switch' : ''}`}>
        {tab === 'home' && (
          <>
            <div className="run-header">
              <div>
                <h1>{homeTitle(lens)}</h1>
                <p>{HOME_DATE_LINE}</p>
              </div>
              <span className="count-pill">{homeStopCountLabel(homeList.length)}</span>
            </div>

            {lens === 'pulse' && (
              <div className="kpis">
                {kpis.map((tile) => (
                  <div key={tile.id} className="kpi">
                    <i style={{ background: tile.hex }} />
                    <span>{tile.label}</span>
                    <b>{tile.value}</b>
                  </div>
                ))}
              </div>
            )}

            <p className="section-label">Next</p>
            <div className="stack">
              {widgets.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  className={`widget ${widget.featured ? 'featured' : ''}`}
                  onClick={() => onTab('jobs')}
                >
                  <b>{widget.count}</b>
                  <span>
                    <strong>{widget.label}</strong>
                    <small>{widget.hint}</small>
                  </span>
                  <span className="pin" style={{ background: KIND_HEX[widget.tone] }} />
                </button>
              ))}
            </div>

            <p className="section-label">Do this now</p>
            {now ? (
              <section className="now">
                <div className="sheet-top">
                  <span className="kicker">{kindLabel(now)}</span>
                  <span className="pill" style={{ background: kindHex(now) }}>
                    {flowLabel(now)}
                  </span>
                </div>
                <h2>{now.customerName}</h2>
                <p className="reason">
                  {now.title} · {now.estimate ? money(now.estimate) : '—'}
                </p>
                <button
                  type="button"
                  className={`cta ${burst ? 'burst' : ''}`}
                  disabled={cta?.disabled}
                  onClick={onPrimary}
                >
                  {cta?.primary}
                </button>
                {cta?.disabled && <p className="reason">{cta.reason}</p>}
              </section>
            ) : (
              <div className="empty">
                <b>{empty.title}</b>
                {empty.body}
              </div>
            )}
          </>
        )}

        {tab === 'jobs' && (
          <>
            <div className="stack">
              {jobList.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  selected={job.id === selectedId}
                  pulse={job.id === selectedId && burst}
                  onClick={() => openJob(job.id)}
                />
              ))}
              {jobList.length === 0 && (
                <div className="empty">
                  <b>{empty.title}</b>
                  {empty.body}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'create' && (
          <>
            <section className="banner">
              <h2>What do you want?</h2>
              <p>Estimate sells and hands off. Service finishes the job.</p>
            </section>
            <div className="stack">
              {lanes.primary.map((lane) => (
                <button key={lane.id} type="button" className="lane" onClick={() => onCreate(lane)}>
                  <span className="well" style={{ background: `${laneHex(lane.tone)}22`, color: laneHex(lane.tone) }}>
                    {lane.label[0]}
                  </span>
                  <span className="copy">
                    <b>{lane.label}</b>
                    <small>{lane.hint}</small>
                  </span>
                </button>
              ))}
            </div>
            {lanes.also.length > 0 && (
              <>
                <p className="section-label">Also</p>
                <div className="stack">
                  {lanes.also.map((lane) => (
                    <button key={lane.id} type="button" className="lane" onClick={() => onCreate(lane)}>
                      <span className="well" style={{ background: `${laneHex(lane.tone)}22`, color: laneHex(lane.tone) }}>
                        {lane.label[0]}
                      </span>
                      <span className="copy">
                        <b>{lane.label}</b>
                        <small>{lane.hint}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'alerts' && (
          <div className="stack">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                className="alert"
                onClick={() => {
                  if (alert.jobId) openJob(alert.jobId)
                  onAck(alert.id)
                }}
              >
                <span className="pin" style={{ background: alert.unread ? '#2EEBFA' : alertTone(alert.kind) }} />
                <span className="copy">
                  <b>{alert.title}</b>
                  <small>{alert.detail}</small>
                </span>
                <span className="time">{alert.time}</span>
              </button>
            ))}
            {alerts.length === 0 && (
              <div className="empty">
                <b>{empty.title}</b>
                {empty.body}
              </div>
            )}
          </div>
        )}

        {tab === 'more' && moreRoute && <MoreStub route={moreRoute} onBack={() => onMore(null)} />}

        {tab === 'more' && !moreRoute && (
          <>
            {groups.map((group) => (
              <div key={group.id}>
                <p className="section-label">{group.label}</p>
                <div className="stack">
                  {group.items.map((item) => (
                    <button key={item.href} type="button" className="more-link" onClick={() => onMore(item.route)}>
                      <span className="pin" style={{ background: '#2EEBFA' }} />
                      <span className="copy">
                        <b>{item.label}</b>
                        <small>{item.hint}</small>
                      </span>
                      <span className="chev">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="theme-row">
              <span>Appearance</span>
              <button type="button" onClick={onTheme}>
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
            <p className="section-label">Demo seat</p>
            <button type="button" className="lane" onClick={() => setSeatsOpen((value) => !value)}>
              <span className="avatar">{initials(seat.name)}</span>
              <span className="copy">
                <b>{seat.name}</b>
                <small>{ROLE_LABEL[role]} · {ORG}</small>
              </span>
              <span className="chev">{seatsOpen ? '⌃' : '›'}</span>
            </button>
            {seatsOpen && (
              <div className="seats">
                {SEATS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.role === role ? 'on' : ''}
                    onClick={() => {
                      onRole(item.role)
                      setSeatsOpen(false)
                    }}
                  >
                    <span>{item.name}</span>
                    <span>{ROLE_LABEL[item.role]}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {sheetOpen && selected && (
        <div className="sheet" onClick={() => onOpenSheet(false)}>
          <div className="sheet-card" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-top">
              <span className="kicker">{displayKind(selected).toUpperCase()}</span>
              <div className="overflow">
                <button type="button" aria-label="More actions" onClick={() => setMenu((value) => !value)}>
                  ···
                </button>
                {menu && (
                  <div className="menu">
                    {OVERFLOW.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          onOverflow(item)
                          setMenu(false)
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <h2>{selected.customerName}</h2>
            <p className="reason">
              {kindLabel(selected)} · {selected.title} · {selected.estimate ? money(selected.estimate) : '—'}
            </p>
            <p className="reason">
              {selected.address}
              {selected.crew ? ` · ${selected.crew}` : ''}
            </p>
            <span className="pill" style={{ background: kindHex(selected) }}>
              {flowLabel(selected)}
            </span>
            <button
              type="button"
              className={`cta ${burst ? 'burst' : ''}`}
              disabled={jobCta(selected, role).disabled}
              onClick={onPrimary}
            >
              {jobCta(selected, role).primary}
            </button>
            {jobCta(selected, role).disabled && <p className="reason">{jobCta(selected, role).reason}</p>}
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span>{toast}</span>
          {canUndo && (
            <button type="button" onClick={onUndo}>
              Undo
            </button>
          )}
        </div>
      )}

      <nav className="dock" aria-label="Primary">
        {DOCK.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'on' : ''}
            onClick={() => {
              onMore(null)
              onOpenSheet(false)
              onTab(item.id)
            }}
          >
            <span className="glyph">{ICONS[item.icon]}</span>
            {item.label}
            {item.id === 'alerts' && unread > 0 ? <span className="dot" /> : null}
          </button>
        ))}
      </nav>
    </div>
  )
}
