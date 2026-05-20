'use client'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/data'
import { CitySwitcher } from './city-switcher'

export default function HeaderInner() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-right">
          <Link href="/" className="site-logo">{SITE_NAME}<span className="dot"/></Link>
          <CitySwitcher />
        </div>
        <nav className="nav-links" aria-label="التنقل الرئيسي">
          <Link href="#form" className="nav-cta">احصل على أفضل عرض الآن</Link>
        </nav>
      </div>
    </header>
  )
}
