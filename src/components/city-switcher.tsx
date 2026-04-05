'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cities } from '@/lib/data'

export function CitySwitcher() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const current = cities.find(c => path?.includes(`/sa/${c.slug}`))

  return (
    <div className="city-nav" onMouseLeave={() => setOpen(false)}>
      <button
        className="city-nav-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>{current?.nameAr || 'اختر مدينة'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="city-nav-dropdown" role="listbox" aria-label="اختيار المدينة">
          {cities.map(c => (
            <Link
              key={c.slug}
              href={`/sa/${c.slug}`}
              className={`city-nav-item ${current?.slug === c.slug ? 'city-nav-item-active' : ''}`}
              role="option"
              aria-selected={current?.slug === c.slug}
              onClick={() => setOpen(false)}
            >
              <span>{c.nameAr}</span>
              <span className="city-nav-meta">من {c.minPrice} ر.س</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
