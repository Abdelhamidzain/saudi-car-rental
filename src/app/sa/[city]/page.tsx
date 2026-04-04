import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getAirportsForCity, getPartnersForCity, getCityBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME, SITE_URL } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export function generateStaticParams() {
  return cities.map(c => ({ city: c.slug }))
}

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
    { q: `كم سعر تأجير سيارة في ${city.nameAr}؟`, a: `تبدأ أسعار تأجير السيارات في ${city.nameAr} من ${city.minPrice} ريال يومياً للفئة الاقتصادية. تتفاوت التكلفة حسب نوع المركبة ومدة الإيجار والموسم.` },
    { q: `ما أفضل شركة تأجير سيارات في ${city.nameAr}؟`, a: `نعرض عروض ${cityPartners.length} شركة معتمدة في ${city.nameAr} منها ${cityPartners.slice(0, 2).map(p => p.name).join(' و')}. قارن الأسعار واختر الأنسب لاحتياجاتك.` },
    { q: `هل يوجد توصيل من المطار في ${city.nameAr}؟`, a: cityAirports.length > 0 ? `نعم، غالبية شركائنا يوفرون خدمة التوصيل من ${cityAirports[0].nameAr} (${cityAirports[0].code}) مباشرة.` : `نعم، معظم مكاتب الإيجار في ${city.nameAr} توفر خدمة التوصيل والاستقبال.` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema([
        { name: SITE_NAME, url: '/' },
        { name: city.nameAr, url: `/sa/${city.slug}` },
      ]),
      generateFAQSchema(cityFAQs),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-primary via-primary-light to-primary relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="hero-glow w-[400px] h-[400px] -top-24 -right-24 absolute" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 items-center">
          <div className="text-center lg:text-right">
            {/* Breadcrumb */}
            <nav className="text-white/40 text-sm mb-5" aria-label="التنقل">
              <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
              <span className="mx-2 text-white/20">/</span>
              <span className="text-white/80">{city.nameAr}</span>
            </nav>

            <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              تأجير سيارات في <span className="text-accent">{city.nameAr}</span>
            </h1>
            <p className="text-lg text-white/60 max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
              {city.description}
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm">
              <span className="bg-white/10 border border-white/10 text-white/80 px-5 py-2.5 rounded-full">{city.partnerCount} شركة معتمدة</span>
              <span className="bg-accent/15 border border-accent/30 text-accent px-5 py-2.5 rounded-full font-bold">من {city.minPrice} ر.س/يوم</span>
              {cityAirports.length > 0 && <span className="bg-white/10 border border-white/10 text-white/80 px-5 py-2.5 rounded-full">✈️ توصيل المطار</span>}
            </div>
          </div>
          <div id="form"><LeadForm /></div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4">🚗 الفئات المتوفرة</div>
            <h2 className="font-display text-2xl md:text-3xl font-black">فئات السيارات المتوفرة في {city.nameAr}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`}
                className="bg-white border border-border/50 rounded-2xl p-5 text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-display text-sm font-bold">{cat.nameAr}</h3>
                <p className="text-xs text-text-mid mt-1">من {cat.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Airport section */}
      {cityAirports.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <div className="section-tag mb-4">✈️ المطارات</div>
            <h2 className="font-display text-2xl font-black mb-8">تأجير سيارة من مطارات {city.nameAr}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {cityAirports.map(ap => (
                <Link key={ap.slug} href={`/sa/airports/${ap.slug}`}
                  className="bg-bg border border-border/50 rounded-2xl px-8 py-5 hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all">
                  <p className="font-display text-xl font-black text-accent mb-1">{ap.code}</p>
                  <p className="text-sm text-text-mid">{ap.nameAr.replace(' الدولي', '')}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4">❓ أسئلة شائعة</div>
            <h2 className="font-display text-2xl font-black">أسئلة شائعة عن تأجير السيارات في {city.nameAr}</h2>
          </div>
          <div className="grid gap-3">
            {cityFAQs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-bold text-base list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-accent shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <p className="px-5 pb-5 text-sm text-text-mid leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other cities */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-xl font-black text-center mb-8">تأجير سيارات في مدن أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {otherCities.map(c => (
              <Link key={c.slug} href={`/sa/${c.slug}`}
                className="bg-bg border border-border/50 rounded-2xl p-5 text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all">
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
