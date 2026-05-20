'use client'
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import {
  applyRouteContext,
  deriveSearchStateFromPathname,
  getDefaultSearchDates,
  type SearchState,
} from '@/lib/search/state'

interface SearchContextType extends SearchState {
  setCitySlug: (v: string) => void
  setCategorySlug: (v: string) => void
  setCarSlug: (v: string) => void
  setAirportSlug: (v: string) => void
  setAirportMode: (v: boolean) => void
  setDateRange: (pickup: string, ret: string) => void
  setDurationHint: (v: string) => void
}

function buildInitialState(pathname: string): SearchState {
  const derived = deriveSearchStateFromPathname(pathname)
  const dates = getDefaultSearchDates()
  return {
    citySlug: derived.citySlug ?? '',
    categorySlug: derived.categorySlug ?? '',
    carSlug: derived.carSlug ?? '',
    airportSlug: derived.airportSlug ?? '',
    airportMode: derived.airportMode ?? false,
    pickupDate: dates.pickupDate,
    returnDate: dates.returnDate,
    durationHint: 'today',
  }
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ''
  const [state, setState] = useState<SearchState>(() => buildInitialState(pathname))

  useEffect(() => {
    setState(s => {
      const next = applyRouteContext(s, pathname)
      if (
        next.citySlug === s.citySlug &&
        next.categorySlug === s.categorySlug &&
        next.carSlug === s.carSlug &&
        next.airportSlug === s.airportSlug &&
        next.airportMode === s.airportMode
      ) return s
      return { ...s, ...next }
    })
  }, [pathname])

  const value = useMemo<SearchContextType>(() => ({
    ...state,
    setCitySlug: v => setState(s => ({ ...s, citySlug: v })),
    setCategorySlug: v => setState(s => ({ ...s, categorySlug: v })),
    setCarSlug: v => setState(s => ({ ...s, carSlug: v })),
    setAirportSlug: v => setState(s => ({ ...s, airportSlug: v })),
    setAirportMode: v => setState(s => ({ ...s, airportMode: v })),
    setDateRange: (pickup, ret) => setState(s => ({ ...s, pickupDate: pickup, returnDate: ret })),
    setDurationHint: v => setState(s => ({ ...s, durationHint: v })),
  }), [state])

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within SearchProvider')
  return ctx
}
