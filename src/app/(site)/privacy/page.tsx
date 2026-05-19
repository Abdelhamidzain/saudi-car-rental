import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/data'

export const metadata: Metadata = {
  title: { absolute: `سياسة الخصوصية — ${SITE_NAME}` },
  description: `سياسة الخصوصية لمنصة ${SITE_NAME} لتأجير السيارات. نوضح كيف نجمع ونستخدم ونحمي بياناتك الشخصية عند استخدام خدمات تأجير سيارات عبر منصتنا.`,
  alternates: { canonical: '/privacy' },
  openGraph: { title: `سياسة الخصوصية — ${SITE_NAME}`, description: 'سياسة الخصوصية وحماية البيانات الشخصية.', url: `${SITE_URL}/privacy`, type: 'website', locale: 'ar_SA' },
}

export default function PrivacyPage() {
  return (<>
    <section className="hero" style={{padding:'120px 0 60px'}}>
      <div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container" style={{position:'relative',zIndex:10}}>
        <div className="breadcrumb" style={{justifyContent:'center'}}><Link href="/">الرئيسية</Link><span className="sep">/</span><span className="current">سياسة الخصوصية</span></div>
        <h1 className="hero-title" style={{textAlign:'center'}}>سياسة <span>الخصوصية</span></h1>
        <p className="hero-subtitle" style={{textAlign:'center',maxWidth:600,margin:'0 auto'}}>نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية.</p>
      </div>
    </section>

    <section className="section section-white"><div className="container" style={{maxWidth:800}}>
      <h2 className="section-title" style={{marginBottom:16}}>البيانات التي نجمعها</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>عند تقديم طلب تأجير سيارة عبر المنصة نجمع المعلومات التالية: رقم الجوال للتواصل، المدينة المطلوبة، نوع المركبة المفضلة، وتاريخ الاستلام والتسليم. لا نجمع بيانات مالية أو أرقام بطاقات ائتمانية عبر الموقع.</p>

      <h2 className="section-title" style={{marginBottom:16,marginTop:40}}>كيف نستخدم بياناتك</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>نستخدم المعلومات المقدمة لغرض واحد فقط: إيصال طلبك لشركات تأجير السيارات المعتمدة في المدينة المختارة حتى يتواصلوا معك بعرض السعر. لا نبيع بياناتك لأي طرف ثالث ولا نستخدمها لأغراض تسويقية بدون موافقتك المسبقة.</p>

      <h2 className="section-title" style={{marginBottom:16,marginTop:40}}>حماية البيانات</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>نطبق إجراءات أمنية متقدمة لحماية بياناتك تشمل تشفير الاتصال عبر بروتوكول HTTPS وتخزين البيانات في خوادم آمنة. نلتزم بنظام حماية البيانات الشخصية الصادر عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).</p>

      <h2 className="section-title" style={{marginBottom:16,marginTop:40}}>ملفات تعريف الارتباط (Cookies)</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الموقع وتحسين تجربة الاستخدام. تشمل هذه الملفات تذكر المدينة المختارة وتفضيلات العرض. يمكنك تعطيلها من إعدادات متصفحك لكن ذلك قد يؤثر على بعض وظائف الموقع.</p>

      <h2 className="section-title" style={{marginBottom:16,marginTop:40}}>حقوقك</h2>
      <p style={{fontSize:'.95rem',color:'#4B5563',lineHeight:2,marginBottom:20}}>لك الحق في طلب الاطلاع على بياناتك الشخصية المخزنة لدينا أو تصحيحها أو حذفها في أي وقت. للتواصل معنا بخصوص بياناتك أرسل طلبك إلى: <strong>privacy@cars-renting.com</strong></p>

      <p style={{fontSize:'.85rem',color:'#9CA3AF',marginTop:40,textAlign:'center'}}>آخر تحديث: أبريل 2026</p>
    </div></section>
  </>)
}
