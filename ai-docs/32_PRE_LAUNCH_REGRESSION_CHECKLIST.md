# 32 — Pre-Launch Regression Checklist

> **Purpose.** A reusable, end-to-end regression sweep to run before every public deploy. Covers SEO, sitemap, structured data, metadata, privacy, and the DB-overlay fallback path that landed in Tasks 6.2A–D and was cleaned up by 6.2X.
> Most checks are automated by [scripts/seo-regression.ts](../scripts/seo-regression.ts). Items that genuinely need a human (visual review, Lighthouse, schema.org validator) are listed under §3.

---

## 1. Running the automated sweep

### Default (read-only)

```bash
npm run seo:check
```

The default invocation is **read-only**. It does not mutate the database. It will:

1. Detect (or build + spawn) a prod server on `PORT=3299` (override with `SEO_CHECK_PORT`).
2. Curl 13 representative routes (homepage, 3 trust pages, 3 cities, 2 categories, 2 car-detail, 2 airports) plus `/sitemap.xml`.
3. Run ~80 assertions across:
   - Prerendered-route count from `.next/prerender-manifest.json` (must be **236**; the build log says `237/237` workers but the authoritative manifest-route count is 236 — the worker tally counts a few non-route generation tasks).
   - Sitemap entry count (must be **231**), no duplicates, all absolute URLs.
   - `<title>` / OG / Twitter / canonical metadata on every probed route.
   - Arabic title patterns:
     - City: `تأجير سيارات في [city] — ...`
     - Category: `تأجير سيارات [category] في [city] — ...`
     - Car detail: `تأجير سيارة [brand model] في [city] — من X ريال يومياً`
     - **Negative invariant:** no title contains `تأجير سيارات ب` (Task 6.2B follow-up `9090d39`).
   - JSON-LD per route:
     - Exactly 1 `WebSite` + 1 `Organization` on every public route (Task 6.2X invariant).
     - Exactly 1 `LocalBusiness` (AutoRental) on home, city, category, airport pages.
     - 0 `LocalBusiness` on `/about`, `/contact`, `/privacy`, and car-detail.
     - No `الرياض` in any `LocalBusiness.name` on non-Riyadh routes (no layout leak).
     - Exactly 1 `Product` block on car-detail pages, with `lowPrice` / `highPrice` matching `data.ts` static prices (Task 6.2D pricing deferral invariant).
     - 1 `BreadcrumbList` + 1 `FAQPage` where expected.
   - Public privacy:
     - No `whatsapp_number`, `internal_notes`, `trust_level`, `approval_status`, `assigned_company_id`, `consent_ip`, `customer_phone`, `customer_email`, `lead_activity_logs`, `auth.users` literals appear in rendered HTML.

Exits **0** on all-PASS, **non-zero** on any failure (prints a failure list with details).

### Optional `--fallback` pass (writes to DB)

```bash
npm run seo:check -- --fallback
```

This pass simulates DB outage scenarios by:

1. Flipping `cities.public_status='draft'` on Jeddah → curl `/sa/jeddah` → assert static fallback rendered → restore to `'published'`.
2. Flipping `car_categories.status='archived'` on Luxury → curl `/sa/jeddah/luxury` → assert fallback → restore.
3. Flipping `cars.status='archived'` on Mercedes E-Class → curl `/sa/jeddah/luxury/mercedes-e-class` → assert fallback → restore.

Each mutation is wrapped in `try/finally`. Before each mutation, the rollback SQL is printed to **stderr** so the operator can copy-paste it into the Supabase SQL Editor if the script is killed mid-run.

**Do not run `--fallback` casually.** Reserve it for pre-launch sweeps where the time cost (a few seconds of partial DB drift) is acceptable.

---

## 2. What the automated sweep covers

| Category | Asserted in script? |
|---|---|
| Prerendered route count (236 in manifest; 237 in worker log) | ✅ |
| Sitemap entry count (231) | ✅ |
| Sitemap URL uniqueness | ✅ |
| Sitemap URLs absolute + no query/fragment | ✅ |
| `<title>` exact match per route | ✅ |
| OG / Twitter / canonical present | ✅ |
| Arabic title pattern (`في` not `بـ`) | ✅ |
| WebSite + Organization on every route | ✅ |
| LocalBusiness count per route | ✅ |
| No Riyadh leak on non-Riyadh routes | ✅ |
| Product schema on car-detail | ✅ |
| Product prices match `data.ts` static | ✅ |
| Breadcrumb + FAQPage presence | ✅ |
| No admin-field literals in HTML | ✅ |
| No `whatsapp_number` exposure | ✅ |
| DB-overlay fallback path | ✅ (via `--fallback`) |

---

## 3. Manual checks before launch

The script can't easily cover the items below. Run them once per launch.

### 3.1 Lighthouse (mobile + desktop)

