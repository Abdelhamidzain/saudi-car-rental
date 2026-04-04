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
    // For now, just show success
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-card rounded-2xl p-7 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h3 className="text-xl font-extrabold text-primary mb-2">تم!</h3>
        <p className="text-sm text-text-mid mb-4">سيتواصل معك أحد شركائنا خلال دقائق</p>
        <button onClick={() => setSubmitted(false)} className="text-sm text-text-mid hover:text-primary">
          طلب جديد
        </button>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl p-7 shadow-xl min-h-[420px]">
      <h2 className="text-xl font-bold text-primary mb-1">احصل على عرض تأجير فوري</h2>
      <p className="text-sm text-text-mid mb-5">مجاني بالكامل</p>
      <div className="grid gap-3">
        {/* City */}
        <div className="flex flex-col gap-1">
          <label htmlFor="f-city" className="text-xs font-bold text-text-mid">المدينة</label>
          <select id="f-city" value={city} onChange={e => setCity(e.target.value)}
            className="p-3 border-2 border-border rounded-lg text-sm bg-white focus:border-primary transition-colors">
            <option value="">اختر</option>
            {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="f-pickup" className="text-xs font-bold text-text-mid">الاستلام</label>
            <input id="f-pickup" type="date" min={today} value={pickup} onChange={e => { setPickup(e.target.value); if (!returnDate) setReturn(e.target.value) }}
              className="p-3 border-2 border-border rounded-lg text-sm bg-white focus:border-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-return" className="text-xs font-bold text-text-mid">التسليم</label>
            <input id="f-return" type="date" min={pickup || today} value={returnDate} onChange={e => setReturn(e.target.value)}
              className="p-3 border-2 border-border rounded-lg text-sm bg-white focus:border-primary transition-colors" />
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex flex-col gap-1">
          <label htmlFor="f-vehicle" className="text-xs font-bold text-text-mid">النوع</label>
          <select id="f-vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)}
            className="p-3 border-2 border-border rounded-lg text-sm bg-white focus:border-primary transition-colors">
            <option value="">اختر</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
          </select>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label htmlFor="f-phone" className="text-xs font-bold text-text-mid">الجوال</label>
          <input id="f-phone" type="tel" placeholder="05xxxxxxxx" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)}
            className="p-3 border-2 border-border rounded-lg text-sm bg-white focus:border-primary transition-colors" />
        </div>

        {/* Honeypot */}
        <div className="hidden"><input type="text" value={honey} onChange={e => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" /></div>

        {/* Submit */}
        <button onClick={handleSubmit}
          className="w-full py-3.5 bg-accent text-primary-dark rounded-xl text-lg font-extrabold hover:bg-accent-hover active:scale-[.98] transition-all mt-1"
          aria-label="أرسل طلب تأجير سيارة مجاناً">
          أرسل طلبي
        </button>
        <p className="text-xs text-text-mid text-center">بياناتك محمية</p>
      </div>
    </div>
  )
}
