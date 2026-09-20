import { useCallback, useMemo, useState } from 'react'
import './App.css'
import { AppFallback } from './AppFallback'
import { AppRive } from './AppRive'
import {
  ROLE_LABEL,
  SAMPLE_JOBS,
  SEATS,
  applyPrimary,
  createJob,
  deriveKpis,
  groupedMoreNav,
  homeLens,
  homeWidgets,
  jobCta,
  jobsForLens,
  seedAlerts,
  tabByIndex,
  type Alert,
  type Job,
  type StaffRole,
  type Tab,
} from './odinops'

function supportsWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'))
  } catch {
    return false
  }
}

function forceFallback(): boolean {
  return new URLSearchParams(window.location.search).has('fallback')
}

function prefersDark(): boolean {
  return !window.matchMedia('(prefers-color-scheme: light)').matches
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS)
  const [alerts, setAlerts] = useState<Alert[]>(() => seedAlerts(SAMPLE_JOBS))
  const [selectedId, setSelectedId] = useState(SAMPLE_JOBS[1].id)
  const [role, setRole] = useState<StaffRole>('sales')
  const [tab, setTab] = useState<Tab>('home')
  const [moreRoute, setMoreRoute] = useState<string | null>(null)
  const [toast, setToast] = useState('Sales home — write Maya, then send')
  const [darkMode, setDarkMode] = useState(prefersDark)
  const [burst, setBurst] = useState(0)
  const [riveReady, setRiveReady] = useState(false)
  const [riveFailed, setRiveFailed] = useState(() => !supportsWebGL2() || forceFallback())

  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) ?? jobs[0],
    [jobs, selectedId],
  )

  const flash = useCallback((message: string) => {
    setToast(message)
    setBurst((value) => value + 1)
  }, [])

  const onSelect = useCallback((id: string) => {
    const job = jobs.find((item) => item.id === id)
    if (!job) return
    setSelectedId(id)
    setToast(`${job.customerName} · ${job.title}`)
  }, [jobs])

  const onSelectJobIndex = useCallback((index: number) => {
    const list = jobsForLens(jobs, homeLens(role), tab === 'alerts' ? 'jobs' : tab)
    if (list[index]) onSelect(list[index].id)
  }, [jobs, role, tab, onSelect])

  const onRole = useCallback((next: StaffRole) => {
    setRole(next)
    const seat = SEATS.find((item) => item.role === next)
    const lens = homeLens(next)
    const visible = jobsForLens(jobs, lens, 'home')
    if (visible.length && !visible.some((job) => job.id === selectedId)) {
      setSelectedId(visible[0].id)
    }
    setTab('home')
    setMoreRoute(null)
    setToast(`Demo role · ${seat?.name} · ${ROLE_LABEL[next]}`)
  }, [jobs, selectedId])

  const onTab = useCallback((next: Tab) => {
    if (next === 'more' && tab === 'more' && moreRoute) {
      setMoreRoute(null)
      return
    }
    setTab(next)
    if (next !== 'more') setMoreRoute(null)
  }, [tab, moreRoute])

  const onTabIndex = useCallback((index: number) => {
    onTab(tabByIndex(index))
  }, [onTab])

  const onCreate = useCallback((kind: 'estimate' | 'service') => {
    const job = createJob(kind, jobs.length + 1, role)
    setJobs((current) => [job, ...current])
    setSelectedId(job.id)
    setTab('jobs')
    flash(`Created ${kind} · ${job.customerName}`)
  }, [jobs.length, role, flash])

  const onPrimary = useCallback(() => {
    if (tab === 'create') {
      onCreate('estimate')
      return
    }
    if (tab === 'more') {
      setMoreRoute(null)
      setTab('jobs')
      return
    }
    if (!selected) return
    const result = applyPrimary(selected, role)
    setJobs((current) => current.map((job) => (job.id === result.job.id ? result.job : job)))
    if (result.alert) {
      setAlerts((current) => [result.alert!, ...current.filter((item) => item.id !== result.alert!.id)])
    }
    flash(result.toast)
  }, [selected, role, flash, tab, onCreate])

  const onSecondary = useCallback(() => {
    if (tab === 'create') {
      onCreate('service')
      return
    }
    if (tab === 'more' && moreRoute) {
      setMoreRoute(null)
      return
    }
    if (!selected) return
    const cta = jobCta(selected, role)
    if (selected.step === 'progress') {
      const alert: Alert = {
        id: `shout-${selected.id}`,
        title: 'Office shout',
        detail: `${selected.customerName} · need help on site`,
        kind: 'shout',
        jobId: selected.id,
        unread: true,
      }
      setAlerts((current) => [alert, ...current.filter((item) => item.id !== alert.id)])
      setTab('alerts')
      flash(`Shout sent · ${selected.customerName}`)
      return
    }
    flash(cta.secondary)
  }, [tab, moreRoute, selected, role, onCreate, flash])

  const onSelectMoreIndex = useCallback((index: number) => {
    const groups = groupedMoreNav(role).flatMap((group) => group.items)
    if (groups[index]) {
      setTab('more')
      setMoreRoute(groups[index].route)
    }
  }, [role])

  const onAck = useCallback((id: string) => {
    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, unread: false } : alert)))
  }, [])

  const showRive = !riveFailed
  const list = jobsForLens(jobs, homeLens(role), tab === 'home' || tab === 'jobs' ? tab : 'jobs')
  const kpis = deriveKpis(jobs)
  const widgets = homeWidgets(jobs, homeLens(role))

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="shell">
        <div className="status">
          <span>OdinOps</span>
          <span className="status-actions">
            <select
              className="seat-select"
              aria-label="Demo role"
              value={role}
              onChange={(event) => onRole(event.target.value as StaffRole)}
            >
              {SEATS.map((seat) => (
                <option key={seat.id} value={seat.role}>
                  {seat.name} · {ROLE_LABEL[seat.role]}
                </option>
              ))}
            </select>
            <button type="button" className="theme-toggle" onClick={() => setDarkMode((value) => !value)}>
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <span>{riveReady ? 'Rive WebGL2' : riveFailed ? 'HTML fallback' : 'Loading Rive…'}</span>
          </span>
        </div>
        <div className="phone">
          {showRive && (
            <AppRive
              jobs={list}
              allJobs={jobs}
              alerts={alerts}
              kpis={kpis}
              widgets={widgets}
              selectedId={selectedId}
              role={role}
              tab={tab}
              moreRoute={moreRoute}
              toast={toast}
              darkMode={darkMode}
              burst={burst}
              onReady={() => setRiveReady(true)}
              onError={() => setRiveFailed(true)}
              onSelectJobIndex={onSelectJobIndex}
              onSelectMoreIndex={onSelectMoreIndex}
              onTabIndex={onTabIndex}
              onPrimary={onPrimary}
              onSecondary={onSecondary}
            />
          )}
          {riveFailed && (
            <AppFallback
              jobs={jobs}
              alerts={alerts}
              selectedId={selectedId}
              role={role}
              tab={tab}
              moreRoute={moreRoute}
              toast={toast}
              darkMode={darkMode}
              onSelect={onSelect}
              onTab={onTab}
              onRole={onRole}
              onPrimary={onPrimary}
              onSecondary={onSecondary}
              onCreate={onCreate}
              onMore={setMoreRoute}
              onAck={onAck}
            />
          )}
          {showRive && !riveReady && !riveFailed && <div className="loading">Loading OdinOps…</div>}
        </div>
      </div>
    </div>
  )
}
