'use client'

/**
 * Car-detail-page client content (Task 9 H1-only SSR experiment).
 * Renders /sa/[city]/[category]/[car] body after hydration via slots.
 *
 * Pricing remains driven by static `data.ts.carModels[].dailyPrice` /
 * `monthlyPrice` — passed in as props so post-hydration the visible
 * pricing card matches the Product JSON-LD emitted in SSR.
 */

import Link from 'next/link'
import {
  cities, categories, getCarBySlug, getCarsByCategory,
  categoryGradients, generateCarSEOContent, getCityBySlug, getCategoryBySlug,
} from '@/lib/data'
import { LazyLeadForm } from './lazy-lead-form'

type Slot = 'breadcrumb' | 'pills' | 'form' | 'body'

type Props = {
  slot: Slot
  citySlug: string
  catSlug: string
  carSlug: string
  cityNameAr: string
  categoryNameAr: string
  carBrandAr: string
  carNameAr: string
  carYear: number
  faqs: { q: string; a: string }[]
}

export default function CarPageClientContent({ slot, citySlug, catSlug, carSlug, cityNameAr, categoryNameAr, carBrandAr, carNameAr, carYear, faqs }: Props) {
  const car = getCarBySlug(carSlug)
  const city = getCityBySlug(citySlug)
  const cat = getCategoryBySlug(catSlug)
  if (!car || !city || !cat) return null

  if (slot === 'breadcrumb') {
    return (
      <div className="breadcrumb">
        <Link href="/">الرئيسية</Link><span className="sep">/</span>
        <Link href={`/sa/${city.slug}`}>{cityNameAr}</Link><span className="sep">/</span>
        <Link href={`/sa/${city.slug}/${cat.slug}`}>{categoryNameAr}</Link><span className="sep">/</span>
        <span className="current">{carNameAr}</span>
      </div>
    )
  }

  if (slot === 'pills') {
    return (
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center' }}>
        <span className="pill pill-accent">من {car.dailyPrice} ريال/يوم</span>
        <span className="pill pill-accent">{car.monthlyPrice} ريال/شهر</span>
        <span className="pill pill-glass">{car.seats} مقاعد • {car.transmissionAr}</span>
        <span className="pill pill-glass">{car.fuelAr} • {carYear}</span>
        <span className="pill pill-glass">{cat.icon} {categoryNameAr}</span>
      </div>
    )
  }

  if (slot === 'form') {
    return <LazyLeadForm defaultCitySlug={city.slug} selectedCarSlug={car.slug} defaultCategorySlug={cat.slug} />
  }

  if (slot === 'body') {
    const similarCars = getCarsByCategory(cat.slug).filter(c => c.slug !== car.slug)
    const otherCities = cities.filter(c => c.slug !== city.slug).slice(0, 5)
    const seo = generateCarSEOContent(car, city, cat)
    const grad = categoryGradients[cat.slug] || categoryGradients.economy

    return (
      <>
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">💰 أسعار إيجار {carNameAr}</div>
              <h2 className="section-title">أسعار إيجار {carNameAr} {carYear} في {cityNameAr}</h2>
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

        <section className="section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">📋 مواصفات {carBrandAr}</div>
              <h2 className="section-title">مواصفات {carNameAr} {carYear} — المواصفات الفنية</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, maxWidth: 800, margin: '0 auto' }}>
              {[
                { icon: '👥', label: 'عدد المقاعد', value: `${car.seats} مقاعد` },
                { icon: '⚙️', label: 'ناقل الحركة', value: car.transmissionAr },
                { icon: '⛽', label: 'نوع الوقود', value: car.fuelAr },
                { icon: '📅', label: 'سنة الموديل', value: `${carYear}` },
                { icon: '🏷️', label: 'الشركة المصنعة', value: carBrandAr },
                { icon: '🚗', label: 'فئة السيارة', value: categoryNameAr },
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

        <section className="section section-dark">
          <div className="container">
            <div className="section-header">
              <div className="section-tag section-tag-dark">✨ لماذا {carNameAr}؟</div>
              <h2 className="section-title section-title-white">مميزات استئجار {carNameAr} في {cityNameAr}</h2>
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

        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">🏙️ نصائح القيادة في {cityNameAr}</div>
              <h2 className="section-title">نصائح إيجار {carNameAr} في {cityNameAr}</h2>
            </div>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <p style={{ fontSize: '.95rem', color: '#4B5563', lineHeight: 2, marginBottom: 24 }}>{seo.cityTips}</p>
              <p style={{ fontSize: '.95rem', color: '#4B5563', lineHeight: 2 }}>{seo.rentalProcess}</p>
            </div>
          </div>
        </section>

        {similarCars.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div className="section-tag">{cat.icon} {categoryNameAr} أخرى</div>
                <h2 className="section-title">{categoryNameAr} أخرى في {cityNameAr}</h2>
                <p className="section-sub">قارن بين موديلات فئة {categoryNameAr} واختر الأنسب لرحلتك</p>
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

        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">🏙️ مدن أخرى</div>
              <h2 className="section-title">إيجار {carNameAr} في مدن أخرى</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {otherCities.map(c => (
                <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}/${car.slug}`} className="link-card">
                  <div className="link-card-name">تأجير {carNameAr} {c.nameAr}</div>
                  <div className="link-card-sub">من {car.dailyPrice} ريال/يوم</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container-sm">
            <div className="section-header">
              <div className="section-tag">❓ أسئلة شائعة</div>
              <h2 className="section-title">أسئلة شائعة عن تأجير سيارة {carNameAr} في {cityNameAr}</h2>
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

        <div className="ssr-links">
          <div className="container">
            <h2 className="ssr-links-title">تأجير سيارات {categoryNameAr} أخرى في {cityNameAr}</h2>
            <div className="ssr-links-grid">
              {similarCars.slice(0,4).map(c=><Link key={c.slug} href={`/sa/${city.slug}/${cat.slug}/${c.slug}`}>{c.nameAr}</Link>)}
            </div>
            <h2 className="ssr-links-title" style={{marginTop:20}}>تأجير سيارة من فئات أخرى</h2>
            <div className="ssr-links-grid">
              {categories.filter(c=>c.slug!==cat.slug).slice(0,5).map(c=><Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`}>{c.icon} {c.nameAr} {cityNameAr}</Link>)}
            </div>
            <h2 className="ssr-links-title" style={{marginTop:20}}>تأجير السيارات في مدن أخرى</h2>
            <div className="ssr-links-grid">
              {otherCities.map(c=><Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}/${car.slug}`}>{carNameAr} — {c.nameAr}</Link>)}
              <Link href={`/sa/${city.slug}`}>جميع العروض في {cityNameAr}</Link>
            </div>
          </div>
        </div>

        <section className="section section-white">
          <div className="container">
            <div className="cta-box">
              <div className="hero-glow" style={{ width: 288, height: 288, top: -80, right: -80 }} />
              <div className="hero-glow" style={{ width: 192, height: 192, bottom: -60, left: -60 }} />
              <div className="cta-title">احجز {carNameAr} الآن في {cityNameAr}</div>
              <div className="cta-desc">قدّم طلب إيجار {carNameAr} خلال ثوانٍ واستلم أفضل عرض سعر من الشركات المعتمدة في {cityNameAr}</div>
              <Link href="#form" className="cta-btn">قدّم طلبك مجاناً ←</Link>
            </div>
          </div>
        </section>

      </>
    )
  }

  return null
}
