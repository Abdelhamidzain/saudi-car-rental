import { generateFAQSchema, generateLocalBusinessSchema, getCityBySlug, homeFAQs } from '@/lib/data'
import { NoSSR } from '@/components/no-ssr'
import HomepageClientContent from '@/components/homepage-client-content'

// Homepage SSR carries ONLY the JSON-LD + hero scaffold + H1 as visible text.
// All other visible content (hero badge / subtitle / stats / form / sections
// / FAQ / internal links / CTA / disclaimer) is rendered post-hydration via
// HomepageClientContent slots wrapped in <NoSSR> (which uses dynamic with
// ssr: false under the hood). Visual layout is preserved.

export default function HomePage() {
  const riyadh = getCityBySlug('riyadh')!
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':[generateFAQSchema(homeFAQs), generateLocalBusinessSchema(riyadh)]})}}/>

      <section className="hero">
        <div className="hero-grid"/>
        <div className="hero-glow" style={{width:500,height:500,top:-100,right:-100}}/>
        <div className="hero-glow" style={{width:400,height:400,bottom:-50,left:-50}}/>
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <NoSSR><HomepageClientContent slot="hero-pre-h1" /></NoSSR>
              <h1 className="hero-title">تأجير سيارات في السعودية <span>بأسعار تنافسية وخيارات موثوقة</span></h1>
              <NoSSR><HomepageClientContent slot="hero-post-h1" /></NoSSR>
            </div>
            <div id="form"><NoSSR><HomepageClientContent slot="hero-form" /></NoSSR></div>
          </div>
        </div>
      </section>

      <NoSSR><HomepageClientContent slot="body" /></NoSSR>
    </>
  )
}
