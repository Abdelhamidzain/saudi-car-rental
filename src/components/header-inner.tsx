'use client'
import Link from 'next/link'
import { categories, SITE_NAME } from '@/lib/data'
import { CitySwitcher } from './city-switcher'

export default function HeaderInner() {
  return (
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
  )
}
