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

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 min-h-[500px] bg-gradient-to-br from-primary-dark via-primary to-primary-light relative overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,168,56,.12)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* Text */}
          <div className="text-center lg:text-right">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              تأجير سيارات في السعودية<br />
              <span className="text-accent">قارن واحجز بأفضل سعر</span>
            </h1>
            <p className="text-lg text-white/85 max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
              نجمع لك عروض تأجير سيارات من أكثر من 50 مكتب معتمد في الرياض وجدة والدمام.
              قارن الأسعار واحصل على أفضل عرض تأجير سيارة بأقل من 79 ريال يومياً دون كفالة مسبقة.
              نغطي الحجز اليومي والأسبوعي والشهري مع التوصيل للمطار.
            </p>
          </div>

          {/* Form */}
          <div id="form">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-border py-6 min-h-[80px]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center px-6">
          <div><div className="text-3xl font-extrabold text-primary">50+</div><div className="text-sm text-text-mid mt-1">مكتب معتمد</div></div>
          <div><div className="text-3xl font-extrabold text-primary">12</div><div className="text-sm text-text-mid mt-1">وجهة</div></div>
          <div><div className="text-3xl font-extrabold text-primary">4,200+</div><div className="text-sm text-text-mid mt-1">طلب شهرياً</div></div>
          <div><div className="text-3xl font-extrabold text-primary">4.8★</div><div className="text-sm text-text-mid mt-1">تقييم عملاء</div></div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 px-6" id="cities">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2">تأجير سيارات في المدن الرئيسية</h2>
            <p className="text-text-mid">اختر وجهتك وقارن العروض المتوفرة حالياً</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map(city => (
              <Link key={city.slug} href={`/sa/${city.slug}`}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all group">
                <div className="h-0 pb-[56%] bg-gradient-to-br from-primary-dark to-primary-light relative">
                  <div className="absolute bottom-3 right-4 text-xl font-extrabold text-white drop-shadow-lg">{city.nameAr}</div>
                </div>
                <div className="p-4 flex justify-between items-center bg-white">
                  <span className="text-sm text-[#3D3D3D]"><strong className="text-[#0B2920]">{city.partnerCount}</strong> شركة</span>
                  <span className="text-sm font-bold text-[#0D3D1F] bg-[rgba(45,159,95,.15)] px-2.5 py-1 rounded-md">من {city.minPrice} ر.س</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-3">لماذا تختار منصتنا؟</h2>
          <p className="text-text-mid leading-relaxed">
            نربطك بأكبر أسطول مركبات مرخّص من هيئة النقل العام في المملكة.
            تأجير السيارات عبر منصتنا يوفّر وقتك بمقارنة العروض لحظياً بدلاً من الاتصال بكل شركة على حدة.
            جميع الشركاء يقدمون تأميناً شاملاً وكيلومترات مفتوحة وقبول رخصة قيادة دولية.
            سواء وصلت حديثاً من رحلة جوية أو تخطط لجولة برية طويلة — نضمن لك الخيار المثالي بخطوة واحدة.
          </p>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-8">فئات سيارات للتأجير</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/sa/riyadh/${cat.slug}`}
                className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h3 className="text-sm font-bold">{cat.nameAr}</h3>
                <p className="text-xs text-text-main mt-1">من {cat.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Airports */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-6">تأجير سيارة من المطار</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {airports.map(ap => (
              <Link key={ap.slug} href={`/sa/airports/${ap.slug}`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary transition-all">
                <p className="font-bold text-sm">{ap.nameAr.replace('الدولي', '').replace('الدولي', '').trim()}</p>
                <p className="text-sm text-text-mid mt-1">{ap.code}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Blocks */}
      <section className="py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center text-2xl">🛡️</div>
            <h3 className="font-bold mb-1">شركات تأجير سيارات مرخصة</h3>
            <p className="text-sm text-text-mid">نعرض عروض حصرية من مؤسسات حاصلة على تصريح هيئة النقل العام</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center text-2xl">🔄</div>
            <h3 className="font-bold mb-1">تحديث دوري للأسعار</h3>
            <p className="text-sm text-text-mid">نراجع قوائم التأجير والعروض باستمرار لضمان دقة البيانات المعروضة</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center text-2xl">⚖️</div>
            <h3 className="font-bold mb-1">مقارنة شفافة عادلة وسريعة</h3>
            <p className="text-sm text-text-mid">قارن تكاليف تأجير السيارات بين عدة مزوّدين واختر الأوفر لميزانيتك</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-8">أسئلة متكررة حول استئجار السيارات</h2>
          <div className="divide-y divide-border">
            {homeFAQs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex justify-between items-center py-5 cursor-pointer font-bold text-base list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-text-mid shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <p className="pb-5 text-sm text-text-mid leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-12 px-6 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">ابدأ رحلتك الآن</h2>
        <p className="text-white/90 mb-6">قدّم طلب تأجير سيارة خلال ثوانٍ واستلم أفضل عرض متاح</p>
        <Link href="#form" className="inline-block bg-accent text-primary-dark px-10 py-4 rounded-xl text-lg font-extrabold hover:bg-accent-hover transition-colors">
          قدّم طلبك مجاناً
        </Link>
      </section>

      {/* Disclaimer */}
      <section className="py-5 px-6 bg-primary/5">
        <p className="max-w-3xl mx-auto text-center text-sm text-text-mid leading-relaxed">
          <strong>تنبيه:</strong> هذا الموقع دليل إلكتروني لمقارنة عروض تأجير السيارات ولا يُجري عمليات حجز مباشرة.
          الأسعار المدرجة ابتدائية وقابلة للتغيير وفقاً للتواريخ والتوفر لدى الشركة المعنية.
          تواصل مع المؤجر للحصول على التسعيرة النهائية قبل إتمام أي اتفاق.
        </p>
      </section>
    </>
  )
}
