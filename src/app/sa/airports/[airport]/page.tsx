import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { airports, categories, getCityBySlug, getAirportBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export function generateStaticParams() {
  return airports.map(a => ({ airport: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ airport: string }> }): Promise<Metadata> {
  const ap = getAirportBySlug((await params).airport)
  if (!ap) return {}
  const city = getCityBySlug(ap.citySlug)
  return {
    title: `تأجير سيارة من ${ap.nameAr} (${ap.code})`,
    description: `احجز سيارة من ${ap.nameAr} في ${city?.nameAr}. استلم مركبتك فور وصولك مع خدمة التوصيل المباشر. أسعار تبدأ من ${city?.minPrice} ريال يومياً.`,
    alternates: { canonical: `/sa/airports/${ap.slug}` },
  }
}

const airportInfo: Record<string, string> = {
  'king-khalid': 'يقع في شمال العاصمة الرياض ويخدم أكثر من 30 مليون مسافر سنوياً. صالات الوصول الدولية والمحلية مجهزة بمكاتب تأجير متعددة. الطريق السريع يربطك بوسط المدينة خلال 35 دقيقة.',
  'king-abdulaziz': 'بوابة جدة الجوية ونقطة العبور الرئيسية للحجاج والمعتمرين. المبنى الجديد يضم طابقاً كاملاً لمكاتب إيجار السيارات. يبعد 19 كم عن وسط جدة عبر طريق المدينة السريع.',
  'king-fahd': 'أكبر مطار بالعالم مساحةً ويخدم المنطقة الشرقية بالكامل. يربط الدمام بالخبر والظهران والجبيل. مكاتب التأجير متوفرة في صالة القدوم الرئيسية على مدار الساعة.',
  'prince-mohammed': 'يخدم زوار المسجد النبوي ويشهد ذروة في مواسم العمرة والحج. استلام السيارة من صالة الوصول مباشرة مع إمكانية تسليمها بمدينة أخرى.',
  'taif': 'مطار الطائف الدولي يخدم المصطافين والزوار القادمين لمدينة الورد. قريب من الباحة وبلجرشي مما يجعله نقطة انطلاق ممتازة لجولات الجنوب.',
}

export default async function AirportPage({ params }: { params: Promise<{ airport: string }> }) {
  const ap = getAirportBySlug((await params).airport)
  if (!ap) notFound()
  const city = getCityBySlug(ap.citySlug)
  if (!city) notFound()
  const info = airportInfo[ap.slug] || ''

  const apFAQs = [
    { q: `هل توجد مكاتب تأجير سيارات داخل ${ap.nameAr}؟`, a: `نعم، يتوفر عدد من مكاتب الإيجار المعتمدة في صالات الوصول. كما يمكنك الحجز مسبقاً عبر منصتنا والاستلام فور هبوطك.` },
    { q: `كم المسافة من ${ap.nameAr} لوسط ${city.nameAr}؟`, a: `تختلف المسافة حسب وجهتك داخل ${city.nameAr}، لكن أغلب المواقع المركزية تبعد 20-40 دقيقة بالسيارة عبر الطرق السريعة.` },
    { q: `هل أستطيع تسليم السيارة في مطار مختلف؟`, a: `بعض الشركاء يوفرون خدمة التسليم في مدينة أو مطار مختلف مقابل رسوم إضافية. تواصل مع المؤجر لتأكيد التوفر والتكلفة.` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema([
        { name: SITE_NAME, url: '/' },
        { name: city.nameAr, url: `/sa/${city.slug}` },
        { name: ap.code, url: `/sa/airports/${ap.slug}` },
      ]),
      generateFAQSchema(apFAQs),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-primary-dark via-primary to-primary-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          <div className="text-center lg:text-right">
            <nav className="text-white/60 text-sm mb-4" aria-label="التنقل">
              <Link href="/" className="hover:text-white">الرئيسية</Link>
              <span className="mx-2">/</span>
              <Link href={`/sa/${city.slug}`} className="hover:text-white">{city.nameAr}</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{ap.code}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              تأجير سيارة من {ap.nameAr}
            </h1>
            <p className="text-lg text-white/85 max-w-lg leading-relaxed mx-auto lg:mx-0 mb-6">{info}</p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm text-white/90">
              <span className="bg-white/15 px-4 py-2 rounded-full">✈️ {ap.code}</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">من {city.minPrice} ر.س/يوم</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">استلام فوري</span>
            </div>
          </div>
          <div id="form"><LeadForm /></div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-6">فئات سيارات متوفرة في {city.nameAr}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/${city.slug}/${cat.slug}`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary transition-all">
                <span className="text-2xl">{cat.icon}</span>
                <p className="text-sm font-bold mt-1">{cat.nameAr}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-6 bg-white" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-8">أسئلة عن التأجير من {ap.nameAr}</h2>
          <div className="divide-y divide-border">
            {apFAQs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex justify-between items-center py-5 cursor-pointer font-bold text-sm list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-text-mid shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <p className="pb-5 text-sm text-text-mid leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other airports */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-6">مطارات أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {airports.filter(a => a.slug !== ap.slug).map(a => (
              <Link key={a.slug} href={`/sa/airports/${a.slug}`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary transition-all">
                <p className="font-bold text-sm">{a.nameAr.replace(' الدولي', '')}</p>
                <p className="text-sm text-text-mid">{a.code}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
