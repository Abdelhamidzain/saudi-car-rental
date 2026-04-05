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
      <section className="pt-28 pb-20 px-6 min-h-[600px] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 40%, #0D1B2A 100%)' }}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-glow w-[500px] h-[500px] absolute" style={{ top: '-100px', right: '-100px' }} />
        <div className="hero-glow w-[400px] h-[400px] absolute" style={{ bottom: '-50px', left: '-50px' }} />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-7" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              +4,200 طلب شهرياً
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              تأجير سيارات في السعودية<br />
              <span className="text-accent">قارن واحجز بأفضل سعر</span>
            </h1>
            <p className="text-lg max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
          <div id="form" className="max-w-md mx-auto lg:mx-0 w-full">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ===== CITIES ===== */}
      <section className="py-20 px-6 bg-white" id="cities">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">🏙️ المدن الرئيسية</div>
            <h2 className="font-display text-3xl font-black mb-3">تأجير سيارات في المدن الرئيسية</h2>
            <p className="text-text-mid text-lg max-w-lg mx-auto">اختر وجهتك وقارن العروض المتوفرة حالياً من أفضل شركات التأجير</p>
          </div>

          {/* Row 1: Riyadh large + Jeddah */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {cities.slice(0, 2).map((city, i) => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${i === 0 ? 'md:col-span-2 h-64' : 'h-64'}`}>
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #1B3A5C, #0D1B2A)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.1) 60%)' }} />
                <div className="absolute top-5 left-5 px-4 py-1.5 rounded-full text-xs font-bold z-10" style={{ background: 'rgba(212,168,83,0.9)', color: '#0D1B2A' }}>
                  من {city.minPrice} ر.س
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-6 z-10">
                  <h3 className="font-display text-2xl font-black text-white">{city.nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🏢 {city.partnerCount} شركة</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>📍 {city.nameEn}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2: 3 equal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {cities.slice(2, 5).map(city => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer h-56 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #1B3A5C, #0D1B2A)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.1) 60%)' }} />
                <div className="absolute top-5 left-5 px-4 py-1.5 rounded-full text-xs font-bold z-10" style={{ background: 'rgba(212,168,83,0.9)', color: '#0D1B2A' }}>
                  من {city.minPrice} ر.س
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-6 z-10">
                  <h3 className="font-display text-xl font-black text-white">{city.nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🏢 {city.partnerCount} شركة</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 3: Khobar alone centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="hidden md:block" />
            {cities.slice(5, 6).map(city => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer h-56 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #1B3A5C, #0D1B2A)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.1) 60%)' }} />
                <div className="absolute top-5 left-5 px-4 py-1.5 rounded-full text-xs font-bold z-10" style={{ background: 'rgba(212,168,83,0.9)', color: '#0D1B2A' }}>
                  من {city.minPrice} ر.س
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-6 z-10">
                  <h3 className="font-display text-xl font-black text-white">{city.nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🏢 {city.partnerCount} شركة</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">✨ لماذا تختارنا</div>
            <h2 className="font-display text-3xl font-black mb-3">لماذا تختار منصتنا؟</h2>
            <p className="text-text-mid max-w-lg mx-auto">نجمع لك أفضل العروض من شركات التأجير المرخصة في المملكة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'مقارنة شفافة', desc: 'قارن أسعار جميع الشركات في مكان واحد بكل شفافية وبدون رسوم مخفية' },
              { icon: '🔄', title: 'تحديث دوري', desc: 'نحدّث الأسعار والعروض بشكل مستمر لنضمن لك أفضل سعر متاح' },
              { icon: '✅', title: 'شركات مرخصة', desc: 'نعرض عروضاً حصرية من مؤسسات حاصلة على ترخيص هيئة النقل' },
              { icon: '🚀', title: 'حجز سريع', desc: 'أرسل طلبك واحصل على أفضل العروض خلال دقائق مباشرة على جوالك' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center border border-border hover:-translate-y-1 hover:shadow-xl hover:border-accent transition-all cursor-default">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))' }}>
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-text-mid leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VEHICLE CATEGORIES ===== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">🚗 فئات السيارات</div>
            <h2 className="font-display text-3xl font-black mb-3">فئات سيارات للتأجير</h2>
            <p className="text-text-mid max-w-lg mx-auto">اختر الفئة المناسبة لرحلتك واحتياجاتك</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/riyadh/${cat.slug}`}
                className="bg-bg rounded-2xl p-6 text-center border-2 border-transparent hover:border-accent hover:-translate-y-1 transition-all cursor-pointer">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-display text-sm font-bold mb-1">{cat.nameAr}</h3>
                <p className="text-sm text-text-mid">من <strong className="text-accent-hover">{cat.minPrice} ر.س</strong> / يوم</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AIRPORTS ===== */}
      <section className="py-20 px-6 text-white" style={{ background: 'linear-gradient(135deg, #0D1B2A, #1B3A5C)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag section-tag-dark mb-4">✈️ المطارات</div>
            <h2 className="font-display text-3xl font-black text-white mb-3">تأجير سيارة من المطار</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="max-w-lg mx-auto">استلم سيارتك مباشرة عند وصولك للمطار</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 max-w-4xl mx-auto">
            {airports.map(ap => (
              <Link key={ap.slug} href={`/sa/airports/${ap.slug}`}
                className="rounded-2xl p-6 text-center hover:-translate-y-1 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="font-display text-2xl font-black text-accent mb-2">{ap.code}</div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{ap.nameAr.replace(' الدولي', '')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">❓ أسئلة شائعة</div>
            <h2 className="font-display text-3xl font-black">أسئلة متكررة حول استئجار السيارات</h2>
          </div>
          <div className="grid gap-3">
            {homeFAQs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
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

      {/* ===== CTA ===== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto rounded-3xl p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B2A, #1B3A5C)' }}>
          <div className="hero-glow w-72 h-72 absolute" style={{ top: '-80px', right: '-80px' }} />
          <div className="hero-glow w-48 h-48 absolute" style={{ bottom: '-60px', left: '-60px' }} />
          <h2 className="font-display text-3xl font-black text-white mb-4 relative z-10">ابدأ رحلتك الآن</h2>
          <p className="mb-8 relative z-10" style={{ color: 'rgba(255,255,255,0.6)' }}>قدّم طلب تأجير سيارة خلال ثوانٍ واستلم أفضل عرض متاح</p>
          <Link href="#form" className="inline-flex items-center gap-2 bg-accent text-primary px-10 py-4 rounded-full font-display text-lg font-black hover:opacity-90 transition-all relative z-10">
            قدّم طلبك مجاناً ←
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 px-6" style={{ background: 'rgba(13,27,42,0.05)' }}>
        <p className="max-w-3xl mx-auto text-center text-sm text-text-mid leading-relaxed">
          <strong>تنبيه:</strong> هذا الموقع دليل إلكتروني لمقارنة عروض تأجير السيارات ولا يُجري عمليات حجز مباشرة.
          الأسعار المدرجة ابتدائية وقابلة للتغيير وفقاً للتواريخ والتوفر لدى الشركة المعنية.
        </p>
      </section>
    </>
  )
}
