'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cities, SITE_NAME } from '@/lib/data'

// Buffer accounting for the floating CTA's own height plus mobile Safari's
// bottom browser chrome. The floating CTA hides once the internal form
// submit button reaches the viewport above this bottom band, so the two
// CTAs never overlap.
const ACTION_BOTTOM_BUFFER_PX = 120

// True when the internal form action target is visible / near-visible —
// i.e. the floating CTA should hide. Recomputed on every scroll/resize
// frame so it stays correct under mobile Safari's dynamic viewport.
function isActionTargetVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  const h = window.innerHeight || document.documentElement.clientHeight
  return rect.top < h - ACTION_BOTTOM_BUFFER_PX && rect.bottom > 0
}

export default function FooterInner() {
  const [nearForm, setNearForm] = useState(false)

  useEffect(() => {
    let io: IntersectionObserver | null = null
    let rafId = 0
    let scrollRaf = 0
    let tries = 0
    let target: HTMLElement | null = null
    const MAX_TRIES = 40 // ~0.6s — enough for the lazy lead form to mount

    function evaluate() {
      if (target) setNearForm(isActionTargetVisible(target))
    }

    function onScrollResize() {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        evaluate()
      })
    }

    function start() {
      const submit = document.getElementById('lead-form-submit')
      const fallback = document.getElementById('form')
      // Prefer the precise submit button. The lead form is lazy-loaded, so
      // the button may not be in the DOM yet — retry briefly while #form
      // exists before settling for a broader anchor.
      if (!submit && fallback && tries < MAX_TRIES) {
        tries++
        rafId = requestAnimationFrame(start)
        return
      }
      // Priority: #lead-form-submit → #lead-form-action → #form.
      target = submit
        ?? document.getElementById('lead-form-action')
        ?? fallback
      if (!target) return
      evaluate()
      if (typeof IntersectionObserver !== 'undefined') {
        // The observer is only a cheap trigger; the actual decision is the
        // getBoundingClientRect math in evaluate(), which is reliable under
        // mobile Safari's collapsing/expanding bottom chrome.
        io = new IntersectionObserver(evaluate, {
          rootMargin: `0px 0px -${ACTION_BOTTOM_BUFFER_PX}px 0px`,
          threshold: 0,
        })
        io.observe(target)
      }
      window.addEventListener('scroll', onScrollResize, { passive: true })
      window.addEventListener('resize', onScrollResize)
    }

    start()
    return () => {
      io?.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      window.removeEventListener('scroll', onScrollResize)
      window.removeEventListener('resize', onScrollResize)
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
