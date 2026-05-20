import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cities, carModels, getCityBySlug, getCategoryBySlug, getCarBySlug, getAirportsForCity, getPartnersForCity, generateFAQSchema, generateBreadcrumbSchema, generateCarSEOContent, SITE_NAME, SITE_URL } from '@/lib/data'
import { NoSSR } from '@/components/no-ssr'
import { SeoPageHero } from '@/components/seo-page-hero'
import CarPageClientContent from '@/components/car-page-client-content'
import { getCarPageOverlayFromDb } from '@/lib/public-data/adapters/car-page'

export function generateStaticParams() {
  const p: { city: string; category: string; car: string }[] = []
  for (const city of cities)
    for (const car of carModels)
      p.push({ city: city.slug, category: car.category, car: car.slug })
  return p
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string; car: string }> }): Promise<Metadata> {
  const { city: cs, category: cats, car: cars } = await params
  const city = getCityBySlug(cs), cat = getCategoryBySlug(cats), car = getCarBySlug(cars)
  if (!city || !cat || !car) return {}
  const overlay = await getCarPageOverlayFromDb(cs, cats, cars)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const carNameAr = overlay?.carNameAr ?? car.nameAr
  const carYear = overlay?.carYear ?? car.year
  const title = `تأجير سيارة ${carNameAr} في ${cityNameAr} — من ${car.dailyPrice} ريال يومياً`
  const desc = `تأجير سيارات ${overlay?.categoryNameAr ?? cat.nameAr} في ${cityNameAr}: احجز ${carNameAr} ${carYear} بأفضل سعر. قارن عروض تأجير السيارات من الشركات المرخصة. أسعار تبدأ من ${car.dailyPrice} ريال يومياً.`
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: `/sa/${city.slug}/${cat.slug}/${car.slug}` },
    openGraph: {
      title: `تأجير سيارة ${carNameAr} ${cityNameAr} — من ${car.dailyPrice} ريال`,
      description: `احجز ${carNameAr} ${carYear} في ${cityNameAr}. قارن عروض تأجير السيارات بأسعار تبدأ من ${car.dailyPrice} ريال يومياً.`,
      url: `${SITE_URL}/sa/${city.slug}/${cat.slug}/${car.slug}`,
      type: 'website',
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `تأجير سيارة ${carNameAr} ${cityNameAr}`,
      description: `${carNameAr} ${carYear} للإيجار من ${car.dailyPrice} ريال يومياً. قارن العروض واحجز الآن.`,
    },
  }
}

