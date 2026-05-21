'use client'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { CarModel, Category } from '@/lib/data'

type Props = {
  value: string
  onChange: (slug: string) => void
  onAutocompleteSelect: (carSlug: string, categorySlug: string) => void
  cars: ReadonlyArray<CarModel>
  categories: ReadonlyArray<Category>
  categorySlug: string
  disabled?: boolean
  labelText?: string
}

const MAX_SUGGESTIONS = 6
const SUGGEST_LIST_ID = 'car-suggest-list'

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

const suggestionStyle = (highlighted: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  textAlign: 'right',
  gap: 2,
  padding: '9px 12px',
  background: highlighted ? 'rgba(212,168,83,0.16)' : 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: 'inherit',
})

function isFullyVisibleWithin(child: HTMLElement, parent: HTMLElement): boolean {
  const cr = child.getBoundingClientRect()
  const pr = parent.getBoundingClientRect()
  return cr.left >= pr.left && cr.right <= pr.right
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Ranked match score. 0 = no match. Higher = better.
// `.toLowerCase()` is a no-op on Arabic, so Arabic substring matching
// works directly; Latin text is case-folded.
function scoreCar(c: CarModel, q: string, currentCat: string): number {
  const nameAr = c.nameAr.toLowerCase()
  const nameEn = c.nameEn.toLowerCase()
  const brand = c.brand.toLowerCase()
  const brandAr = c.brandAr.toLowerCase()
  const slug = c.slug.toLowerCase()

  let score = 0
  if (nameAr.startsWith(q) || nameEn.startsWith(q)) score = 100
  else if (brand.startsWith(q) || brandAr.startsWith(q)) score = 80
  else if (nameAr.includes(q) || nameEn.includes(q)) score = 60
  else if (brand.includes(q) || brandAr.includes(q) || slug.includes(q)) score = 40
  else return 0

  // Matches inside the currently selected category rank above global ones.
  if (currentCat && c.category === currentCat) score += 15
  return score
}

export function CarModelSelector({
  value,
  onChange,
  onAutocompleteSelect,
  cars,
  categories,
  categorySlug,
  disabled = false,
  labelText = 'موديل السيارة',
}: Props) {
  const hasLabel = labelText.trim().length > 0
  const stripRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)

  const categoryNameBySlug = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of categories) m.set(c.slug, c.nameAr)
    return m
  }, [categories])

  // Cars in the currently selected category — drives the browse card strip.
  const filtered = useMemo(() => {
    if (!categorySlug) return []
    return cars
      .filter(c => c.category === categorySlug)
      .slice()
      .sort((a, b) => a.dailyPrice - b.dailyPrice)
  }, [cars, categorySlug])

  // Pin the selected car first; the rest keep price-ascending order.
  const orderedCars = useMemo(() => {
    if (!value) return filtered
    const idx = filtered.findIndex(c => c.slug === value)
    if (idx < 0) return filtered
    return [filtered[idx], ...filtered.slice(0, idx), ...filtered.slice(idx + 1)]
  }, [value, filtered])

  // Global autocomplete suggestions — searches ALL cars, ranks current-category
  // matches higher, capped at MAX_SUGGESTIONS.
  const suggestions = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    return cars
      .map(c => ({ car: c, score: scoreCar(c, q, categorySlug) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.car.dailyPrice - b.car.dailyPrice)
      .slice(0, MAX_SUGGESTIONS)
      .map(x => x.car)
  }, [cars, query, categorySlug])

  const dropdownVisible = open && normalize(query).length > 0

  // Reset the search when the category changes (airport routes keep this
  // component mounted across category changes).
  useEffect(() => {
    setQuery('')
    setOpen(false)
    setHighlight(-1)
  }, [categorySlug])

  useEffect(() => {
    if (!value) return
    const btn = btnRefs.current.get(value)
    const strip = stripRef.current
    if (!btn || !strip) return
    if (isFullyVisibleWithin(btn, strip)) return
    btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [value, orderedCars.length])

  function pick(c: CarModel) {
    setQuery(c.nameAr)
    setOpen(false)
    setHighlight(-1)
    onAutocompleteSelect(c.slug, c.category)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      setHighlight(-1)
      return
    }
    if (!dropdownVisible || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && highlight < suggestions.length) {
        e.preventDefault()
        pick(suggestions[highlight])
      }
    }
  }

  return (
    <div className="form-group">
      {hasLabel && <div id="car-model-label" className="form-label">{labelText}</div>}

      <input
        type="search"
        className="form-input"
        placeholder="ابحث باسم السيارة أو الموديل"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHighlight(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { window.setTimeout(() => setOpen(false), 150) }}
        onKeyDown={onKeyDown}
        disabled={disabled}
        dir="auto"
        autoComplete="off"
        role="combobox"
        aria-expanded={dropdownVisible}
        aria-controls={SUGGEST_LIST_ID}
        aria-autocomplete="list"
        aria-label="ابحث باسم السيارة أو الموديل"
        style={{ marginBottom: 8 }}
      />

      {dropdownVisible && (
        <div
          id={SUGGEST_LIST_ID}
          role="listbox"
          aria-label="نتائج البحث عن سيارة"
          style={{
            marginBottom: 10,
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 12,
            background: '#0D1B2A',
            maxHeight: 260,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {suggestions.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: '.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              لا توجد سيارات مطابقة لهذا البحث
            </div>
          ) : (
            suggestions.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onClick={() => pick(c)}
                onMouseEnter={() => setHighlight(i)}
                disabled={disabled}
                style={suggestionStyle(i === highlight)}
              >
                <span style={{ fontSize: '.88rem', fontWeight: 700, color: '#fff' }}>{c.nameAr}</span>
                <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.6)' }}>
                  {categoryNameBySlug.get(c.category) ?? c.category}
                  <span style={{ color: '#D4A853', fontWeight: 600 }}> · من {c.dailyPrice} ريال/يوم</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {!categorySlug ? (
        <div style={emptyBoxStyle}>اختر نوع السيارة أولاً لعرض الموديلات المناسبة</div>
      ) : filtered.length === 0 ? (
        <div style={emptyBoxStyle}>لا توجد موديلات متاحة لهذا النوع حالياً</div>
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
