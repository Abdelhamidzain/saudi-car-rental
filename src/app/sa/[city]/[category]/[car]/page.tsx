import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, carModels, getCityBySlug, getCategoryBySlug, getCarBySlug, getCarsByCategory, getAirportsForCity, getPartnersForCity, generateFAQSchema, generateBreadcrumbSchema, generateCarSEOContent, categoryGradients, SITE_NAME, SITE_URL } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'
import { NoSSR } from '@/components/no-ssr'

export function generateStaticParams() {
  const p: { city: string; category: string; car: string }[] = []
  for (const city of cities)
    for (const car of carModels)
      p.push({ city: city.slug, category: car.category, car: car.slug })
  return p
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string; car: string }> }): Promise<Metadata> {
  const { city: cs, category: cats, car: cars } = await params
  const city = getCityBySlug(cs), cat = getCategoryBySlug(cats), car = getCarBySlug(cars)
  if (!city || !cat || !car) return {}
  const title = `تأجير سيارة ${car.nameAr} في ${city.nameAr} — تأجير سيارات من ${car.dailyPrice} ريال | ${SITE_NAME}`
  const desc = `تأجير سيارات ${cat.nameAr} في ${city.nameAr}: احجز ${car.nameAr} ${car.year} بأفضل سعر. قارن عروض تأجير السيارات من الشركات المرخصة. تأجير سيارة ${car.nameAr} يبدأ من ${car.dailyPrice} ريال يومياً و${car.monthlyPrice} ريال شهرياً.`
  return {
    title, description: desc,
    alternates: { canonical: `/sa/${city.slug}/${cat.slug}/${car.slug}` },
    openGraph: { title, description: desc, url: `${SITE_URL}/sa/${city.slug}/${cat.slug}/${car.slug}`, type: 'website', locale: 'ar_SA' },
  }
}

