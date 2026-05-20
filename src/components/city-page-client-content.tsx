'use client'

/**
 * City-page client content (Task 9 H1-only SSR experiment).
 *
 * Renders all body content of /sa/[city] post-hydration via slot pattern.
 * The server page keeps only JSON-LD + hero scaffold + H1 + intro paragraph
 * in SSR. Receives DB-overlay-resolved values as props so visible text
 * stays consistent with the server-rendered H1.
 */

import Link from 'next/link'
import {
  cities, categories, carModels, categoryGradients, cityGuides,
  getAirportsForCity,
} from '@/lib/data'
import { LazyLeadForm } from './lazy-lead-form'

type Slot = 'breadcrumb' | 'pills' | 'form' | 'body'

type Props = {
  slot: Slot
  citySlug: string
  cityNameAr: string
  cityMinPrice: number
  faqs: { q: string; a: string }[]
}

export default function CityPageClientContent({ slot, citySlug, cityNameAr, cityMinPrice, faqs }: Props) {
  if (slot === 'breadcrumb') {
    return (
      <div className="breadcrumb">
        <Link href="/">الرئيسية</Link>
        <span className="sep">/</span>
        <span className="current">{cityNameAr}</span>
      </div>
    )
  }

  if (slot === 'pills') {
    const ap = getAirportsForCity(citySlug)
    const partnerCount = cities.find(c => c.slug === citySlug)?.partnerCount ?? 0
    return (
      <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
        <span className="pill pill-glass">{partnerCount} شركة معتمدة</span>
        <span className="pill pill-accent">من {cityMinPrice} ريال/يوم</span>
        {ap.length > 0 && <span className="pill pill-glass">✈️ توصيل المطار</span>}
      </div>
    )
  }

  if (slot === 'form') {
    return <LazyLeadForm defaultCitySlug={citySlug} />
  }

  if (slot === 'body') {
    const ap = getAirportsForCity(citySlug)
    const others = cities.filter(c => c.slug !== citySlug)
    const guide = cityGuides[citySlug] || cityGuides.riyadh

    return (
      <>
        <section className="section"><div className="container">
          <div className="section-header"><div className="section-tag">🚗 الفئات المتوفرة</div><h2 className="section-title">فئات السيارات المتوفرة في {cityNameAr}</h2></div>
          <div className="cats-grid">{categories.map(cat=>(
            <Link key={cat.slug} href={`/sa/${citySlug}/${cat.slug}`} className="cat-card"><div className="cat-emoji">{cat.icon}</div><div className="cat-name">{cat.nameAr}</div><div className="cat-price">من <strong>{cat.minPrice}</strong> ريال</div></Link>
          ))}</div>
        </div></section>

        <section className="section section-white"><div className="container">
          <div className="section-header"><div className="section-tag">📖 دليل الاستئجار</div><h2 className="section-title">دليل استئجار المركبات في {cityNameAr}</h2><p className="section-sub">كل ما تحتاج معرفته قبل استئجار مركبة في {cityNameAr}</p></div>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            {guide.map((p,i)=>(<p key={i} style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>{p}</p>))}
          </div>
        </div></section>

        <section className="section"><div className="container">
          <div className="section-header"><div className="section-tag">⭐ الأكثر طلباً</div><h2 className="section-title">السيارات الأكثر طلباً في {cityNameAr}</h2></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>{carModels.filter((_,i)=>i%3===0||i<7).slice(0,8).map(c=>{
            const catObj=categories.find(ct=>ct.slug===c.category)
            const grad=categoryGradients[c.category]||categoryGradients.economy
            return(
              <Link key={c.slug} href={`/sa/${citySlug}/${c.category}/${c.slug}`} style={{textDecoration:'none',display:'block',position:'relative',borderRadius:16,overflow:'hidden',height:190,background:`linear-gradient(135deg,${grad.from},${grad.to})`,transition:'transform .4s,box-shadow .4s'}}>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(13,27,42,0.9) 0%,rgba(13,27,42,0.15) 60%)'}}/>
                <div style={{position:'absolute',top:14,left:14,zIndex:2,background:'rgba(212,168,83,0.9)',color:'#0D1B2A',padding:'4px 12px',borderRadius:50,fontSize:'.65rem',fontWeight:700}}>من {c.dailyPrice} ريال</div>
                <div style={{position:'absolute',top:14,right:14,zIndex:2,fontSize:'1.5rem'}}>{catObj?.icon}</div>
                <div style={{position:'absolute',bottom:0,right:0,left:0,padding:18,zIndex:2}}>
                  <div style={{fontFamily:"'Cairo',sans-serif",fontSize:'1.1rem',fontWeight:800,color:'#fff'}}>{c.nameAr}</div>
                  <div style={{fontSize:'.7rem',color:'rgba(255,255,255,0.7)',marginTop:4}}>{c.brandAr} • {c.seats} مقاعد • {c.transmissionAr}</div>
                </div>
              </Link>
            )
          })}</div>
        </div></section>

        {ap.length>0&&<section className="section section-white"><div className="container">
          <div className="section-header"><div className="section-tag">✈️ المطارات</div><h2 className="section-title">استئجار مركبة من مطارات {cityNameAr}</h2></div>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:16}}>{ap.map(a=>(
            <Link key={a.slug} href={`/sa/airports/${a.slug}`} className="link-card-white link-card" style={{padding:'20px 32px'}}>
              <div className="airport-code" style={{color:'#D4A853'}}>{a.code}</div><div className="link-card-sub">{a.nameAr.replace(' الدولي','')}</div>
            </Link>
          ))}</div>
        </div></section>}

        <section className="section" id="faq"><div className="container-sm">
          <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة شائعة عن تأجير السيارات في {cityNameAr}</h2></div>
          <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
        </div></section>

        <section className="section section-white"><div className="container">
          <h2 className="section-title" style={{textAlign:'center',marginBottom:24}}>دليل استئجار المركبات</h2>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:16,textAlign:'center'}}>{guide[0]}</p>
            <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,textAlign:'center'}}>{guide[1]}</p>
          </div>
        </div></section>

        <div className="ssr-links">
          <div className="container">
            <h2 className="ssr-links-title">تأجير سيارات {cityNameAr} حسب الفئة</h2>
            <div className="ssr-links-grid">
              {categories.map(c=><Link key={c.slug} href={`/sa/${citySlug}/${c.slug}`}>{c.icon} {c.nameAr} {cityNameAr}</Link>)}
            </div>
            <h2 className="ssr-links-title" style={{marginTop:20}}>تأجير السيارات في مدن أخرى</h2>
            <div className="ssr-links-grid">
              {others.map((c,i)=><Link key={c.slug} href={`/sa/${c.slug}`}>{i===0?'تأجير سيارة':'إيجار مركبات'} {c.nameAr}</Link>)}
            </div>
            {ap.length>0&&<><h2 className="ssr-links-title" style={{marginTop:20}}>الاستلام من المطار</h2>
            <div className="ssr-links-grid">
              {ap.map(a=><Link key={a.slug} href={`/sa/airports/${a.slug}`}>{a.code} — {a.nameAr.replace(' الدولي','')}</Link>)}
            </div></>}
          </div>
        </div>

        <section className="section section-white"><div className="container">
          <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير سيارات في مدن أخرى</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{others.map(c=>(
            <Link key={c.slug} href={`/sa/${c.slug}`} className="link-card"><div className="link-card-name">{c.nameAr}</div><div className="link-card-sub">من {c.minPrice} ريال</div></Link>
          ))}</div>
        </div></section>

      </>
    )
  }

  return null
}
