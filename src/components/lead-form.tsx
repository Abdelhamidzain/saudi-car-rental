'use client'
import { useState, useEffect, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cities, categories } from '@/lib/data'
import { useCity } from './city-context'
import { createLead } from '@/lib/leads/create-lead'
import { CONSENT_TEXT_AR } from '@/lib/leads/consent'
import { todayInRiyadh } from '@/lib/leads/date-utils'
import { buildRouteFromContext } from '@/lib/search/url-builder'
import { addDays, diffDays } from '@/lib/search/date-presets'
import type { CreateLeadError } from '@/lib/leads/types'
import { DateRangePicker } from './search/date-range-picker'
import { AirportModeToggle } from './search/airport-mode-toggle'
import { CategoryCardSelector } from './search/category-card-selector'
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
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [honey, setHoney] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [leadNumber, setLeadNumber] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
    if (slug && slug !== defaultCitySlug) {
      router.push(buildRouteFromContext(slug, pathname))
    }
  }

  function handleVehicleChange(slug: string) {
    search.setCategorySlug(slug)
    if (!slug) return
    if (isAirportRoute) return
    if (!city) return
    if (slug === defaultCategorySlug) return
    router.push(`/sa/${city}/${slug}`)
  }

  useEffect(() => {
    if (pickup && ret && ret < pickup) search.setDateRange(pickup, pickup)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, ret])

  function readUtmFromLocation() {
    if (typeof window === 'undefined') return {}
    const params = new URLSearchParams(window.location.search)
    return {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      content: params.get('utm_content'),
      term: params.get('utm_term'),
    }
  }

  function submit() {
    setErrorMsg(null)

    if (!city || !pickup || !ret || !vehicle || !phone || phone.length < 9) {
      setErrorMsg('الرجاء تعبئة جميع الحقول')
      return
    }

    const sourcePage =
      typeof window !== 'undefined'
        ? pathname + window.location.search
        : pathname

    startTransition(async () => {
      const result = await createLead({
        customer_phone: phone,
        city_slug: city,
        pickup_date: pickup,
        return_date: ret,
        category_slug: vehicle || null,
        selected_car_slug: selectedCarSlug ?? null,
        airport_slug: airportSlug ?? null,
        request_type: 'best_offer',
        pickup_location: null,
        customer_notes: notes || null,
        source_page: sourcePage,
        utm: readUtmFromLocation(),
        honey,
      })

      if (result.ok) {
        setLeadNumber(result.lead_number)
      } else {
        setErrorMsg(mapErrorToMessage(result.error, result.message_ar))
      }
    })
  }

  function resetForm() {
    setLeadNumber(null)
    setErrorMsg(null)
    setHoney('')
    setPhone('')
    setNotes('')
  }

  if (leadNumber) return (
    <div className="glass-form" style={{ textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(26,122,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
      </div>
      <div className="glass-form-title" role="status">تم إرسال طلبك!</div>
      <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>تم استلام طلبك. ستتواصل معك شركة التأجير خلال دقائق لتأكيد السعر والتوفر.</p>
      <div style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.85)', marginBottom: 20, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', direction: 'ltr' }}>
        رقم الطلب: <strong>{leadNumber}</strong>
      </div>
      <button onClick={resetForm} style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.5)' }}>طلب جديد</button>
    </div>
  )

  return (
    <div className="glass-form" role="form" aria-label="نموذج طلب تأجير سيارة">
      <div className="glass-form-title">ابحث عن سيارتك</div>
      <div className="glass-form-sub">احصل على أفضل العروض مجاناً</div>

      <section className="form-section" aria-label="الموقع">
        <div className="form-section-title">أين تحتاج السيارة؟</div>
        <div className="form-group">
          <label htmlFor="lead-city" className="form-label">المدينة</label>
          <select id="lead-city" className="form-input" value={city} onChange={e => handleCityChange(e.target.value)} aria-required="true" disabled={isPending}>
            <option value="">اختر المدينة</option>
            {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
          </select>
        </div>
        <AirportModeToggle citySlug={city} disabled={isPending} />
      </section>

      <section className="form-section" aria-label="مدة التأجير">
        <div className="form-section-title">مدة التأجير</div>
        <DateRangePicker
          today={today}
          pickup={pickup}
          ret={ret}
          onChange={(p, r) => search.setDateRange(p, r)}
          onPresetChange={(hint) => search.setDurationHint(hint)}
          disabled={isPending}
          hideLabel
        />
      </section>

      <section className="form-section" aria-label="نوع السيارة">
        <div className="form-section-title">نوع السيارة</div>
        <CategoryCardSelector
          value={vehicle}
          onChange={handleVehicleChange}
          categories={categories}
          disabled={isPending}
          labelText=""
        />
      </section>

      <section className="form-section" aria-label="بيانات التواصل">
        <div className="form-section-title">بيانات التواصل</div>
        <div className="form-group">
          <label htmlFor="lead-phone" className="form-label">رقم الجوال</label>
          <input id="lead-phone" type="tel" className="form-input" placeholder="05XXXXXXXX" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} aria-required="true" autoComplete="tel" disabled={isPending} />
        </div>

        <div className="form-group">
          <label htmlFor="lead-notes" className="form-label">ملاحظات إضافية (اختياري)</label>
          <textarea
            id="lead-notes"
            className="form-input"
            placeholder="مثال: كرسي أطفال، توصيل لموقع معين، إيجار شهري"
            rows={2}
            maxLength={500}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={isPending}
            style={{ resize: 'vertical', minHeight: 56 }}
          />
        </div>

        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}><input tabIndex={-1} value={honey} onChange={e => setHoney(e.target.value)} autoComplete="off" /></div>

        {errorMsg && (
          <div role="alert" style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fecaca', fontSize: '.85rem' }}>
            {errorMsg}
          </div>
        )}

        <button className="form-submit" onClick={submit} type="button" aria-label="أرسل طلب تأجير سيارة مجاناً" disabled={isPending}>
          {isPending ? 'جاري الإرسال…' : 'أرسل طلبي ←'}
        </button>
        <div className="form-note">{CONSENT_TEXT_AR}</div>
      </section>
    </div>
  )
}

function mapErrorToMessage(_error: CreateLeadError, fallbackAr: string): string {
  return fallbackAr
}
