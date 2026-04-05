import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, carModels, getCityBySlug, getCategoryBySlug, getCarBySlug, getCarsByCategory, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME, SITE_URL } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'

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
  const title = `تأجير ${car.nameAr} في ${city.nameAr} — من ${car.dailyPrice} ريال/يوم`
  const desc = `احجز ${car.nameAr} ${car.year} في ${city.nameAr}. ${car.transmissionAr} • ${car.seats} مقاعد • ${car.fuelAr}. أسعار تبدأ من ${car.dailyPrice} ريال يومياً و${car.monthlyPrice} ريال شهرياً. قارن العروض واحصل على أفضل سعر.`
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

  const faqs = [
    { q: `كم سعر تأجير ${car.nameAr} في ${city.nameAr}؟`, a: `يبدأ سعر تأجير ${car.nameAr} من ${car.dailyPrice} ريال يومياً و${car.monthlyPrice} ريال شهرياً في ${city.nameAr}. السعر يشمل التأمين الأساسي وقد يختلف حسب مدة الإيجار والشركة المؤجرة.` },
    { q: `ما مواصفات ${car.nameAr} ${car.year}؟`, a: `${car.nameAr} ${car.year}: ${car.seats} مقاعد، ناقل حركة ${car.transmissionAr}، وقود ${car.fuelAr}. تشمل المميزات: ${car.features.join('، ')}.` },
    { q: `هل تأجير ${car.nameAr} يشمل التأمين؟`, a: `نعم، جميع عروض التأجير تشمل التأمين الأساسي. يمكنك ترقية التأمين لشامل مقابل رسوم إضافية بسيطة عند التواصل مع الشركة المؤجرة.` },
    { q: `هل يمكن استلام ${car.nameAr} من المطار في ${city.nameAr}؟`, a: `نعم، معظم شركائنا يوفرون خدمة التوصيل والاستلام من مطارات ${city.nameAr}. حدد ذلك عند تقديم الطلب وسيتم ترتيب الاستلام.` },
    { q: `ما شروط تأجير ${car.nameAr}؟`, a: `المستندات المطلوبة: رخصة قيادة سارية المفعول، هوية وطنية أو جواز سفر ساري، والعمر لا يقل عن 21 سنة. بعض الشركات قد تطلب ضمان مالي قابل للاسترداد.` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org', '@graph': [
      generateBreadcrumbSchema([
        { name: SITE_NAME, url: '/' },
        { name: city.nameAr, url: `/sa/${city.slug}` },
        { name: cat.nameAr, url: `/sa/${city.slug}/${cat.slug}` },
        { name: car.nameAr, url: `/sa/${city.slug}/${cat.slug}/${car.slug}` },
      ]),
      generateFAQSchema(faqs),
      {
        '@type': 'Product', name: `تأجير ${car.nameAr} في ${city.nameAr}`,
        description: car.description, brand: { '@type': 'Brand', name: car.brand },
        offers: { '@type': 'AggregateOffer', lowPrice: car.dailyPrice, highPrice: car.dailyPrice * 2, priceCurrency: 'SAR', availability: 'https://schema.org/InStock' },
      },
    ],
  }

  const specs = [
    { icon: '👥', label: 'المقاعد', value: `${car.seats} مقاعد` },
    { icon: '⚙️', label: 'ناقل الحركة', value: car.transmissionAr },
    { icon: '⛽', label: 'الوقود', value: car.fuelAr },
    { icon: '📅', label: 'سنة الموديل', value: `${car.year}` },
    { icon: '🏷️', label: 'الماركة', value: car.brandAr },
    { icon: '🏷️', label: 'الفئة', value: cat.nameAr },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
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
              <h1 className="hero-title">تأجير {car.nameAr} في <span>{city.nameAr}</span></h1>
              <p className="hero-subtitle">{car.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <span className="pill pill-accent">من {car.dailyPrice} ر.س/يوم</span>
                <span className="pill pill-glass">{car.seats} مقاعد • {car.transmissionAr}</span>
                <span className="pill pill-glass">{car.fuelAr} • {car.year}</span>
              </div>
            </div>
            <div id="form"><LazyLeadForm /></div>
          </div>
        </div>
      </section>

      {/* PRICES */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">💰 الأسعار</div>
            <h2 className="section-title">أسعار تأجير {car.nameAr} في {city.nameAr}</h2>
            <p className="section-sub">أسعار تنافسية مع التأمين الأساسي — يومي وشهري</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            <div className="feature-card" style={{ borderTop: '3px solid #D4A853' }}>
              <div className="feature-icon">📅</div>
              <div className="feature-title">الإيجار اليومي</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#D4A853', fontFamily: "'Cairo', sans-serif" }}>{car.dailyPrice} <span style={{ fontSize: '1rem', color: '#6B7280' }}>ر.س/يوم</span></div>
              <div className="feature-desc">يشمل التأمين الأساسي + كيلومترات محدودة</div>
            </div>
            <div className="feature-card" style={{ borderTop: '3px solid #0D1B2A' }}>
              <div className="feature-icon">🗓️</div>
              <div className="feature-title">الإيجار الشهري</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0D1B2A', fontFamily: "'Cairo', sans-serif" }}>{car.monthlyPrice} <span style={{ fontSize: '1rem', color: '#6B7280' }}>ر.س/شهر</span></div>
              <div className="feature-desc">خصم يصل 40% — تأمين شامل + كيلومترات مفتوحة</div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">📋 المواصفات</div>
            <h2 className="section-title">مواصفات {car.nameAr} {car.year}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, maxWidth: 800, margin: '0 auto' }}>
            {specs.map((s, i) => (
              <div key={i} className="cat-card" style={{ cursor: 'default' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                <div className="cat-name">{s.label}</div>
                <div className="cat-price"><strong>{s.value}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <div className="section-tag section-tag-dark">✨ المميزات</div>
            <h2 className="section-title section-title-white">مميزات {car.nameAr}</h2>
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
        </div>
      </section>

      {/* SIMILAR CARS */}
      {similarCars.length > 0 && (
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">🚗 سيارات مشابهة</div>
              <h2 className="section-title">سيارات {cat.nameAr} أخرى في {city.nameAr}</h2>
              <p className="section-sub">قارن بين موديلات فئة {cat.nameAr} واختر الأنسب لرحلتك</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {similarCars.map(c => (
                <Link key={c.slug} href={`/sa/${city.slug}/${cat.slug}/${c.slug}`} className="feature-card" style={{ textAlign: 'right', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: '2rem' }}>{cat.icon}</div>
                    <span className="pill pill-accent" style={{ fontSize: '.7rem', padding: '4px 12px' }}>من {c.dailyPrice} ر.س</span>
                  </div>
                  <div className="feature-title" style={{ marginBottom: 4 }}>{c.nameAr}</div>
                  <div style={{ fontSize: '.8rem', color: '#6B7280', marginBottom: 8 }}>{c.brandAr} • {c.year}</div>
                  <div style={{ fontSize: '.75rem', color: '#9CA3AF' }}>{c.seats} مقاعد • {c.transmissionAr} • {c.fuelAr}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SAME CAR OTHER CITIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🏙️ مدن أخرى</div>
            <h2 className="section-title">تأجير {car.nameAr} في مدن أخرى</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {otherCities.map(c => (
              <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}/${car.slug}`} className="link-card">
                <div className="link-card-name">{c.nameAr}</div>
                <div className="link-card-sub">من {car.dailyPrice} ر.س/يوم</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-white" id="faq">
        <div className="container-sm">
          <div className="section-header">
            <div className="section-tag">❓ أسئلة شائعة</div>
            <h2 className="section-title">أسئلة عن تأجير {car.nameAr} في {city.nameAr}</h2>
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

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-box">
            <div className="hero-glow" style={{ width: 288, height: 288, top: -80, right: -80 }} />
            <div className="hero-glow" style={{ width: 192, height: 192, bottom: -60, left: -60 }} />
            <div className="cta-title">احجز {car.nameAr} الآن</div>
            <div className="cta-desc">قدّم طلبك خلال ثوانٍ واستلم أفضل عرض لتأجير {car.nameAr} في {city.nameAr}</div>
            <Link href="#form" className="cta-btn">قدّم طلبك مجاناً ←</Link>
          </div>
        </div>
      </section>
    </>
  )
}
