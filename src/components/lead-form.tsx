'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cities, categories, carModels } from '@/lib/data'
import { useCity } from './city-context'
import { CONSENT_TEXT_AR } from '@/lib/leads/consent'
import { todayInRiyadh } from '@/lib/leads/date-utils'
import { buildRouteFromContext, buildInCityRoute } from '@/lib/search/url-builder'
import { addDays, diffDays } from '@/lib/search/date-presets'
import { DateRangePicker } from './search/date-range-picker'
import { AirportModeToggle } from './search/airport-mode-toggle'
import { CategoryCardSelector } from './search/category-card-selector'
import { CarModelSelector } from './search/car-model-selector'
import { LeadCaptureModal } from './search/lead-capture-modal'
import { useSearch } from './search/search-context'

type LeadFormProps = {
  selectedCarSlug?: string
  airportSlug?: string
  defaultCategorySlug?: string
  defaultCitySlug?: string
}

export function LeadForm({ selectedCarSlug, airportSlug, defaultCategorySlug, defaultCitySlug }: LeadFormProps = {}) {
  const { selectedCity, setSelectedCity } = useCity()
  const search = useSearch()
  const pathname = usePathname() || ''
  const router = useRouter()
  const today = todayInRiyadh()
  const isAirportRoute = pathname.startsWith('/sa/airports/')

  const [city, setCity] = useState(defaultCitySlug ?? '')
  const pickup = search.pickupDate
  const ret = search.returnDate
  const vehicle = search.categorySlug || defaultCategorySlug || ''
  const car = search.carSlug || selectedCarSlug || ''
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // If a user keeps the site open past midnight, the search context's
  // pickupDate (initialized once on provider mount) can drift into the past.
  // On mount, snap pickup forward to today while preserving the rental
  // duration so the active preset chip (اليوم / أسبوع / …) stays correct.
  useEffect(() => {
    if (pickup && pickup < today) {
      const wantedDays = ret && ret >= pickup ? diffDays(pickup, ret) : 1
      const safeDays = wantedDays > 0 ? wantedDays : 1
      search.setDateRange(today, addDays(today, safeDays))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedCity) setCity(selectedCity)
  }, [selectedCity])

  // Mirror the URL-derived defaultCitySlug into CityContext so the global
  // header city-selector-btn reflects the page's city on first load. This
  // runs on mount and whenever defaultCitySlug changes (e.g. client-side
  // navigation to a different city's page). Manual user picks via the
  // form/header dropdowns still win — they fire setSelectedCity directly,
  // and this effect doesn't re-fire because defaultCitySlug hasn't changed.
  useEffect(() => {
    if (defaultCitySlug && defaultCitySlug !== selectedCity) {
      setSelectedCity(defaultCitySlug)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCitySlug])

  function handleCityChange(slug: string) {
    setCity(slug)
    setSelectedCity(slug)
    if (!slug || slug === defaultCitySlug) return
    // Airport routes: keep airport semantics (map to target city's airport).
    if (isAirportRoute) {
      router.push(buildRouteFromContext(slug, pathname), { scroll: false })
      return
    }
    // Other routes: prefer the user's SearchProvider category/car selections,
    // which already mirror the URL on /sa/[city]/... pages and carry the
    // user's homepage/no-city picks on routes that don't expose them in the URL.
    router.push(buildInCityRoute(slug, search.categorySlug, search.carSlug), { scroll: false })
  }

  function handleVehicleChange(slug: string) {
    search.setCategorySlug(slug)
    // Picking a different category invalidates the previously selected car.
    if (slug && slug !== vehicle) search.setCarSlug('')
    if (!slug) return
    if (isAirportRoute) return
    if (!city) return
    if (slug === defaultCategorySlug) return
    router.push(`/sa/${city}/${slug}`, { scroll: false })
  }

  function handleCarChange(slug: string) {
    search.setCarSlug(slug)
    if (!slug) return
    if (isAirportRoute) return
    if (!city || !vehicle) return
    if (slug === car) return
    router.push(`/sa/${city}/${vehicle}/${slug}`, { scroll: false })
  }

  useEffect(() => {
    if (pickup && ret && ret < pickup) search.setDateRange(pickup, pickup)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, ret])

  function openModal() {
    setErrorMsg(null)
    if (!city || !pickup || !ret || !vehicle) {
      setErrorMsg('الرجاء اختيار المدينة وتاريخ التأجير ونوع السيارة قبل المتابعة')
      return
    }
    setIsModalOpen(true)
  }

  return (
    <div className="glass-form" role="form" aria-label="نموذج طلب تأجير سيارة">
      <div className="glass-form-title">ابحث عن سيارتك</div>
      <div className="glass-form-sub">حدد اختياراتك ثم احصل على أفضل عرض مناسب</div>

      <section className="form-section" aria-label="الموقع">
        <div className="form-section-title">أين تحتاج السيارة؟</div>
        <div className="form-group">
          <label htmlFor="lead-city" className="form-label">المدينة</label>
          <select id="lead-city" className="form-input" value={city} onChange={e => handleCityChange(e.target.value)} aria-required="true">
            <option value="">اختر المدينة</option>
            {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
          </select>
        </div>
        <AirportModeToggle citySlug={city} />
      </section>

      <section className="form-section" aria-label="مدة التأجير">
        <div className="form-section-title">مدة التأجير</div>
        <DateRangePicker
          today={today}
          pickup={pickup}
          ret={ret}
          onChange={(p, r) => search.setDateRange(p, r)}
          onPresetChange={(hint) => search.setDurationHint(hint)}
          hideLabel
        />
      </section>

      <section className="form-section" aria-label="نوع السيارة">
        <div className="form-section-title">نوع السيارة</div>
        <CategoryCardSelector
          value={vehicle}
          onChange={handleVehicleChange}
          categories={categories}
          labelText=""
        />
      </section>

      <section className="form-section" aria-label="موديل السيارة">
        <div className="form-section-title">موديل السيارة</div>
        <CarModelSelector
          value={car}
          onChange={handleCarChange}
          cars={carModels}
          categorySlug={vehicle}
          labelText=""
        />
      </section>

      {/* Stable marker for the floating-CTA observer: it represents the
          actionable end of the form (error region + main CTA), not the
          top of the form, so the floating CTA only hides once the user
          has actually reached the action area. */}
      <div id="lead-form-action" aria-hidden="true" />

      {errorMsg && (
        <div role="alert" style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fecaca', fontSize: '.85rem' }}>
          {errorMsg}
        </div>
      )}

      <button
        id="lead-form-submit"
        className="form-submit"
        onClick={openModal}
        type="button"
        aria-label="احصل على أفضل عرض الآن"
      >
        احصل على أفضل عرض الآن
      </button>
      <div className="form-note">{CONSENT_TEXT_AR}</div>

      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        citySlug={city}
        pickupDate={pickup}
        returnDate={ret}
        categorySlug={vehicle}
        carSlug={car}
        airportSlug={airportSlug ?? ''}
      />
    </div>
  )
}
