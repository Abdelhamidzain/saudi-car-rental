import type { MetadataRoute } from 'next'
import { cities, categories, airports, carModels, SITE_URL } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({ url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 })

  // City pages
  for (const city of cities) {
    entries.push({ url: `${SITE_URL}/sa/${city.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 })
    // Category pages per city
    for (const cat of categories) {
      entries.push({ url: `${SITE_URL}/sa/${city.slug}/${cat.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
    }
    // Car model pages per city
    for (const car of carModels) {
      entries.push({ url: `${SITE_URL}/sa/${city.slug}/${car.category}/${car.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 })
    }
  }

  // Airport pages
  for (const ap of airports) {
    entries.push({ url: `${SITE_URL}/sa/airports/${ap.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 })
  }

  return entries
}
