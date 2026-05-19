import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL, getCityBySlug, generateLocalBusinessSchema } from '@/lib/data'
import { CityProvider } from '@/components/city-context'
import { ClientHeader } from '@/components/client-header'
import { ClientFooter } from '@/components/client-footer'

export const metadata: Metadata = {
  title: { default:`تأجير سيارات في السعودية — قارن واحجز بأفضل سعر | ${SITE_NAME}`, template:`%s | ${SITE_NAME}` },
  description: 'تأجير سيارات في الرياض وجدة والدمام من أكثر من 50 مكتب معتمد. قارن عروض تأجير السيارات واحجز تأجير سيارة بأسعار تبدأ من 42 ريال يومياً مع التأمين والتوصيل للمطار.',
  alternates: { canonical: '/' },
  openGraph: {
    title: `تأجير سيارات في السعودية — قارن واحجز بأفضل سعر`,
    description: 'قارن عروض تأجير السيارات من 50+ شركة مرخصة في الرياض وجدة والدمام. أسعار تبدأ من 42 ريال يومياً مع التأمين.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `تأجير سيارات في السعودية | ${SITE_NAME}`,
    description: 'قارن عروض تأجير السيارات من 50+ شركة مرخصة. أسعار تبدأ من 42 ريال يومياً.',
  },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CityProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org','@graph':[
          {'@type':'WebSite',name:SITE_NAME,url:SITE_URL,inLanguage:'ar'},
          {'@type':'Organization',name:SITE_NAME,url:SITE_URL},
          generateLocalBusinessSchema(getCityBySlug('riyadh')!),
        ]
      })}} />
      <ClientHeader/>
      <main id="main">{children}</main>
      <ClientFooter/>
    </CityProvider>
  )
}
