import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { airports, categories, getCityBySlug, getAirportBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'
import { NoSSR } from '@/components/no-ssr'

export function generateStaticParams() { return airports.map(a=>({airport:a.slug})) }
export async function generateMetadata({params}:{params:Promise<{airport:string}>}):Promise<Metadata> {
  const ap=getAirportBySlug((await params).airport); if(!ap) return {}; const city=getCityBySlug(ap.citySlug)
  return {
    title:`تأجير سيارات من ${ap.nameAr} (${ap.code}) — أسعار من ${city?.minPrice} ريال | ${SITE_NAME}`,
    description:`تأجير سيارة من ${ap.nameAr} بأفضل سعر. قارن عروض تأجير السيارات من شركات التأجير المرخصة في ${city?.nameAr}. استلم سيارتك فور وصولك من المطار.`,
    alternates:{canonical:`/sa/airports/${ap.slug}`}
  }
}

const info:Record<string,string>={
  'king-khalid':`يقع مطار الملك خالد الدولي شمال الرياض ويخدم أكثر من 30 مليون مسافر سنوياً. تتوفر خدمات تأجير سيارات مباشرة في صالات الوصول من خلال عدة مكاتب إيجار مرخصة. يمكنك حجز سيارة واستلامها فور وصولك.`,
  'king-abdulaziz':`يعد مطار الملك عبدالعزيز الدولي البوابة الجوية لمدينة جدة ونقطة العبور الرئيسية للحجاج والمعتمرين. تتوفر مكاتب إيجار في جميع صالات المطار مع إمكانية إيجار مركبة بأسعار تنافسية تبدأ من 99 ريال يومياً.`,
  'king-fahd':`مطار الملك فهد الدولي هو أكبر مطار مساحةً في العالم ويخدم المنطقة الشرقية. يوفر المطار خدمات خدمات الإيجار عبر شركات معتمدة متعددة مع خيارات تأجير سيارات اقتصادية وفاخرة.`,
  'prince-mohammed':`مطار الأمير محمد بن عبدالعزيز يخدم زوار المسجد النبوي والمدينة المنورة. تتوفر خدمة تأجير سيارة مباشرة عند الوصول مع إمكانية التوصيل لأي موقع داخل المدينة.`,
  'taif':`مطار الطائف الدولي يخدم المصطافين والزوار القادمين لمدينة الورد والهدا والشفا. تتوفر خدمات استئجار مركبات بأسعار مناسبة مع خيارات دفع رباعي للتنقل في المناطق الجبلية.`
}

export default async function AirportPage({params}:{params:Promise<{airport:string}>}) {
  const ap=getAirportBySlug((await params).airport); if(!ap) notFound()
  const city=getCityBySlug(ap.citySlug); if(!city) notFound()
  const faqs=[
    {q:`كم سعر تأجير سيارات من ${ap.nameAr}؟`,a:`تبدأ الأسعار من ${city.minPrice} ريال سعودي يومياً للمركبات الاقتصادية. يختلف السعر حسب فئة المركبة ومدة العقد وموسم الذروة. الإيجار الشهري يوفر خصومات تصل أربعين بالمئة.`},
    {q:`هل توجد مكاتب إيجار مركبات داخل ${ap.nameAr}؟`,a:`نعم، تتوفر عدة مكاتب معتمدة في صالات الوصول بـ${ap.nameAr}. يمكنك استلام مركبتك مباشرة عند وصولك دون الحاجة للتنقل خارج مبنى المطار.`},
    {q:`كيف أحجز تأجير سيارة من ${ap.nameAr}؟`,a:`قدّم طلبك عبر النموذج أعلاه واختر تاريخ الوصول ونوع المركبة المطلوبة. سيتواصل معك أحد شركائنا المعتمدين بأفضل عرض خلال دقائق معدودة.`},
    {q:`هل يمكن تسليم المركبة في مطار مختلف؟`,a:`بعض الشركاء المعتمدين يوفرون خدمة الاستلام من مدينة والتسليم في مدينة أخرى مقابل رسوم إضافية بسيطة يتم الاتفاق عليها مسبقاً.`},
    {q:`ما الوثائق المطلوبة لاستئجار مركبة من ${ap.nameAr}؟`,a:`يلزم رخصة قيادة سارية المفعول وإثبات هوية رسمي ساري (بطاقة وطنية أو جواز سفر). الحد الأدنى للعمر واحد وعشرون عاماً مع إمكانية طلب ضمان مالي مسترد.`},
  ]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:`تأجير سيارات ${city.nameAr}`,url:`/sa/${city.slug}`},{name:`تأجير سيارات ${ap.code}`,url:`/sa/airports/${ap.slug}`}]),generateFAQSchema(faqs)]}

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero"><div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner"><div className="hero-text">
        <div className="breadcrumb"><Link href="/">الرئيسية</Link><span className="sep">/</span><Link href={`/sa/${city.slug}`}>{city.nameAr}</Link><span className="sep">/</span><span className="current">{ap.code}</span></div>
        <h1 className="hero-title">تأجير سيارات من <span>{ap.nameAr}</span></h1>
        <p className="hero-subtitle">{info[ap.slug]||`تتوفر خدمات الإيجار في ${ap.nameAr} من شركات المكاتب المعتمدة. احجز الآن واستلم سيارتك فور وصولك.`}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}><span className="pill pill-accent">✈️ {ap.code}</span><span className="pill pill-accent">من {city.minPrice} ريال/يوم</span><span className="pill pill-glass">استلام فوري</span><span className="pill pill-glass">المكاتب المعتمدة</span></div>
      </div><div id="form"><LazyLeadForm/></div></div></div>
    </section>

    <NoSSR>
    {/* WHY RENT FROM AIRPORT */}
    <section className="section section-white"><div className="container">
      <div className="section-header"><div className="section-tag">✨ لماذا الاستئجار من المطار</div><h2 className="section-title">مميزات تأجير سيارة من {ap.nameAr}</h2><p className="section-sub">وفّر وقتك واستلم سيارتك مباشرة — بدون انتظار</p></div>
      <div className="features-grid">
        {[
          {icon:'✈️',title:'استلام فوري من المطار',desc:`استلم سيارتك من صالة الوصول في ${ap.nameAr} مباشرة بدون انتظار تاكسي أو نقل عام`},
          {icon:'💰',title:'أسعار إيجار تنافسية',desc:`أسعار الإيجار تبدأ من ${city.minPrice} ريال يومياً — قارن العروض واختر الأنسب`},
          {icon:'🔄',title:'تسليم مرن عند المغادرة',desc:'أعد السيارة لمكتب الإيجار في المطار قبل رحلتك مباشرة بدون عناء'},
          {icon:'✅',title:'مكاتب إيجار مرخصة',desc:'جميع شركاء حاصلون على ترخيص هيئة النقل العام في المملكة'},
        ].map((f,i)=>(
          <div key={i} className="feature-card"><div className="feature-icon">{f.icon}</div><div className="feature-title">{f.title}</div><div className="feature-desc">{f.desc}</div></div>
        ))}
      </div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-header"><div className="section-tag">🚗 فئات المركبات المتاحة</div><h2 className="section-title">فئات سيارات للتأجير من {city.nameAr}</h2><p className="section-sub">اختر فئة السيارة المناسبة لرحلتك من {ap.nameAr}</p></div>
      <div className="cats-grid">{categories.map(cat=>(
        <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`} className="cat-card"><div style={{fontSize:'2rem'}}>{cat.icon}</div><div className="cat-name">{cat.nameAr}</div><div className="cat-price">من {cat.minPrice} ريال</div></Link>
      ))}</div>
    </div></section>

    </NoSSR>

    <section className="section section-white" id="faq"><div className="container-sm">
      <div className="section-header"><div className="section-tag">❓ أسئلة شائعة</div><h2 className="section-title">أسئلة شائعة عن الاستئجار من {ap.nameAr}</h2></div>
      <div className="faq-list">{faqs.map((f,i)=>(<details key={i} className="faq-item"><summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary><p>{f.a}</p></details>))}</div>
    </div></section>

    {/* SSR INTERNAL LINKS */}
    <div className="ssr-links">
      <div className="container">
        <div className="ssr-links-title">تأجير سيارات في {city.nameAr}</div>
        <div className="ssr-links-grid">
          {categories.map(c=><Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`}>{c.icon} {c.nameAr} {city.nameAr}</Link>)}
        </div>
        <div className="ssr-links-title" style={{marginTop:20}}>تأجير سيارة من مطارات أخرى</div>
        <div className="ssr-links-grid">
          {airports.filter(a=>a.slug!==ap.slug).map(a=><Link key={a.slug} href={`/sa/airports/${a.slug}`}>{a.code} — {a.nameAr.replace(' الدولي','')}</Link>)}
        </div>
      </div>
    </div>

    <NoSSR>
    {/* CTA */}
    <section className="section"><div className="container">
      <div className="cta-box">
        <div className="hero-glow" style={{width:288,height:288,top:-80,right:-80}}/>
        <div className="cta-title">احجز تأجير سيارة من {ap.nameAr} الآن</div>
        <div className="cta-desc">قدّم طلب استئجار مركبة واستلم سيارتك فور وصولك — تأجير السيارات أسهل مع منصتنا</div>
        <Link href="#form" className="cta-btn">قدّم طلبك مجاناً ←</Link>
      </div>
    </div></section>

    <section className="section section-white"><div className="container">
      <h2 className="section-title" style={{textAlign:'center',marginBottom:32}}>تأجير سيارات من مطارات أخرى</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16}}>{airports.filter(a=>a.slug!==ap.slug).map(a=>(
        <Link key={a.slug} href={`/sa/airports/${a.slug}`} className="link-card-white link-card"><div style={{fontFamily:"'Cairo',sans-serif",fontSize:'1.25rem',fontWeight:900,color:'#D4A853',marginBottom:4}}>{a.code}</div><div className="link-card-sub">تأجير سيارة من {a.nameAr.replace(' الدولي','')}</div></Link>
      ))}</div>
    </div></section>
    </NoSSR>
  </>)
}
