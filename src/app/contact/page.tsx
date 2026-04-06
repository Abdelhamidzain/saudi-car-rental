import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/data'

export const metadata: Metadata = {
  title: { absolute: `اتصل بنا — ${SITE_NAME} | تأجير سيارات في السعودية` },
  description: `تواصل مع فريق ${SITE_NAME} لأي استفسار حول تأجير السيارات في السعودية. نرحب باقتراحاتكم وملاحظاتكم لتحسين خدمة تأجير سيارة عبر منصتنا.`,
  alternates: { canonical: '/contact' },
  openGraph: { title: `اتصل بنا — ${SITE_NAME}`, description: 'تواصل معنا لأي استفسار حول تأجير السيارات.', url: `${SITE_URL}/contact`, type: 'website', locale: 'ar_SA' },
}

export default function ContactPage() {
  return (<>
    <section className="hero" style={{padding:'120px 0 60px'}}>
      <div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container" style={{position:'relative',zIndex:10}}>
        <div className="breadcrumb" style={{justifyContent:'center'}}><Link href="/">الرئيسية</Link><span className="sep">/</span><span className="current">اتصل بنا</span></div>
        <h1 className="hero-title" style={{textAlign:'center'}}>اتصل <span>بنا</span></h1>
        <p className="hero-subtitle" style={{textAlign:'center',maxWidth:600,margin:'0 auto'}}>نسعد بتواصلكم لأي استفسار أو اقتراح حول خدمات تأجير السيارات عبر منصتنا.</p>
      </div>
    </section>

    <section className="section section-white"><div className="container" style={{maxWidth:700}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
        <div style={{background:'#FAFAF7',border:'1px solid #E5E7EB',borderRadius:16,padding:32,textAlign:'center'}}>
          <div style={{fontSize:'2rem',marginBottom:12}}>📧</div>
          <h2 style={{fontSize:'1rem',fontWeight:700,color:'#1A1A2E',marginBottom:8}}>البريد الإلكتروني</h2>
          <p style={{fontSize:'.9rem',color:'#4B5563',lineHeight:1.8}}>للاستفسارات العامة والشراكات</p>
          <p style={{fontSize:'.9rem',color:'#D4A853',fontWeight:700,marginTop:8}}>info@cars-renting.com</p>
        </div>
        <div style={{background:'#FAFAF7',border:'1px solid #E5E7EB',borderRadius:16,padding:32,textAlign:'center'}}>
          <div style={{fontSize:'2rem',marginBottom:12}}>🏢</div>
          <h2 style={{fontSize:'1rem',fontWeight:700,color:'#1A1A2E',marginBottom:8}}>للشركاء والمكاتب</h2>
          <p style={{fontSize:'.9rem',color:'#4B5563',lineHeight:1.8}}>إذا كنت مكتب تأجير سيارات مرخص وترغب بالانضمام</p>
          <p style={{fontSize:'.9rem',color:'#D4A853',fontWeight:700,marginTop:8}}>partners@cars-renting.com</p>
        </div>
      </div>

      <div style={{marginTop:48,textAlign:'center'}}>
        <h2 style={{fontSize:'1rem',fontWeight:700,color:'#1A1A2E',marginBottom:16}}>أوقات الاستجابة</h2>
        <p style={{fontSize:'.9rem',color:'#4B5563',lineHeight:2}}>نرد على جميع الرسائل خلال أربع وعشرين ساعة عمل. للطلبات العاجلة المتعلقة بحجوزات تأجير سيارات قائمة يرجى التواصل مباشرة مع شركة التأجير المعنية عبر بيانات التواصل الموجودة في تأكيد الحجز.</p>
      </div>
    </div></section>
  </>)
}
