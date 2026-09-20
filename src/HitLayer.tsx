import { useEffect, useRef, useState } from 'react'
import { DOCK, type Tab } from './odinops'

export type BridgeRow =
  | { type: 'job'; id: string; label: string }
  | { type: 'create'; id: string; label: string }
  | { type: 'alert'; id: string; label: string }
  | { type: 'more'; id: string; label: string }
  | { type: 'seat'; id: string; label: string }

type Frame = { left: number; top: number; width: number; height: number; scale: number }

function contain(width: number, height: number, artW = 390, artH = 844): Frame {
  const scale = Math.min(width / artW, height / artH)
  const drawnW = artW * scale
  const drawnH = artH * scale
  return {
    left: (width - drawnW) / 2,
    top: (height - drawnH) / 2,
    width: drawnW,
    height: drawnH,
    scale,
  }
}

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
  const [frame, setFrame] = useState<Frame | null>(null)

  useEffect(() => {
    const node = host.current
    if (!node) return
    const parent = node.parentElement
    if (!parent) return
    const update = () => {
      const box = parent.getBoundingClientRect()
      setFrame(contain(box.width, box.height))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={host} className={`hit-layer ${debug ? 'debug' : ''}`}>
      {frame && (
        <div
          className="hit-frame"
          style={{
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
          }}
        >
          <div
            className="hit-artboard"
            style={{
              width: 390,
              height: 844,
              transform: `scale(${frame.scale})`,
            }}
          >
            <div className={`hit-list ${rows.length ? 'live' : 'idle'}`} role="list">
              {rows.map((row) => (
                <button
                  key={`${row.type}-${row.id}`}
                  type="button"
                  className="hit-row"
                  aria-label={row.label}
                  onClick={() => onRow(row)}
                >
                  {debug ? row.label : ''}
                </button>
              ))}
            </div>
            <div className="hit-actions">
              <button type="button" className="hit-cta" aria-label={primaryLabel} onClick={onPrimary}>
                {debug ? primaryLabel : ''}
              </button>
              <button type="button" className="hit-cta" aria-label="More actions" onClick={onSecondary}>
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
                  onClick={() => onTab(item.id)}
                >
                  {debug ? item.label : ''}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
