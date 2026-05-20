import { airports, getCarBySlug, getCategoryBySlug, getCityBySlug } from '@/lib/data'

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

export function buildInCityRoute(citySlug: string, categorySlug: string, carSlug: string): string {
  if (!citySlug || !getCityBySlug(citySlug)) return '/'
  const fallback = `/sa/${citySlug}`
  const cat = categorySlug ? getCategoryBySlug(categorySlug) : undefined
  if (carSlug) {
    const car = getCarBySlug(carSlug)
    if (car && cat && car.category === cat.slug) return `/sa/${citySlug}/${cat.slug}/${car.slug}`
    if (cat) return `/sa/${citySlug}/${cat.slug}`
    return fallback
  }
  if (cat) return `/sa/${citySlug}/${cat.slug}`
  return fallback
}
