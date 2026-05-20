'use client'
import { useRouter, usePathname } from 'next/navigation'
import { airports } from '@/lib/data'
import { buildInCityRoute } from '@/lib/search/url-builder'
import { useSearch } from './search-context'
import type { CSSProperties } from 'react'

type Props = {
  citySlug: string
  disabled?: boolean
}

function getCityAirport(citySlug: string) {
  return citySlug ? airports.find(a => a.citySlug === citySlug) : undefined
}

export function AirportModeToggle({ citySlug, disabled = false }: Props) {
  const router = useRouter()
  const pathname = usePathname() || ''
  const isAirportRoute = pathname.startsWith('/sa/airports/')
  const { categorySlug, carSlug } = useSearch()

  const ap = getCityAirport(citySlug)
  const cityChosen = !!citySlug
  const cityHasAirport = !!ap

  const inCityDisabled = disabled || !cityChosen
  const airportDisabled = disabled || !cityChosen || !cityHasAirport

  function selectInCity() {
    if (inCityDisabled) return
    if (!isAirportRoute) return
    router.push(buildInCityRoute(citySlug, categorySlug, carSlug), { scroll: false })
  }

  function selectAirport() {
    if (airportDisabled || !ap) return
    if (isAirportRoute && pathname === `/sa/airports/${ap.slug}`) return
    router.push(`/sa/airports/${ap.slug}`, { scroll: false })
  }

  const btn = (active: boolean, btnDisabled: boolean, isLast: boolean): CSSProperties => ({
    flex: 1,
    padding: '10px 12px',
    background: active ? 'rgba(212,168,83,0.18)' : 'transparent',
    color: active ? '#F0D78C' : 'rgba(255,255,255,0.78)',
    border: 'none',
    borderInlineEnd: isLast ? 'none' : '1px solid rgba(255,255,255,0.1)',
    fontSize: '.85rem',
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: btnDisabled ? 'not-allowed' : 'pointer',
    opacity: btnDisabled ? 0.5 : 1,
    transition: 'all .2s',
  })

  return (
    <div className="form-group">
      <div className="form-label">موقع الاستلام</div>
      <div
        role="group"
        aria-label="موقع الاستلام"
        style={{
          display: 'flex',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={selectInCity}
          disabled={inCityDisabled}
          aria-pressed={!isAirportRoute}
          style={btn(!isAirportRoute, inCityDisabled, false)}
        >
          داخل المدينة
        </button>
        <button
          type="button"
          onClick={selectAirport}
          disabled={airportDisabled}
          aria-pressed={isAirportRoute}
          style={btn(isAirportRoute, airportDisabled, true)}
        >
          من المطار
        </button>
      </div>
      {cityChosen && !cityHasAirport && (
        <div style={{ marginTop: 6, fontSize: '.75rem', color: 'rgba(255,255,255,0.55)' }}>
          لا يوجد مطار متاح لهذه المدينة حالياً
        </div>
      )}
    </div>
  )
}
