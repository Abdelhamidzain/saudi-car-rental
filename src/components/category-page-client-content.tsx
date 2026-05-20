'use client'

/**
 * Category-page client content (Task 9 H1-only SSR experiment).
 * Renders /sa/[city]/[category] body after hydration via slots.
 */

import Link from 'next/link'
import {
  cities, categories, getCategoryBySlug, getCarsByCategory, categoryGradients,
} from '@/lib/data'
import { LazyLeadForm } from './lazy-lead-form'

type Slot = 'breadcrumb' | 'pills' | 'form' | 'body'

type Props = {
  slot: Slot
  citySlug: string
  catSlug: string
  cityNameAr: string
  categoryNameAr: string
  faqs: { q: string; a: string }[]
}

export default function CategoryPageClientContent({ slot, citySlug, catSlug, cityNameAr, categoryNameAr, faqs }: Props) {
  const cat = getCategoryBySlug(catSlug)
  if (!cat) return null

  if (slot === 'breadcrumb') {
    return (
      <div className="breadcrumb">
        <Link href="/">الرئيسية</Link>
        <span className="sep">/</span>
        <Link href={`/sa/${citySlug}`}>{cityNameAr}</Link>
        <span className="sep">/</span>
        <span className="current">{categoryNameAr}</span>
      </div>
    )
  }

  if (slot === 'pills') {
    return (
      <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
        <span className="pill pill-accent">من {cat.minPrice} ريال/يوم</span>
        <span className="pill pill-glass">{cat.icon} {categoryNameAr}</span>
        <span className="pill pill-glass">شركات مرخصة</span>
      </div>
    )
  }

  if (slot === 'form') {
    return <LazyLeadForm defaultCitySlug={citySlug} defaultCategorySlug={cat.slug} />
  }

  if (slot === 'body') {
    const otherCats = categories.filter(c => c.slug !== cat.slug)
    const otherCities = cities.filter(c => c.slug !== citySlug).slice(0, 4)
    const cars = getCarsByCategory(cat.slug)

    return (
      <>
        {cars.length > 0 && (
        <section className="section section-white"><div className="container">
          <div className="section-header"><div className="section-tag">{cat.icon} السيارات المتوفرة</div><h2 className="section-title">سيارات {categoryNameAr} للإيجار في {cityNameAr}</h2><p className="section-sub">اختر الموديل المناسب وقارن العروض المتاحة</p></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20}}>{cars.map(c=>{
            const grad=categoryGradients[cat.slug]||categoryGradients.economy
            return(
            <Link key={c.slug} href={`/sa/${citySlug}/${cat.slug}/${c.slug}`} style={{textDecoration:'none',display:'block',position:'relative',borderRadius:16,overflow:'hidden',height:210,background:`linear-gradient(135deg,${grad.from},${grad.to})`,transition:'transform .4s,box-shadow .4s'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(13,27,42,0.9) 0%,rgba(13,27,42,0.15) 60%)'}}/>
              <div style={{position:'absolute',top:16,left:16,zIndex:2,background:'rgba(212,168,83,0.9)',color:'#0D1B2A',padding:'5px 14px',borderRadius:50,fontSize:'.7rem',fontWeight:700}}>من {c.dailyPrice} ريال/يوم</div>
              <div style={{position:'absolute',top:16,right:16,zIndex:2,fontSize:'1.8rem'}}>{cat.icon}</div>
              <div style={{position:'absolute',bottom:0,right:0,left:0,padding:20,zIndex:2}}>
                <div style={{fontFamily:"'Cairo',sans-serif",fontSize:'1.25rem',fontWeight:800,color:'#fff'}}>{c.nameAr}</div>
                <div style={{display:'flex',gap:12,marginTop:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:'.7rem',color:'rgba(255,255,255,0.75)'}}>{c.brandAr} • {c.year}</span>
                  <span style={{fontSize:'.7rem',color:'rgba(255,255,255,0.75)'}}>{c.seats} مقاعد • {c.transmissionAr}</span>
                </div>
                <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.1)',fontSize:'.75rem',color:'#D4A853',fontWeight:700}}>عرض التفاصيل والسعر ←</div>
              </div>
            </Link>
          )})}</div>
        </div></section>
        )}

        <section className="section"><div className="container">
          <div className="section-header"><div className="section-tag">🚗 فئات أخرى</div><h2 className="section-title">فئات أخرى متوفرة في {cityNameAr}</h2></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:16}}>{otherCats.map(c=>(
            <Link key={c.slug} href={`/sa/${citySlug}/${c.slug}`} className="cat-card"><div style={{fontSize:'2rem'}}>{c.icon}</div><div className="cat-name">{c.nameAr}</div><div className="cat-price">من {c.minPrice} ريال</div></Link>
          ))}</div>
        </div></section>

        <section className="section section-white"><div className="container">
          <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير سيارات {categoryNameAr} في مدن أخرى</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{otherCities.map(c=>(
            <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}`} className="link-card"><div className="link-card-name">{c.nameAr}</div><div className="link-card-sub">من {cat.minPrice} ريال</div></Link>
          ))}</div>
        </div></section>

        <section className="section" id="faq"><div className="container-sm">
          <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة عن تأجير سيارات {categoryNameAr} في {cityNameAr}</h2></div>
          <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
        </div></section>

        <div className="ssr-links">
          <div className="container">
            <h2 className="ssr-links-title">تأجير سيارات {categoryNameAr} في مدن أخرى</h2>
            <div className="ssr-links-grid">
              {cities.filter(c=>c.slug!==citySlug).slice(0,5).map(c=><Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}`}>{cat.icon} {categoryNameAr} {c.nameAr}</Link>)}
            </div>
            <h2 className="ssr-links-title" style={{marginTop:20}}>تأجير سيارة من فئات أخرى في {cityNameAr}</h2>
            <div className="ssr-links-grid">
              {categories.filter(c=>c.slug!==cat.slug).map(c=><Link key={c.slug} href={`/sa/${citySlug}/${c.slug}`}>{c.icon} {c.nameAr}</Link>)}
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}
