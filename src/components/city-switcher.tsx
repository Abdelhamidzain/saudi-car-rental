'use client'
import { cities } from '@/lib/data'
import { useCity } from './city-context'

export function CitySwitcher() {
  const { selectedCity, setSelectedCity } = useCity()
  const current = cities.find(c => c.slug === selectedCity)

  return (
    <div className="nav-dropdown">
      <button className="city-selector-btn" aria-haspopup="listbox" aria-label="اختر المدينة">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>{current?.nameAr || 'اختر المدينة'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div className="nav-dropdown-menu">
        <div className="nav-dropdown-inner" role="listbox" aria-label="المدن">
          {cities.map(c => (
            <button
              key={c.slug}
              role="option"
              aria-selected={selectedCity === c.slug}
              className={`city-option ${selectedCity === c.slug ? 'city-option-active' : ''}`}
              onClick={() => setSelectedCity(c.slug)}
            >
              <span>{c.nameAr}</span>
              <span className="city-option-price">من {c.minPrice} ر.س</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
