import Link from 'next/link'
import { cities, categories, airports, homeFAQs, generateFAQSchema, SITE_NAME } from '@/lib/data'
import { LazyLeadForm } from '@/components/lazy-lead-form'

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':[generateFAQSchema(homeFAQs)]})}}/>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"/>
        <div className="hero-glow" style={{width:500,height:500,top:-100,right:-100}}/>
        <div className="hero-glow" style={{width:400,height:400,bottom:-50,left:-50}}/>
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-badge"><span className="pulse"/>+4,200 طلب شهرياً</div>
              <h1 className="hero-title">تأجير سيارات في السعودية<br/><span>قارن واحجز بأفضل سعر</span></h1>
              <p className="hero-subtitle">نجمع لك عروض تأجير سيارات من أكثر من 50 مكتب معتمد في الرياض وجدة والدمام. قارن الأسعار واحصل على أفضل عرض تأجير سيارة بأقل من 79 ريال يومياً.</p>
              <div className="hero-stats">
                <div style={{textAlign:'center'}}><div className="stat-num">+50</div><div className="stat-label">مكتب معتمد</div></div>
                <div style={{textAlign:'center'}}><div className="stat-num">12</div><div className="stat-label">وجهة</div></div>
                <div style={{textAlign:'center'}}><div className="stat-num">4.8 ★</div><div className="stat-label">تقييم العملاء</div></div>
              </div>
            </div>
            <div id="form"><LazyLeadForm/></div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="section section-white" id="cities">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🏙️ المدن الرئيسية</div>
            <h2 className="section-title">تأجير سيارات في المدن الرئيسية</h2>
            <p className="section-sub">اختر وجهتك وقارن العروض المتوفرة حالياً من أفضل شركات التأجير</p>
          </div>
          <div className="cities-grid">
            {cities.map((city,i)=>(
              <Link key={city.slug} href={`/sa/${city.slug}`} className={`city-card ${i===0?'city-card-large':''}`}>
                <div className="city-overlay"/>
                <div className="city-price">من {city.minPrice} ر.س</div>
                <div className="city-content">
                  <div className="city-name">{city.nameAr}</div>
                  <div className="city-meta">
                    <span>🏢 {city.partnerCount} شركة</span>
                    <span>📍 {city.nameEn}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">✨ لماذا تختارنا</div>
            <h2 className="section-title">لماذا تختار منصتنا؟</h2>
            <p className="section-sub">نجمع لك أفضل العروض من شركات التأجير المرخصة في المملكة</p>
          </div>
          <div className="features-grid">
            {[
              {icon:'⚡',title:'مقارنة شفافة',desc:'قارن أسعار جميع الشركات في مكان واحد بكل شفافية وبدون رسوم مخفية'},
              {icon:'🔄',title:'تحديث دوري',desc:'نحدّث الأسعار والعروض بشكل مستمر لنضمن لك أفضل سعر متاح'},
              {icon:'✅',title:'شركات مرخصة',desc:'نعرض عروضاً حصرية من مؤسسات حاصلة على ترخيص هيئة النقل'},
              {icon:'🚀',title:'حجز سريع',desc:'أرسل طلبك واحصل على أفضل العروض خلال دقائق مباشرة على جوالك'},
            ].map((f,i)=>(
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🚗 فئات السيارات</div>
            <h2 className="section-title">فئات سيارات للتأجير</h2>
            <p className="section-sub">اختر الفئة المناسبة لرحلتك واحتياجاتك</p>
          </div>
          <div className="cats-grid">
            {categories.map(cat=>(
              <Link key={cat.slug} href={`/sa/riyadh/${cat.slug}`} className="cat-card">
                <div className="cat-emoji">{cat.icon}</div>
                <div className="cat-name">{cat.nameAr}</div>
                <div className="cat-price">من <strong>{cat.minPrice} ر.س</strong> / يوم</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AIRPORTS */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <div className="section-tag section-tag-dark">✈️ المطارات</div>
            <h2 className="section-title section-title-white">تأجير سيارة من المطار</h2>
            <p className="section-sub section-sub-light">استلم سيارتك مباشرة عند وصولك للمطار</p>
          </div>
          <div className="airports-grid">
            {airports.map(ap=>(
              <Link key={ap.slug} href={`/sa/airports/${ap.slug}`} className="airport-card">
                <div className="airport-code">{ap.code}</div>
                <div className="airport-name">{ap.nameAr.replace(' الدولي','')}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container-sm">
          <div className="section-header">
            <div className="section-tag">❓ أسئلة شائعة</div>
            <h2 className="section-title">أسئلة متكررة حول استئجار السيارات</h2>
          </div>
          <div className="faq-list">
            {homeFAQs.map((faq,i)=>(
              <details key={i} className="faq-item">
                <summary>{faq.q}<svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-white">
        <div className="container">
          <div className="cta-box">
            <div className="hero-glow" style={{width:288,height:288,top:-80,right:-80}}/>
            <div className="hero-glow" style={{width:192,height:192,bottom:-60,left:-60}}/>
            <div className="cta-title">ابدأ رحلتك الآن</div>
            <div className="cta-desc">قدّم طلب تأجير سيارة خلال ثوانٍ واستلم أفضل عرض متاح</div>
            <Link href="#form" className="cta-btn">قدّم طلبك مجاناً ←</Link>
          </div>
        </div>
      </section>

      <div className="disclaimer"><p><strong>تنبيه:</strong> هذا الموقع دليل إلكتروني لمقارنة عروض تأجير السيارات ولا يُجري عمليات حجز مباشرة. الأسعار المدرجة ابتدائية وقابلة للتغيير.</p></div>
    </>
  )
}
