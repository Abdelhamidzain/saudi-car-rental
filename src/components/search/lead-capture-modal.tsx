'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { createLead } from '@/lib/leads/create-lead'
import { CONSENT_TEXT_AR } from '@/lib/leads/consent'
import { cities, categories, carModels, airports } from '@/lib/data'
import { formatDateDisplay, diffDays, daysLabelAr } from '@/lib/search/date-presets'
import type { CreateLeadError } from '@/lib/leads/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  citySlug: string
  pickupDate: string
  returnDate: string
  categorySlug: string
  carSlug: string
  airportSlug: string
}

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

function mapErrorToMessage(_error: CreateLeadError, fallbackAr: string): string {
  return fallbackAr
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  citySlug,
  pickupDate,
  returnDate,
  categorySlug,
  carSlug,
  airportSlug,
}: Props) {
  const pathname = usePathname() ?? ''
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [honey, setHoney] = useState('')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [leadNumber, setLeadNumber] = useState<string | null>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => phoneRef.current?.focus(), 50)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  function reset() {
    setPhone('')
    setNotes('')
    setHoney('')
    setErrorMsg(null)
    setLeadNumber(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function submit() {
    setErrorMsg(null)
    if (!phone || phone.length < 9) {
      setErrorMsg('الرجاء إدخال رقم جوال صحيح')
      return
    }
    const sourcePage = typeof window !== 'undefined' ? pathname + window.location.search : pathname

    startTransition(async () => {
      const result = await createLead({
        customer_phone: phone,
        city_slug: citySlug,
        pickup_date: pickupDate,
        return_date: returnDate,
        category_slug: categorySlug || null,
        selected_car_slug: carSlug || null,
        airport_slug: airportSlug || null,
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

  if (!isOpen) return null

  const cityNameAr = cities.find(c => c.slug === citySlug)?.nameAr
  const categoryNameAr = categories.find(c => c.slug === categorySlug)?.nameAr
  const carNameAr = carSlug ? carModels.find(c => c.slug === carSlug)?.nameAr : undefined
  const airportNameAr = airportSlug ? airports.find(a => a.slug === airportSlug)?.nameAr : undefined
  const days = diffDays(pickupDate, returnDate)

  if (leadNumber) {
    return (
      <div className="lead-modal-backdrop" onClick={handleClose} role="presentation">
        <div
          className="lead-modal"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="تم إرسال الطلب"
        >
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(26,122,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="lead-modal-title" role="status">تم إرسال طلبك!</div>
            <p className="lead-modal-sub" style={{ marginBottom: 12 }}>
              تم استلام طلبك. ستتواصل معك شركة التأجير خلال دقائق لتأكيد السعر والتوفر.
            </p>
            <div style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.85)', marginBottom: 20, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', direction: 'ltr' }}>
              رقم الطلب: <strong>{leadNumber}</strong>
            </div>
            <button className="form-submit" onClick={handleClose} type="button">إغلاق</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lead-modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="lead-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        <button
          className="lead-modal-close"
          onClick={handleClose}
          type="button"
          aria-label="إغلاق"
          disabled={isPending}
        >
          ×
        </button>

        <h2 id="lead-modal-title" className="lead-modal-title">احصل على أفضل عرض الآن</h2>
        <p className="lead-modal-sub">اترك رقم جوالك وسنساعدك في الوصول إلى عرض مناسب حسب اختياراتك.</p>

        {(cityNameAr || categoryNameAr) && (
          <div className="lead-modal-summary" aria-label="ملخص الطلب">
            {airportNameAr ? (
              <div><span aria-hidden="true">📍 </span>{airportNameAr}</div>
            ) : cityNameAr ? (
              <div><span aria-hidden="true">📍 </span>{cityNameAr}</div>
            ) : null}
            {pickupDate && returnDate && days > 0 && (
              <div>
                <span aria-hidden="true">📅 </span>
                <span dir="ltr" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  {formatDateDisplay(pickupDate)} ← {formatDateDisplay(returnDate)}
                </span>
                <span style={{ color: '#D4A853', marginInlineStart: 8, fontWeight: 700 }}>{daysLabelAr(days)}</span>
              </div>
            )}
            {categoryNameAr && (
              <div>
                <span aria-hidden="true">🚗 </span>{categoryNameAr}
                {carNameAr ? ` · ${carNameAr}` : ''}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="modal-phone" className="form-label">رقم الجوال</label>
          <input
            ref={phoneRef}
            id="modal-phone"
            type="tel"
            className="form-input"
            placeholder="05XXXXXXXX"
            dir="ltr"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            aria-required="true"
            autoComplete="tel"
            disabled={isPending}
          />
        </div>

        <div className="form-group">
          <label htmlFor="modal-notes" className="form-label">ملاحظات إضافية (اختياري)</label>
          <textarea
            id="modal-notes"
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

        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <input
            tabIndex={-1}
            value={honey}
            onChange={e => setHoney(e.target.value)}
            autoComplete="off"
            aria-hidden="true"
          />
        </div>

        {errorMsg && (
          <div role="alert" style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fecaca', fontSize: '.85rem' }}>
            {errorMsg}
          </div>
        )}

        <button
          className="form-submit"
          onClick={submit}
          type="button"
          aria-label="احصل على أفضل عرض الآن"
          disabled={isPending}
        >
          {isPending ? 'جاري الإرسال…' : 'احصل على أفضل عرض الآن'}
        </button>
        <div className="form-note">{CONSENT_TEXT_AR}</div>
      </div>
    </div>
  )
}
