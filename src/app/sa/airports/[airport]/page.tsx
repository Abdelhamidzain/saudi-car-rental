import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { airports, categories, getCityBySlug, getAirportBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'

export function generateStaticParams() { return airports.map(a=>({airport:a.slug})) }
export async function generateMetadata({params}:{params:Promise<{airport:string}>}):Promise<Metadata> {
  const ap=getAirportBySlug((await params).airport); if(!ap) return {}; const city=getCityBySlug(ap.citySlug)
  return { title:`تأجير سيارة من ${ap.nameAr} (${ap.code})`, description:`احجز سيارة من ${ap.nameAr}. أسعار من ${city?.minPrice} ريال يومياً.`, alternates:{canonical:`/sa/airports/${ap.slug}`} }
}
const info:Record<string,string>={'king-khalid':'يقع شمال الرياض ويخدم أكثر من 30 مليون مسافر سنوياً.','king-abdulaziz':'بوابة جدة الجوية ونقطة العبور الرئيسية للحجاج.','king-fahd':'أكبر مطار مساحةً ويخدم المنطقة الشرقية.','prince-mohammed':'يخدم زوار المسجد النبوي.','taif':'يخدم المصطافين القادمين لمدينة الورد.'}

export default async function AirportPage({params}:{params:Promise<{airport:string}>}) {
  const ap=getAirportBySlug((await params).airport); if(!ap) notFound()
  const city=getCityBySlug(ap.citySlug); if(!city) notFound()
  const faqs=[{q:`هل توجد مكاتب تأجير داخل ${ap.nameAr}؟`,a:`نعم، في صالات الوصول.`},{q:`كم المسافة لوسط ${city.nameAr}؟`,a:`20-40 دقيقة بالسيارة.`},{q:`هل أستطيع تسليم السيارة في مطار مختلف؟`,a:`بعض الشركاء يوفرون ذلك مقابل رسوم إضافية.`}]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:city.nameAr,url:`/sa/${city.slug}`},{name:ap.code,url:`/sa/airports/${ap.slug}`}]),generateFAQSchema(faqs)]}

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero"><div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner"><div className="hero-text">
        <div className="breadcrumb"><Link href="/">الرئيسية</Link><span className="sep">/</span><Link href={`/sa/${city.slug}`}>{city.nameAr}</Link><span className="sep">/</span><span className="current">{ap.code}</span></div>
        <h1 className="hero-title">تأجير سيارة من <span>{ap.nameAr}</span></h1>
        <p className="hero-subtitle">{info[ap.slug]||''}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}><span className="pill pill-accent">✈️ {ap.code}</span><span className="pill pill-glass">من {city.minPrice} ر.س/يوم</span><span className="pill pill-glass">استلام فوري</span></div>
      </div><div id="form"><LazyLeadForm/></div></div></div>
    </section>

    <section className="section"><div className="container">
      <div className="section-header"><div className="section-tag">🚗 الفئات</div><h2 className="section-title">فئات سيارات في {city.nameAr}</h2></div>
      <div className="cats-grid">{categories.map(cat=>(
        <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`} className="cat-card"><div style={{fontSize:'2rem'}}>{cat.icon}</div><div className="cat-name">{cat.nameAr}</div></Link>
      ))}</div>
    </div></section>

    <section className="section section-white" id="faq"><div className="container-sm">
      <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة عن التأجير من {ap.nameAr}</h2></div>
      <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
    </div></section>

    <section className="section"><div className="container">
      <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>مطارات أخرى</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{airports.filter(a=>a.slug!==ap.slug).map(a=>(
        <Link key={a.slug} href={`/sa/airports/${a.slug}`} className="link-card-white link-card"><div style={{fontFamily:"'Cairo',sans-serif",fontSize:'1.25rem',fontWeight:900,color:'#D4A853',marginBottom:4}}>{a.code}</div><div className="link-card-sub">{a.nameAr.replace(' الدولي','')}</div></Link>
      ))}</div>
    </div></section>
  </>)
}
