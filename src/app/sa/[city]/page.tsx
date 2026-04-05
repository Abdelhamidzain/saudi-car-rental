import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getAirportsForCity, getPartnersForCity, getCityBySlug, carModels, categoryGradients, cityGuides, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'

export function generateStaticParams() { return cities.map(c=>({city:c.slug})) }
export async function generateMetadata({params}:{params:Promise<{city:string}>}):Promise<Metadata> {
  const city=getCityBySlug((await params).city); if(!city) return {}
  return { title:`تأجير سيارات في ${city.nameAr} — أسعار من ${city.minPrice} ريال/يوم`, description:`قارن عروض تأجير السيارات في ${city.nameAr} من ${city.partnerCount} شركة معتمدة.`, alternates:{canonical:`/sa/${city.slug}`} }
}

export default async function CityPage({params}:{params:Promise<{city:string}>}) {
  const city=getCityBySlug((await params).city); if(!city) notFound()
  const ap=getAirportsForCity(city.slug), partners=getPartnersForCity(city.slug), others=cities.filter(c=>c.slug!==city.slug)
  const guide = cityGuides[city.slug] || cityGuides.riyadh
  const faqs=[
    {q:`كم يكلف تأجير سيارات في ${city.nameAr}؟`,a:`تبدأ أسعار تأجير السيارات في ${city.nameAr} من ${city.minPrice} ريال يومياً للفئة الاقتصادية. تأجير سيارة سيدان متوسطة يبدأ من 135 ريال والفئة الفاخرة من 359 ريال يومياً.`},
    {q:`ما أفضل شركة تأجير سيارات في ${city.nameAr}؟`,a:`نعرض عروض تأجير السيارات من ${partners.length} شركة معتمدة في ${city.nameAr} منها ${partners.slice(0,2).map(p=>p.name).join(' و')}. جميعها حاصلة على ترخيص هيئة النقل العام بالمملكة.`},
    {q:`هل يوجد توصيل تأجير سيارة من المطار في ${city.nameAr}؟`,a:ap.length>0?`نعم، غالبية شركات تأجير السيارات توفر خدمة التوصيل والاستلام من ${ap[0].nameAr} مباشرة عند وصولك.`:`نعم، معظم مكاتب تأجير سيارات في ${city.nameAr} توفر خدمة التوصيل للعميل.`},
    {q:`هل تأجير سيارة في ${city.nameAr} يشمل التأمين والوقود؟`,a:`جميع عروض تأجير السيارات تشمل التأمين الأساسي ضد الغير. الوقود عادة على حساب المستأجر ويتم تسليم المركبة بخزان ممتلئ.`},
    {q:`ما شروط تأجير سيارات في ${city.nameAr}؟`,a:`يلزم رخصة قيادة سارية وهوية وطنية أو جواز سفر والحد الأدنى للعمر 21 سنة. بعض شركات تأجير السيارات تطلب ضماناً مالياً مسترداً عند تأجير سيارة فاخرة.`},
  ]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:city.nameAr,url:`/sa/${city.slug}`}]),generateFAQSchema(faqs)]}

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero">
      <div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner">
        <div className="hero-text">
          <div className="breadcrumb"><Link href="/">الرئيسية</Link><span className="sep">/</span><span className="current">{city.nameAr}</span></div>
          <h1 className="hero-title">تأجير سيارات في <span>{city.nameAr}</span></h1>
          <p className="hero-subtitle">{city.description}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}><span className="pill pill-glass">{city.partnerCount} شركة معتمدة</span><span className="pill pill-accent">من {city.minPrice} ريال/يوم</span>{ap.length>0&&<span className="pill pill-glass">✈️ توصيل المطار</span>}</div>
        </div>
        <div id="form"><LazyLeadForm/></div>
      </div></div>
    </section>

    <section className="section"><div className="container">
      <div className="section-header"><div className="section-tag">🚗 الفئات المتوفرة</div><h2 className="section-title">فئات السيارات المتوفرة في {city.nameAr}</h2></div>
      <div className="cats-grid">{categories.map(cat=>(
        <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`} className="cat-card"><div className="cat-emoji">{cat.icon}</div><div className="cat-name">{cat.nameAr}</div><div className="cat-price">من <strong>{cat.minPrice}</strong> ريال</div></Link>
      ))}</div>
    </div></section>

    {/* CITY GUIDE — UNIQUE CONTENT */}
    <section className="section section-white"><div className="container">
      <div className="section-header"><div className="section-tag">📖 دليل الاستئجار</div><h2 className="section-title">دليل استئجار المركبات في {city.nameAr}</h2><p className="section-sub">كل ما تحتاج معرفته قبل استئجار مركبة في {city.nameAr}</p></div>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        {guide.map((p,i)=>(<p key={i} style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>{p}</p>))}
      </div>
    </div></section>

    {/* POPULAR CARS */}
    <section className="section section-white"><div className="container">
      <div className="section-header"><div className="section-tag">⭐ الأكثر طلباً</div><h2 className="section-title">السيارات الأكثر طلباً في {city.nameAr}</h2><p className="section-sub">أشهر موديلات السيارات المتوفرة للتأجير في {city.nameAr}</p></div>
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

    {ap.length>0&&<section className="section"><div className="container">
      <div className="section-header"><div className="section-tag">✈️ المطارات</div><h2 className="section-title">تأجير سيارة من مطارات {city.nameAr}</h2></div>
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:16}}>{ap.map(a=>(
        <Link key={a.slug} href={`/sa/airports/${a.slug}`} className="link-card-white link-card" style={{padding:'20px 32px'}}>
          <div className="airport-code" style={{color:'#D4A853'}}>{a.code}</div><div className="link-card-sub">{a.nameAr.replace(' الدولي','')}</div>
        </Link>
      ))}</div>
    </div></section>}

    <section className="section" id="faq"><div className="container-sm">
      <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة شائعة عن تأجير السيارات في {city.nameAr}</h2></div>
      <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
    </div></section>

    <section className="section section-white"><div className="container">
      <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير سيارات في مدن أخرى</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{others.map(c=>(
        <Link key={c.slug} href={`/sa/${c.slug}`} className="link-card"><div className="link-card-name">{c.nameAr}</div><div className="link-card-sub">من {c.minPrice} ريال</div></Link>
      ))}</div>
    </div></section>
  </>)
}
