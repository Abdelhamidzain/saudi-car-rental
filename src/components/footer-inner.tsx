'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cities, SITE_NAME } from '@/lib/data'

// CTA height + safety: hide the floating CTA when the form's action-area
// marker enters the viewport (minus the bottom ~80 px the CTA occupies),
// so it slides out cleanly once the user reaches the main submit area.
const FORM_NEAR_ROOT_MARGIN = '0px 0px -80px 0px'

function isActionAreaNearViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  const h = window.innerHeight || document.documentElement.clientHeight
  return rect.top < h - 80 && rect.bottom > 0
}

export default function FooterInner() {
  const [nearForm, setNearForm] = useState(false)

  useEffect(() => {
    let io: IntersectionObserver | null = null
    let rafId = 0
    let tries = 0
    const MAX_TRIES = 40 // ~0.6s — enough for the lazy lead form to mount

    function start() {
      const marker = document.getElementById('lead-form-action')
      const fallback = document.getElementById('form')
      // Prefer the precise action marker. The lead form is lazy-loaded, so
      // the marker may not be in the DOM yet — retry briefly while #form
      // exists before settling for the broader #form anchor.
      if (!marker && fallback && tries < MAX_TRIES) {
        tries++
        rafId = requestAnimationFrame(start)
        return
      }
      const target = marker ?? fallback
      if (!target) return
      // Synchronous initial check so we don't flash the CTA if the action
      // area is already in view on first paint.
      setNearForm(isActionAreaNearViewport(target))
      if (typeof IntersectionObserver === 'undefined') return
      io = new IntersectionObserver(
        ([entry]) => setNearForm(entry.isIntersecting),
        { rootMargin: FORM_NEAR_ROOT_MARGIN, threshold: 0 },
      )
      io.observe(target)
    }

    start()
    return () => {
      io?.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
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
