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

export function generateMetadata({ params }: { params: { city: string; category: string } }): Metadata {
  const city = getCityBySlug(params.city)
  const cat = getCategoryBySlug(params.category)
  if (!city || !cat) return {}
  return {
    title: `تأجير سيارات ${cat.nameAr} في ${city.nameAr} — من ${cat.minPrice} ريال/يوم`,
    description: `قارن عروض إيجار سيارات ${cat.nameAr} في ${city.nameAr}. أسعار تبدأ من ${cat.minPrice} ريال يومياً مع تأمين شامل وكيلومترات مفتوحة. احجز الآن.`,
    alternates: { canonical: `/sa/${city.slug}/${cat.slug}` },
  }
}

// Lexical pools for unique content per combination
const categoryDescriptions: Record<string, (cityName: string) => string> = {
  economy: (c) => `وفّر ميزانيتك مع أفضل عروض تأجير سيارات اقتصادية في ${c}. موديلات مثل هيونداي اكسنت وتويوتا يارس ونيسان صني — مثالية للتنقل اليومي والرحلات القصيرة داخل المدينة.`,
  sedan: (c) => `استمتع بالراحة مع تأجير سيارات سيدان في ${c}. خيارات متنوعة من تويوتا كامري وهيونداي سوناتا وكيا K5 — مناسبة للعائلات الصغيرة ورجال الأعمال.`,
  suv: (c) => `استكشف ${c} بقوة مع تأجير سيارات دفع رباعي. فورتشنر وباترول وتوسان — مصممة للطرق الوعرة والرحلات البرية الطويلة مع مساحة أمتعة واسعة.`,
  luxury: (c) => `اترك انطباعاً مميزاً مع تأجير سيارات فاخرة في ${c}. مرسيدس ولكزس وبي ام دبليو — تجربة قيادة استثنائية مع أعلى معايير الفخامة والتقنية.`,
  '7-seater': (c) => `سافر مع عائلتك الكبيرة بأريحية. تأجير سيارات 7 مقاعد في ${c} يشمل إنوفا وفورتشنر وستاريا — مساحة كافية لكل أفراد الأسرة وأمتعتهم.`,
  pickup: (c) => `حلول نقل قوية مع تأجير بيك أب في ${c}. هايلكس وتاكوما ونافارا — مثالية للمقاولين والمشاريع والرحلات الصحراوية والتخييم.`,
  van: (c) => `نقل جماعي مريح مع تأجير فان في ${c}. هاي إيس وأوركيا وستاركس — الحل الأمثل للمجموعات السياحية وفرق العمل والمناسبات الكبيرة.`,
}

export default function CategoryPage({ params }: { params: { city: string; category: string } }) {
  const city = getCityBySlug(params.city)
  const cat = getCategoryBySlug(params.category)
  if (!city || !cat) notFound()

  const cityAirports = getAirportsForCity(city.slug)
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
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-primary-dark via-primary to-primary-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          <div className="text-center lg:text-right">
            <nav className="text-white/60 text-sm mb-4" aria-label="التنقل">
              <Link href="/" className="hover:text-white">الرئيسية</Link>
              <span className="mx-2">/</span>
              <Link href={`/sa/${city.slug}`} className="hover:text-white">{city.nameAr}</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{cat.nameAr}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              تأجير سيارات {cat.nameAr} في {city.nameAr}
            </h1>
            <p className="text-lg text-white/85 max-w-lg leading-relaxed mx-auto lg:mx-0 mb-6">{desc}</p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm text-white/90">
              <span className="bg-white/15 px-4 py-2 rounded-full">من {cat.minPrice} ر.س/يوم</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">{cat.icon} {cat.nameAr}</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">تأمين شامل</span>
            </div>
          </div>
          <div id="form"><LeadForm /></div>
        </div>
      </section>

      {/* Other categories in same city */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-6">فئات أخرى في {city.nameAr}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {otherCats.map(c => (
              <Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary transition-all">
                <span className="text-2xl">{c.icon}</span>
                <p className="text-sm font-bold mt-1">{c.nameAr}</p>
                <p className="text-xs text-text-mid">من {c.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Same category in other cities */}
      <section className="py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-6">تأجير {cat.nameAr} في مدن أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {otherCities.map(c => (
              <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}`}
                className="bg-bg border border-border rounded-xl p-4 text-center hover:border-primary transition-all">
                <p className="font-bold">{c.nameAr}</p>
                <p className="text-xs text-text-mid mt-1">من {cat.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-8">أسئلة عن تأجير {cat.nameAr} في {city.nameAr}</h2>
          <div className="divide-y divide-border">
            {catFAQs.map((faq, i) => (
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
    </>
  )
}
