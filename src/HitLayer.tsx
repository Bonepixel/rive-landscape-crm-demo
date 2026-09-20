import { useEffect, useRef, useState } from 'react'
import { DOCK, type Tab } from './odinops'

export type BridgeRow =
  | { type: 'job'; id: string; label: string }
  | { type: 'create'; id: string; label: string }
  | { type: 'alert'; id: string; label: string }
  | { type: 'more'; id: string; label: string }
  | { type: 'seat'; id: string; label: string }

type Props = {
  tab: Tab
  rows: BridgeRow[]
  primaryLabel: string
  debug: boolean
  onTab: (tab: Tab) => void
  onPrimary: () => void
  onSecondary: () => void
  onRow: (row: BridgeRow) => void
}

function usable(rect: DOMRect | undefined) {
  return Boolean(rect && rect.width >= 32 && rect.height >= 64)
}

export function HitLayer({
  tab,
  rows,
  primaryLabel,
  debug,
  onTab,
  onPrimary,
  onSecondary,
  onRow,
}: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const node = host.current
    if (!node) return
    const parent = node.parentElement
    if (!parent) return

    let raf = 0
    const update = () => {
      const canvas = parent.querySelector('canvas')
      const canvasBox = canvas?.getBoundingClientRect()
      const parentBox = parent.getBoundingClientRect()
      setReady(usable(parentBox) || usable(canvasBox))
    }

    update()
    raf = requestAnimationFrame(update)
    const observer = new ResizeObserver(update)
    observer.observe(parent)
    if (parent.querySelector('canvas')) observer.observe(parent.querySelector('canvas') as Element)
    const timer = window.setInterval(update, 400)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [])

  return (
    <div ref={host} className={`hit-layer ${debug ? 'debug' : ''} ${ready ? 'ready' : ''}`} data-testid="hit-layer">
      {ready && (
        <>
          <div className={`hit-list ${rows.length ? 'live' : 'idle'}`} role="list">
            {rows.map((row) => (
              <button
                key={`${row.type}-${row.id}`}
                type="button"
                className="hit-row"
                aria-label={row.label}
                data-bridge={`${row.type}:${row.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onRow(row)
                }}
              >
                {debug ? row.label : ''}
              </button>
            ))}
          </div>
          <div className="hit-actions">
            <button
              type="button"
              className="hit-cta"
              data-testid="hit-primary"
              aria-label={primaryLabel}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onPrimary()
              }}
            >
              {debug ? primaryLabel : ''}
            </button>
            <button
              type="button"
              className="hit-cta"
              data-testid="hit-secondary"
              aria-label="More actions"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onSecondary()
              }}
            >
              {debug ? '···' : ''}
            </button>
          </div>
          <nav className="hit-dock" aria-label="Primary">
            {DOCK.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === tab ? 'on' : ''}
                aria-label={item.label}
                aria-current={item.id === tab ? 'page' : undefined}
                data-tab={item.id}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onTab(item.id)
                }}
              >
                {debug ? item.label : ''}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
