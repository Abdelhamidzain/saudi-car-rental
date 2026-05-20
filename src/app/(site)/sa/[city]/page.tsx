import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getAirportsForCity, getPartnersForCity, getCityBySlug, carModels, categoryGradients, cityGuides, generateFAQSchema, generateBreadcrumbSchema, generateLocalBusinessSchema, SITE_NAME, SITE_URL } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'
import { NoSSR } from '@/components/no-ssr'
import { getCityPageOverlayFromDb } from '@/lib/public-data/adapters/city-page'

export function generateStaticParams() { return cities.map(c=>({city:c.slug})) }
export async function generateMetadata({params}:{params:Promise<{city:string}>}):Promise<Metadata> {
  const slug = (await params).city
  const city=getCityBySlug(slug); if(!city) return {}
  // Augment (not replace) static city with DB overlay for safe visible fields.
  // Falls back to static when DB is down, row is draft/archived, or column null.
  const overlay = await getCityPageOverlayFromDb(slug)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const cityMinPrice = overlay?.cityMinPrice ?? city.minPrice
  return {
    title: `تأجير سيارات في ${cityNameAr} — أسعار من ${cityMinPrice} ريال/يوم`,
    description: `تأجير سيارات في ${cityNameAr} من ${city.partnerCount} شركة معتمدة. قارن عروض تأجير السيارات واحصل على أفضل سعر تأجير سيارة يبدأ من ${cityMinPrice} ريال يومياً مع التأمين وخدمة التوصيل للمطار.`,
    alternates: { canonical: `/sa/${city.slug}` },
    openGraph: {
      title: `تأجير سيارات في ${cityNameAr} — من ${cityMinPrice} ريال`,
      description: `قارن عروض تأجير السيارات في ${cityNameAr} من ${city.partnerCount} شركة. أسعار تأجير سيارة تبدأ من ${cityMinPrice} ريال يومياً.`,
      url: `${SITE_URL}/sa/${city.slug}`,
      type: 'website',
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `تأجير سيارات في ${cityNameAr} — من ${cityMinPrice} ريال`,
      description: `قارن عروض تأجير السيارات في ${cityNameAr}. أسعار تبدأ من ${cityMinPrice} ريال يومياً.`,
    },
  }
}

