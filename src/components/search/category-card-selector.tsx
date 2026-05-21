'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import type { Category } from '@/lib/data'

type Props = {
  value: string
  onChange: (slug: string) => void
  categories: ReadonlyArray<Category>
  disabled?: boolean
  labelText?: string
}

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

function isFullyVisibleWithin(child: HTMLElement, parent: HTMLElement): boolean {
  const cr = child.getBoundingClientRect()
  const pr = parent.getBoundingClientRect()
  return cr.left >= pr.left && cr.right <= pr.right
}

export function CategoryCardSelector({
  value,
  onChange,
  categories,
  disabled = false,
  labelText = 'نوع السيارة',
}: Props) {
  const hasLabel = labelText.trim().length > 0
  const stripRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())

  // Bring the selected card into view on mount and whenever the selection
  // changes. We skip when the card is already fully visible so we don't
  // fight a user who has manually scrolled to a different region.
  useEffect(() => {
    if (!value) return
    const btn = btnRefs.current.get(value)
    const strip = stripRef.current
    if (!btn || !strip) return
    if (isFullyVisibleWithin(btn, strip)) return
    btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [value])

  return (
    <div className="form-group">
      {hasLabel && <div id="category-card-label" className="form-label">{labelText}</div>}
      <div
        ref={stripRef}
        className="category-strip"
        role="group"
        aria-labelledby={hasLabel ? 'category-card-label' : undefined}
        aria-label={hasLabel ? undefined : 'نوع السيارة'}
      >
        {categories.map(c => {
          const active = value === c.slug
          return (
            <button
              key={c.slug}
              ref={(el) => { btnRefs.current.set(c.slug, el) }}
              type="button"
              onClick={() => onChange(c.slug)}
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
