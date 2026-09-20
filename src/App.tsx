import { useCallback, useMemo, useState } from 'react'
import './App.css'
import { CrmFallback } from './CrmFallback'
import { CrmRive } from './CrmRive'
import {
  SAMPLE_LEADS,
  advanceLead,
  makeWalkInLead,
  type Lead,
  type Stage,
} from './crm'

function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

function forceFallback(): boolean {
  return new URLSearchParams(window.location.search).has('fallback')
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS)
  const [selectedId, setSelectedId] = useState(SAMPLE_LEADS[0].id)
  const [pipeline, setPipeline] = useState<Stage>('newLead')
  const [toast, setToast] = useState('Tap a job · send the estimate')
  const [riveReady, setRiveReady] = useState(false)
  const [riveFailed, setRiveFailed] = useState(() => !supportsWebGL2() || forceFallback())

  const selected = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? leads[0],
    [leads, selectedId],
  )

  const onSelect = useCallback((id: string) => {
    const lead = leads.find((item) => item.id === id)
    if (!lead) return
    setSelectedId(id)
    setToast(`${lead.customerName} · ${lead.jobType}`)
  }, [leads])

  const onSelectIndex = useCallback((index: number) => {
    const lead = leads[index]
    if (lead) onSelect(lead.id)
  }, [leads, onSelect])

  const onPipeline = useCallback((stage: Stage) => {
    setPipeline(stage)
    const label =
      stage === 'newLead' ? 'New leads' : stage === 'estimateSent' ? 'Estimates out' : 'Won jobs'
    setToast(`Focus: ${label}`)
  }, [])

  const onNewLead = useCallback(() => {
    const lead = makeWalkInLead(leads.length + 1)
    setLeads((current) => [...current, lead])
    setSelectedId(lead.id)
    setPipeline('newLead')
    setToast(`New lead captured · ${lead.customerName}`)
  }, [leads.length])

  const onSendEstimate = useCallback(() => {
    if (!selected) return
    if (selected.status === 'won') {
      setToast(`${selected.customerName} is already won`)
      return
    }
    const updated = advanceLead(selected)
    setLeads((current) => current.map((lead) => (lead.id === updated.id ? updated : lead)))
    setPipeline(updated.status)
    setToast(
      updated.status === 'estimateSent'
        ? `Estimate sent to ${updated.customerName}`
        : `${updated.customerName} marked won`,
    )
  }, [selected])

  const onCall = useCallback(() => {
    if (!selected) return
    setToast(`Calling ${selected.customerName}…`)
  }, [selected])

  const showRive = !riveFailed

  return (
    <div className="app">
      <div className="shell">
        <div className="status">
          <span>GreenField · Sales CRM</span>
          <span>{riveReady ? 'Rive WebGL2' : riveFailed ? 'HTML fallback' : 'Loading Rive…'}</span>
        </div>
        <div className="phone">
          {showRive && (
            <CrmRive
              leads={leads}
              selectedId={selectedId}
              pipeline={pipeline}
              toast={toast}
              onReady={() => setRiveReady(true)}
              onError={() => setRiveFailed(true)}
              onSelectIndex={onSelectIndex}
              onPipeline={onPipeline}
              onNewLead={onNewLead}
              onSendEstimate={onSendEstimate}
              onCall={onCall}
            />
          )}
          {(riveFailed || !riveReady) && riveFailed && (
            <CrmFallback
              leads={leads}
              selectedId={selectedId}
              pipeline={pipeline}
              toast={toast}
              onSelect={onSelect}
              onPipeline={onPipeline}
              onNewLead={onNewLead}
              onSendEstimate={onSendEstimate}
              onCall={onCall}
            />
          )}
          {showRive && !riveReady && !riveFailed && (
            <div className="loading">Loading GreenField sales board…</div>
          )}
        </div>
      </div>
    </div>
  )
}