```bash
# Spawn a prod server (or reuse one):
PORT=3000 npm run start

# Then in Chrome DevTools → Lighthouse, run for these URLs:
#   /
#   /sa/riyadh
#   /sa/riyadh/economy
#   /sa/riyadh/economy/hyundai-accent
#   /sa/airports/king-khalid
```

- **Performance**: target ≥85 mobile, ≥95 desktop.
- **Accessibility**: target 100; if not 100, review whichever items dropped.
- **SEO**: target 100.
- **Best Practices**: target ≥95.

### 3.2 Schema.org / Google Rich Results validator

Validate the JSON-LD on one URL per route type at:

- https://validator.schema.org
- https://search.google.com/test/rich-results

Confirm no errors / warnings on:
- `/` (LocalBusiness + FAQ)
- `/sa/riyadh` (LocalBusiness + Breadcrumb + FAQ)
- `/sa/riyadh/economy` (LocalBusiness + Breadcrumb + FAQ)
- `/sa/riyadh/economy/hyundai-accent` (Product + Breadcrumb + FAQ)
- `/sa/airports/king-khalid` (LocalBusiness + Breadcrumb + FAQ)

### 3.3 Mobile visual review

Manually inspect one URL per route type on a real mobile device or Chrome DevTools mobile emulation (iPhone 14 + Pixel 7). Look for:

- Arabic text overflow / line-breaks at narrow widths.
- RTL alignment correctness (hero, breadcrumbs, FAQ accordion).
- Touch-target sizes on lead-form inputs (min 44px).
- Sticky header behaviour on scroll.
- Lead form submission flow end-to-end (test phone normalization).

### 3.4 Accessibility quick check

In Chrome DevTools → Lighthouse (Accessibility category only) and Axe DevTools extension on the same five URLs:

- Color contrast on hero pills, FAQ summary text, and CTA buttons.
- `lang="ar"` and `dir="rtl"` on the `<html>` element.
- Form labels associated with inputs (`<label for="...">` or `aria-label`).
- Heading hierarchy (one H1, no skipped levels).

### 3.5 Vercel production spot checks

Once deployed to Vercel:

- Re-run `npm run seo:check` against the production URL (override port logic by pointing the script at a `BASE` env var if needed, or just verify a handful of URLs via `curl` + manual JSON-LD inspection).
- Confirm `/_next/static/...` cache headers (long max-age, immutable).
- Confirm `Cache-Control` on `/sitemap.xml` is reasonable (not `no-store`).
- Confirm `Cache-Control` on lead-form POST endpoint is `no-store`.
- Confirm `/admin/*` returns 401/redirect from an unauthenticated browser.

---

## 4. Failure recovery — `--fallback` pass

If `--fallback` is killed mid-run (Ctrl+C, network drop, hung server), one or more rows may be left in their mutated state. The script prints the rollback SQL to `stderr` **before each mutation**, so the operator can recover by copy-pasting into the Supabase SQL Editor:

```sql
-- Restore Jeddah city to published
update public.cities set public_status='published' where slug='jeddah';

-- Restore Luxury category to active
update public.car_categories set status='active' where slug='luxury';

-- Restore Mercedes E-Class car to active
update public.cars set status='active' where slug='mercedes-e-class';
```

After running the rollback SQL, re-run `npm run seo:check` (without `--fallback`) to confirm the public site is back to baseline.

---

## 5. Launch sign-off checklist

Before merging to `main` for a public launch, the operator should be able to tick every line below.

- [ ] `npm run seo:check` exits 0 with no failures.
- [ ] `npm run seo:check -- --fallback` exits 0 (or has been intentionally skipped with reason).
- [ ] Lighthouse scores meet the §3.1 targets on all 5 representative URLs.
- [ ] Schema.org / Rich Results validators report **no errors** for the 5 URLs in §3.2.
- [ ] Manual mobile visual review (§3.3) is clean.
- [ ] Accessibility quick-check (§3.4) shows no critical issues.
- [ ] Production Vercel spot checks (§3.5) pass.
- [ ] `npm run db:seed` is idempotent (0 new rows on re-run).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm run build` succeeds; worker tally is **237/237** and `.next/prerender-manifest.json` routes count is **236**.
- [ ] No `.env*` files committed.
- [ ] No `_smoke-test-*.ts` files at repo root.
- [ ] Latest progress documented in `ai-docs/31_PROJECT_PROGRESS_STATUS.md`.

---

## 6. Updating this checklist

When a new public route ships, a new structured-data type is introduced, or a new privacy-sensitive field is added to the schema, both the script and this checklist must be updated:

- **Script:** add the new route to the `ROUTES` config; add new entries to the `lbExpectations`, `productExpectations`, or `titleExpectations` maps; update `EXPECTED_SITEMAP_COUNT` / `EXPECTED_PRERENDERED_ROUTES` constants if the page set grew.
- **Checklist:** update §2 (automated coverage table) and §5 (sign-off list) accordingly.

The script and checklist are the source of truth for "is the public site ready to launch." Keep them current.
