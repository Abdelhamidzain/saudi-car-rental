import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getCityBySlug, getCategoryBySlug, getCarsByCategory, categoryGradients, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'

export function generateStaticParams() { const p:{city:string;category:string}[]=[]; for(const c of cities) for(const cat of categories) p.push({city:c.slug,category:cat.slug}); return p }
export async function generateMetadata({params}:{params:Promise<{city:string;category:string}>}):Promise<Metadata> {
  const city=getCityBySlug((await params).city),cat=getCategoryBySlug((await params).category); if(!city||!cat) return {}
  return { title:`تأجير سيارات ${cat.nameAr} في ${city.nameAr} — من ${cat.minPrice} ريال/يوم`, description:`قارن عروض إيجار سيارات ${cat.nameAr} في ${city.nameAr}.`, alternates:{canonical:`/sa/${city.slug}/${cat.slug}`} }
}

const descs:Record<string,(c:string)=>string>={
  economy:c=>`وفّر ميزانيتك مع تأجير سيارات اقتصادية في ${c}. هيونداي اكسنت وتويوتا يارس.`,
  sedan:c=>`استمتع بالراحة مع سيارات سيدان في ${c}. تويوتا كامري وهيونداي سوناتا.`,
  suv:c=>`استكشف ${c} مع دفع رباعي. فورتشنر وباترول.`,
  luxury:c=>`سيارات فاخرة في ${c}. مرسيدس ولكزس وبي ام دبليو.`,
  '7-seater':c=>`سيارات 7 مقاعد في ${c}. إنوفا وفورتشنر وستاريا.`,
  pickup:c=>`بيك أب في ${c}. هايلكس ونافارا.`,
  van:c=>`فان في ${c}. هاي إيس — للمجموعات السياحية.`,
}

export default async function CategoryPage({params}:{params:Promise<{city:string;category:string}>}) {
  const city=getCityBySlug((await params).city),cat=getCategoryBySlug((await params).category); if(!city||!cat) notFound()
  const desc=(descs[cat.slug]||(c=>`تأجير ${cat.nameAr} في ${c}.`))(city.nameAr)
  const otherCats=categories.filter(c=>c.slug!==cat.slug), otherCities=cities.filter(c=>c.slug!==city.slug).slice(0,4)
  const cars=getCarsByCategory(cat.slug)
  const faqs=[{q:`كم سعر تأجير ${cat.nameAr} في ${city.nameAr}؟`,a:`يبدأ من ${cat.minPrice} ريال يومياً.`},{q:`هل تتوفر للإيجار الشهري؟`,a:`نعم، بتخفيض 30-40%.`},{q:`ما المستندات المطلوبة؟`,a:`رخصة قيادة سارية وهوية أو جواز سفر.`}]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:city.nameAr,url:`/sa/${city.slug}`},{name:cat.nameAr,url:`/sa/${city.slug}/${cat.slug}`}]),generateFAQSchema(faqs)]}

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero"><div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner"><div className="hero-text">
        <div className="breadcrumb"><Link href="/">الرئيسية</Link><span className="sep">/</span><Link href={`/sa/${city.slug}`}>{city.nameAr}</Link><span className="sep">/</span><span className="current">{cat.nameAr}</span></div>
        <h1 className="hero-title">تأجير سيارات {cat.nameAr} في <span>{city.nameAr}</span></h1>
        <p className="hero-subtitle">{desc}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}><span className="pill pill-accent">من {cat.minPrice} ر.س/يوم</span><span className="pill pill-glass">{cat.icon} {cat.nameAr}</span><span className="pill pill-glass">تأمين شامل</span></div>
      </div><div id="form"><LazyLeadForm/></div></div></div>
    </section>

    {/* CAR MODELS */}
    {cars.length > 0 && (
    <section className="section section-white"><div className="container">
      <div className="section-header"><div className="section-tag">{cat.icon} السيارات المتوفرة</div><h2 className="section-title">سيارات {cat.nameAr} للتأجير في {city.nameAr}</h2><p className="section-sub">اختر الموديل المناسب وقارن أسعار تأجير {cat.nameAr}</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20}}>{cars.map(c=>{
        const grad=categoryGradients[cat.slug]||categoryGradients.economy
        return(
        <Link key={c.slug} href={`/sa/${city.slug}/${cat.slug}/${c.slug}`} style={{textDecoration:'none',display:'block',position:'relative',borderRadius:16,overflow:'hidden',height:210,background:`linear-gradient(135deg,${grad.from},${grad.to})`,transition:'transform .4s,box-shadow .4s'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(13,27,42,0.9) 0%,rgba(13,27,42,0.15) 60%)'}}/>
          <div style={{position:'absolute',top:16,left:16,zIndex:2,background:'rgba(212,168,83,0.9)',color:'#0D1B2A',padding:'5px 14px',borderRadius:50,fontSize:'.7rem',fontWeight:700}}>من {c.dailyPrice} ر.س/يوم</div>
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
      <div className="section-header"><div className="section-tag">🚗 فئات أخرى</div><h2 className="section-title">فئات أخرى في {city.nameAr}</h2></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:16}}>{otherCats.map(c=>(
        <Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`} className="cat-card"><div style={{fontSize:'2rem'}}>{c.icon}</div><div className="cat-name">{c.nameAr}</div><div className="cat-price">من <strong>{c.minPrice}</strong> ر.س</div></Link>
      ))}</div>
    </div></section>

    <section className="section section-white"><div className="container">
      <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير {cat.nameAr} في مدن أخرى</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{otherCities.map(c=>(
        <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}`} className="link-card"><div className="link-card-name">{c.nameAr}</div><div className="link-card-sub">من {cat.minPrice} ر.س</div></Link>
      ))}</div>
    </div></section>

    <section className="section" id="faq"><div className="container-sm">
      <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة عن تأجير {cat.nameAr} في {city.nameAr}</h2></div>
      <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
    </div></section>
  </>)
}
