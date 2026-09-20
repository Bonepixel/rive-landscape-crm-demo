import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AppFallback } from './AppFallback'
import { AppRive } from './AppRive'
import {
  ROLE_LABEL,
  SAMPLE_JOBS,
  SEATS,
  applyPrimary,
  createFromLane,
  createdToast,
  deriveKpis,
  emptyCopy,
  featuredJob,
  groupedMoreNav,
  homeLens,
  homeNextActions,
  jobCta,
  jobsForLens,
  loadPersisted,
  parseDeepLink,
  savePersisted,
  seedAlerts,
  tabByIndex,
  writeDeepLink,
  type Alert,
  type CreateLane,
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

function boot() {
  const link = parseDeepLink(window.location.search)
  const stored = loadPersisted()
  const role = link.role ?? stored?.role ?? 'sales'
  const tab = link.tab ?? stored?.tab ?? 'home'
  const jobs = stored?.jobs?.length ? stored.jobs : SAMPLE_JOBS
  const alerts = stored?.alerts?.length ? stored.alerts : seedAlerts(jobs)
  const selectedId = link.job ?? stored?.selectedId ?? featuredJob(jobs, homeLens(role), role)?.id ?? jobs[0].id
  return {
    jobs,
    alerts,
    role,
    tab,
    selectedId,
    darkMode: true,
    fallback: link.fallback || !supportsWebGL2(),
  }
}

export default function App() {
  const initial = useMemo(() => boot(), [])
  const [jobs, setJobs] = useState<Job[]>(initial.jobs)
  const [alerts, setAlerts] = useState<Alert[]>(initial.alerts)
  const [selectedId, setSelectedId] = useState(initial.selectedId)
  const [role, setRole] = useState<StaffRole>(initial.role)
  const [tab, setTab] = useState<Tab>(initial.tab)
  const [moreRoute, setMoreRoute] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [canUndo, setCanUndo] = useState(false)
  const [darkMode, setDarkMode] = useState(initial.darkMode)
  const [burst, setBurst] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [riveReady, setRiveReady] = useState(false)
  const [riveFailed, setRiveFailed] = useState(initial.fallback)
  const [booting, setBooting] = useState(true)
  const [confetti, setConfetti] = useState(0)
  const [alertSpark, setAlertSpark] = useState(0)
  const undo = useRef<{ jobs: Job[]; alerts: Alert[] } | null>(null)
  const toastTimer = useRef(0)
  const alertCount = useRef(initial.alerts.length)

  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) ?? jobs[0],
    [jobs, selectedId],
  )

  useEffect(() => {
    savePersisted({ jobs, alerts, role, tab, selectedId, darkMode })
    writeDeepLink({ role, tab, job: selectedId, fallback: riveFailed })
  }, [jobs, alerts, role, tab, selectedId, darkMode, riveFailed])

  const flash = useCallback((message: string, undoable = false) => {
    setToast(message)
    setCanUndo(undoable)
    setBurst((value) => value + 1)
    if (message === 'Deposit paid' || message === 'Closed') {
      setConfetti((value) => value + 1)
    }
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setToast('')
      setCanUndo(false)
    }, 4200)
  }, [])

  const snapshot = useCallback(() => {
    undo.current = { jobs, alerts }
  }, [jobs, alerts])

  const onUndo = useCallback(() => {
    if (!undo.current) return
    setJobs(undo.current.jobs)
    setAlerts(undo.current.alerts)
    undo.current = null
    flash('Undone')
  }, [flash])

  const onSelect = useCallback((id: string) => {
    if (jobs.some((item) => item.id === id)) setSelectedId(id)
  }, [jobs])

  const onSelectJobIndex = useCallback((index: number) => {
    const list = tab === 'home' ? jobsForLens(jobs, homeLens(role), 'home') : jobs
    if (list[index]) {
      onSelect(list[index].id)
      setSheetOpen(true)
    }
  }, [jobs, role, tab, onSelect])

  const onRole = useCallback((next: StaffRole) => {
    setRole(next)
    const lens = homeLens(next)
    const featured = featuredJob(jobs, lens, next)
    if (featured) setSelectedId(featured.id)
    setTab('home')
    setMoreRoute(null)
    setSheetOpen(false)
    flash(`${SEATS.find((seat) => seat.role === next)?.name} · ${ROLE_LABEL[next]}`)
  }, [jobs, flash])

  const onTab = useCallback((next: Tab) => {
    if (next === 'more' && tab === 'more' && moreRoute) {
      setMoreRoute(null)
      return
    }
    setTab(next)
    if (next !== 'more') setMoreRoute(null)
    setSheetOpen(false)
  }, [tab, moreRoute])

  const onCreate = useCallback((lane: CreateLane) => {
    if (lane.action === 'stub') {
      if (lane.route === 'jobs') {
        setTab('jobs')
        return
      }
      setTab('more')
      setMoreRoute(lane.route ?? null)
      return
    }
    snapshot()
    const job = createFromLane(lane.action, jobs.length + 1, role)
    if (!job) return
    setJobs((current) => [job, ...current])
    setSelectedId(job.id)
    setTab('jobs')
    setSheetOpen(true)
    flash(createdToast(lane.action), true)
  }, [jobs.length, role, flash, snapshot])

  const onPrimary = useCallback(() => {
    const target = tab === 'home' && !sheetOpen
      ? featuredJob(jobs, homeLens(role), role) ?? selected
      : selected
    if (!target) return
    const cta = jobCta(target, role)
    if (cta.disabled) {
      flash(cta.reason)
      return
    }
    snapshot()
    const result = applyPrimary(target, role)
    setJobs((current) => current.map((job) => (job.id === result.job.id ? result.job : job)))
    setSelectedId(result.job.id)
    if (result.alert) {
      setAlerts((current) => [result.alert!, ...current.filter((item) => item.id !== result.alert!.id)])
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12)
    }
    flash(result.toast, true)
  }, [selected, role, flash, snapshot, tab, sheetOpen, jobs])

  const onOverflow = useCallback((action: string) => {
    if (!selected) return
    snapshot()
    if (action === 'Note') {
      setJobs((current) => current.map((job) => (job.id === selected.id ? { ...job, note: 'Note saved' } : job)))
    }
    flash(action, true)
  }, [selected, flash, snapshot])

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

  useEffect(() => {
    if (alerts.length > alertCount.current) setAlertSpark((value) => value + 1)
    alertCount.current = alerts.length
  }, [alerts.length])

  useEffect(() => {
    if (!riveReady) return
    const timer = window.setTimeout(() => setBooting(false), 900)
    return () => window.clearTimeout(timer)
  }, [riveReady])

  const showRive = !riveFailed
  const list = jobsForLens(jobs, homeLens(role), tab === 'home' || tab === 'jobs' ? tab : 'jobs')
  const kpis = deriveKpis(jobs)
  const widgets = homeNextActions(jobs, homeLens(role))
  const empty = (
    (tab === 'home' && list.length === 0)
    || (tab === 'jobs' && list.length === 0)
    || (tab === 'alerts' && alerts.length === 0)
  ) ? emptyCopy(homeLens(role), tab) : null

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="shell">
        <div className="status">
          <span>OdinOps</span>
          <span>{riveReady ? 'Rive' : riveFailed ? 'Live shell' : 'Loading…'}</span>
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
              booting={booting}
              empty={empty}
              confetti={confetti}
              alertSpark={alertSpark}
              onReady={() => setRiveReady(true)}
              onError={() => setRiveFailed(true)}
              onSelectJobIndex={onSelectJobIndex}
              onSelectMoreIndex={onSelectMoreIndex}
              onTabIndex={(index) => onTab(tabByIndex(index))}
              onPrimary={onPrimary}
              onSecondary={() => undefined}
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
              canUndo={canUndo}
              darkMode={darkMode}
              sheetOpen={sheetOpen}
              burst={burst > 0}
              onSelect={onSelect}
              onTab={onTab}
              onRole={onRole}
              onPrimary={onPrimary}
              onOverflow={onOverflow}
              onCreate={onCreate}
              onMore={setMoreRoute}
              onAck={onAck}
              onUndo={onUndo}
              onTheme={() => setDarkMode((value) => !value)}
              onOpenSheet={setSheetOpen}
            />
          )}
          {showRive && !riveReady && !riveFailed && (
            <div className="boot">
              <img className="boot-mark" src={`${import.meta.env.BASE_URL}brand/odinops-mark.png`} alt="" />
              <span>OdinOps</span>
              <i className="boot-shimmer" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
