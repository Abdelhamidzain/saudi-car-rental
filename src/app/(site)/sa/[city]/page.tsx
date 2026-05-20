import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cities, getCityBySlug, getAirportsForCity, getPartnersForCity, generateFAQSchema, generateBreadcrumbSchema, generateLocalBusinessSchema, SITE_NAME, SITE_URL } from '@/lib/data'
import { NoSSR } from '@/components/no-ssr'
import { SeoPageHero } from '@/components/seo-page-hero'
import CityPageClientContent from '@/components/city-page-client-content'
import { getCityPageOverlayFromDb } from '@/lib/public-data/adapters/city-page'

export function generateStaticParams() { return cities.map(c=>({city:c.slug})) }
export async function generateMetadata({params}:{params:Promise<{city:string}>}):Promise<Metadata> {
  const slug = (await params).city
  const city=getCityBySlug(slug); if(!city) return {}
  const overlay = await getCityPageOverlayFromDb(slug)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const cityMinPrice = overlay?.cityMinPrice ?? city.minPrice
  return {
    title: `تأجير سيارات في ${cityNameAr} — أسعار من ${cityMinPrice} ريال/يوم`,
    description: `تأجير سيارات في ${cityNameAr} من ${city.partnerCount} شركة معتمدة. قارن عروض تأجير السيارات واحصل على أفضل سعر تأجير سيارة يبدأ من ${cityMinPrice} ريال يومياً مع التأمين وخدمة التوصيل للمطار.`,
    alternates: { canonical: `/sa/${city.slug}` },
    openGraph: {
      title: `تأجير سيارات في ${cityNameAr} — من ${cityMinPrice} ريال`,
      description: `قارن عروض تأجير السيارات في ${cityNameAr} من ${city.partnerCount} شركة. أسعار تأجير سيارة تبدأ من ${cityMinPrice} ريال يومياً.`,
      url: `${SITE_URL}/sa/${city.slug}`,
      type: 'website',
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `تأجير سيارات في ${cityNameAr} — من ${cityMinPrice} ريال`,
      description: `قارن عروض تأجير السيارات في ${cityNameAr}. أسعار تبدأ من ${cityMinPrice} ريال يومياً.`,
    },
  }
}

export default async function CityPage({params}:{params:Promise<{city:string}>}) {
  const slug = (await params).city
  const city=getCityBySlug(slug); if(!city) notFound()
  const overlay = await getCityPageOverlayFromDb(slug)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const cityMinPrice = overlay?.cityMinPrice ?? city.minPrice
  const ap=getAirportsForCity(city.slug)
  const partners=getPartnersForCity(city.slug)
  const faqs=[
    {q:`كم يكلف تأجير سيارات في ${cityNameAr}؟`,a:`تبدأ الأسعار في ${cityNameAr} من ${cityMinPrice} ريال يومياً للمركبات الاقتصادية. السيدان المتوسطة تبدأ من 135 ريال بينما الفئة الفاخرة تبدأ من 359 ريال يومياً مع التأمين الأساسي.`},
    {q:`ما أفضل شركات تأجير السيارات في ${cityNameAr}؟`,a:`نعرض عروض ${partners.length} شركة معتمدة في ${cityNameAr} منها ${partners.slice(0,2).map(p=>p.name).join(' و')}. جميعها حاصلة على ترخيص هيئة النقل العام بالمملكة العربية السعودية.`},
    {q:`هل يوجد خدمة توصيل واستلام من المطار؟`,a:ap.length>0?`نعم، غالبية الشركات المعتمدة توفر خدمة التوصيل والاستلام من ${ap[0].nameAr} مباشرة عند وصول العميل دون أي تكلفة إضافية.`:`نعم، معظم المكاتب المرخصة في ${cityNameAr} توفر خدمة التوصيل للموقع المطلوب.`},
    {q:`هل تأجير سيارة يشمل التأمين والوقود؟`,a:`جميع العروض تشمل تغطية تأمينية أساسية ضد الغير. الوقود عادة على حساب المستأجر ويتم تسليم المركبة بخزان ممتلئ وإرجاعها بنفس المستوى.`},
    {q:`ما الوثائق والشروط المطلوبة للاستئجار؟`,a:`يلزم رخصة قيادة سارية وهوية وطنية أو جواز سفر ساري المفعول والحد الأدنى للعمر واحد وعشرون عاماً. بعض المكاتب تطلب ضماناً مالياً مسترداً عند استلام المركبة الفاخرة.`},
  ]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:cityNameAr,url:`/sa/${city.slug}`}]),generateFAQSchema(faqs),generateLocalBusinessSchema(city)]}

  const introText = `تأجير سيارات في ${cityNameAr} أصبح أسهل مع خيارات تناسب تنقلك اليومي أو رحلتك داخل المملكة. اختر المدينة والفئة المناسبة، وأرسل طلبك ليتم ترشيح الخيارات المتاحة حسب احتياجك والتوفر.`

  const clientProps = { citySlug: city.slug, cityNameAr, cityMinPrice, faqs }

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>

    <SeoPageHero
      h1={<>تأجير سيارات في <span>{cityNameAr}</span></>}
      introText={introText}
      preH1={<CityPageClientContent slot="breadcrumb" {...clientProps}/>}
      postIntro={<CityPageClientContent slot="pills" {...clientProps}/>}
      rightColumn={<CityPageClientContent slot="form" {...clientProps}/>}
    />

    <NoSSR><CityPageClientContent slot="body" {...clientProps}/></NoSSR>
  </>)
}
