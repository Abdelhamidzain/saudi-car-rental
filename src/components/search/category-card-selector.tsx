'use client'
import type { CSSProperties } from 'react'
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
})

export function CategoryCardSelector({
  value,
  onChange,
  categories,
  disabled = false,
  labelText = 'نوع السيارة',
}: Props) {
  return (
    <div className="form-group">
      <div id="category-card-label" className="form-label">{labelText}</div>
      <div
        role="group"
        aria-labelledby="category-card-label"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 4,
          scrollbarWidth: 'thin',
          scrollSnapType: 'x proximity',
        }}
      >
        {categories.map(c => {
          const active = value === c.slug
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onChange(c.slug)}
              disabled={disabled}
              aria-pressed={active}
              aria-label={`${c.nameAr} — من ${c.minPrice} ريال يومياً`}
              style={{ ...cardStyle(active, disabled), scrollSnapAlign: 'start' }}
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
