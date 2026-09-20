import { useCallback, useMemo, useState } from 'react'
import './App.css'
import { OfficeFallback } from './OfficeFallback'
import { OfficeRive } from './OfficeRive'
import {
  SAMPLE_DAYS,
  SAMPLE_JOBS,
  advanceSales,
  assignCrewToJob,
  completeJob,
  jobsForRole,
  makeWalkIn,
  nextSlotDay,
  roleByIndex,
  sendToSales,
  startJob,
  type Job,
  type Role,
  type ScheduleDay,
} from './office'

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
  const [days, setDays] = useState<ScheduleDay[]>(SAMPLE_DAYS)
  const [selectedId, setSelectedId] = useState(SAMPLE_JOBS[0].id)
  const [selectedDayId, setSelectedDayId] = useState(SAMPLE_DAYS[0].id)
  const [role, setRole] = useState<Role>('intake')
  const [toast, setToast] = useState('Capture a walk-in, then send Maya to sales')
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
    setToast(`${job.customerName} · ${job.jobType}`)
  }, [jobs])

  const onSelectJobIndex = useCallback((index: number) => {
    const list = jobsForRole(jobs, role)
    if (list[index]) onSelect(list[index].id)
  }, [jobs, role, onSelect])

  const onSelectDay = useCallback((id: string) => {
    const day = days.find((item) => item.id === id)
    if (!day) return
    setSelectedDayId(id)
    const job = jobs.find((item) => item.id === day.jobId)
    setToast(job ? `${day.day} · ${job.customerName}` : `${day.day} open slot`)
  }, [days, jobs])

  const onSelectDayIndex = useCallback((index: number) => {
    if (days[index]) onSelectDay(days[index].id)
  }, [days, onSelectDay])

  const onRole = useCallback((next: Role) => {
    setRole(next)
    const visible = jobsForRole(jobs, next)
    if (visible.length && !visible.some((job) => job.id === selectedId)) {
      setSelectedId(visible[0].id)
    }
    setToast(`Role: ${next}`)
  }, [jobs, selectedId])

  const onRoleIndex = useCallback((index: number) => {
    onRole(roleByIndex(index))
  }, [onRole])

  const onPrimary = useCallback(() => {
    if (role === 'intake') {
      const lead = makeWalkIn(jobs.length + 1)
      setJobs((current) => [...current, lead])
      setSelectedId(lead.id)
      flash(`Walk-in captured · ${lead.customerName}`)
      return
    }
    if (role === 'sales' && selected) {
      if (selected.status !== 'newLead' && selected.status !== 'estimateSent') {
        setToast(`${selected.customerName} is not in the estimate path`)
        return
      }
      const updated = advanceSales(selected)
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)))
      flash(
        updated.status === 'estimateSent'
          ? `Estimate sent to ${updated.customerName}`
          : `${updated.customerName} marked won`,
      )
      return
    }
    if (role === 'scheduler') {
      const target =
        selected?.status === 'won' || selected?.status === 'scheduled'
          ? selected
          : jobs.find((job) => job.status === 'won')
      if (!target) {
        setToast('No won job ready to book')
        return
      }
      const result = assignCrewToJob(target, days)
      setJobs((current) => current.map((job) => (job.id === result.job.id ? result.job : job)))
      setDays(result.days)
      setSelectedId(result.job.id)
      setSelectedDayId(result.dayId)
      flash(`Crew booked · ${result.job.customerName} ${result.job.day}`)
      return
    }
    if (role === 'admin' && selected) {
      setToast(`Status confirmed · ${selected.customerName}`)
      setBurst((value) => value + 1)
      return
    }
    if (role === 'owner') {
      flash('Scoreboard refreshed')
      return
    }
    if (role === 'foreman') {
      const target = selected?.status === 'scheduled' ? selected : jobs.find((job) => job.status === 'scheduled')
      if (!target) {
        setToast('Nothing queued for the field')
        return
      }
      const updated = startJob(target)
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)))
      setSelectedId(updated.id)
      flash(`Crew rolling · ${updated.customerName}`)
      return
    }
    if (role === 'workers') {
      const target =
        selected?.status === 'inProgress' || selected?.status === 'scheduled'
          ? selected
          : jobs.find((job) => job.status === 'inProgress' || job.status === 'scheduled')
      if (!target) {
        setToast('No assigned task to check off')
        return
      }
      const updated = completeJob(target)
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)))
      setSelectedId(updated.id)
      flash(`Checked off · ${updated.customerName}`)
    }
  }, [role, jobs, days, selected, flash])

  const onSecondary = useCallback(() => {
    if (role === 'intake' && selected) {
      if (selected.status !== 'inquiry') {
        setToast(`${selected.customerName} is already in sales`)
        return
      }
      const updated = sendToSales(selected)
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)))
      flash(`Sent to sales · ${updated.customerName}`)
      return
    }
    if (role === 'sales' && selected) {
      setToast(`Calling ${selected.customerName}…`)
      return
    }
    if (role === 'scheduler') {
      const next = nextSlotDay(days, selectedDayId)
      setSelectedDayId(next.id)
      setToast(`Focus ${next.day} ${next.slot}`)
      return
    }
    if (role === 'admin' && selected) {
      setJobs((current) =>
        current.map((job) => (job.id === selected.id ? { ...job, flagged: !job.flagged } : job)),
      )
      flash(selected.flagged ? `Cleared hold · ${selected.customerName}` : `Hold · ${selected.customerName}`)
      return
    }
    if (role === 'owner') {
      setToast('Week review: won jobs now feed scheduler + field')
      return
    }
    if (role === 'foreman' && selected) {
      setToast(`Delay noted · ${selected.customerName}`)
      return
    }
    if (role === 'workers' && selected) {
      setToast(`Help requested · ${selected.customerName}`)
    }
  }, [role, selected, days, selectedDayId, flash])

  const showRive = !riveFailed

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="shell">
        <div className="status">
          <span>OdinOps · Landscape office</span>
          <span className="status-actions">
            <button type="button" className="theme-toggle" onClick={() => setDarkMode((value) => !value)}>
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <span>{riveReady ? 'Rive WebGL2' : riveFailed ? 'HTML fallback' : 'Loading Rive…'}</span>
          </span>
        </div>
        <div className="phone">
          {showRive && (
            <OfficeRive
              jobs={jobs}
              days={days}
              selectedId={selectedId}
              selectedDayId={selectedDayId}
              role={role}
              toast={toast}
              darkMode={darkMode}
              burst={burst}
              onReady={() => setRiveReady(true)}
              onError={() => setRiveFailed(true)}
              onSelectJobIndex={onSelectJobIndex}
              onSelectDayIndex={onSelectDayIndex}
              onRoleIndex={onRoleIndex}
              onPrimary={onPrimary}
              onSecondary={onSecondary}
            />
          )}
          {riveFailed && (
            <OfficeFallback
              jobs={jobs}
              days={days}
              selectedId={selectedId}
              selectedDayId={selectedDayId}
              role={role}
              toast={toast}
              darkMode={darkMode}
              burst={burst}
              onSelect={onSelect}
              onSelectDay={onSelectDay}
              onRole={onRole}
              onPrimary={onPrimary}
              onSecondary={onSecondary}
            />
          )}
          {showRive && !riveReady && !riveFailed && (
            <div className="loading">Loading OdinOps office…</div>
          )}
        </div>
      </div>
    </div>
  )
}
