'use client'
import { useState, useEffect } from 'react'
import { cities, categories } from '@/lib/data'
import { useCity } from './city-context'

export function LeadForm() {
  const { selectedCity, setSelectedCity } = useCity()
  const today = new Date().toISOString().split('T')[0]

  const [city, setCity] = useState('')
  const [pickup, setPickup] = useState(today)
  const [ret, setRet] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [phone, setPhone] = useState('')
  const [honey, setHoney] = useState('')
  const [done, setDone] = useState(false)

  // Sync city from context (when user picks from navbar dropdown)
  useEffect(() => {
    if (selectedCity) setCity(selectedCity)
  }, [selectedCity])

  // Sync back to context when form city changes
  function handleCityChange(slug: string) {
    setCity(slug)
    setSelectedCity(slug)
  }

  // Ensure return date is always >= pickup date
  useEffect(() => {
    if (pickup && ret && ret < pickup) setRet(pickup)
  }, [pickup, ret])

  function submit() {
    if (honey) return
    if (!city || !pickup || !ret || !vehicle || !phone || phone.length < 9) {
      alert('الرجاء تعبئة جميع الحقول')
      return
    }
    setDone(true)
  }

  if (done) return (
    <div className="glass-form" style={{ textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(26,122,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
      </div>
      <div className="glass-form-title" role="status">تم إرسال طلبك!</div>
      <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>سيتواصل معك أحد شركائنا خلال دقائق</p>
      <button onClick={() => setDone(false)} style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.5)' }}>طلب جديد</button>
    </div>
  )

  return (
    <div className="glass-form" role="form" aria-label="نموذج طلب تأجير سيارة">
      <div className="glass-form-title">ابحث عن سيارتك</div>
      <div className="glass-form-sub">احصل على أفضل العروض مجاناً</div>

      <div className="form-group">
        <label htmlFor="lead-city" className="form-label">المدينة</label>
        <select id="lead-city" className="form-input" value={city} onChange={e => handleCityChange(e.target.value)} aria-required="true">
          <option value="">اختر المدينة</option>
          {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="lead-pickup" className="form-label">تاريخ الاستلام</label>
          <input id="lead-pickup" type="date" className="form-input" min={today} value={pickup} onChange={e => { setPickup(e.target.value); if (!ret || ret < e.target.value) setRet(e.target.value) }} style={{ colorScheme: 'dark' }} aria-required="true" />
        </div>
        <div className="form-group">
          <label htmlFor="lead-return" className="form-label">تاريخ التسليم</label>
          <input id="lead-return" type="date" className="form-input" min={pickup || today} value={ret} onChange={e => setRet(e.target.value)} style={{ colorScheme: 'dark' }} aria-required="true" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="lead-vehicle" className="form-label">نوع السيارة</label>
        <select id="lead-vehicle" className="form-input" value={vehicle} onChange={e => setVehicle(e.target.value)} aria-required="true">
          <option value="">اختر النوع</option>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.nameAr}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="lead-phone" className="form-label">رقم الجوال</label>
        <input id="lead-phone" type="tel" className="form-input" placeholder="05XXXXXXXX" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} aria-required="true" autoComplete="tel" />
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}><input tabIndex={-1} value={honey} onChange={e => setHoney(e.target.value)} autoComplete="off" /></div>

      <button className="form-submit" onClick={submit} type="button" aria-label="أرسل طلب تأجير سيارة مجاناً">أرسل طلبي ←</button>
      <div className="form-note">بياناتك محمية ولن نشاركها مع أي طرف</div>
    </div>
  )
}
