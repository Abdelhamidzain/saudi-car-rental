import type { Metadata } from 'next'
import Link from 'next/link'
import { Tajawal, Cairo } from 'next/font/google'
import './globals.css'
import { cities, categories, SITE_NAME, SITE_URL } from '@/lib/data'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700', '800', '900'],
  display: 'swap',
  variable: '--font-tajawal',
  preload: true,
})

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — قارن العروض واحجز بأفضل سعر`, template: `%s | ${SITE_NAME}` },
  description: 'قارن أسعار تأجير السيارات من أفضل الشركات في الرياض وجدة والدمام. أسعار تبدأ من 42 ريال يومياً.',
  alternates: { canonical: '/' },
}

// Critical inline CSS — renders header+hero on FIRST FRAME before external CSS loads
const criticalCSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D1B2A;color:#fff;font-family:var(--font-tajawal),'Tajawal',Arial,sans-serif;overflow-x:hidden}
.site-header{position:fixed;top:0;left:0;right:0;z-index:50;height:64px;background:rgba(13,27,42,0.95);border-bottom:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.site-header .container{display:flex;align-items:center;justify-content:space-between;height:100%;max-width:1200px;margin:0 auto;padding:0 24px}
.site-logo{font-family:var(--font-cairo),'Cairo',sans-serif;font-size:1.25rem;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;text-decoration:none}
.site-logo .dot{width:8px;height:8px;border-radius:50%;background:#D4A853}
.hero{padding:120px 0 80px;background:linear-gradient(135deg,#0D1B2A 0%,#1B3A5C 40%,#0D1B2A 100%);position:relative;overflow:hidden}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
.hero-inner{display:grid;grid-template-columns:1fr;gap:48px;align-items:center;position:relative;z-index:10}
@media(min-width:1024px){.hero-inner{grid-template-columns:1fr 420px;gap:64px}}
.hero-text{text-align:center}
@media(min-width:1024px){.hero-text{text-align:right}}
.hero-title{font-family:var(--font-cairo),'Cairo',sans-serif;font-size:2.5rem;font-weight:900;color:#fff;line-height:1.25;margin-bottom:20px}
.hero-title span{color:#D4A853}
@media(min-width:768px){.hero-title{font-size:3rem}}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(212,168,83,0.15);border:1px solid rgba(212,168,83,0.3);padding:8px 20px;border-radius:50px;color:#D4A853;font-size:.875rem;font-weight:600;margin-bottom:28px}
.glass-form{background:rgba(255,255,255,0.06);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;position:relative;overflow:hidden;min-height:480px}
.nav-links{display:flex;align-items:center;gap:32px;font-size:.875rem;font-weight:500}
.nav-link{color:rgba(255,255,255,0.75);text-decoration:none}
.nav-cta{background:#D4A853;color:#0D1B2A;padding:10px 24px;border-radius:50px;font-weight:700;text-decoration:none}
@media(max-width:767px){.hide-mobile{display:none!important}}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <head>
        {/* CRITICAL: Inline CSS for instant first-frame paint */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
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
