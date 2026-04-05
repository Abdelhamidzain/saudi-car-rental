import Link from 'next/link'
import { cities, categories, airports, homeFAQs, generateFAQSchema, SITE_NAME } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [generateFAQSchema(homeFAQs)],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 40%, #0D1B2A 100%)', padding: '120px 0 80px' }}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-glow" style={{ width: 500, height: 500, top: -100, right: -100 }} />
        <div className="hero-glow" style={{ width: 400, height: 400, bottom: -50, left: -50 }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full text-sm font-semibold mb-7" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853', padding: '8px 20px' }}>
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                +4,200 طلب شهرياً
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                تأجير سيارات في السعودية<br />
                <span className="text-accent">قارن واحجز بأفضل سعر</span>
              </h1>
              <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 520 }}>
                نجمع لك عروض تأجير سيارات من أكثر من 50 مكتب معتمد في الرياض وجدة والدمام.
                قارن الأسعار واحصل على أفضل عرض تأجير سيارة بأقل من 79 ريال يومياً.
              </p>

              <div className="flex flex-wrap gap-10 justify-center lg:justify-start">
                {[
                  { num: '+50', label: 'مكتب معتمد' },
                  { num: '12', label: 'وجهة' },
                  { num: '4.8 ★', label: 'تقييم العملاء' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-display text-3xl font-black text-accent">{s.num}</div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div id="form">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CITIES ===== */}
      <section className="bg-white" id="cities" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="text-center" style={{ marginBottom: 56 }}>
            <div className="section-tag" style={{ marginBottom: 16 }}>🏙️ المدن الرئيسية</div>
            <h2 className="font-display text-3xl md:text-4xl font-black" style={{ marginBottom: 12 }}>تأجير سيارات في المدن الرئيسية</h2>
            <p className="text-text-mid text-lg" style={{ maxWidth: 500, margin: '0 auto' }}>اختر وجهتك وقارن العروض المتوفرة حالياً من أفضل شركات التأجير</p>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20, marginBottom: 20 }}>
            {cities.slice(0, 2).map((city, i) => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${i === 0 ? 'md:col-span-2' : ''}`}
                style={{ height: 260, display: 'block' }}>
                <div className="absolute inset-0 duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #1B3A5C, #0D1B2A)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.1) 60%)' }} />
                <div className="absolute rounded-full text-xs font-bold z-10" style={{ top: 20, left: 20, background: 'rgba(212,168,83,0.9)', color: '#0D1B2A', padding: '6px 16px' }}>
                  من {city.minPrice} ر.س
                </div>
                <div className="absolute z-10" style={{ bottom: 0, right: 0, left: 0, padding: 24 }}>
                  <h3 className="font-display text-2xl font-black text-white">{city.nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🏢 {city.partnerCount} شركة</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>📍 {city.nameEn}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20, marginBottom: 20 }}>
            {cities.slice(2, 5).map(city => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ height: 220, display: 'block' }}>
                <div className="absolute inset-0 duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #1B3A5C, #0D1B2A)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.1) 60%)' }} />
                <div className="absolute rounded-full text-xs font-bold z-10" style={{ top: 20, left: 20, background: 'rgba(212,168,83,0.9)', color: '#0D1B2A', padding: '6px 16px' }}>
                  من {city.minPrice} ر.س
                </div>
                <div className="absolute z-10" style={{ bottom: 0, right: 0, left: 0, padding: 24 }}>
                  <h3 className="font-display text-xl font-black text-white">{city.nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🏢 {city.partnerCount} شركة</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 3 - Khobar centered */}
          {cities.length > 5 && (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
              <div className="hidden md:block" />
              <Link href={`/sa/${cities[5].slug}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ height: 220, display: 'block' }}>
                <div className="absolute inset-0 duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #1B3A5C, #0D1B2A)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.1) 60%)' }} />
                <div className="absolute rounded-full text-xs font-bold z-10" style={{ top: 20, left: 20, background: 'rgba(212,168,83,0.9)', color: '#0D1B2A', padding: '6px 16px' }}>
                  من {cities[5].minPrice} ر.س
                </div>
                <div className="absolute z-10" style={{ bottom: 0, right: 0, left: 0, padding: 24 }}>
                  <h3 className="font-display text-xl font-black text-white">{cities[5].nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🏢 {cities[5].partnerCount} شركة</span>
                  </div>
                </div>
              </Link>
              <div className="hidden md:block" />
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="text-center" style={{ marginBottom: 56 }}>
            <div className="section-tag" style={{ marginBottom: 16 }}>✨ لماذا تختارنا</div>
            <h2 className="font-display text-3xl font-black" style={{ marginBottom: 12 }}>لماذا تختار منصتنا؟</h2>
            <p className="text-text-mid" style={{ maxWidth: 500, margin: '0 auto' }}>نجمع لك أفضل العروض من شركات التأجير المرخصة في المملكة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 24 }}>
            {[
              { icon: '⚡', title: 'مقارنة شفافة', desc: 'قارن أسعار جميع الشركات في مكان واحد بكل شفافية وبدون رسوم مخفية' },
              { icon: '🔄', title: 'تحديث دوري', desc: 'نحدّث الأسعار والعروض بشكل مستمر لنضمن لك أفضل سعر متاح' },
              { icon: '✅', title: 'شركات مرخصة', desc: 'نعرض عروضاً حصرية من مؤسسات حاصلة على ترخيص هيئة النقل' },
              { icon: '🚀', title: 'حجز سريع', desc: 'أرسل طلبك واحصل على أفضل العروض خلال دقائق مباشرة على جوالك' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl text-center border border-border hover:-translate-y-1 hover:shadow-xl hover:border-accent transition-all cursor-default" style={{ padding: 32 }}>
                <div className="flex items-center justify-center mx-auto text-3xl" style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))', marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold" style={{ marginBottom: 8 }}>{f.title}</h3>
                <p className="text-sm text-text-mid leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VEHICLE CATEGORIES ===== */}
      <section className="bg-white" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="text-center" style={{ marginBottom: 56 }}>
            <div className="section-tag" style={{ marginBottom: 16 }}>🚗 فئات السيارات</div>
            <h2 className="font-display text-3xl font-black" style={{ marginBottom: 12 }}>فئات سيارات للتأجير</h2>
            <p className="text-text-mid" style={{ maxWidth: 500, margin: '0 auto' }}>اختر الفئة المناسبة لرحلتك واحتياجاتك</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7" style={{ gap: 16 }}>
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/riyadh/${cat.slug}`}
                className="bg-bg rounded-2xl text-center border-2 border-transparent hover:border-accent hover:-translate-y-1 transition-all cursor-pointer" style={{ padding: 24 }}>
                <div className="text-4xl" style={{ marginBottom: 12 }}>{cat.icon}</div>
                <h3 className="font-display text-sm font-bold" style={{ marginBottom: 4 }}>{cat.nameAr}</h3>
                <p className="text-sm text-text-mid">من <strong className="text-accent-hover">{cat.minPrice} ر.س</strong> / يوم</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AIRPORTS ===== */}
      <section className="text-white" style={{ background: 'linear-gradient(135deg, #0D1B2A, #1B3A5C)', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="text-center" style={{ marginBottom: 56 }}>
            <div className="section-tag section-tag-dark" style={{ marginBottom: 16 }}>✈️ المطارات</div>
            <h2 className="font-display text-3xl font-black text-white" style={{ marginBottom: 12 }}>تأجير سيارة من المطار</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto' }}>استلم سيارتك مباشرة عند وصولك للمطار</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5" style={{ gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {airports.map(ap => (
              <Link key={ap.slug} href={`/sa/airports/${ap.slug}`}
                className="rounded-2xl text-center hover:-translate-y-1 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', padding: 24 }}>
                <div className="font-display text-2xl font-black text-accent" style={{ marginBottom: 8 }}>{ap.code}</div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{ap.nameAr.replace(' الدولي', '')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <div className="text-center" style={{ marginBottom: 56 }}>
            <div className="section-tag" style={{ marginBottom: 16 }}>❓ أسئلة شائعة</div>
            <h2 className="font-display text-3xl font-black">أسئلة متكررة حول استئجار السيارات</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {homeFAQs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-base list-none" style={{ padding: 20 }}>
                  {faq.q}
                  <svg className="w-5 h-5 text-accent shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <p className="text-sm text-text-mid leading-relaxed" style={{ padding: '0 20px 20px' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-white" style={{ padding: '80px 0' }}>
        <div className="relative overflow-hidden rounded-3xl text-center" style={{ maxWidth: 900, margin: '0 auto 0', padding: '72px 48px', background: 'linear-gradient(135deg, #0D1B2A, #1B3A5C)', marginInline: 24 }}>
          <div className="hero-glow" style={{ width: 288, height: 288, top: -80, right: -80 }} />
          <div className="hero-glow" style={{ width: 192, height: 192, bottom: -60, left: -60 }} />
          <h2 className="font-display text-3xl font-black text-white relative z-10" style={{ marginBottom: 16 }}>ابدأ رحلتك الآن</h2>
          <p className="relative z-10" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>قدّم طلب تأجير سيارة خلال ثوانٍ واستلم أفضل عرض متاح</p>
          <Link href="#form" className="inline-flex items-center gap-2 bg-accent text-primary rounded-full font-display text-lg font-black hover:opacity-90 transition-all relative z-10" style={{ padding: '16px 40px' }}>
            قدّم طلبك مجاناً ←
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ padding: '24px 0', background: 'rgba(13,27,42,0.05)' }}>
        <p className="text-center text-sm text-text-mid leading-relaxed" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <strong>تنبيه:</strong> هذا الموقع دليل إلكتروني لمقارنة عروض تأجير السيارات ولا يُجري عمليات حجز مباشرة.
          الأسعار المدرجة ابتدائية وقابلة للتغيير.
        </p>
      </section>
    </>
  )
}
