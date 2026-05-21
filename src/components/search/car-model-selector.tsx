'use client'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { CarModel } from '@/lib/data'

type Props = {
  value: string
  onChange: (slug: string) => void
  cars: ReadonlyArray<CarModel>
  categorySlug: string
  disabled?: boolean
  labelText?: string
}

const emptyBoxStyle: CSSProperties = {
  padding: '14px 16px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  border: '1px dashed rgba(255,255,255,0.12)',
  fontSize: '.85rem',
  color: 'rgba(255,255,255,0.6)',
  textAlign: 'center',
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

// Case-insensitive partial match across Arabic + Latin identifiers.
// `.toLowerCase()` is a no-op on Arabic text, so Arabic substring matching
// works directly; Latin text is normalised for case-insensitive matching.
function matchesQuery(c: CarModel, q: string): boolean {
  return (
    c.nameAr.toLowerCase().includes(q) ||
    c.nameEn.toLowerCase().includes(q) ||
    c.brand.toLowerCase().includes(q) ||
    c.brandAr.toLowerCase().includes(q) ||
    c.slug.toLowerCase().includes(q)
  )
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
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!categorySlug) return []
    return cars
      .filter(c => c.category === categorySlug)
      .slice()
      .sort((a, b) => a.dailyPrice - b.dailyPrice)
  }, [cars, categorySlug])

  // Reset the search when the category changes. On airport routes this
  // component stays mounted across category changes, so the query would
  // otherwise persist into a category it no longer applies to.
  useEffect(() => {
    setQuery('')
  }, [categorySlug])

  const q = query.trim().toLowerCase()

  // Search-filtered list. A selected car is always retained even when it
  // doesn't match the query (it gets pinned first below) so the user's
  // current pick never disappears mid-search.
  const searched = useMemo(() => {
    if (!q) return filtered
    return filtered.filter(c => matchesQuery(c, q) || c.slug === value)
  }, [filtered, q, value])

  // Pin the selected car first; the rest keep the price-ascending order.
  const orderedCars = useMemo(() => {
    if (!value) return searched
    const idx = searched.findIndex(c => c.slug === value)
    if (idx < 0) return searched
    return [searched[idx], ...searched.slice(0, idx), ...searched.slice(idx + 1)]
  }, [value, searched])

  useEffect(() => {
    if (!value) return
    const btn = btnRefs.current.get(value)
    const strip = stripRef.current
    if (!btn || !strip) return
    if (isFullyVisibleWithin(btn, strip)) return
    btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [value, orderedCars.length])

  if (!categorySlug) {
    return (
      <div className="form-group">
        {hasLabel && <div className="form-label">{labelText}</div>}
        <div style={emptyBoxStyle}>اختر نوع السيارة أولاً لعرض الموديلات المناسبة</div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="form-group">
        {hasLabel && <div className="form-label">{labelText}</div>}
        <div style={emptyBoxStyle}>لا توجد موديلات متاحة لهذا النوع حالياً</div>
      </div>
    )
  }

  return (
    <div className="form-group">
      {hasLabel && <div id="car-model-label" className="form-label">{labelText}</div>}

      <input
        type="search"
        className="form-input"
        placeholder="ابحث باسم السيارة أو الموديل"
        value={query}
        onChange={e => setQuery(e.target.value)}
        disabled={disabled}
        dir="auto"
        autoComplete="off"
        aria-label="ابحث باسم السيارة أو الموديل"
        style={{ marginBottom: 10 }}
      />

      {orderedCars.length === 0 ? (
        <div style={emptyBoxStyle}>لا توجد سيارات مطابقة لهذا البحث في هذه الفئة</div>
      ) : (
        <div
          ref={stripRef}
          className="category-strip"
          role="group"
          aria-labelledby={hasLabel ? 'car-model-label' : undefined}
          aria-label={hasLabel ? undefined : 'موديل السيارة'}
        >
          {orderedCars.map(c => {
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
      )}
    </div>
  )
}
