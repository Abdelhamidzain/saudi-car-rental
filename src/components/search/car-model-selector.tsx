'use client'
import { useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { CarModel } from '@/lib/data'

type Props = {
  value: string
  onChange: (slug: string) => void
  cars: ReadonlyArray<CarModel>
  categorySlug: string
  disabled?: boolean
  labelText?: string
}

const DRAG_THRESHOLD_PX = 6

const cardStyle = (active: boolean, disabled: boolean): CSSProperties => ({
  flexShrink: 0,
  minWidth: 168,
  padding: '12px 14px',
  borderRadius: 12,
  border: `1px solid ${active ? '#D4A853' : 'rgba(255,255,255,0.12)'}`,
  background: active ? 'rgba(212,168,83,0.18)' : 'rgba(255,255,255,0.05)',
  color: 'inherit',
  fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  textAlign: 'right',
  gap: 4,
  transition: 'all .2s',
  outlineOffset: 2,
  scrollSnapAlign: 'start',
})

export function CarModelSelector({
  value,
  onChange,
  cars,
  categorySlug,
  disabled = false,
  labelText = 'موديل السيارة',
}: Props) {
  const hasLabel = labelText.trim().length > 0
  const stripRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean; pointerId: number } | null>(null)
  const suppressClick = useRef(false)

  const filtered = useMemo(() => {
    if (!categorySlug) return []
    return cars
      .filter(c => c.category === categorySlug)
      .slice()
      .sort((a, b) => a.dailyPrice - b.dailyPrice)
  }, [cars, categorySlug])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return
    if (e.pointerType === 'touch') return
    if (e.button !== 0) return
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

  if (!categorySlug) {
    return (
      <div className="form-group">
        {hasLabel && <div className="form-label">{labelText}</div>}
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', fontSize: '.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          اختر نوع السيارة أولاً لعرض الموديلات المناسبة
        </div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="form-group">
        {hasLabel && <div className="form-label">{labelText}</div>}
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', fontSize: '.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          لا توجد موديلات متاحة لهذا النوع حالياً
        </div>
      </div>
    )
  }

  return (
    <div className="form-group">
      {hasLabel && <div id="car-model-label" className="form-label">{labelText}</div>}
      <div
        ref={stripRef}
        className="category-strip"
        role="group"
        aria-labelledby={hasLabel ? 'car-model-label' : undefined}
        aria-label={hasLabel ? undefined : 'موديل السيارة'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        {filtered.map(c => {
          const active = value === c.slug
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => handleSelect(c.slug)}
              disabled={disabled}
              aria-pressed={active}
              aria-label={`${c.nameAr} ${c.year} — من ${c.dailyPrice} ريال يومياً`}
              style={cardStyle(active, disabled)}
            >
              <span style={{ fontSize: '.9rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{c.nameAr}</span>
              <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.6)' }}>
                {c.year} · {c.seats} ركاب · {c.transmissionAr}
              </span>
              <span style={{ fontSize: '.75rem', color: '#D4A853', fontWeight: 700, marginTop: 2 }}>
                من {c.dailyPrice} ريال/يوم
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
