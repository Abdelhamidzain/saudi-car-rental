import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { airports, getCityBySlug, getAirportBySlug, generateFAQSchema, generateBreadcrumbSchema, generateLocalBusinessSchema, SITE_NAME, SITE_URL } from '@/lib/data'
import { NoSSR } from '@/components/no-ssr'
import AirportPageClientContent from '@/components/airport-page-client-content'
import { getAirportPageOverlayFromDb } from '@/lib/public-data/adapters/airport-page'

export function generateStaticParams() { return airports.map(a=>({airport:a.slug})) }
export async function generateMetadata({params}:{params:Promise<{airport:string}>}):Promise<Metadata> {
  const slug=(await params).airport
  const ap=getAirportBySlug(slug); if(!ap) return {}
  const city=getCityBySlug(ap.citySlug)
  const overlay=await getAirportPageOverlayFromDb(slug)
  const airportNameAr=overlay?.airportNameAr ?? ap.nameAr
  const airportCode=overlay?.airportCode ?? ap.code
  const cityNameAr=overlay?.cityNameAr ?? city?.nameAr
  const cityMinPrice=overlay?.cityMinPrice ?? city?.minPrice
  return {
    title: { absolute: `تأجير سيارات من ${airportNameAr} (${airportCode}) — من ${cityMinPrice} ريال` },
    description: `تأجير سيارة من ${airportNameAr} بأفضل سعر. قارن عروض تأجير السيارات من الشركات المرخصة في ${cityNameAr}. أسعار تبدأ من ${cityMinPrice} ريال يومياً مع استلام فوري.`,
    alternates: { canonical: `/sa/airports/${ap.slug}` },
    openGraph: {
      title: `تأجير سيارات من ${airportNameAr} (${airportCode})`,
      description: `قارن عروض تأجير السيارات من ${airportNameAr}. أسعار تأجير سيارة تبدأ من ${cityMinPrice} ريال يومياً مع استلام فوري.`,
      url: `${SITE_URL}/sa/airports/${ap.slug}`,
      type: 'website',
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `تأجير سيارات ${airportCode} — من ${cityMinPrice} ريال`,
      description: `احجز سيارتك من ${airportNameAr}. استلام فوري وأسعار تبدأ من ${cityMinPrice} ريال يومياً.`,
    },
  }
}

export default async function AirportPage({params}:{params:Promise<{airport:string}>}) {
  const slug=(await params).airport
  const ap=getAirportBySlug(slug); if(!ap) notFound()
  const city=getCityBySlug(ap.citySlug); if(!city) notFound()
  const overlay=await getAirportPageOverlayFromDb(slug)
  const airportNameAr=overlay?.airportNameAr ?? ap.nameAr
  const airportCode=overlay?.airportCode ?? ap.code
  const cityNameAr=overlay?.cityNameAr ?? city.nameAr
  const cityMinPrice=overlay?.cityMinPrice ?? city.minPrice
  const faqs=[
    {q:`كم سعر تأجير سيارات من ${airportNameAr}؟`,a:`تبدأ الأسعار من ${cityMinPrice} ريال سعودي يومياً للمركبات الاقتصادية الموفرة للوقود. العقد الأسبوعي متوفر بتخفيض خمسة عشر بالمئة بينما الاشتراك الشهري يمنحك وفراً يصل أربعين بالمئة مع تغطية تأمينية شاملة وكيلومترات مفتوحة. تتفاوت التسعيرة حسب الفئة والموسم ومدة العقد.`},
    {q:`هل توجد مكاتب إيجار معتمدة داخل صالات الوصول؟`,a:`بالتأكيد، تنتشر عدة نقاط خدمة مرخصة ضمن صالات القدوم حيث يمكنك إنهاء إجراءات الاستلام وتوقيع العقد واستلام المفاتيح خلال دقائق قليلة فور اجتياز بوابة الجمارك والجوازات.`},
    {q:`كيف أحجز تأجير سيارة عبر المنصة؟`,a:`العملية بسيطة وسريعة: عبّئ النموذج أعلاه بتحديد موعد الوصول ونوع الفئة المرغوبة ورقم الجوال للتواصل. خلال دقائق معدودة سيتصل بك مندوب أحد شركائنا المعتمدين لتأكيد الحجز وتقديم أنسب العروض المتاحة.`},
    {q:`هل يمكن تسليم المركبة في موقع مختلف؟`,a:`عدد من الشركاء المعتمدين يوفرون مرونة كاملة في نقاط التسليم سواء داخل نفس المدينة أو في مدينة مغايرة. يُرجى تحديد ذلك مسبقاً عند تعبئة الطلب حيث قد تُفرض رسوم رمزية إضافية حسب المسافة وسياسة المؤجر.`},
    {q:`ما الوثائق والشروط اللازمة للاستئجار؟`,a:`يُشترط إبراز رخصة قيادة صالحة سواء محلية أو دولية مصحوبة بإثبات هوية رسمي كالبطاقة الوطنية أو جواز السفر الساري. يجب ألا يقل عمر المستأجر عن واحد وعشرين عاماً مع إمكانية طلب إيداع ضمان مالي قابل للاسترداد الكامل عند إتمام العقد.`},
  ]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:`تأجير سيارات ${cityNameAr}`,url:`/sa/${city.slug}`},{name:`تأجير سيارات ${airportCode}`,url:`/sa/airports/${ap.slug}`}]),generateFAQSchema(faqs),generateLocalBusinessSchema(city)]}

  const introText = `تأجير سيارات من ${airportNameAr} يساعدك على ترتيب تنقلك بعد الوصول بسهولة، سواء كانت رحلتك للعمل أو السياحة أو زيارة عائلية. اختر المدينة والفئة المناسبة، وأرسل طلبك ليتم متابعة الخيارات المتاحة حسب التوفر.`

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero"><div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner"><div className="hero-text">
        <NoSSR><AirportPageClientContent slot="breadcrumb" airportSlug={ap.slug} citySlug={city.slug} airportNameAr={airportNameAr} airportCode={airportCode} cityNameAr={cityNameAr} cityMinPrice={cityMinPrice} faqs={faqs}/></NoSSR>
        <h1 className="hero-title">تأجير سيارات من <span>{airportNameAr}</span></h1>
        <p className="hero-subtitle">{introText}</p>
        <NoSSR><AirportPageClientContent slot="pills" airportSlug={ap.slug} citySlug={city.slug} airportNameAr={airportNameAr} airportCode={airportCode} cityNameAr={cityNameAr} cityMinPrice={cityMinPrice} faqs={faqs}/></NoSSR>
      </div><div id="form"><NoSSR><AirportPageClientContent slot="form" airportSlug={ap.slug} citySlug={city.slug} airportNameAr={airportNameAr} airportCode={airportCode} cityNameAr={cityNameAr} cityMinPrice={cityMinPrice} faqs={faqs}/></NoSSR></div></div></div>
    </section>

    <NoSSR><AirportPageClientContent slot="body" airportSlug={ap.slug} citySlug={city.slug} airportNameAr={airportNameAr} airportCode={airportCode} cityNameAr={cityNameAr} cityMinPrice={cityMinPrice} faqs={faqs}/></NoSSR>
  </>)
}
