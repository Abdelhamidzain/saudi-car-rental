import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { airports, categories, getCityBySlug, getAirportBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export function generateStaticParams() { return airports.map(a=>({airport:a.slug})) }

export async function generateMetadata({params}:{params:Promise<{airport:string}>}):Promise<Metadata> {
  const ap=getAirportBySlug((await params).airport)
  if(!ap) return {}
  const city=getCityBySlug(ap.citySlug)
  return { title:`تأجير سيارة من ${ap.nameAr} (${ap.code})`, description:`احجز سيارة من ${ap.nameAr}. استلم مركبتك فور وصولك. أسعار من ${city?.minPrice} ريال يومياً.`, alternates:{canonical:`/sa/airports/${ap.slug}`} }
}

const apInfo:Record<string,string>={
  'king-khalid':'يقع شمال الرياض ويخدم أكثر من 30 مليون مسافر سنوياً. صالات الوصول مجهزة بمكاتب تأجير متعددة.',
  'king-abdulaziz':'بوابة جدة الجوية ونقطة العبور الرئيسية للحجاج والمعتمرين. المبنى الجديد يضم طابقاً لمكاتب الإيجار.',
  'king-fahd':'أكبر مطار مساحةً ويخدم المنطقة الشرقية. يربط الدمام بالخبر والظهران.',
  'prince-mohammed':'يخدم زوار المسجد النبوي. استلام السيارة من صالة الوصول مباشرة.',
  'taif':'يخدم المصطافين القادمين لمدينة الورد. نقطة انطلاق لجولات الجنوب.',
}

export default async function AirportPage({params}:{params:Promise<{airport:string}>}) {
  const ap=getAirportBySlug((await params).airport)
  if(!ap) notFound()
  const city=getCityBySlug(ap.citySlug)
  if(!city) notFound()
  const info=apInfo[ap.slug]||''
  const apFAQs=[
    {q:`هل توجد مكاتب تأجير داخل ${ap.nameAr}؟`,a:`نعم، يتوفر مكاتب إيجار معتمدة في صالات الوصول.`},
    {q:`كم المسافة لوسط ${city.nameAr}؟`,a:`أغلب المواقع المركزية تبعد 20-40 دقيقة بالسيارة.`},
    {q:`هل أستطيع تسليم السيارة في مطار مختلف؟`,a:`بعض الشركاء يوفرون التسليم في مطار آخر مقابل رسوم إضافية.`},
  ]
  const jsonLd={
    '@context':'https://schema.org',
    '@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:city.nameAr,url:`/sa/${city.slug}`},{name:ap.code,url:`/sa/airports/${ap.slug}`}]),generateFAQSchema(apFAQs)]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
      <section className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#0D1B2A 0%,#1B3A5C 40%,#0D1B2A 100%)',padding:'120px 0 80px'}}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}} />
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:10}}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <nav className="text-sm mb-5" style={{color:'rgba(255,255,255,0.4)'}} aria-label="التنقل">
                <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
                <span className="mx-2" style={{color:'rgba(255,255,255,0.2)'}}>/</span>
                <Link href={`/sa/${city.slug}`} className="hover:text-accent transition-colors">{city.nameAr}</Link>
                <span className="mx-2" style={{color:'rgba(255,255,255,0.2)'}}>/</span>
                <span style={{color:'rgba(255,255,255,0.8)'}}>{ap.code}</span>
              </nav>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-5">تأجير سيارة من <span className="text-accent">{ap.nameAr}</span></h1>
              <p className="text-lg leading-relaxed mb-8" style={{color:'rgba(255,255,255,0.6)',maxWidth:520}}>{info}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm">
                <span className="rounded-full font-bold" style={{background:'rgba(212,168,83,0.15)',border:'1px solid rgba(212,168,83,0.3)',color:'#D4A853',padding:'10px 20px'}}>✈️ {ap.code}</span>
                <span className="rounded-full" style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',padding:'10px 20px'}}>من {city.minPrice} ر.س/يوم</span>
              </div>
            </div>
            <div id="form"><LeadForm /></div>
          </div>
        </div>
      </section>

      <section style={{padding:'80px 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}>
          <div className="text-center" style={{marginBottom:48}}>
            <div className="section-tag" style={{marginBottom:16}}>🚗 الفئات</div>
            <h2 className="font-display text-2xl font-black">فئات سيارات متوفرة في {city.nameAr}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7" style={{gap:16}}>
            {categories.map(cat=>(
              <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`} className="bg-white border border-border rounded-2xl text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{padding:20}}>
                <span className="text-3xl">{cat.icon}</span>
                <p className="font-display text-sm font-bold mt-2">{cat.nameAr}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" id="faq" style={{padding:'80px 0'}}>
        <div style={{maxWidth:800,margin:'0 auto',padding:'0 24px'}}>
          <div className="text-center" style={{marginBottom:48}}>
            <div className="section-tag" style={{marginBottom:16}}>❓ أسئلة شائعة</div>
            <h2 className="font-display text-xl font-black">أسئلة عن التأجير من {ap.nameAr}</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {apFAQs.map((faq,i)=>(
              <details key={i} className="group bg-bg rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-sm list-none" style={{padding:20}}>{faq.q}
                  <svg className="w-5 h-5 text-accent shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <p className="text-sm text-text-mid leading-relaxed" style={{padding:'0 20px 20px'}}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'64px 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}>
          <h2 className="font-display text-xl font-black text-center" style={{marginBottom:32}}>مطارات أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{gap:16}}>
            {airports.filter(a=>a.slug!==ap.slug).map(a=>(
              <Link key={a.slug} href={`/sa/airports/${a.slug}`} className="bg-white border border-border rounded-2xl text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{padding:20}}>
                <p className="font-display text-xl font-black text-accent" style={{marginBottom:4}}>{a.code}</p>
                <p className="text-sm text-text-mid">{a.nameAr.replace(' الدولي','')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
