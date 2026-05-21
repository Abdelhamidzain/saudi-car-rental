'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cities, SITE_NAME } from '@/lib/data'

// CTA height + safety: hide the floating CTA when the form's top enters
// the bottom ~80 px of the viewport so it slides out cleanly before the
// form's own submit area becomes visible.
const FORM_NEAR_ROOT_MARGIN = '0px 0px -80px 0px'

function isFormNearViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  const h = window.innerHeight || document.documentElement.clientHeight
  return rect.top < h - 80 && rect.bottom > 0
}

export default function FooterInner() {
  const [nearForm, setNearForm] = useState(false)

  useEffect(() => {
    const target = document.getElementById('form')
    if (!target) return
    // Synchronous initial check so we don't flash the CTA if the form is
    // already in view on first paint (typical on hero-based SEO pages).
    setNearForm(isFormNearViewport(target))
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setNearForm(entry.isIntersecting),
      { rootMargin: FORM_NEAR_ROOT_MARGIN, threshold: 0 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">{SITE_NAME}<span style={{width:8,height:8,borderRadius:'50%',background:'#D4A853',display:'inline-block'}}/></div>
              <p style={{fontSize:'.85rem',lineHeight:1.8,maxWidth:300}}>منصة مقارنة لإيجار المركبات بالمملكة العربية السعودية. نجمع لك أفضل العروض من الشركات المرخصة.</p>
            </div>
            <div><div className="footer-title">المدن</div><div className="footer-links">{cities.map(c=><Link key={c.slug} href={`/sa/${c.slug}`}>{c.nameAr}</Link>)}</div></div>
            <div><div className="footer-title">خدمات</div><div className="footer-links"><span>شهري</span><span>أسبوعي</span><span>المطار</span><span>بدون تأمين</span></div></div>
            <div><div className="footer-title">روابط</div><div className="footer-links"><Link href="/about">من نحن</Link><Link href="/contact">اتصل بنا</Link><Link href="/privacy">سياسة الخصوصية</Link></div></div>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} {SITE_NAME}. جميع الحقوق محفوظة</span><span>صُنع بـ ❤️ في السعودية</span></div>
      </footer>
      <div className={'mobile-cta' + (nearForm ? ' mobile-cta-hidden' : '')} aria-hidden={nearForm}>
        <Link href="#form" tabIndex={nearForm ? -1 : 0}>احصل على أفضل عرض الآن</Link>
      </div>
    </>
  )
}
