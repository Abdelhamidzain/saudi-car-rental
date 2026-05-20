import { getCityBySlug, getCategoryBySlug, getCarBySlug, getAirportBySlug } from '@/lib/data'
import { todayInRiyadh } from '@/lib/leads/date-utils'
import { addDays } from './date-presets'

export interface SearchState {
  citySlug: string
  categorySlug: string
  carSlug: string
  airportSlug: string
  airportMode: boolean
  pickupDate: string
  returnDate: string
  durationHint: string
}

export type RouteContext = Pick<SearchState, 'citySlug' | 'categorySlug' | 'carSlug' | 'airportSlug' | 'airportMode'>

export function getDefaultSearchDates(): { pickupDate: string; returnDate: string } {
  const t = todayInRiyadh()
  return { pickupDate: t, returnDate: addDays(t, 3) }
}

const EMPTY_ROUTE_CONTEXT: RouteContext = {
  citySlug: '',
  categorySlug: '',
  carSlug: '',
  airportSlug: '',
  airportMode: false,
}

export function deriveSearchStateFromPathname(pathname: string): Partial<RouteContext> {
  const airportMatch = pathname.match(/^\/sa\/airports\/([^/]+)/)
  if (airportMatch) {
    const ap = getAirportBySlug(airportMatch[1])
    if (ap) {
      return { airportSlug: ap.slug, airportMode: true, citySlug: ap.citySlug }
    }
    return {}
  }

  const carMatch = pathname.match(/^\/sa\/([^/]+)\/([^/]+)\/([^/]+)/)
  if (carMatch) {
    const [, citySlug, catSlug, carSlug] = carMatch
    const out: Partial<RouteContext> = {}
    if (getCityBySlug(citySlug)) out.citySlug = citySlug
    if (getCategoryBySlug(catSlug)) out.categorySlug = catSlug
    if (getCarBySlug(carSlug)) out.carSlug = carSlug
    return out
  }

  const catMatch = pathname.match(/^\/sa\/([^/]+)\/([^/]+)/)
  if (catMatch) {
    const [, citySlug, catSlug] = catMatch
    const out: Partial<RouteContext> = {}
    if (getCityBySlug(citySlug)) out.citySlug = citySlug
    if (getCategoryBySlug(catSlug)) out.categorySlug = catSlug
    return out
  }

  const cityMatch = pathname.match(/^\/sa\/([^/]+)/)
  if (cityMatch) {
    const [, citySlug] = cityMatch
    if (getCityBySlug(citySlug)) return { citySlug }
    return {}
  }

  return {}
}

export function applyRouteContext(prev: RouteContext, pathname: string): RouteContext {
  if (!pathname.startsWith('/sa/')) return prev
  const derived = deriveSearchStateFromPathname(pathname)
  // Airport routes don't carry category/car in their URL — preserve the user's
  // prior category/car pick so an in-city → airport toggle keeps their selection.
  if (pathname.startsWith('/sa/airports/')) {
    return {
      ...EMPTY_ROUTE_CONTEXT,
      ...derived,
      categorySlug: prev.categorySlug,
      carSlug: prev.carSlug,
    }
  }
  return { ...EMPTY_ROUTE_CONTEXT, ...derived }
}
