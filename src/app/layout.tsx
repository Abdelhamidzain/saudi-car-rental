import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { cities, categories, airports, SITE_NAME, SITE_URL } from '@/lib/data'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — قارن العروض واحجز بأفضل سعر`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'قارن أسعار تأجير السيارات من أفضل الشركات في الرياض وجدة والدمام. احصل على عروض فورية بدون تأمين مسبق. أسعار تبدأ من 42 ريال يومياً.',
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL, inLanguage: 'ar' },
                { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
              ],
            }),
          }}
        />
      </head>
      <body>
        {/* Skip Link */}
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:right-0 focus:bg-primary focus:text-white focus:p-3 focus:z-50">
          انتقل للمحتوى الرئيسي
        </a>

        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 bg-white/92 backdrop-blur-xl border-b border-border transition-shadow">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-extrabold text-primary">
              {SITE_NAME.split(' ')[0]}<span className="text-accent">{SITE_NAME.split(' ')[1]}</span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-mid">
              {/* Cities Dropdown */}
              <div className="relative group">
                <span className="cursor-pointer hover:text-primary">المدن</span>
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-border p-4 min-w-48 grid gap-1">
                    {cities.map(c => (
                      <Link key={c.slug} href={`/sa/${c.slug}`} className="px-3 py-2 rounded-lg hover:bg-bg text-sm font-medium">
                        {c.nameAr}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories Dropdown */}
              <div className="relative group">
                <span className="cursor-pointer hover:text-primary">الفئات</span>
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-border p-4 min-w-48 grid gap-1">
                    {categories.map(c => (
                      <Link key={c.slug} href={`/sa/riyadh/${c.slug}`} className="px-3 py-2 rounded-lg hover:bg-bg text-sm font-medium">
                        {c.icon} {c.nameAr}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="#faq" className="hover:text-primary">الأسئلة</Link>
            </nav>

            {/* CTA */}
            <Link href="#form" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-light transition-colors">
              احصل على عرض
            </Link>
          </div>
        </header>

        {/* Main */}
        <main id="main">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-primary-dark text-white/60 pt-12 pb-6 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <p className="text-white text-lg font-extrabold mb-4">
                {SITE_NAME.split(' ')[0]}<span className="text-accent">{SITE_NAME.split(' ')[1]}</span>
              </p>
              <p className="text-sm leading-relaxed max-w-xs">
                أول منصة مقارنة لإيجار المركبات بالمملكة العربية السعودية.
              </p>
            </div>

            {/* Cities */}
            <div>
              <p className="text-white font-bold mb-4">المدن</p>
              <div className="grid gap-1 text-sm">
                {cities.map(c => (
                  <Link key={c.slug} href={`/sa/${c.slug}`} className="hover:text-accent transition-colors">
                    {c.nameAr}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-white font-bold mb-4">خدمات</p>
              <div className="grid gap-1 text-sm">
                <Link href="/monthly" className="hover:text-accent">شهري</Link>
                <Link href="/weekly" className="hover:text-accent">أسبوعي</Link>
                <Link href="/airport" className="hover:text-accent">المطار</Link>
                <Link href="/no-deposit" className="hover:text-accent">بدون تأمين</Link>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-white font-bold mb-4">روابط</p>
              <div className="grid gap-1 text-sm">
                <Link href="/about" className="hover:text-accent">من نحن</Link>
                <Link href="/partners" className="hover:text-accent">للشركاء</Link>
                <Link href="/privacy" className="hover:text-accent">سياسة الخصوصية</Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-xs">
            © {new Date().getFullYear()} {SITE_NAME}
          </div>
        </footer>

        {/* Mobile CTA */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-border p-3">
          <Link href="#form" className="block w-full text-center bg-accent text-primary-dark py-3.5 rounded-xl font-extrabold text-base">
            احصل على عرض تأجير
          </Link>
        </div>
      </body>
    </html>
  )
}
