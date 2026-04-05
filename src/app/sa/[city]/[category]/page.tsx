import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cities, categories, getCityBySlug, getCategoryBySlug, generateFAQSchema, generateBreadcrumbSchema, SITE_NAME } from '@/lib/data'
import { LeadForm } from '@/components/lead-form'

export function generateStaticParams() {
  const p:{city:string;category:string}[]=[]
  for(const c of cities) for(const cat of categories) p.push({city:c.slug,category:cat.slug})
  return p
}

export async function generateMetadata({params}:{params:Promise<{city:string;category:string}>}):Promise<Metadata> {
  const city=getCityBySlug((await params).city), cat=getCategoryBySlug((await params).category)
  if(!city||!cat) return {}
  return { title:`تأجير سيارات ${cat.nameAr} في ${city.nameAr} — من ${cat.minPrice} ريال/يوم`, description:`قارن عروض إيجار سيارات ${cat.nameAr} في ${city.nameAr}. أسعار تبدأ من ${cat.minPrice} ريال يومياً.`, alternates:{canonical:`/sa/${city.slug}/${cat.slug}`} }
}

const catDescs:Record<string,(c:string)=>string>={
  economy:c=>`وفّر ميزانيتك مع أفضل عروض تأجير سيارات اقتصادية في ${c}. هيونداي اكسنت وتويوتا يارس — مثالية للتنقل اليومي.`,
  sedan:c=>`استمتع بالراحة مع سيارات سيدان في ${c}. تويوتا كامري وهيونداي سوناتا — مناسبة للعائلات ورجال الأعمال.`,
  suv:c=>`استكشف ${c} مع دفع رباعي. فورتشنر وباترول — مصممة للطرق الوعرة والرحلات البرية.`,
  luxury:c=>`اترك انطباعاً مع سيارات فاخرة في ${c}. مرسيدس ولكزس — تجربة قيادة استثنائية.`,
  '7-seater':c=>`سافر مع عائلتك بأريحية. سيارات 7 مقاعد في ${c} — مساحة لكل الأسرة.`,
  pickup:c=>`حلول نقل قوية مع بيك أب في ${c}. هايلكس ونافارا — للمشاريع والرحلات.`,
  van:c=>`نقل جماعي مريح مع فان في ${c}. هاي إيس — الحل للمجموعات السياحية.`,
}

export default async function CategoryPage({params}:{params:Promise<{city:string;category:string}>}) {
  const city=getCityBySlug((await params).city), cat=getCategoryBySlug((await params).category)
  if(!city||!cat) notFound()
  const desc=(catDescs[cat.slug]||((c:string)=>`تأجير سيارات ${cat.nameAr} في ${c} بأفضل الأسعار.`))(city.nameAr)
  const otherCats=categories.filter(c=>c.slug!==cat.slug), otherCities=cities.filter(c=>c.slug!==city.slug).slice(0,4)
  const catFAQs=[
    {q:`كم سعر تأجير ${cat.nameAr} في ${city.nameAr}؟`,a:`يبدأ سعر إيجار ${cat.nameAr} في ${city.nameAr} من ${cat.minPrice} ريال يومياً.`},
    {q:`هل تتوفر ${cat.nameAr} للإيجار الشهري؟`,a:`نعم، أغلب مكاتب التأجير توفر عقود شهرية مخفّضة بنسبة 30-40%.`},
    {q:`ما المستندات المطلوبة؟`,a:`رخصة قيادة سارية، هوية أو جواز سفر، وبطاقة ائتمان أو تأمين نقدي.`},
  ]
  const jsonLd={'@context':'https://schema.org','@graph':[generateBreadcrumbSchema([{name:SITE_NAME,url:'/'},{name:city.nameAr,url:`/sa/${city.slug}`},{name:cat.nameAr,url:`/sa/${city.slug}/${cat.slug}`}]),generateFAQSchema(catFAQs)]}

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
      <section className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#0D1B2A 0%,#1B3A5C 40%,#0D1B2A 100%)',padding:'120px 0 80px'}}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-glow" style={{width:400,height:400,top:-100,right:-100}} />
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:10}}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <nav className="text-sm mb-5" style={{color:'rgba(255,255,255,0.4)'}} aria-label="التنقل">
                <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
                <span className="mx-2" style={{color:'rgba(255,255,255,0.2)'}}>/</span>
                <Link href={`/sa/${city.slug}`} className="hover:text-accent transition-colors">{city.nameAr}</Link>
                <span className="mx-2" style={{color:'rgba(255,255,255,0.2)'}}>/</span>
                <span style={{color:'rgba(255,255,255,0.8)'}}>{cat.nameAr}</span>
              </nav>
              <h1 className="font-display text-3xl md:text-5xl font-black text-white leading-tight mb-5">تأجير سيارات {cat.nameAr} في <span className="text-accent">{city.nameAr}</span></h1>
              <p className="text-lg leading-relaxed mb-8" style={{color:'rgba(255,255,255,0.6)',maxWidth:520}}>{desc}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm">
                <span className="rounded-full font-bold" style={{background:'rgba(212,168,83,0.15)',border:'1px solid rgba(212,168,83,0.3)',color:'#D4A853',padding:'10px 20px'}}>من {cat.minPrice} ر.س/يوم</span>
                <span className="rounded-full" style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',padding:'10px 20px'}}>{cat.icon} {cat.nameAr}</span>
              </div>
            </div>
            <div id="form"><LeadForm /></div>
          </div>
        </div>
      </section>

      <section style={{padding:'80px 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}>
          <div className="text-center" style={{marginBottom:48}}>
            <div className="section-tag" style={{marginBottom:16}}>🚗 فئات أخرى</div>
            <h2 className="font-display text-2xl font-black">فئات أخرى في {city.nameAr}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{gap:16}}>
            {otherCats.map(c=>(
              <Link key={c.slug} href={`/sa/${city.slug}/${c.slug}`} className="bg-white border border-border rounded-2xl text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{padding:20}}>
                <span className="text-3xl">{c.icon}</span>
                <p className="font-display text-sm font-bold mt-2">{c.nameAr}</p>
                <p className="text-xs text-text-mid">من {c.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" style={{padding:'64px 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}>
          <h2 className="font-display text-xl font-black text-center" style={{marginBottom:32}}>تأجير {cat.nameAr} في مدن أخرى</h2>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{gap:16}}>
            {otherCities.map(c=>(
              <Link key={c.slug} href={`/sa/${c.slug}/${cat.slug}`} className="bg-bg border border-border rounded-2xl text-center hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all" style={{padding:20}}>
                <p className="font-display font-bold">{c.nameAr}</p>
                <p className="text-xs text-text-mid mt-1">من {cat.minPrice} ر.س</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{padding:'80px 0'}}>
        <div style={{maxWidth:800,margin:'0 auto',padding:'0 24px'}}>
          <div className="text-center" style={{marginBottom:48}}>
            <div className="section-tag" style={{marginBottom:16}}>❓ أسئلة شائعة</div>
            <h2 className="font-display text-xl font-black">أسئلة عن تأجير {cat.nameAr} في {city.nameAr}</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {catFAQs.map((faq,i)=>(
              <details key={i} className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-sm list-none" style={{padding:20}}>{faq.q}
                  <svg className="w-5 h-5 text-accent shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <p className="text-sm text-text-mid leading-relaxed" style={{padding:'0 20px 20px'}}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
