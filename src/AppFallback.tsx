import {
  DOCK,
  KIND_HEX,
  MORE_NAV,
  ROLE_LABEL,
  SEATS,
  deriveKpis,
  displayKind,
  flowLabel,
  groupedMoreNav,
  homeLens,
  homeSubtitle,
  homeTitle,
  homeWidgets,
  intakeDefaults,
  jobCta,
  jobsForLens,
  kindHex,
  kindLabel,
  kindNote,
  money,
  type Alert,
  type Job,
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
  darkMode: boolean
  onSelect: (id: string) => void
  onTab: (tab: Tab) => void
  onRole: (role: StaffRole) => void
  onPrimary: () => void
  onSecondary: () => void
  onCreate: (kind: 'estimate' | 'service') => void
  onMore: (route: string | null) => void
  onAck: (id: string) => void
}

function MoreStub({ route, onBack }: { route: string; onBack: () => void }) {
  const item = MORE_NAV.find((row) => row.route === route)
  return (
    <section className="hero">
      <span className="kicker">MORE · {item?.href ?? `/${route}`}</span>
      <h2>{item?.label ?? route}</h2>
      <p className="addr">{item?.hint}</p>
      <p className="next">Same destination as live OdinOps. Shared Estimate → Service workflow stays on Home / Jobs / Create / Alerts.</p>
      <div className="actions">
        <button type="button" className="action secondary" onClick={onBack}>
          Back to More
        </button>
      </div>
    </section>
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
  darkMode,
  onSelect,
  onTab,
  onRole,
  onPrimary,
  onSecondary,
  onCreate,
  onMore,
  onAck,
}: Props) {
  const lens = homeLens(role)
  const seat = SEATS.find((item) => item.role === role) as Seat
  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0]
  const list = tab === 'alerts' ? [] : jobsForLens(jobs, lens, tab)
  const widgets = homeWidgets(jobs, lens)
  const unread = alerts.filter((alert) => alert.unread).length
  const cta = selected ? jobCta(selected, role) : null
  const groups = groupedMoreNav(role)
  const logo = `${import.meta.env.BASE_URL}brand/${darkMode ? 'odinops-dark' : 'odinops-light'}.jpg`

  return (
    <div className={`fallback ${darkMode ? 'dark' : 'light'}`} role="application" aria-label="OdinOps">
      <header className="header">
        <img className="logo-img" src={logo} alt="OdinOps" />
        <div className="titles">
          <h1>OdinOps</h1>
          <p>
            {homeTitle(lens)} · {ROLE_LABEL[role]}
          </p>
        </div>
        <span className="seat-chip">{seat.name.split(' ')[0]}</span>
      </header>

      <div className="scroll">
        {tab === 'home' && (
          <>
            <p className="section-label">{homeSubtitle(lens)}</p>
            <div className="widgets">
              {widgets.map((widget) => (
                <button key={widget.id} type="button" className="widget" onClick={() => onTab('jobs')}>
                  <small>{widget.label}</small>
                  <b>{widget.count}</b>
                  <small>{widget.hint}</small>
                </button>
              ))}
            </div>
            {lens === 'pulse' && (
              <div className="kpis">
                {deriveKpis(jobs).map((tile) => (
                  <div key={tile.id} className="kpi">
                    <i style={{ background: tile.id === 'pipe' ? KIND_HEX.estimate : tile.id === 'won' ? KIND_HEX.job : tile.id === 'booked' ? KIND_HEX.service : KIND_HEX.inspection }} />
                    <span>{tile.label}</span>
                    <b>{tile.value}</b>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'create' && (
          <>
            <p className="section-label">Create · /create</p>
            <p className="muted">Estimate sells and hands off. Service finishes the job.</p>
            <button
              type="button"
              className={`chooser ${intakeDefaults(role).kind === 'estimate' ? 'preferred' : ''}`}
              onClick={() => onCreate('estimate')}
            >
              <b>New estimate</b>
              <small>Price → e-sign + deposit → Ready to schedule</small>
              <em>Site visit / quote{intakeDefaults(role).kind === 'estimate' ? ' · default for this seat' : ''}</em>
            </button>
            <button
              type="button"
              className={`chooser ${intakeDefaults(role).kind === 'service' ? 'preferred' : ''}`}
              onClick={() => onCreate('service')}
            >
              <b>New service</b>
              <small>Fixed-price service or consult</small>
              <em>Install / service call{intakeDefaults(role).kind === 'service' ? ' · default for this seat' : ''}</em>
            </button>
          </>
        )}

        {tab === 'alerts' && (
          <>
            <p className="section-label">Alerts · /alerts</p>
            <div className="list">
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  className={`alert ${alert.unread ? 'selected' : ''}`}
                  onClick={() => {
                    if (alert.jobId) onSelect(alert.jobId)
                    onAck(alert.id)
                  }}
                >
                  <span className="accent" style={{ background: alert.kind === 'signed' ? KIND_HEX.estimate : '#2EEBFA' }} />
                  <span>
                    <b>{alert.title}</b>
                    <small>{alert.detail}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'more' && moreRoute && <MoreStub route={moreRoute} onBack={() => onMore(null)} />}

        {tab === 'more' && !moreRoute && (
          <>
            <p className="section-label">More · menu</p>
            {groups.map((group) => (
              <div key={group.id}>
                <p className="section-label">{group.label}</p>
                <div className="list">
                  {group.items.map((item) => (
                    <button key={item.href} type="button" className="more-link" onClick={() => onMore(item.route)}>
                      <span className="accent" style={{ background: '#2EEBFA' }} />
                      <span>
                        <b>{item.label}</b>
                        <small>
                          {item.href} · {item.hint}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="section-label">Demo role</p>
            <div className="demo-roles">
              {SEATS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.role === role ? 'on' : ''}
                  onClick={() => onRole(item.role)}
                >
                  <span>{item.name}</span>
                  <span>{ROLE_LABEL[item.role]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {(tab === 'home' || tab === 'jobs') && (
          <>
            <p className="section-label">{tab === 'jobs' ? 'Jobs · /jobs' : 'On this lens'}</p>
            <div className="list">
              {list.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className={`card ${job.id === selectedId ? 'selected' : ''}`}
                  onClick={() => onSelect(job.id)}
                >
                  <span className="accent" style={{ background: kindHex(job) }} />
                  <span>
                    <b>{job.customerName}</b>
                    <small>
                      {kindLabel(job)} · {job.title}
                    </small>
                  </span>
                  <span className="meta">
                    <b>{money(job.estimate)}</b>
                    <span className="chip" style={{ background: kindHex(job) }}>
                      {flowLabel(job)}
                    </span>
                  </span>
                </button>
              ))}
              {list.length === 0 && <p className="muted">Nothing on this lens.</p>}
            </div>
          </>
        )}

        {selected && tab !== 'create' && tab !== 'more' && (
          <section className="hero">
            <div className="hero-top">
              <span className="kicker">{displayKind(selected).toUpperCase()}</span>
              <span className="chip" style={{ background: kindHex(selected) }}>
                {flowLabel(selected)}
              </span>
            </div>
            <h2>{selected.customerName}</h2>
            <div className="job">
              {selected.title} · <em>{money(selected.estimate)}</em>
            </div>
            <div className="addr">{selected.address}{selected.crew ? ` · ${selected.crew}` : ''}</div>
            <div className="next">{cta?.attention ?? kindNote(selected)}</div>
            {tab !== 'alerts' && cta && (
              <div className="actions">
                <button type="button" className="action primary" onClick={onPrimary}>
                  {cta.primary}
                </button>
                <button type="button" className="action secondary" onClick={onSecondary}>
                  {cta.secondary}
                </button>
              </div>
            )}
          </section>
        )}

        <p className="toast">{toast}</p>
      </div>

      <nav className="dock" aria-label="Primary">
        {DOCK.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'on' : ''}
            onClick={() => {
              onMore(null)
              onTab(item.id)
            }}
          >
            {item.label}
            {item.id === 'alerts' && unread > 0 ? <span className="dot" /> : null}
          </button>
        ))}
      </nav>
    </div>
  )
}
