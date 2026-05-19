'use client'
import { useState, useEffect, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { cities, categories } from '@/lib/data'
import { useCity } from './city-context'
import { createLead } from '@/lib/leads/create-lead'
import { CONSENT_TEXT_AR } from '@/lib/leads/consent'
import type { CreateLeadError } from '@/lib/leads/types'

type LeadFormProps = {
  selectedCarSlug?: string
  airportSlug?: string
  defaultCategorySlug?: string
}

export function LeadForm({ selectedCarSlug, airportSlug, defaultCategorySlug }: LeadFormProps = {}) {
  const { selectedCity, setSelectedCity } = useCity()
  const pathname = usePathname()
  const today = new Date().toISOString().split('T')[0]

  const [city, setCity] = useState('')
  const [pickup, setPickup] = useState(today)
  const [ret, setRet] = useState('')
  const [vehicle, setVehicle] = useState(defaultCategorySlug ?? '')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [honey, setHoney] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [leadNumber, setLeadNumber] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (selectedCity) setCity(selectedCity)
  }, [selectedCity])

  function handleCityChange(slug: string) {
    setCity(slug)
    setSelectedCity(slug)
  }

  useEffect(() => {
    if (pickup && ret && ret < pickup) setRet(pickup)
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

      <div className="form-group">
        <label htmlFor="lead-city" className="form-label">المدينة</label>
        <select id="lead-city" className="form-input" value={city} onChange={e => handleCityChange(e.target.value)} aria-required="true" disabled={isPending}>
          <option value="">اختر المدينة</option>
          {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="lead-pickup" className="form-label">تاريخ الاستلام</label>
          <input id="lead-pickup" type="date" className="form-input" min={today} value={pickup} onChange={e => { setPickup(e.target.value); if (!ret || ret < e.target.value) setRet(e.target.value) }} style={{ colorScheme: 'dark' }} aria-required="true" disabled={isPending} />
        </div>
        <div className="form-group">
          <label htmlFor="lead-return" className="form-label">تاريخ التسليم</label>
          <input id="lead-return" type="date" className="form-input" min={pickup || today} value={ret} onChange={e => setRet(e.target.value)} style={{ colorScheme: 'dark' }} aria-required="true" disabled={isPending} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="lead-vehicle" className="form-label">نوع السيارة</label>
        <select id="lead-vehicle" className="form-input" value={vehicle} onChange={e => setVehicle(e.target.value)} aria-required="true" disabled={isPending}>
          <option value="">اختر النوع</option>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.nameAr}</option>)}
        </select>
      </div>

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
    </div>
  )
}

function mapErrorToMessage(_error: CreateLeadError, fallbackAr: string): string {
  return fallbackAr
}
