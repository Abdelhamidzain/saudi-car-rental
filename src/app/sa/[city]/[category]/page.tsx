import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getCityBySlug, getCategoryBySlug, getAirportsForCity, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export function generateStaticParams() {
  const params: { city: string; category: string }[] = []
  for (const city of cities) {
    for (const cat of categories) {
      params.push({ city: city.slug, category: cat.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string }> }): Promise<Metadata> {
  const city = getCityBySlug((await params).city)
  const cat = getCategoryBySlug((await params).category)
  if (!city || !cat) return {}
  return {
    title: `تأجير سيارات ${cat.nameAr} في ${city.nameAr} — من ${cat.minPrice} ريال/يوم`,
    description: `قارن عروض إيجار سيارات ${cat.nameAr} في ${city.nameAr}. أسعار تبدأ من ${cat.minPrice} ريال يومياً مع تأمين شامل وكيلومترات مفتوحة. احجز الآن.`,
    alternates: { canonical: `/sa/${city.slug}/${cat.slug}` },
  }
}

const categoryDescriptions: Record<string, (cityName: string) => string> = {
  economy: (c) => `وفّر ميزانيتك مع أفضل عروض تأجير سيارات اقتصادية في ${c}. موديلات مثل هيونداي اكسنت وتويوتا يارس ونيسان صني — مثالية للتنقل اليومي والرحلات القصيرة داخل المدينة.`,
  sedan: (c) => `استمتع بالراحة مع تأجير سيارات سيدان في ${c}. خيارات متنوعة من تويوتا كامري وهيونداي سوناتا وكيا K5 — مناسبة للعائلات الصغيرة ورجال الأعمال.`,
  suv: (c) => `استكشف ${c} بقوة مع تأجير سيارات دفع رباعي. فورتشنر وباترول وتوسان — مصممة للطرق الوعرة والرحلات البرية الطويلة مع مساحة أمتعة واسعة.`,
  luxury: (c) => `اترك انطباعاً مميزاً مع تأجير سيارات فاخرة في ${c}. مرسيدس ولكزس وبي ام دبليو — تجربة قيادة استثنائية مع أعلى معايير الفخامة والتقنية.`,
  '7-seater': (c) => `سافر مع عائلتك الكبيرة بأريحية. تأجير سيارات 7 مقاعد في ${c} يشمل إنوفا وفورتشنر وستاريا — مساحة كافية لكل أفراد الأسرة وأمتعتهم.`,
  pickup: (c) => `حلول نقل قوية مع تأجير بيك أب في ${c}. هايلكس وتاكوما ونافارا — مثالية للمقاولين والمشاريع والرحلات الصحراوية والتخييم.`,
  van: (c) => `نقل جماعي مريح مع تأجير فان في ${c}. هاي إيس وأوركيا وستاركس — الحل الأمثل للمجموعات السياحية وفرق العمل والمناسبات الكبيرة.`,
}

export default async function CategoryPage({ params }: { params: Promise<{ city: string; category: string }> }) {
  const city = getCityBySlug((await params).city)
  const cat = getCategoryBySlug((await params).category)
  if (!city || !cat) notFound()

  const descFn = categoryDescriptions[cat.slug]
  const desc = descFn ? descFn(city.nameAr) : `تأجير سيارات ${cat.nameAr} في ${city.nameAr} بأفضل الأسعار.`
  const otherCats = categories.filter(c => c.slug !== cat.slug)
  const otherCities = cities.filter(c => c.slug !== city.slug).slice(0, 4)

  const catFAQs = [
    { q: `كم سعر تأجير ${cat.nameAr} في ${city.nameAr}؟`, a: `يبدأ سعر إيجار سيارات ${cat.nameAr} في ${city.nameAr} من ${cat.minPrice} ريال يومياً. يتفاوت حسب الموديل وفترة الإيجار والموسم.` },
    { q: `هل تتوفر ${cat.nameAr} للإيجار الشهري في ${city.nameAr}؟`, a: `نعم، أغلب مكاتب التأجير في ${city.nameAr} توفر عقود شهرية مخفّضة لسيارات ${cat.nameAr}. التسعير الشهري عادة أوفر بنسبة 30-40% مقارنة باليومي.` },
    { q: `ما المستندات المطلوبة لتأجير ${cat.nameAr}؟`, a: `تحتاج رخصة قيادة سارية (سعودية أو دولية)، هوية أو جواز سفر، وبطاقة ائتمان أو مبلغ تأمين نقدي حسب سياسة المؤجر.` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema([
        { name: SITE_NAME, url: '/' },
        { name: city.nameAr, url: `/sa/${city.slug}` },
        { name: cat.nameAr, url: `/sa/${city.slug}/${cat.slug}` },
      ]),
      generateFAQSchema(catFAQs),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 40%, #0D1B2A 100%)' }}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-glow w-[400px] h-[400px] -top-24 -right-24 absolute" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <nav className="text-white/40 text-sm mb-5" aria-label="التنقل">
              <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
              <span className="mx-2 text-white/20">/</span>
              <Link href={`/sa/${city.slug}`} className="hover:text-accent transition-colors">{city.nameAr}</Link>
              <span className="mx-2 text-white/20">/</span>
              <span className="text-white/80">{cat.nameAr}</span>
            </nav>
            <h1 className="font-display text-3xl md:text-5xl font-black text-white leading-tight mb-5">
              تأجير سيارات {cat.nameAr} في <span className="text-accent">{city.nameAr}</span>
            </h1>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed mx-auto lg:mx-0 mb-8">{desc}</p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm">
              <span className="px-5 py-2.5 rounded-full font-bold text-sm" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>من {cat.minPrice} ر.س/يوم</span>
              <span className="px-5 py-2.5 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>{cat.icon} {cat.nameAr}</span>
              <span className="px-5 py-2.5 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>تأمين شامل</span>
            </div>
          </div>
          <div id="form"><LeadForm /></div>
        </div>
      </section>

      {/* Other categories */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4">🚗 فئات أخرى</div>
            <h2 className="font-display text-2xl font-black">فئات أخرى في {city.nameAr}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {otherCats.map(c => (
              <Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`}
                className="bg-white border border-border/50 rounded-2xl p-5 text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all">
                <span className="text-3xl">{c.icon}</span>
                <p className="font-display text-sm font-bold mt-2">{c.nameAr}</p>
                <p className="text-xs text-text-mid">من {c.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Same category other cities */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-xl font-black text-center mb-8">تأجير {cat.nameAr} في مدن أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherCities.map(c => (
              <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}`}
                className="bg-bg border border-border/50 rounded-2xl p-5 text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all">
                <p className="font-display font-bold">{c.nameAr}</p>
                <p className="text-xs text-text-mid mt-1">من {cat.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4">❓ أسئلة شائعة</div>
            <h2 className="font-display text-xl font-black">أسئلة عن تأجير {cat.nameAr} في {city.nameAr}</h2>
          </div>
          <div className="grid gap-3">
            {catFAQs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-bold text-sm list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-accent shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <p className="px-5 pb-5 text-sm text-text-mid leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
