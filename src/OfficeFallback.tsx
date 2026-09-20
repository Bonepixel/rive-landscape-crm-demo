import {
  ROLES,
  STAGE_COLOR,
  STAGE_LABEL,
  daysWithJobs,
  deriveKpis,
  derivePills,
  heroMeta,
  jobsForRole,
  money,
  nextAction,
  roleCopy,
  type Job,
  type Role,
  type ScheduleDay,
} from './office'

function argbToCss(argb: number): string {
  return `#${(argb & 0xffffff).toString(16).padStart(6, '0')}`
}

type Props = {
  jobs: Job[]
  days: ScheduleDay[]
  selectedId: string
  selectedDayId: string
  role: Role
  toast: string
  darkMode: boolean
  burst: number
  onSelect: (id: string) => void
  onSelectDay: (id: string) => void
  onRole: (role: Role) => void
  onPrimary: () => void
  onSecondary: () => void
}

export function OfficeFallback({
  jobs,
  days,
  selectedId,
  selectedDayId,
  role,
  toast,
  darkMode,
  burst,
  onSelect,
  onSelectDay,
  onRole,
  onPrimary,
  onSecondary,
}: Props) {
  const copy = roleCopy(role, jobs)
  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0]
  const listJobs = jobsForRole(jobs, role).filter(() => role !== 'owner' && role !== 'scheduler')
  const showDays = role === 'scheduler'
  const kpis = role === 'owner' ? deriveKpis(jobs) : []
  const pills = role === 'admin' ? derivePills(jobs) : []
  const logo = `${import.meta.env.BASE_URL}brand/${darkMode ? 'odinops-dark' : 'odinops-light'}.jpg`

  return (
    <div
      className={`fallback ${darkMode ? 'dark' : 'light'} ${burst ? 'just-burst' : ''}`}
      role="application"
      aria-label="OdinOps landscape office"
    >
      <header className="header">
        <div className="title-row">
          <img className="logo-img" src={logo} alt="OdinOps" />
          <div className="titles">
            <h1>OdinOps</h1>
            <p>{copy.subtitle}</p>
          </div>
        </div>
        <div className="value-chip">{copy.pipelineValue}</div>
      </header>

      <div className="roles" role="tablist">
        {ROLES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={role === item.id}
            className={`role-chip ${role === item.id ? 'on' : ''}`}
            onClick={() => onRole(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="panel-head">
        <strong>{copy.panelTitle}</strong>
        <span>{copy.panelHint}</span>
      </div>

      {pills.length > 0 && (
        <div className="pills">
          {pills.map((pill) => (
            <span key={pill.id} className="pill tick" style={{ background: argbToCss(pill.color) }}>
              {pill.label}
            </span>
          ))}
        </div>
      )}

      {kpis.length > 0 && (
        <div className="kpis">
          {kpis.map((tile) => (
            <button key={tile.id} type="button" className="kpi tick">
              <i style={{ background: argbToCss(tile.accent) }} />
              <span>{tile.label}</span>
              <b>{tile.value}</b>
            </button>
          ))}
        </div>
      )}

      {showDays && (
        <div className="list">
          {daysWithJobs(days, jobs).map((day) => (
            <button
              key={day.id}
              type="button"
              className={`slot ${day.id === selectedDayId ? 'selected highlight' : ''}`}
              onClick={() => onSelectDay(day.id)}
            >
              <em>{day.day}</em>
              <span>
                <b>{day.title}</b>
                <small>
                  {day.slot} · {day.crew}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}

      {listJobs.length > 0 && (
        <div className="list">
          {listJobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className={`card ${job.id === selectedId ? 'selected' : ''}`}
              onClick={() => onSelect(job.id)}
            >
              <span className="accent" style={{ background: argbToCss(STAGE_COLOR[job.status]) }} />
              <span>
                <b>{job.customerName}</b>
                <small>{job.jobType}</small>
              </span>
              <span className="meta">
                <b>{money(job.estimate)}</b>
                <span className="chip" style={{ background: argbToCss(STAGE_COLOR[job.status]) }}>
                  {STAGE_LABEL[job.status]}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <section className="hero">
          <div className="hero-top">
            <span className="kicker">SELECTED</span>
            <span className="chip" style={{ background: argbToCss(STAGE_COLOR[selected.status]) }}>
              {STAGE_LABEL[selected.status]}
            </span>
          </div>
          <h2>{selected.customerName}</h2>
          <div className="job">
            {selected.jobType} · <em>{money(selected.estimate)}</em>
          </div>
          <div className="addr">{heroMeta(selected)}</div>
          <div className="next">{nextAction(selected, role)}</div>
        </section>
      )}

      <div className="actions">
        <button type="button" className="action estimate" onClick={onPrimary}>
          {copy.primary}
        </button>
        <button type="button" className="action call" onClick={onSecondary}>
          {copy.secondary}
        </button>
      </div>
      <div className="toast">{toast}</div>
    </div>
  )
}
