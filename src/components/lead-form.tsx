'use client'
import { useState } from 'react'
import { cities, categories } from '@/lib/data'

export function LeadForm() {
  const [city,setCity]=useState(''), [pickup,setPickup]=useState(''), [ret,setRet]=useState('')
  const [vehicle,setVehicle]=useState(''), [phone,setPhone]=useState(''), [honey,setHoney]=useState('')
  const [done,setDone]=useState(false)
  const today=new Date().toISOString().split('T')[0]

  function submit() {
    if(honey) return
    if(!city||!pickup||!ret||!vehicle||!phone||phone.length<9){ alert('الرجاء تعبئة جميع الحقول'); return }
    setDone(true)
  }

  if(done) return (
    <div className="glass-form" style={{textAlign:'center'}}>
      <div style={{width:64,height:64,margin:'0 auto 20px',borderRadius:'50%',background:'rgba(26,122,66,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A42" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div className="glass-form-title">تم!</div>
      <p style={{fontSize:'0.875rem',color:'rgba(255,255,255,0.6)',marginBottom:20}}>سيتواصل معك أحد شركائنا خلال دقائق</p>
      <button onClick={()=>setDone(false)} style={{fontSize:'0.875rem',color:'rgba(255,255,255,0.4)'}}>طلب جديد</button>
    </div>
  )

  return (
    <div className="glass-form">
      <div className="glass-form-title">ابحث عن سيارتك</div>
      <div className="glass-form-sub">احصل على أفضل العروض مجاناً</div>
      <div className="form-group">
        <label className="form-label">المدينة</label>
        <select className="form-input" value={city} onChange={e=>setCity(e.target.value)}>
          <option value="">اختر المدينة</option>
          {cities.map(c=><option key={c.slug} value={c.slug}>{c.nameAr}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">الاستلام</label>
          <input type="date" className="form-input" min={today} value={pickup} onChange={e=>{setPickup(e.target.value);if(!ret)setRet(e.target.value)}} style={{colorScheme:'dark'}}/>
        </div>
        <div className="form-group">
          <label className="form-label">التسليم</label>
          <input type="date" className="form-input" min={pickup||today} value={ret} onChange={e=>setRet(e.target.value)} style={{colorScheme:'dark'}}/>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">نوع السيارة</label>
        <select className="form-input" value={vehicle} onChange={e=>setVehicle(e.target.value)}>
          <option value="">اختر النوع</option>
          {categories.map(c=><option key={c.slug} value={c.slug}>{c.icon} {c.nameAr}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">رقم الجوال</label>
        <input type="tel" className="form-input" placeholder="05XXXXXXXX" dir="ltr" value={phone} onChange={e=>setPhone(e.target.value)}/>
      </div>
      <div style={{display:'none'}}><input value={honey} onChange={e=>setHoney(e.target.value)} tabIndex={-1} autoComplete="off"/></div>
      <button className="form-submit" onClick={submit}>أرسل طلبي ←</button>
      <div className="form-note">بياناتك محمية ولن نشاركها مع أي طرف</div>
    </div>
  )
}
