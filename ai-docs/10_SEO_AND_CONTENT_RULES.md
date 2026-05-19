# 10 — SEO and Content Rules

## SEO Goal

Build strong organic traffic for car rental searches in Saudi Arabia.

## Main SEO Page Types

- City pages.
- Airport pages.
- Category pages.
- Car model pages.
- Company profile pages.
- Comparison pages.
- Rental guide articles.

## Priority Keywords

Arabic:
- تأجير سيارات الرياض
- تأجير سيارات جدة
- تأجير سيارات الدمام
- تأجير سيارات من المطار
- تأجير سيارات شهري
- تأجير سيارات اقتصادية
- تأجير سيارات عائلية
- تأجير سيارات بدون سائق
- أرخص تأجير سيارات
- أفضل شركات تأجير سيارات

## Page Rules

Every SEO page should have:
- Clear H1.
- Useful intro.
- Real internal links.
- FAQ section.
- Lead form or CTA.
- Schema where appropriate.
- Unique content.
- No fake guarantees.

## Important Copy Rules

Use:
- starts from.
- initial price.
- compare offers.
- submit request.
- company confirms price and availability.

Avoid:
- guaranteed final price.
- confirmed booking.
- pay now.
- book instantly.

## Programmatic SEO Rules

Do not create thousands of thin pages.

Only index pages with:
- Useful content.
- Real offer data or useful comparison.
- Internal links.
- City/category relevance.
- Lead CTA.

## Schema

Use carefully:
- WebSite
- Organization
- LocalBusiness
- AutoRental where appropriate
- FAQPage
- BreadcrumbList
- Product/Offer carefully for rental offers

## NoSSR Rule

Important SEO content should not be hidden behind client-only rendering.

Use SSR/SSG for:
- Headings.
- Content.
- FAQs.
- Internal links.
- Offer cards if possible.

Use client components only for:
- Filters.
- Forms.
- Interactive UI.

## TODO — SEO Content and Weekly Price (Phase 2)

When public pages are migrated from `src/lib/data.ts` to database-driven data,
SEO content generation must read the stored `offers.weekly_price_from` value
instead of recalculating weekly price from daily price.

Background:
- `generateCarSEOContent()` in `src/lib/data.ts` currently derives weekly
  price as `round(dailyPrice × 7 × 0.85)` for body copy on car landing pages.
- The same formula is used by the seed script to populate
  `offers.weekly_price_from` as bootstrap/demo data only.
- The stored DB value is the source of truth. Admins (and later, company
  users) can override it. Daily-price edits do not propagate to weekly.
- Rewriting the SEO generator now would create a divergence between static
  pages (which still read `data.ts`) and the DB. The rewrite must land in
  the same change that switches consumers over to the DB.

Out of scope for the current task. Tracked here so it isn't lost.
