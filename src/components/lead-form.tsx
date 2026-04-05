'use client'

import { useState } from 'react'
import { cities, categories } from '@/lib/data'

export function LeadForm() {
  const [city, setCity] = useState('')
  const [pickup, setPickup] = useState('')
  const [returnDate, setReturn] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [phone, setPhone] = useState('')
  const [honey, setHoney] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit() {
    if (honey) return
    if (!city || !pickup || !returnDate || !vehicle || !phone || phone.length < 9) {
      alert('الرجاء تعبئة جميع الحقول')
      return
    }
    setSubmitted(true)
  }

  const inputStyle: React.CSSProperties = {
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    width: '100%',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.3s',
  }

  if (submitted) {
    return (
      <div className="rounded-3xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(26,122,66,0.2)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h3 className="font-display text-2xl font-black text-white mb-2">تم!</h3>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>سيتواصل معك أحد شركائنا خلال دقائق</p>
        <button onClick={() => setSubmitted(false)} className="text-sm hover:text-accent transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          طلب جديد
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Gold top bar */}
      <div className="absolute top-0 right-0 left-0 h-1" style={{ background: 'linear-gradient(90deg, #D4A853, #F0D78C, #D4A853)' }} />

      <h2 className="font-display text-xl font-black text-white mb-1">ابحث عن سيارتك</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>احصل على أفضل العروض مجاناً</p>

      <div className="grid gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-city" className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>المدينة</label>
          <select id="f-city" value={city} onChange={e => setCity(e.target.value)} style={inputStyle}>
            <option value="">اختر المدينة</option>
            {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-pickup" className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>الاستلام</label>
            <input id="f-pickup" type="date" min={today} value={pickup}
              onChange={e => { setPickup(e.target.value); if (!returnDate) setReturn(e.target.value) }}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-return" className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>التسليم</label>
            <input id="f-return" type="date" min={pickup || today} value={returnDate}
              onChange={e => setReturn(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-vehicle" className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>نوع السيارة</label>
          <select id="f-vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)} style={inputStyle}>
            <option value="">اختر النوع</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.nameAr}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-phone" className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>رقم الجوال</label>
          <input id="f-phone" type="tel" placeholder="05XXXXXXXX" dir="ltr" value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle} />
        </div>

        <div className="hidden"><input type="text" value={honey} onChange={e => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" /></div>

        <button onClick={handleSubmit}
          className="w-full py-4 rounded-xl font-display text-lg font-black transition-all hover:opacity-90 active:scale-[0.98] mt-1"
          style={{ background: 'linear-gradient(135deg, #D4A853, #B8912E)', color: '#0D1B2A' }}
          aria-label="أرسل طلب تأجير سيارة مجاناً">
          أرسل طلبي ←
        </button>
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>بياناتك محمية ولن نشاركها مع أي طرف</p>
      </div>
    </div>
  )
}
