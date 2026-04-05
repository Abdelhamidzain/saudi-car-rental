import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { cities, categories, SITE_NAME, SITE_URL } from '@/lib/data'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — قارن العروض واحجز بأفضل سعر`, template: `%s | ${SITE_NAME}` },
  description: 'قارن أسعار تأجير السيارات من أفضل الشركات في الرياض وجدة والدمام. أسعار تبدأ من 42 ريال يومياً.',
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* FIX: Preconnect to Google Fonts — eliminates DNS+TCP+TLS latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* FIX: Load fonts via <link> instead of CSS @import — non-render-blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=Cairo:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context':'https://schema.org','@graph':[
            {'@type':'WebSite',name:SITE_NAME,url:SITE_URL,inLanguage:'ar'},
            {'@type':'Organization',name:SITE_NAME,url:SITE_URL}
          ]
        })}} />
      </head>
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="site-logo">{SITE_NAME}<span className="dot"/></Link>
            <nav className="nav-links hide-mobile" aria-label="التنقل الرئيسي">
              <div className="nav-dropdown">
                <span className="nav-link" style={{cursor:'pointer'}}>المدن</span>
                <div className="nav-dropdown-menu"><div className="nav-dropdown-inner">
                  {cities.map(c=><Link key={c.slug} href={`/sa/${c.slug}`} className="nav-dropdown-link">{c.nameAr}</Link>)}
                </div></div>
              </div>
              <div className="nav-dropdown">
                <span className="nav-link" style={{cursor:'pointer'}}>الفئات</span>
                <div className="nav-dropdown-menu"><div className="nav-dropdown-inner">
                  {categories.map(c=><Link key={c.slug} href={`/sa/riyadh/${c.slug}`} className="nav-dropdown-link">{c.icon} {c.nameAr}</Link>)}
                </div></div>
              </div>
              <Link href="#faq" className="nav-link">الأسئلة</Link>
              <Link href="#form" className="nav-cta">احصل على عرض</Link>
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="footer-brand">{SITE_NAME}<span style={{width:8,height:8,borderRadius:'50%',background:'#D4A853',display:'inline-block'}}/></div>
                <p style={{fontSize:'.85rem',lineHeight:1.8,maxWidth:300}}>منصة مقارنة لإيجار المركبات بالمملكة العربية السعودية. نجمع لك أفضل العروض من الشركات المرخصة.</p>
              </div>
              <div><div className="footer-title">المدن</div><div className="footer-links">{cities.map(c=><Link key={c.slug} href={`/sa/${c.slug}`}>{c.nameAr}</Link>)}</div></div>
              <div><div className="footer-title">خدمات</div><div className="footer-links"><span>شهري</span><span>أسبوعي</span><span>المطار</span><span>بدون تأمين</span></div></div>
              <div><div className="footer-title">روابط</div><div className="footer-links"><span>من نحن</span><span>للشركاء</span><span>سياسة الخصوصية</span></div></div>
            </div>
          </div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} {SITE_NAME}. جميع الحقوق محفوظة</span><span>صُنع بـ ❤️ في السعودية</span></div>
        </footer>

        <div className="mobile-cta hide-desktop"><Link href="#form">احصل على عرض تأجير</Link></div>
      </body>
    </html>
  )
}