export default async function CarPage({ params }: { params: Promise<{ city: string; category: string; car: string }> }) {
  const { city: cs, category: cats, car: cars } = await params
  const city = getCityBySlug(cs), cat = getCategoryBySlug(cats), car = getCarBySlug(cars)
  if (!city || !cat || !car || car.category !== cat.slug) notFound()

  const similarCars = getCarsByCategory(cat.slug).filter(c => c.slug !== car.slug)
  const otherCities = cities.filter(c => c.slug !== city.slug).slice(0, 5)
  const cityAirports = getAirportsForCity(city.slug)
  const partners = getPartnersForCity(city.slug)
  const seo = generateCarSEOContent(car, city, cat)
  const grad = categoryGradients[cat.slug] || categoryGradients.economy

  const faqs = [
    { q: `كم سعر تأجير سيارة ${car.nameAr} في ${city.nameAr}؟`, a: `يبدأ الإيجار اليومي لـ${car.nameAr} موديل ${car.year} في ${city.nameAr} من ${car.dailyPrice} ريال سعودي. السعر الأسبوعي من ${seo.weeklyPrice} ريال بخصم خمسة عشر بالمئة، والشهري من ${car.monthlyPrice} ريال بخصم يصل أربعين بالمئة. جميع العروض تشمل تغطية تأمينية أساسية ضد الغير.` },
    { q: `ما مواصفات ${car.nameAr} ${car.year} المتوفرة للإيجار؟`, a: `${car.nameAr} من ${car.brandAr} موديل ${car.year}: سعة ${car.seats} ركاب، ناقل حركة ${car.transmissionAr}، يعمل بوقود ${car.fuelAr}. أبرز التجهيزات تشمل: ${car.features.join('، ')}. ${car.description}` },
    { q: `هل إيجار ${car.nameAr} يشمل التأمين والكيلومترات؟`, a: `نعم، جميع عروض تأجير السيارات تشمل تغطية تأمينية أساسية وكيلومترات محددة يومياً. بالإمكان ترقية الحماية التأمينية لتشمل الأضرار الذاتية والسرقة مقابل رسوم بسيطة عند الاستلام.` },
    { q: `هل يمكن استلام ${car.nameAr} من المطار في ${city.nameAr}؟`, a: cityAirports.length > 0 ? `بالتأكيد، غالبية المكاتب المعتمدة في ${city.nameAr} توفر خدمة التوصيل والاستلام من ${cityAirports[0].nameAr} (${cityAirports[0].code}) مباشرة عند وصول العميل دون رسوم إضافية.` : `بالتأكيد، معظم المكاتب المرخصة توفر خدمة الإيصال للموقع المطلوب. حدد ذلك عند تقديم طلبك.` },
    { q: `ما الوثائق المطلوبة لاستئجار ${car.nameAr}؟`, a: `الشروط الأساسية: رخصة قيادة سعودية أو دولية سارية المفعول، إثبات هوية رسمي ساري (بطاقة وطنية أو جواز سفر)، والحد الأدنى للعمر واحد وعشرون عاماً. بعض المؤجرين يطلبون مبلغ ضمان قابل للاسترداد عند إعادة المركبة بحالتها.` },
    { q: `كم عدد شركات تأجير سيارات المتوفرة في ${city.nameAr}؟`, a: `نجمع عروض ${partners.length > 0 ? partners.length : city.partnerCount} مكتب إيجار مرخص في ${city.nameAr}${partners.length > 0 ? ` منها ${partners.slice(0, 3).map(p => p.name).join(' و')}` : ''}. جميع الشركاء حاصلون على اعتماد هيئة النقل العام بالمملكة العربية السعودية.` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org', '@graph': [
      generateBreadcrumbSchema([
        { name: SITE_NAME, url: '/' },
        { name: `تأجير سيارات ${city.nameAr}`, url: `/sa/${city.slug}` },
        { name: `تأجير ${cat.nameAr} ${city.nameAr}`, url: `/sa/${city.slug}/${cat.slug}` },
        { name: `تأجير ${car.nameAr} ${city.nameAr}`, url: `/sa/${city.slug}/${cat.slug}/${car.slug}` },
      ]),
      generateFAQSchema(faqs),
      {
        '@type': 'Product', name: `تأجير ${car.nameAr} في ${city.nameAr}`,
        description: seo.uniqueIntro, brand: { '@type': 'Brand', name: car.brand },
        offers: { '@type': 'AggregateOffer', lowPrice: car.dailyPrice, highPrice: car.monthlyPrice, priceCurrency: 'SAR', availability: 'https://schema.org/InStock', offerCount: partners.length || city.partnerCount },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO — SSR */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" style={{ width: 400, height: 400, top: -100, right: -100 }} />
        <div className="hero-glow" style={{ width: 300, height: 300, bottom: -50, left: -50 }} />
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="breadcrumb">
                <Link href="/">الرئيسية</Link><span className="sep">/</span>
                <Link href={`/sa/${city.slug}`}>{city.nameAr}</Link><span className="sep">/</span>
                <Link href={`/sa/${city.slug}/${cat.slug}`}>{cat.nameAr}</Link><span className="sep">/</span>
                <span className="current">{car.nameAr}</span>
              </div>
              <h1 className="hero-title">تأجير سيارة {car.nameAr} في <span>{city.nameAr}</span></h1>
              <p className="hero-subtitle">{seo.uniqueIntro}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <span className="pill pill-accent">من {car.dailyPrice} ريال/يوم</span>
                <span className="pill pill-accent">{car.monthlyPrice} ريال/شهر</span>
                <span className="pill pill-glass">{car.seats} مقاعد • {car.transmissionAr}</span>
                <span className="pill pill-glass">{car.fuelAr} • {car.year}</span>
                <span className="pill pill-glass">{cat.icon} {cat.nameAr}</span>
              </div>
            </div>
            <div id="form"><LazyLeadForm /></div>
          </div>
        </div>
      </section>

      <NoSSR>
      {/* PRICES + SPECS */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">💰 أسعار إيجار {car.nameAr}</div>
            <h2 className="section-title">أسعار إيجار {car.nameAr} {car.year} في {city.nameAr}</h2>
            <p className="section-sub">أسعار تنافسية من الشركات المعتمدة — يومي وأسبوعي وشهري</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
            <div className="feature-card" style={{ borderTop: '3px solid #D4A853' }}>
              <div className="feature-icon">📅</div>
              <div className="feature-title">الإيجار اليومي</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#D4A853', fontFamily: "'Cairo', sans-serif" }}>{car.dailyPrice} <span style={{ fontSize: '1rem', color: '#6B7280' }}>ريال/يوم</span></div>
              <div className="feature-desc">تأمين أساسي + كيلومترات محدودة</div>
            </div>
            <div className="feature-card" style={{ borderTop: '3px solid #1B3A5C' }}>
              <div className="feature-icon">📆</div>
              <div className="feature-title">الإيجار الأسبوعي</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1B3A5C', fontFamily: "'Cairo', sans-serif" }}>{seo.weeklyPrice} <span style={{ fontSize: '1rem', color: '#6B7280' }}>ريال/أسبوع</span></div>
              <div className="feature-desc">خصم 15% — تأمين أساسي</div>
            </div>
            <div className="feature-card" style={{ borderTop: '3px solid #0D1B2A' }}>
              <div className="feature-icon">🗓️</div>
              <div className="feature-title">الإيجار الشهري</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0D1B2A', fontFamily: "'Cairo', sans-serif" }}>{car.monthlyPrice} <span style={{ fontSize: '1rem', color: '#6B7280' }}>ريال/شهر</span></div>
              <div className="feature-desc">خصم 40% — تأمين شامل + كيلومترات مفتوحة</div>
            </div>
          </div>
          <p style={{ textAlign: 'center', maxWidth: 700, margin: '32px auto 0', fontSize: '.9rem', color: '#4B5563', lineHeight: 1.8 }}>{seo.pricingDetails}</p>
        </div>
      </section>

      {/* SPECS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">📋 مواصفات {car.brandAr}</div>
            <h2 className="section-title">مواصفات {car.nameAr} {car.year} — المواصفات الفنية</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, maxWidth: 800, margin: '0 auto' }}>
            {[
              { icon: '👥', label: 'عدد المقاعد', value: `${car.seats} مقاعد` },
              { icon: '⚙️', label: 'ناقل الحركة', value: car.transmissionAr },
              { icon: '⛽', label: 'نوع الوقود', value: car.fuelAr },
              { icon: '📅', label: 'سنة الموديل', value: `${car.year}` },
              { icon: '🏷️', label: 'الشركة المصنعة', value: car.brandAr },
              { icon: '🚗', label: 'فئة السيارة', value: cat.nameAr },
            ].map((s, i) => (
              <div key={i} className="cat-card" style={{ cursor: 'default' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                <div className="cat-name">{s.label}</div>
                <div className="cat-price"><strong>{s.value}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS CAR - Unique Content */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <div className="section-tag section-tag-dark">✨ لماذا {car.nameAr}؟</div>
            <h2 className="section-title section-title-white">مميزات استئجار {car.nameAr} في {city.nameAr}</h2>
            <p className="section-sub section-sub-light">تجهيزات ومميزات تجعل رحلتك أكثر راحة وأماناً</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {car.features.map((f, i) => (
              <div key={i} className="airport-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 8, color: '#D4A853' }}>✓</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{f}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', maxWidth: 700, margin: '32px auto 0', fontSize: '.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>{seo.whyThisCar}</p>
        </div>
      </section>

      {/* CITY TIPS - Unique Content */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🏙️ نصائح القيادة في {city.nameAr}</div>
            <h2 className="section-title">نصائح إيجار {car.nameAr} في {city.nameAr}</h2>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ fontSize: '.95rem', color: '#4B5563', lineHeight: 2, marginBottom: 24 }}>{seo.cityTips}</p>
            <p style={{ fontSize: '.95rem', color: '#4B5563', lineHeight: 2 }}>{seo.rentalProcess}</p>
          </div>
        </div>
      </section>

      {/* SIMILAR CARS - Colored Cards */}
      {similarCars.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">{cat.icon} {cat.nameAr} أخرى</div>
              <h2 className="section-title">{cat.nameAr} أخرى في {city.nameAr}</h2>
              <p className="section-sub">قارن بين موديلات فئة {cat.nameAr} واختر الأنسب لرحلتك</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {similarCars.map(c => (
                <Link key={c.slug} href={`/sa/${city.slug}/${cat.slug}/${c.slug}`} style={{ textDecoration: 'none', display: 'block', position: 'relative', borderRadius: 16, overflow: 'hidden', height: 200, background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`, transition: 'transform .4s, box-shadow .4s' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.2) 60%)' }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2, background: 'rgba(212,168,83,0.9)', color: '#0D1B2A', padding: '5px 14px', borderRadius: 50, fontSize: '.7rem', fontWeight: 700 }}>من {c.dailyPrice} ريال/يوم</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: 20, zIndex: 2 }}>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{c.nameAr}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.75)' }}>{c.brandAr} • {c.year}</span>
                      <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.75)' }}>{c.seats} مقاعد • {c.transmissionAr}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SAME CAR OTHER CITIES */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🏙️ مدن أخرى</div>
            <h2 className="section-title">إيجار {car.nameAr} في مدن أخرى</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {otherCities.map(c => (
              <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}/${car.slug}`} className="link-card">
                <div className="link-card-name">تأجير {car.nameAr} {c.nameAr}</div>
                <div className="link-card-sub">من {car.dailyPrice} ريال/يوم</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </NoSSR>

      {/* FAQ — SSR ONLY for Surfer SEO */}
      <section className="section" id="faq">
        <div className="container-sm">
          <div className="section-header">
            <div className="section-tag">❓ أسئلة شائعة</div>
            <h2 className="section-title">أسئلة شائعة عن تأجير سيارة {car.nameAr} في {city.nameAr}</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary>{f.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <NoSSR>
      {/* CTA */}
      <section className="section section-white">
        <div className="container">
          <div className="cta-box">
            <div className="hero-glow" style={{ width: 288, height: 288, top: -80, right: -80 }} />
            <div className="hero-glow" style={{ width: 192, height: 192, bottom: -60, left: -60 }} />
            <div className="cta-title">احجز {car.nameAr} الآن في {city.nameAr}</div>
            <div className="cta-desc">قدّم طلب إيجار {car.nameAr} خلال ثوانٍ واستلم أفضل عرض سعر من الشركات المعتمدة في {city.nameAr}</div>
            <Link href="#form" className="cta-btn">قدّم طلبك مجاناً ←</Link>
          </div>
        </div>
      </section>
      </NoSSR>
    </>
  )
}
