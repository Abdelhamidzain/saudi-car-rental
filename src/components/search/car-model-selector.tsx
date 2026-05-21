'use client'
import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import type { CarModel } from '@/lib/data'

type Props = {
  value: string
  onChange: (slug: string) => void
  cars: ReadonlyArray<CarModel>
  categorySlug: string
  disabled?: boolean
  labelText?: string
}

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

function isFullyVisibleWithin(child: HTMLElement, parent: HTMLElement): boolean {
  const cr = child.getBoundingClientRect()
  const pr = parent.getBoundingClientRect()
  return cr.left >= pr.left && cr.right <= pr.right
}

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
  const btnRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())

  const filtered = useMemo(() => {
    if (!categorySlug) return []
    return cars
      .filter(c => c.category === categorySlug)
      .slice()
      .sort((a, b) => a.dailyPrice - b.dailyPrice)
  }, [cars, categorySlug])

  // Bring the selected car into view on mount, when the value changes, and
  // when the filtered set changes (e.g. after a category swap). Skip when
  // already fully visible so we don't fight manual user scroll.
  useEffect(() => {
    if (!value) return
    const btn = btnRefs.current.get(value)
    const strip = stripRef.current
    if (!btn || !strip) return
    if (isFullyVisibleWithin(btn, strip)) return
    btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [value, filtered.length])

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
      >
        {filtered.map(c => {
          const active = value === c.slug
          return (
            <button
              key={c.slug}
              ref={(el) => { btnRefs.current.set(c.slug, el) }}
              type="button"
              onClick={() => onChange(c.slug)}
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
