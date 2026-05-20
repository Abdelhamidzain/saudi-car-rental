'use client'

/**
 * Airport-page client content (Task 9 H1-only SSR experiment).
 * Renders /sa/airports/[airport] body after hydration via slots.
 */

import Link from 'next/link'
import { airports, categories } from '@/lib/data'
import { LazyLeadForm } from './lazy-lead-form'

type Slot = 'breadcrumb' | 'pills' | 'form' | 'body'

type Props = {
  slot: Slot
  airportSlug: string
  citySlug: string
  airportNameAr: string
  airportCode: string
  cityNameAr: string
  cityMinPrice: number
  faqs: { q: string; a: string }[]
}

export default function AirportPageClientContent({ slot, airportSlug, citySlug, airportNameAr, airportCode, cityNameAr, cityMinPrice, faqs }: Props) {
  if (slot === 'breadcrumb') {
    return (
      <div className="breadcrumb">
        <Link href="/">الرئيسية</Link>
        <span className="sep">/</span>
        <Link href={`/sa/${citySlug}`}>{cityNameAr}</Link>
        <span className="sep">/</span>
        <span className="current">{airportCode}</span>
      </div>
    )
  }

  if (slot === 'pills') {
    return (
      <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
        <span className="pill pill-accent">✈️ {airportCode}</span>
        <span className="pill pill-accent">من {cityMinPrice} ريال/يوم</span>
        <span className="pill pill-glass">استلام فوري</span>
        <span className="pill pill-glass">المكاتب المعتمدة</span>
      </div>
    )
  }

  if (slot === 'form') {
    return <LazyLeadForm defaultCitySlug={citySlug} airportSlug={airportSlug} />
  }

  if (slot === 'body') {
    return (
      <>
        <section className="section section-white"><div className="container">
          <div className="section-header"><div className="section-tag">✨ لماذا الاستئجار من المطار</div><h2 className="section-title">مميزات تأجير سيارة من {airportNameAr}</h2><p className="section-sub">وفّر وقتك واستلم سيارتك مباشرة — بدون انتظار</p></div>
          <div className="features-grid">
            {[
              {icon:'✈️',title:'استلام فوري من المطار',desc:`استلم سيارتك من صالة الوصول في ${airportNameAr} مباشرة بدون انتظار تاكسي أو نقل عام`},
              {icon:'💰',title:'أسعار إيجار تنافسية',desc:`أسعار الإيجار تبدأ من ${cityMinPrice} ريال يومياً — قارن العروض واختر الأنسب`},
              {icon:'🔄',title:'تسليم مرن عند المغادرة',desc:'أعد السيارة لمكتب الإيجار في المطار قبل رحلتك مباشرة بدون عناء'},
              {icon:'✅',title:'مكاتب إيجار مرخصة',desc:'جميع شركاء حاصلون على ترخيص هيئة النقل العام في المملكة'},
            ].map((f,i)=>(
              <div key={i} className="feature-card"><div className="feature-icon">{f.icon}</div><div className="feature-title">{f.title}</div><div className="feature-desc">{f.desc}</div></div>
            ))}
          </div>
        </div></section>

        <section className="section"><div className="container">
          <div className="section-header"><div className="section-tag">🚗 فئات المركبات المتاحة</div><h2 className="section-title">فئات سيارات للتأجير من {cityNameAr}</h2><p className="section-sub">اختر فئة السيارة المناسبة لرحلتك من {airportNameAr}</p></div>
          <div className="cats-grid">{categories.map(cat=>(
            <Link key={cat.slug} href={`/sa/${citySlug}/${cat.slug}`} className="cat-card"><div style={{fontSize:'2rem'}}>{cat.icon}</div><div className="cat-name">{cat.nameAr}</div><div className="cat-price">من {cat.minPrice} ريال</div></Link>
          ))}</div>
        </div></section>

        <section className="section section-white" id="faq"><div className="container-sm">
          <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة شائعة عن الاستئجار من {airportNameAr}</h2></div>
          <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
        </div></section>

        <div className="ssr-links">
          <div className="container">
            <h2 className="ssr-links-title">تأجير سيارات في {cityNameAr}</h2>
            <div className="ssr-links-grid">
              {categories.map(c=><Link key={c.slug} href={`/sa/${citySlug}/${c.slug}`}>{c.icon} {c.nameAr} {cityNameAr}</Link>)}
            </div>
            <h2 className="ssr-links-title" style={{marginTop:20}}>تأجير السيارات من مطارات أخرى</h2>
            <div className="ssr-links-grid">
              {airports.filter(a=>a.slug!==airportSlug).map(a=><Link key={a.slug} href={`/sa/airports/${a.slug}`}>{a.code} — {a.nameAr.replace(' الدولي','')}</Link>)}
            </div>
          </div>
        </div>

        <section className="section"><div className="container">
          <div className="cta-box">
            <div className="hero-glow" style={{width:288,height:288,top:-80,right:-80}}/>
            <div className="cta-title">احجز تأجير سيارة من {airportNameAr} الآن</div>
            <div className="cta-desc">قدّم طلب استئجار مركبة واستلم سيارتك فور وصولك — تأجير السيارات أسهل مع منصتنا</div>
            <Link href="#form" className="cta-btn">قدّم طلبك مجاناً ←</Link>
          </div>
        </div></section>

        <section className="section section-white"><div className="container">
          <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير سيارات من مطارات أخرى</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{airports.filter(a=>a.slug!==airportSlug).map(a=>(
            <Link key={a.slug} href={`/sa/airports/${a.slug}`} className="link-card-white link-card"><div style={{fontFamily:"'Cairo',sans-serif",fontSize:'1.25rem',fontWeight:900,color:'#D4A853',marginBottom:4}}>{a.code}</div><div className="link-card-sub">تأجير سيارة من {a.nameAr.replace(' الدولي','')}</div></Link>
          ))}</div>
        </div></section>
      </>
    )
  }

  return null
}
