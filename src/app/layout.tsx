import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { cities, categories, SITE_NAME, SITE_URL } from '@/lib/data'

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
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:right-0 focus:bg-primary focus:text-white focus:p-3 focus:z-50">
          انتقل للمحتوى الرئيسي
        </a>

        {/* ===== HEADER ===== */}
        <header className="fixed top-0 inset-x-0 z-50 h-16" style={{ background: 'rgba(13,27,42,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
            <Link href="/" className="font-display text-xl font-black text-white flex items-center gap-2">
              {SITE_NAME}
              <span className="w-2 h-2 rounded-full bg-accent" />
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <div className="relative group">
                <span className="cursor-pointer text-white/70 hover:text-accent transition-colors">المدن</span>
                <div className="absolute top-full right-0 pt-3 hidden group-hover:block z-50">
                  <div className="rounded-2xl shadow-2xl p-4 min-w-52 grid gap-1" style={{ background: 'rgba(27,58,92,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {cities.map(c => (
                      <Link key={c.slug} href={`/sa/${c.slug}`} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-accent hover:bg-white/10 transition-colors">
                        {c.nameAr}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <span className="cursor-pointer text-white/70 hover:text-accent transition-colors">الفئات</span>
                <div className="absolute top-full right-0 pt-3 hidden group-hover:block z-50">
                  <div className="rounded-2xl shadow-2xl p-4 min-w-52 grid gap-1" style={{ background: 'rgba(27,58,92,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {categories.map(c => (
                      <Link key={c.slug} href={`/sa/riyadh/${c.slug}`} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-accent hover:bg-white/10 transition-colors">
                        {c.icon} {c.nameAr}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="#faq" className="text-white/70 hover:text-accent transition-colors">الأسئلة</Link>

              <Link href="#form" className="bg-accent text-primary px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                احصل على عرض
              </Link>
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        {/* ===== FOOTER ===== */}
        <footer className="bg-primary text-white/50 pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="font-display text-white text-lg font-black mb-4 flex items-center gap-2">
                {SITE_NAME}
                <span className="w-2 h-2 rounded-full bg-accent" />
              </p>
              <p className="text-sm leading-relaxed max-w-xs">
                منصة مقارنة لإيجار المركبات بالمملكة العربية السعودية. نجمع لك أفضل العروض من الشركات المرخصة.
              </p>
            </div>
            <div>
              <p className="font-display text-white font-bold mb-4 text-sm">المدن</p>
              <div className="grid gap-2 text-sm">
                {cities.map(c => (
                  <Link key={c.slug} href={`/sa/${c.slug}`} className="hover:text-accent transition-colors">{c.nameAr}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-display text-white font-bold mb-4 text-sm">خدمات</p>
              <div className="grid gap-2 text-sm">
                <span>شهري</span>
                <span>أسبوعي</span>
                <span>المطار</span>
                <span>بدون تأمين</span>
              </div>
            </div>
            <div>
              <p className="font-display text-white font-bold mb-4 text-sm">روابط</p>
              <div className="grid gap-2 text-sm">
                <span>من نحن</span>
                <span>للشركاء</span>
                <span>سياسة الخصوصية</span>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <span>© {new Date().getFullYear()} {SITE_NAME}. جميع الحقوق محفوظة</span>
            <span>صُنع بـ ❤️ في السعودية</span>
          </div>
        </footer>

        {/* Mobile CTA */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3" style={{ background: 'rgba(13,27,42,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="#form" className="block w-full text-center bg-accent text-primary py-3.5 rounded-2xl font-display font-black text-base">
            احصل على عرض تأجير
          </Link>
        </div>
      </body>
    </html>
  )
}
