import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cities, categories, getCityBySlug, getCategoryBySlug, generateFAQSchema, generateBreadcrumbSchema, generateLocalBusinessSchema, SITE_NAME, SITE_URL } from '@/lib/data'
import { NoSSR } from '@/components/no-ssr'
import CategoryPageClientContent from '@/components/category-page-client-content'
import { getCategoryPageOverlayFromDb } from '@/lib/public-data/adapters/category-page'

export function generateStaticParams() { const p:{city:string;category:string}[]=[]; for(const c of cities) for(const cat of categories) p.push({city:c.slug,category:cat.slug}); return p }
export async function generateMetadata({params}:{params:Promise<{city:string;category:string}>}):Promise<Metadata> {
  const {city:citySlug,category:catSlug} = await params
  const city=getCityBySlug(citySlug),cat=getCategoryBySlug(catSlug); if(!city||!cat) return {}
  const overlay = await getCategoryPageOverlayFromDb(citySlug, catSlug)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const categoryNameAr = overlay?.categoryNameAr ?? cat.nameAr
  return {
    title: `تأجير سيارات ${categoryNameAr} في ${cityNameAr} — من ${cat.minPrice} ريال/يوم`,
    description: `تأجير سيارات ${categoryNameAr} في ${cityNameAr} بأفضل سعر. قارن عروض تأجير السيارات من الشركات المرخصة. أسعار تأجير سيارة ${categoryNameAr} تبدأ من ${cat.minPrice} ريال يومياً مع التأمين وخدمة التوصيل.`,
    alternates: { canonical: `/sa/${city.slug}/${cat.slug}` },
    openGraph: {
      title: `تأجير سيارات ${categoryNameAr} في ${cityNameAr} — من ${cat.minPrice} ريال`,
      description: `قارن عروض تأجير السيارات من فئة ${categoryNameAr} في ${cityNameAr}. أسعار تأجير سيارة تبدأ من ${cat.minPrice} ريال يومياً.`,
      url: `${SITE_URL}/sa/${city.slug}/${cat.slug}`,
      type: 'website',
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `تأجير سيارات ${categoryNameAr} ${cityNameAr} — من ${cat.minPrice} ريال`,
      description: `قارن عروض تأجير السيارات ${categoryNameAr} في ${cityNameAr}. أسعار تبدأ من ${cat.minPrice} ريال.`,
    },
  }
}

export default async function CategoryPage({params}:{params:Promise<{city:string;category:string}>}) {
  const {city:citySlug,category:catSlug} = await params
  const city=getCityBySlug(citySlug),cat=getCategoryBySlug(catSlug); if(!city||!cat) notFound()
  const overlay = await getCategoryPageOverlayFromDb(citySlug, catSlug)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const categoryNameAr = overlay?.categoryNameAr ?? cat.nameAr
  const faqs=[{q:`كم سعر تأجير سيارة ${categoryNameAr} في ${cityNameAr}؟`,a:`يبدأ سعر الإيجار اليومي لفئة ${categoryNameAr} في ${cityNameAr} من ${cat.minPrice} ريال. الاستئجار الشهري يوفر خصماً يصل 40% مع تغطية تأمينية شاملة.`},{q:`هل عروض تأجير السيارات تشمل التأمين والكيلومترات؟`,a:`نعم، جميع العروض تشمل التأمين الأساسي ضد الغير. يمكنك ترقيته لتأمين شامل مقابل رسوم إضافية بسيطة عند استلام المركبة.`},{q:`ما المستندات المطلوبة للاستئجار؟`,a:`يلزم رخصة قيادة سارية وهوية وطنية أو جواز سفر ساري المفعول. الحد الأدنى للعمر 21 سنة للفئات العادية و25 للمركبات الفاخرة.`}]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:cityNameAr,url:`/sa/${city.slug}`},{name:categoryNameAr,url:`/sa/${city.slug}/${cat.slug}`}]),generateFAQSchema(faqs),generateLocalBusinessSchema(city)]}

  const introText = `تأجير سيارات ${categoryNameAr} في ${cityNameAr} مناسب لمن يبحث عن سيارة تلائم طبيعة الرحلة، سواء للتنقل اليومي أو السفر أو الزيارات. اختر الفئة المناسبة، وأرسل طلبك ليتم عرض الخيارات المتاحة حسب المدينة والتوفر.`

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero"><div className="hero-grid"/><div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}}/>
      <div className="container"><div className="hero-inner"><div className="hero-text">
        <NoSSR><CategoryPageClientContent slot="breadcrumb" citySlug={city.slug} catSlug={cat.slug} cityNameAr={cityNameAr} categoryNameAr={categoryNameAr} faqs={faqs}/></NoSSR>
        <h1 className="hero-title">تأجير سيارات {categoryNameAr} في <span>{cityNameAr}</span></h1>
        <p className="hero-subtitle">{introText}</p>
        <NoSSR><CategoryPageClientContent slot="pills" citySlug={city.slug} catSlug={cat.slug} cityNameAr={cityNameAr} categoryNameAr={categoryNameAr} faqs={faqs}/></NoSSR>
      </div><div id="form"><NoSSR><CategoryPageClientContent slot="form" citySlug={city.slug} catSlug={cat.slug} cityNameAr={cityNameAr} categoryNameAr={categoryNameAr} faqs={faqs}/></NoSSR></div></div></div>
    </section>

    <NoSSR><CategoryPageClientContent slot="body" citySlug={city.slug} catSlug={cat.slug} cityNameAr={cityNameAr} categoryNameAr={categoryNameAr} faqs={faqs}/></NoSSR>
  </>)
}