export default async function CarPage({ params }: { params: Promise<{ city: string; category: string; car: string }> }) {
  const { city: cs, category: cats, car: cars } = await params
  const city = getCityBySlug(cs), cat = getCategoryBySlug(cats), car = getCarBySlug(cars)
  if (!city || !cat || !car || car.category !== cat.slug) notFound()

  const overlay = await getCarPageOverlayFromDb(cs, cats, cars)
  const cityNameAr = overlay?.cityNameAr ?? city.nameAr
  const categoryNameAr = overlay?.categoryNameAr ?? cat.nameAr
  const carBrand = overlay?.carBrand ?? car.brand
  const carBrandAr = overlay?.carBrandAr ?? car.brandAr
  const carNameAr = overlay?.carNameAr ?? car.nameAr
  const carYear = overlay?.carYear ?? car.year

  const cityAirports = getAirportsForCity(city.slug)
  const partners = getPartnersForCity(city.slug)
  const seo = generateCarSEOContent(car, city, cat)

  const faqs = [
    { q: `كم سعر تأجير سيارة ${carNameAr} في ${cityNameAr}؟`, a: `يبدأ الإيجار اليومي لهذا الموديل في ${cityNameAr} من ${car.dailyPrice} ريال سعودي شاملاً الحماية التأمينية الأساسية. العقد الأسبوعي متوفر بتخفيض خمسة عشر بالمئة ابتداءً من ${seo.weeklyPrice} ريال، بينما الاشتراك الشهري يوفر وفراً أكبر بسعر ${car.monthlyPrice} ريال مع كيلومترات مفتوحة وتغطية شاملة.` },
    { q: `ما مواصفات ${carNameAr} ${carYear} المتوفرة للإيجار؟`, a: `هذا الموديل من إنتاج ${carBrandAr} يتسع لعدد ${car.seats} ركاب مع ناقل حركة ${car.transmissionAr} ومحرك يعمل بوقود ${car.fuelAr}. أبرز التجهيزات المتوفرة: ${car.features.join('، ')}. ${car.description}` },
    { q: `هل إيجار ${carNameAr} يشمل الحماية التأمينية؟`, a: `بالتأكيد، كافة العقود تتضمن تغطية أساسية ضد أضرار الطرف الثالث مع حدود كيلومترية يومية محددة. تتوفر باقات حماية متقدمة تشمل الأضرار الذاتية والسرقة والحوادث الطبيعية مقابل مبلغ إضافي بسيط يُحدد عند توقيع العقد.` },
    { q: `هل تتوفر خدمة التوصيل من المطار؟`, a: cityAirports.length > 0 ? `غالبية المكاتب المعتمدة توفر استقبالاً مباشراً عند بوابات الوصول في ${cityAirports[0].nameAr} (${cityAirports[0].code}) على مدار الساعة. يكفي تحديد رقم الرحلة وموعد الهبوط عند تعبئة النموذج وسيكون المندوب بانتظارك حاملاً لوحة باسمك.` : `أغلب المكاتب المرخصة توفر خدمة الإيصال للموقع المطلوب سواء فندق أو منزل أو مقر عمل. حدد العنوان عند تقديم طلبك وسيتم التنسيق مباشرة.` },
    { q: `ما الوثائق والشروط المطلوبة؟`, a: `يُشترط إبراز رخصة قيادة صالحة (محلية أو دولية) مصحوبة بإثبات هوية رسمي ساري المفعول كالبطاقة الوطنية أو جواز السفر. الحد الأدنى المقبول للعمر واحد وعشرون عاماً للفئات العادية وخمس وعشرون للموديلات الرياضية والفارهة. قد يُطلب إيداع مبلغ ضمان قابل للاسترداد كاملاً عند إنهاء العقد وإرجاع المركبة بحالتها السليمة.` },
    { q: `كم عدد شركات تأجير سيارات المتوفرة في ${cityNameAr}؟`, a: `نجمع ونقارن عروض ${partners.length > 0 ? partners.length : city.partnerCount} مكتب إيجار حاصل على اعتماد هيئة النقل العام${partners.length > 0 ? ` أبرزها ${partners.slice(0, 3).map(p => p.name).join(' و')}` : ''}. نعرض لك خيارات متنوعة تناسب مختلف الميزانيات والاحتياجات لتتخذ قرارك بثقة ووضوح.` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org', '@graph': [
      generateBreadcrumbSchema([
        { name: SITE_NAME, url: '/' },
        { name: `تأجير سيارات ${cityNameAr}`, url: `/sa/${city.slug}` },
        { name: `تأجير ${categoryNameAr} ${cityNameAr}`, url: `/sa/${city.slug}/${cat.slug}` },
        { name: `تأجير ${carNameAr} ${cityNameAr}`, url: `/sa/${city.slug}/${cat.slug}/${car.slug}` },
      ]),
      generateFAQSchema(faqs),
      {
        '@type': 'Product', name: `تأجير ${carNameAr} في ${cityNameAr}`,
        description: seo.uniqueIntro, brand: { '@type': 'Brand', name: carBrand },
        offers: { '@type': 'AggregateOffer', lowPrice: car.dailyPrice, highPrice: car.monthlyPrice, priceCurrency: 'SAR', availability: 'https://schema.org/InStock', offerCount: partners.length || city.partnerCount },
      },
    ],
  }

  const introText = `تأجير سيارة ${carNameAr} في ${cityNameAr} خيار مناسب لمن يبحث عن سيارة ${categoryNameAr} واضحة المواصفات وسهلة الطلب. راجع تفاصيل السيارة، ثم أرسل طلبك ليتم متابعة الخيارات المتاحة حسب المدينة والتوفر.`

  const clientProps = { citySlug: city.slug, catSlug: cat.slug, carSlug: car.slug, cityNameAr, categoryNameAr, carBrandAr, carNameAr, carYear, faqs }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SeoPageHero
        h1={<>تأجير سيارة {carNameAr} في <span>{cityNameAr}</span></>}
        introText={introText}
        extraDecorations={<div className="hero-glow" style={{ width: 300, height: 300, bottom: -50, left: -50 }} />}
        preH1={<CarPageClientContent slot="breadcrumb" {...clientProps}/>}
        postIntro={<CarPageClientContent slot="pills" {...clientProps}/>}
        rightColumn={<CarPageClientContent slot="form" {...clientProps}/>}
      />

      <NoSSR><CarPageClientContent slot="body" {...clientProps}/></NoSSR>
    </>
  )
}
