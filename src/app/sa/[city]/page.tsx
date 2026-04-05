import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getAirportsForCity, getPartnersForCity, getCityBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export function generateStaticParams() { return cities.map(c => ({ city: c.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const city = getCityBySlug((await params).city)
  if (!city) return {}
  return {
    title: `تأجير سيارات في ${city.nameAr} — أسعار من ${city.minPrice} ريال/يوم`,
    description: `قارن عروض تأجير السيارات في ${city.nameAr} من ${city.partnerCount} شركة معتمدة. أسعار تبدأ من ${city.minPrice} ريال يومياً مع التوصيل للمطار.`,
    alternates: { canonical: `/sa/${city.slug}` },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = getCityBySlug((await params).city)
  if (!city) notFound()
  const cityAirports = getAirportsForCity(city.slug)
  const cityPartners = getPartnersForCity(city.slug)
  const otherCities = cities.filter(c => c.slug !== city.slug)
  const cityFAQs = [
    { q: `كم سعر تأجير سيارة في ${city.nameAr}؟`, a: `تبدأ أسعار تأجير السيارات في ${city.nameAr} من ${city.minPrice} ريال يومياً للفئة الاقتصادية.` },
    { q: `ما أفضل شركة تأجير سيارات في ${city.nameAr}؟`, a: `نعرض عروض ${cityPartners.length} شركة معتمدة في ${city.nameAr} منها ${cityPartners.slice(0,2).map(p=>p.name).join(' و')}.` },
    { q: `هل يوجد توصيل من المطار في ${city.nameAr}؟`, a: cityAirports.length > 0 ? `نعم، غالبية شركائنا يوفرون خدمة التوصيل من ${cityAirports[0].nameAr} (${cityAirports[0].code}) مباشرة.` : `نعم، معظم مكاتب الإيجار في ${city.nameAr} توفر خدمة التوصيل.` },
  ]
  const jsonLd = { '@context':'https://schema.org', '@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:city.nameAr,url:`/sa/${city.slug}`}]),generateFAQSchema(cityFAQs)] }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden" style={{ background:'linear-gradient(135deg,#0D1B2A 0%,#1B3A5C 40%,#0D1B2A 100%)', padding:'120px 0 80px' }}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-glow" style={{ width:400,height:400,top:-100,right:-100 }} />
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <nav className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.4)' }} aria-label="التنقل">
                <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
                <span className="mx-2" style={{ color:'rgba(255,255,255,0.2)' }}>/</span>
                <span style={{ color:'rgba(255,255,255,0.8)' }}>{city.nameAr}</span>
              </nav>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                تأجير سيارات في <span className="text-accent">{city.nameAr}</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color:'rgba(255,255,255,0.6)',maxWidth:520 }}>{city.description}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm">
                <span className="rounded-full" style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',padding:'10px 20px' }}>{city.partnerCount} شركة معتمدة</span>
                <span className="rounded-full font-bold" style={{ background:'rgba(212,168,83,0.15)',border:'1px solid rgba(212,168,83,0.3)',color:'#D4A853',padding:'10px 20px' }}>من {city.minPrice} ر.س/يوم</span>
              </div>
            </div>
            <div id="form"><LeadForm /></div>
          </div>
        </div>
      </section>

      <section style={{ padding:'80px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 24px' }}>
          <div className="text-center" style={{ marginBottom:48 }}>
            <div className="section-tag" style={{ marginBottom:16 }}>🚗 الفئات المتوفرة</div>
            <h2 className="font-display text-2xl md:text-3xl font-black">فئات السيارات المتوفرة في {city.nameAr}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7" style={{ gap:16 }}>
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`}
                className="bg-white border border-border rounded-2xl text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{ padding:20 }}>
                <div className="text-3xl" style={{ marginBottom:12 }}>{cat.icon}</div>
                <h3 className="font-display text-sm font-bold">{cat.nameAr}</h3>
                <p className="text-xs text-text-mid mt-1">من {cat.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {cityAirports.length > 0 && (
        <section className="bg-white" style={{ padding:'64px 0' }}>
          <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 24px',textAlign:'center' }}>
            <div className="section-tag" style={{ marginBottom:16 }}>✈️ المطارات</div>
            <h2 className="font-display text-2xl font-black" style={{ marginBottom:32 }}>تأجير سيارة من مطارات {city.nameAr}</h2>
            <div className="flex flex-wrap justify-center" style={{ gap:16 }}>
              {cityAirports.map(ap => (
                <Link key={ap.slug} href={`/sa/airports/${ap.slug}`}
                  className="bg-bg border border-border rounded-2xl hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{ padding:'20px 32px' }}>
                  <p className="font-display text-xl font-black text-accent" style={{ marginBottom:4 }}>{ap.code}</p>
                  <p className="text-sm text-text-mid">{ap.nameAr.replace(' الدولي','')}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="faq" style={{ padding:'80px 0' }}>
        <div style={{ maxWidth:800,margin:'0 auto',padding:'0 24px' }}>
          <div className="text-center" style={{ marginBottom:48 }}>
            <div className="section-tag" style={{ marginBottom:16 }}>❓ أسئلة شائعة</div>
            <h2 className="font-display text-2xl font-black">أسئلة شائعة عن تأجير السيارات في {city.nameAr}</h2>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {cityFAQs.map((faq,i) => (
              <details key={i} className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-base list-none" style={{ padding:20 }}>{faq.q}
                  <svg className="w-5 h-5 text-accent shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <p className="text-sm text-text-mid leading-relaxed" style={{ padding:'0 20px 20px' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" style={{ padding:'64px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 24px' }}>
          <h2 className="font-display text-xl font-black text-center" style={{ marginBottom:32 }}>تأجير سيارات في مدن أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-5" style={{ gap:16 }}>
            {otherCities.map(c => (
              <Link key={c.slug} href={`/sa/${c.slug}`}
                className="bg-bg border border-border rounded-2xl text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{ padding:20 }}>
                <p className="font-display font-bold">{c.nameAr}</p>
                <p className="text-xs text-text-mid mt-1">من {c.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
