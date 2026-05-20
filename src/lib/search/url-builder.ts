import { airports, getCarBySlug, getCategoryBySlug } from '@/lib/data'

export function buildRouteFromContext(targetCitySlug: string, currentPathname: string): string {
  const fallback = `/sa/${targetCitySlug}`

  const airportMatch = currentPathname.match(/^\/sa\/airports\/[^/]+/)
  if (airportMatch) {
    const ap = airports.find(a => a.citySlug === targetCitySlug)
    return ap ? `/sa/airports/${ap.slug}` : fallback
  }

  const carMatch = currentPathname.match(/^\/sa\/[^/]+\/([^/]+)\/([^/]+)/)
  if (carMatch) {
    const [, catSlug, carSlug] = carMatch
    const cat = getCategoryBySlug(catSlug)
    const car = getCarBySlug(carSlug)
    if (cat && car && car.category === cat.slug) {
      return `/sa/${targetCitySlug}/${cat.slug}/${car.slug}`
    }
    if (cat) return `/sa/${targetCitySlug}/${cat.slug}`
    return fallback
  }

  const catOnlyMatch = currentPathname.match(/^\/sa\/[^/]+\/([^/]+)/)
  if (catOnlyMatch) {
    const [, catSlug] = catOnlyMatch
    const cat = getCategoryBySlug(catSlug)
    if (cat) return `/sa/${targetCitySlug}/${cat.slug}`
    return fallback
  }

  return fallback
}
