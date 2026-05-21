'use client'
import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { Category } from '@/lib/data'

type Props = {
  value: string
  onChange: (slug: string) => void
  categories: ReadonlyArray<Category>
  disabled?: boolean
  labelText?: string
}

const DRAG_THRESHOLD_PX = 6

const cardStyle = (active: boolean, disabled: boolean): CSSProperties => ({
  flexShrink: 0,
  minWidth: 112,
  padding: '12px 10px',
  borderRadius: 12,
  border: `1px solid ${active ? '#D4A853' : 'rgba(255,255,255,0.12)'}`,
  background: active ? 'rgba(212,168,83,0.18)' : 'rgba(255,255,255,0.05)',
  color: 'inherit',
  fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  transition: 'all .2s',
  textAlign: 'center',
  outlineOffset: 2,
  scrollSnapAlign: 'start',
})

export function CategoryCardSelector({
  value,
  onChange,
  categories,
  disabled = false,
  labelText = 'نوع السيارة',
}: Props) {
  const hasLabel = labelText.trim().length > 0
  const stripRef = useRef<HTMLDivElement>(null)
  // Mouse-drag state. Touch pointers fall through to native overflow scrolling.
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean; pointerId: number } | null>(null)
  // Set when the pointer was dragged past threshold; consumed by the next click
  // so a drag-release on a card doesn't accidentally select it.
  const suppressClick = useRef(false)

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return
    if (e.pointerType === 'touch') return // native scroll on touch
    if (e.button !== 0) return // primary mouse button only
    const el = stripRef.current
    if (!el) return
    // Reset any stale suppress flag from a prior aborted gesture so a fresh
    // click below the drag threshold is never accidentally swallowed.
    suppressClick.current = false
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false, pointerId: e.pointerId }
    try { el.setPointerCapture(e.pointerId) } catch {}
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    if (!drag.current.moved && Math.abs(dx) >= DRAG_THRESHOLD_PX) {
      drag.current.moved = true
      stripRef.current?.classList.add('is-dragging')
    }
    if (drag.current.moved && stripRef.current) {
      stripRef.current.scrollLeft = drag.current.startScroll - dx
    }
  }

  function finishDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state) return
    drag.current = null
    if (state.moved) suppressClick.current = true
    stripRef.current?.classList.remove('is-dragging')
    try { stripRef.current?.releasePointerCapture(state.pointerId) } catch {}
  }

  function handleSelect(slug: string) {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onChange(slug)
  }

  return (
    <div className="form-group">
      {hasLabel && <div id="category-card-label" className="form-label">{labelText}</div>}
      <div
        ref={stripRef}
        className="category-strip"
        role="group"
        aria-labelledby={hasLabel ? 'category-card-label' : undefined}
        aria-label={hasLabel ? undefined : 'نوع السيارة'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        {categories.map(c => {
          const active = value === c.slug
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => handleSelect(c.slug)}
              disabled={disabled}
              aria-pressed={active}
              aria-label={`${c.nameAr} — من ${c.minPrice} ريال يومياً`}
              style={cardStyle(active, disabled)}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">{c.icon}</span>
              <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff' }}>{c.nameAr}</span>
              <span style={{ fontSize: '.7rem', color: '#D4A853', fontWeight: 600 }}>
                من {c.minPrice} ريال/يوم
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
