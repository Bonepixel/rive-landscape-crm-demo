import {
  STAGE_COLOR,
  STAGE_HERO,
  STAGE_LABEL,
  counts,
  heroLine,
  money,
  nextAction,
  pipelineValue,
  type Lead,
  type Stage,
} from './crm'

const TAB: { id: Stage; label: string; tone: string }[] = [
  { id: 'newLead', label: 'New Lead', tone: 'n' },
  { id: 'estimateSent', label: 'Estimate Sent', tone: 'e' },
  { id: 'won', label: 'Won', tone: 'w' },
]

function argbToCss(argb: number): string {
  const rgb = argb & 0xffffff
  return `#${rgb.toString(16).padStart(6, '0')}`
}

type Props = {
  leads: Lead[]
  selectedId: string
  pipeline: Stage
  toast: string
  onSelect: (id: string) => void
  onPipeline: (stage: Stage) => void
  onNewLead: () => void
  onSendEstimate: () => void
  onCall: () => void
}

export function CrmFallback({
  leads,
  selectedId,
  pipeline,
  toast,
  onSelect,
  onPipeline,
  onNewLead,
  onSendEstimate,
  onCall,
}: Props) {
  const selected = leads.find((lead) => lead.id === selectedId) ?? leads[0]
  const tally = counts(leads)

  return (
    <div className="fallback" role="application" aria-label="GreenField Landscapes sales">
      <header className="header">
        <div className="title-row">
          <div className="logo" aria-hidden="true">
            <div className="logo-leaf" />
          </div>
          <div className="titles">
            <h1>GreenField Landscapes</h1>
            <p>Sales · Field CRM</p>
          </div>
        </div>
        <div className="value-chip">{pipelineValue(leads)}</div>
      </header>

      <div className="tabs" role="tablist">
        {TAB.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={pipeline === tab.id}
            className={`tab ${pipeline === tab.id ? 'on' : ''}`}
            onClick={() => onPipeline(tab.id)}
          >
            <span>{tab.label}</span>
            <strong className={tab.tone}>{tally[tab.id]}</strong>
          </button>
        ))}
      </div>

      <div className="list">
        {leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            className={`card ${lead.id === selectedId ? 'selected' : ''}`}
            onClick={() => onSelect(lead.id)}
          >
            <span className="accent" style={{ background: argbToCss(STAGE_COLOR[lead.status]) }} />
            <span>
              <b>{lead.customerName}</b>
              <small>{lead.jobType}</small>
            </span>
            <span className="meta">
              <b>{money(lead.estimate)}</b>
              <span
                className="chip"
                style={{ background: argbToCss(STAGE_COLOR[lead.status]) }}
              >
                {STAGE_LABEL[lead.status]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <section className="hero">
          <div className="hero-top">
            <span className="kicker">SELECTED JOB</span>
            <span
              className="chip"
              style={{ background: argbToCss(STAGE_COLOR[selected.status]) }}
            >
              {STAGE_HERO[selected.status]}
            </span>
          </div>
          <h2>{selected.customerName}</h2>
          <div className="job">
            {selected.jobType} · <em>{money(selected.estimate)}</em>
          </div>
          <div className="addr">{heroLine(selected)}</div>
          <div className="next">{nextAction(selected.status)}</div>
        </section>
      )}

      <div className="actions">
        <button type="button" className="action new" onClick={onNewLead}>
          New lead
        </button>
        <button type="button" className="action estimate" onClick={onSendEstimate}>
          Send estimate
        </button>
        <button type="button" className="action call" onClick={onCall}>
          Call
        </button>
      </div>

      <div className="toast">{toast}</div>
    </div>
  )
}