export default async function CityPage({params}:{params:Promise<{city:string}>}) {
  const slug = (await params).city
  const city=getCityBySlug(slug); if(!city) notFound()
  // Augment (not replace) static city with DB overlay for safe visible fields.
  // Static `city` is still passed to generateLocalBusinessSchema below because
  // the DB lacks lat/lng/partnerCount/description that JSON-LD requires.
  const overlay = await getCityPageOverlayFromDb(slug)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const cityMinPrice = overlay?.cityMinPrice ?? city.minPrice
  const ap=getAirportsForCity(city.slug), partners=getPartnersForCity(city.slug), others=cities.filter(c=>c.slug!==city.slug)
  const guide = cityGuides[city.slug] || cityGuides.riyadh
  const faqs=[
    {q:`كم يكلف تأجير سيارات في ${cityNameAr}؟`,a:`تبدأ الأسعار في ${cityNameAr} من ${cityMinPrice} ريال يومياً للمركبات الاقتصادية. السيدان المتوسطة تبدأ من 135 ريال بينما الفئة الفاخرة تبدأ من 359 ريال يومياً مع التأمين الأساسي.`},
    {q:`ما أفضل شركات تأجير السيارات في ${cityNameAr}؟`,a:`نعرض عروض ${partners.length} شركة معتمدة في ${cityNameAr} منها ${partners.slice(0,2).map(p=>p.name).join(' و')}. جميعها حاصلة على ترخيص هيئة النقل العام بالمملكة العربية السعودية.`},
    {q:`هل يوجد خدمة توصيل واستلام من المطار؟`,a:ap.length>0?`نعم، غالبية الشركات المعتمدة توفر خدمة التوصيل والاستلام من ${ap[0].nameAr} مباشرة عند وصول العميل دون أي تكلفة إضافية.`:`نعم، معظم المكاتب المرخصة في ${cityNameAr} توفر خدمة التوصيل للموقع المطلوب.`},
    {q:`هل تأجير سيارة يشمل التأمين والوقود؟`,a:`جميع العروض تشمل تغطية تأمينية أساسية ضد الغير. الوقود عادة على حساب المستأجر ويتم تسليم المركبة بخزان ممتلئ وإرجاعها بنفس المستوى.`},
    {q:`ما الوثائق والشروط المطلوبة للاستئجار؟`,a:`يلزم رخصة قيادة سارية وهوية وطنية أو جواز سفر ساري المفعول والحد الأدنى للعمر واحد وعشرون عاماً. بعض المكاتب تطلب ضماناً مالياً مسترداً عند استلام المركبة الفاخرة.`},
  ]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:cityNameAr,url:`/sa/${city.slug}`}]),generateFAQSchema(faqs),generateLocalBusinessSchema(city)]}

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>

    <section className="hero">
      <div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner">
        <div className="hero-text">
          <div className="breadcrumb"><Link href="/">الرئيسية</Link><span className="sep">/</span><span className="current">{cityNameAr}</span></div>
          <h1 className="hero-title">تأجير سيارات في <span>{cityNameAr}</span></h1>
          <p className="hero-subtitle">{city.description}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}><span className="pill pill-glass">{city.partnerCount} شركة معتمدة</span><span className="pill pill-accent">من {cityMinPrice} ريال/يوم</span>{ap.length>0&&<span className="pill pill-glass">✈️ توصيل المطار</span>}</div>
        </div>
        <div id="form"><LazyLeadForm/></div>
      </div></div>
    </section>

    {/* SSR H2 — additional unique content */}
    <section className="section section-white"><div className="container" style={{maxWidth:900}}>
      <h2 className="section-title" style={{textAlign:'center',marginBottom:16}}>تأجير سيارة في {cityNameAr} بأفضل سعر</h2>
      <p style={{textAlign:'center',fontSize:'.95rem',color:'#4B5563',lineHeight:2,maxWidth:700,margin:'0 auto'}}>نوفر لك مقارنة شاملة بين عروض تأجير السيارات من {city.partnerCount} مكتب مرخص في {cityNameAr}. تبدأ الأسعار من {cityMinPrice} ريال يومياً للفئة الاقتصادية مع خيارات متنوعة تشمل العقود اليومية والأسبوعية والشهرية. جميع العروض تتضمن تغطية تأمينية أساسية وخدمة استلام مرنة.</p>
    </div></section>

    <NoSSR>
    <section className="section"><div className="container">
      <div className="section-header"><div className="section-tag">🚗 الفئات المتوفرة</div><h2 className="section-title">فئات السيارات المتوفرة في {cityNameAr}</h2></div>
      <div className="cats-grid">{categories.map(cat=>(
        <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`} className="cat-card"><div className="cat-emoji">{cat.icon}</div><div className="cat-name">{cat.nameAr}</div><div className="cat-price">من <strong>{cat.minPrice}</strong> ريال</div></Link>
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
          <Link key={c.slug} href={`/sa/${city.slug}/${c.category}/${c.slug}`} style={{textDecoration:'none',display:'block',position:'relative',borderRadius:16,overflow:'hidden',height:190,background:`linear-gradient(135deg,${grad.from},${grad.to})`,transition:'transform .4s,box-shadow .4s'}}>
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
    </NoSSR>

    {/* FAQ — SSR ONLY */}
    <section className="section" id="faq"><div className="container-sm">
      <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة شائعة عن تأجير السيارات في {cityNameAr}</h2></div>
      <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
    </div></section>

    {/* GUIDE INTRO — SSR for unique content */}
    <section className="section section-white"><div className="container">
      <h2 className="section-title" style={{textAlign:'center',marginBottom:24}}>دليل استئجار المركبات</h2>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:16,textAlign:'center'}}>{guide[0]}</p>
        <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,textAlign:'center'}}>{guide[1]}</p>
      </div>
    </div></section>

    {/* SSR INTERNAL LINKS */}
    <div className="ssr-links">
      <div className="container">
        <h2 className="ssr-links-title">تأجير سيارات {cityNameAr} حسب الفئة</h2>
        <div className="ssr-links-grid">
          {categories.map(c=><Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`}>{c.icon} {c.nameAr} {cityNameAr}</Link>)}
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

    <NoSSR>
    <section className="section section-white"><div className="container">
      <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير سيارات في مدن أخرى</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{others.map(c=>(
        <Link key={c.slug} href={`/sa/${c.slug}`} className="link-card"><div className="link-card-name">{c.nameAr}</div><div className="link-card-sub">من {c.minPrice} ريال</div></Link>
      ))}</div>
    </div></section>
    </NoSSR>
  </>)
}
