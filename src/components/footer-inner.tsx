'use client'
import Link from 'next/link'
import { cities, SITE_NAME } from '@/lib/data'

export default function FooterInner() {
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
      <div className="mobile-cta hide-desktop"><Link href="#form">احصل على عرض تأجير</Link></div>
    </>
  )
}
