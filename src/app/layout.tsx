import type { Metadata } from 'next'
import { Tajawal, Cairo } from 'next/font/google'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/data'
import { CityProvider } from '@/components/city-context'
import { ClientHeader } from '@/components/client-header'
import { ClientFooter } from '@/components/client-footer'

const tajawal = Tajawal({ subsets:['arabic'], weight:['400','700','800','900'], display:'swap', variable:'--font-tajawal', preload:true })
const cairo = Cairo({ subsets:['arabic'], weight:['700','800','900'], display:'optional', variable:'--font-cairo', preload:true })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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

const criticalCSS = `*{margin:0;padding:0;box-sizing:border-box}body{background:#FAFAF7;color:#1A1A2E;font-family:var(--font-tajawal),'Tajawal',Arial,sans-serif;overflow-x:hidden}.site-header{position:fixed;top:0;left:0;right:0;z-index:50;height:64px;background:rgba(13,27,42,.95);border-bottom:1px solid rgba(255,255,255,.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}.site-header .container{display:flex;align-items:center;justify-content:space-between;height:100%;max-width:1200px;margin:0 auto;padding:0 24px}.site-logo{font-family:var(--font-cairo),'Cairo',sans-serif;font-size:1.25rem;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;text-decoration:none}.site-logo .dot{width:8px;height:8px;border-radius:50%;background:#D4A853}.header-right{display:flex;align-items:center;gap:16px}.hero{padding:120px 0 80px;background:linear-gradient(135deg,#0D1B2A,#1B3A5C 40%,#0D1B2A);position:relative;overflow:hidden}.container{max-width:1200px;margin:0 auto;padding:0 24px}.hero-inner{display:grid;grid-template-columns:1fr;gap:48px;align-items:center;position:relative;z-index:10}@media(min-width:1024px){.hero-inner{grid-template-columns:1fr 420px;gap:64px}}.hero-text{text-align:center}@media(min-width:1024px){.hero-text{text-align:right}}.hero-title{font-family:var(--font-cairo),'Cairo',sans-serif;font-size:2.5rem;font-weight:900;color:#fff;line-height:1.25;margin-bottom:20px}.hero-title span{color:#D4A853}@media(min-width:768px){.hero-title{font-size:3rem}}.glass-form{background:rgba(255,255,255,.06);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:32px;position:relative;overflow:hidden;min-height:480px}.nav-links{display:flex;align-items:center;gap:32px;font-size:.875rem;font-weight:500}.nav-link{color:rgba(255,255,255,.75);text-decoration:none}.nav-cta{background:#D4A853;color:#0D1B2A;padding:10px 24px;border-radius:50px;font-weight:700;text-decoration:none}@media(max-width:767px){.hide-mobile{display:none!important}}.city-selector-btn{display:flex;align-items:center;gap:8px;padding:7px 16px;border-radius:10px;font-size:.85rem;font-weight:600;color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);cursor:pointer;margin-right:16px}.city-selector-btn svg{color:#D4A853}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context':'https://schema.org','@graph':[
            {'@type':'WebSite',name:SITE_NAME,url:SITE_URL,inLanguage:'ar'},
            {'@type':'Organization',name:SITE_NAME,url:SITE_URL}
          ]
        })}} />
      </head>
      <body>
        <CityProvider>
          <ClientHeader/>
          <main id="main">{children}</main>
          <ClientFooter/>
        </CityProvider>
      </body>
    </html>
  )
}
