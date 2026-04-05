'use client'
import Link from 'next/link'
import { cities, categories, SITE_NAME } from '@/lib/data'
import { CityProvider } from './city-context'
import { CitySwitcher } from './city-switcher'

export default function LayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <CityProvider>
      <header className="site-header">
        <div className="container">
          <div className="header-right">
            <Link href="/" className="site-logo">{SITE_NAME}<span className="dot"/></Link>
            <CitySwitcher />
          </div>
          <nav className="nav-links hide-mobile" aria-label="التنقل الرئيسي">
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
    </CityProvider>
  )
}
