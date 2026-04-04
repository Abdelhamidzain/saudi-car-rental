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

  if (submitted) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-success/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h3 className="font-display text-2xl font-black text-white mb-2">تم!</h3>
        <p className="text-sm text-white/60 mb-5">سيتواصل معك أحد شركائنا خلال دقائق</p>
        <button onClick={() => setSubmitted(false)} className="text-sm text-white/40 hover:text-accent transition-colors">
          طلب جديد
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
      {/* Gold top bar */}
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-l from-accent via-accent-light to-accent" />
      
      <h2 className="font-display text-xl font-black text-white mb-1">ابحث عن سيارتك</h2>
      <p className="text-sm text-white/50 mb-6">احصل على أفضل العروض مجاناً</p>
      
      <div className="grid gap-4">
        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-city" className="text-xs font-bold text-white/60">المدينة</label>
          <select id="f-city" value={city} onChange={e => setCity(e.target.value)}
            className="p-3.5 bg-white/7 border border-white/10 rounded-xl text-sm text-white focus:border-accent transition-colors appearance-none cursor-pointer [&>option]:text-black">
            <option value="">اختر المدينة</option>
            {cities.map(c => <option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-pickup" className="text-xs font-bold text-white/60">الاستلام</label>
            <input id="f-pickup" type="date" min={today} value={pickup} onChange={e => { setPickup(e.target.value); if (!returnDate) setReturn(e.target.value) }}
              className="p-3.5 bg-white/7 border border-white/10 rounded-xl text-sm text-white focus:border-accent transition-colors [color-scheme:dark]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-return" className="text-xs font-bold text-white/60">التسليم</label>
            <input id="f-return" type="date" min={pickup || today} value={returnDate} onChange={e => setReturn(e.target.value)}
              className="p-3.5 bg-white/7 border border-white/10 rounded-xl text-sm text-white focus:border-accent transition-colors [color-scheme:dark]" />
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-vehicle" className="text-xs font-bold text-white/60">نوع السيارة</label>
          <select id="f-vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)}
            className="p-3.5 bg-white/7 border border-white/10 rounded-xl text-sm text-white focus:border-accent transition-colors appearance-none cursor-pointer [&>option]:text-black">
            <option value="">اختر النوع</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.nameAr}</option>)}
          </select>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-phone" className="text-xs font-bold text-white/60">رقم الجوال</label>
          <input id="f-phone" type="tel" placeholder="05XXXXXXXX" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)}
            className="p-3.5 bg-white/7 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:border-accent transition-colors" />
        </div>

        {/* Honeypot */}
        <div className="hidden"><input type="text" value={honey} onChange={e => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" /></div>

        {/* Submit */}
        <button onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-l from-accent to-accent-hover rounded-xl text-primary font-display text-lg font-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,168,83,0.35)] active:scale-[0.98] transition-all mt-1"
          aria-label="أرسل طلب تأجير سيارة مجاناً">
          أرسل طلبي ←
        </button>
        <p className="text-xs text-white/30 text-center">بياناتك محمية ولن نشاركها مع أي طرف</p>
      </div>
    </div>
  )
}
