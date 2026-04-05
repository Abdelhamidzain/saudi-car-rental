'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cities } from '@/lib/data'

export function CitySwitcher() {
  const path = usePathname()
  // Extract current city from path like /sa/riyadh or /sa/riyadh/economy
  const currentCity = cities.find(c => path?.includes(`/sa/${c.slug}`))

  return (
    <div className="city-switcher" role="navigation" aria-label="اختيار المدينة">
      {cities.map(c => {
        const isActive = currentCity?.slug === c.slug
        return (
          <Link
            key={c.slug}
            href={`/sa/${c.slug}`}
            className={`city-chip ${isActive ? 'city-chip-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {c.nameAr}
          </Link>
        )
      })}
    </div>
  )
}
