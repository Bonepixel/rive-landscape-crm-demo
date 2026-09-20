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

function box(frame: Frame, x: number, y: number, w: number, h: number) {
  return {
    left: x * frame.scale,
    top: y * frame.scale,
    width: w * frame.scale,
    height: h * frame.scale,
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
      const canvas = parent.querySelector('canvas')
      const box = (canvas ?? parent).getBoundingClientRect()
      setFrame(contain(box.width, box.height))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(parent)
    if (parent.querySelector('canvas')) observer.observe(parent.querySelector('canvas') as Element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={host} className={`hit-layer ${debug ? 'debug' : ''}`} data-testid="hit-layer">
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
          <div className={`hit-list ${rows.length ? 'live' : 'idle'}`} role="list" style={box(frame, 16, 158, 358, 380)}>
            {rows.map((row) => (
              <button
                key={`${row.type}-${row.id}`}
                type="button"
                className="hit-row"
                aria-label={row.label}
                data-bridge={`${row.type}:${row.id}`}
                onClick={() => onRow(row)}
              >
                {debug ? row.label : ''}
              </button>
            ))}
          </div>
          <div className="hit-actions" style={box(frame, 16, 668, 358, 52)}>
            <button
              type="button"
              className="hit-cta"
              data-testid="hit-primary"
              aria-label={primaryLabel}
              onClick={onPrimary}
            >
              {debug ? primaryLabel : ''}
            </button>
            <button
              type="button"
              className="hit-cta"
              data-testid="hit-secondary"
              aria-label="More actions"
              onClick={onSecondary}
            >
              {debug ? '···' : ''}
            </button>
          </div>
          <nav className="hit-dock" aria-label="Primary" style={box(frame, 4, 768, 382, 72)}>
            {DOCK.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === tab ? 'on' : ''}
                aria-label={item.label}
                aria-current={item.id === tab ? 'page' : undefined}
                data-tab={item.id}
                onClick={() => onTab(item.id)}
              >
                {debug ? item.label : ''}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
