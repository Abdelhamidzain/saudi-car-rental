import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/data'

export const metadata: Metadata = {
  title: { absolute: `من نحن — ${SITE_NAME} | منصة تأجير سيارات في السعودية` },
  description: `${SITE_NAME} منصة سعودية لمقارنة عروض تأجير السيارات من الشركات المرخصة. نجمع لك أفضل أسعار تأجير سيارة في الرياض وجدة والدمام ومكة والمدينة.`,
  alternates: { canonical: '/about' },
  openGraph: { title: `من نحن — ${SITE_NAME}`, description: 'منصة مقارنة عروض تأجير السيارات من الشركات المرخصة في السعودية.', url: `${SITE_URL}/about`, type: 'website', locale: 'ar_SA' },
}

export default function AboutPage() {
  return (<>
    <section className="hero" style={{padding:'120px 0 60px'}}>
      <div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container" style={{position:'relative',zIndex:10}}>
        <div className="breadcrumb" style={{justifyContent:'center'}}><Link href="/">الرئيسية</Link><span className="sep">/</span><span className="current">من نحن</span></div>
        <h1 className="hero-title" style={{textAlign:'center'}}>من نحن — <span>{SITE_NAME}</span></h1>
        <p className="hero-subtitle" style={{textAlign:'center',maxWidth:700,margin:'0 auto'}}>منصة سعودية متخصصة في مقارنة عروض تأجير سيارات من الشركات المرخصة بالمملكة العربية السعودية. هدفنا تسهيل عملية تأجير السيارات وتوفير أفضل الأسعار.</p>
      </div>
    </section>

    <section className="section section-white"><div className="container" style={{maxWidth:800}}>
      <h2 className="section-title" style={{textAlign:'center',marginBottom:24}}>رؤيتنا ورسالتنا</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>نؤمن بأن تأجير سيارة يجب أن يكون عملية سهلة وشفافة. لذلك أنشأنا منصة تجمع عروض تأجير السيارات من عشرات المكاتب المرخصة في مكان واحد، حيث يمكنك مقارنة الأسعار والمواصفات واختيار الأنسب لاحتياجاتك بثقة تامة.</p>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>نغطي حالياً ست مدن رئيسية في المملكة: الرياض وجدة والدمام ومكة المكرمة والمدينة المنورة والخبر. نتعامل مع أكثر من خمسين مكتب تأجير سيارات حاصل على ترخيص هيئة النقل العام، ونعرض سبع فئات مختلفة من المركبات تشمل الاقتصادية والسيدان والدفع الرباعي والفاخرة والعائلية والبيك أب والفان.</p>

      <h2 className="section-title" style={{textAlign:'center',marginBottom:24,marginTop:48}}>كيف تعمل المنصة</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>العملية بسيطة: تختار المدينة ونوع المركبة وتاريخ الاستلام والتسليم ثم تقدم طلبك مجاناً. خلال دقائق يتواصل معك أحد شركائنا المعتمدين بأفضل عرض سعر متاح. لا نفرض أي رسوم على العميل — نحن دليل مقارنة فقط ولسنا شركة تأجير مباشرة.</p>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>جميع الشركاء المعروضين على المنصة حاصلون على تراخيص رسمية من هيئة النقل العام في المملكة العربية السعودية. نتحقق من صلاحية التراخيص دورياً لضمان تعاملك مع جهات موثوقة ومعتمدة.</p>

      <h2 className="section-title" style={{textAlign:'center',marginBottom:24,marginTop:48}}>تواصل معنا</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,textAlign:'center'}}>لأي استفسار أو اقتراح تواصل معنا عبر البريد الإلكتروني: <strong>info@cars-renting.com</strong></p>
    </div></section>
  </>)
}
