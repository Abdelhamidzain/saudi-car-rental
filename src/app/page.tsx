import Link from 'next/link'
import { cities, categories, airports, homeFAQs, generateFAQSchema, SITE_NAME, SITE_URL } from '@/lib/data'
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
      <section className="pt-28 pb-20 px-6 min-h-[600px] bg-gradient-to-br from-primary via-primary-light to-primary relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="hero-glow w-[500px] h-[500px] -top-24 -right-24 absolute animate-float" />
        <div className="hero-glow w-[400px] h-[400px] -bottom-12 -left-12 absolute" style={{ animationDirection: 'reverse', animationDuration: '10s' }} />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 px-5 py-2 rounded-full text-accent text-sm font-semibold mb-7">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              +4,200 طلب شهرياً
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-tight mb-5">
              تأجير سيارات في السعودية<br />
              <span className="text-accent">قارن واحجز بأفضل سعر</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0">
              نجمع لك عروض تأجير سيارات من أكثر من 50 مكتب معتمد في الرياض وجدة والدمام.
              قارن الأسعار واحصل على أفضل عرض تأجير سيارة بأقل من 79 ريال يومياً.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-10 justify-center lg:justify-start">
              <div className="text-center">
                <div className="font-display text-3xl font-black text-accent">+50</div>
                <div className="text-xs text-white/40 mt-1">مكتب معتمد</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-black text-accent">12</div>
                <div className="text-xs text-white/40 mt-1">وجهة</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-black text-accent">4.8 ★</div>
                <div className="text-xs text-white/40 mt-1">تقييم العملاء</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div id="form">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ===== CITIES ===== */}
      <section className="py-20 px-6 bg-white" id="cities">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">🏙️ المدن الرئيسية</div>
            <h2 className="font-display text-3xl md:text-4xl font-black mb-3">تأجير سيارات في المدن الرئيسية</h2>
            <p className="text-text-mid text-lg max-w-lg mx-auto">اختر وجهتك وقارن العروض المتوفرة حالياً من أفضل شركات التأجير</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, i) => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl ${i === 0 ? 'sm:col-span-2 h-72' : 'h-60'}`}>
                {/* Gradient BG */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-primary transition-transform duration-600 group-hover:scale-105" />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                {/* Price tag */}
                <div className="absolute top-5 left-5 bg-accent/90 text-primary px-4 py-1.5 rounded-full text-xs font-bold z-10">
                  من {city.minPrice} ر.س
                </div>
                {/* Content */}
                <div className="absolute bottom-0 right-0 left-0 p-6 z-10">
                  <h3 className="font-display text-2xl font-black text-white">{city.nameAr}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-white/70">🏢 {city.partnerCount} شركة</span>
                    <span className="text-xs text-white/70">📍 {city.nameEn}</span>
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
              <div key={i} className="bg-white rounded-2xl p-8 text-center border border-border/50 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent transition-all duration-300 cursor-default">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center mx-auto mb-5 text-3xl">
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
      <section className="py-20 px-6 bg-white" id="categories">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">🚗 فئات السيارات</div>
            <h2 className="font-display text-3xl font-black mb-3">فئات سيارات للتأجير</h2>
            <p className="text-text-mid max-w-lg mx-auto">اختر الفئة المناسبة لرحلتك واحتياجاتك</p>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/riyadh/${cat.slug}`}
                className="flex-none w-52 bg-bg rounded-2xl p-7 text-center border-2 border-transparent hover:border-accent hover:-translate-y-1 transition-all snap-start cursor-pointer">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="font-display text-base font-bold mb-1">{cat.nameAr}</h3>
                <p className="text-sm text-text-mid">من <strong className="text-accent-hover text-base">{cat.minPrice} ر.س</strong> / يوم</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AIRPORTS ===== */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary to-primary-light text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag bg-accent/20 !text-accent-light mb-4">✈️ المطارات</div>
            <h2 className="font-display text-3xl font-black text-white mb-3">تأجير سيارة من المطار</h2>
            <p className="text-white/50 max-w-lg mx-auto">استلم سيارتك مباشرة عند وصولك للمطار</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 max-w-4xl mx-auto">
            {airports.map(ap => (
              <Link key={ap.slug} href={`/sa/airports/${ap.slug}`}
                className="bg-white/6 border border-white/8 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-accent hover:-translate-y-1 transition-all">
                <div className="font-display text-2xl font-black text-accent mb-2">{ap.code}</div>
                <p className="text-xs text-white/60 leading-relaxed">{ap.nameAr.replace(' الدولي', '')}</p>
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

      {/* ===== CTA ===== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary to-primary-light rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="hero-glow w-72 h-72 -top-20 -right-20 absolute" />
          <div className="hero-glow w-48 h-48 -bottom-16 -left-16 absolute" />
          <h2 className="font-display text-3xl font-black text-white mb-4 relative z-10">ابدأ رحلتك الآن</h2>
          <p className="text-white/60 mb-8 relative z-10">قدّم طلب تأجير سيارة خلال ثوانٍ واستلم أفضل عرض متاح</p>
          <Link href="#form" className="inline-flex items-center gap-2 bg-accent text-primary px-10 py-4 rounded-full font-display text-lg font-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,168,83,0.35)] transition-all relative z-10">
            قدّم طلبك مجاناً ←
          </Link>
        </div>
      </section>

      {/* ===== DISCLAIMER ===== */}
      <section className="py-6 px-6 bg-primary/5">
        <p className="max-w-3xl mx-auto text-center text-sm text-text-mid leading-relaxed">
          <strong>تنبيه:</strong> هذا الموقع دليل إلكتروني لمقارنة عروض تأجير السيارات ولا يُجري عمليات حجز مباشرة.
          الأسعار المدرجة ابتدائية وقابلة للتغيير وفقاً للتواريخ والتوفر لدى الشركة المعنية.
          تواصل مع المؤجر للحصول على التسعيرة النهائية قبل إتمام أي اتفاق.
        </p>
      </section>
    </>
  )
}
