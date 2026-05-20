# 33 — Production Launch Runbook (Vercel)

> **Purpose.** End-to-end runbook for deploying the Saudi Car Rental platform to Vercel and verifying the production environment. Covers env-var configuration, smoke testing on a real deployment, SEO verification against the live URL, rollback procedures, and a launch sign-off section.
> Companion to [32_PRE_LAUNCH_REGRESSION_CHECKLIST.md](32_PRE_LAUNCH_REGRESSION_CHECKLIST.md) (which covers local pre-launch checks). This runbook covers what to do once the deploy is on Vercel.

---

## 1. Vercel project setup

### 1.1 First-time project creation

1. Vercel dashboard → **Add New → Project** → import the GitHub repo `Abdelhamidzain/saudi-car-rental`.
2. **Framework Preset:** Next.js (detected automatically).
3. **Build & Output Settings:** keep Vercel defaults — they map to:
   - **Build command:** `next build` (Vercel reads from `package.json`).
   - **Output directory:** `.next` (Vercel default for Next.js).
   - **Install command:** `npm install` (Vercel default).
   - **Node.js version:** Vercel default (22.x or current LTS — confirm in Project Settings).
4. Set environment variables (see §2) **before** triggering the first build.
5. Configure custom domain (see §3) — can be done before or after the first successful deploy.

### 1.2 Recommended Vercel project settings

- **Production Branch:** `main`.
- **Automatic Deployments:** enabled for the production branch only (recommended) — preview deploys on PRs are fine; we currently work directly on main so preview = main commits before they're promoted.
- **Cron Jobs:** none for MVP.
- **Edge Config / KV / Postgres:** none — we use Supabase exclusively.
- **Functions:** all routes default to Node.js runtime (no `runtime = 'edge'` declarations exist in the codebase; **do not change this** — the Supabase service-role client requires Node runtime).

---

## 2. Required Vercel environment variables

All 5 vars must be configured in **Project Settings → Environment Variables**. Each row notes the scope (Production / Preview / Development) and the sensitivity level.

| Var | Scope | Sensitive? | Source / Value | Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | All | No | Production: `https://<your-domain>.com` (no trailing slash). Preview: leave unset OR use the auto Vercel preview URL pattern. | Drives canonical URLs, sitemap, OG `url`, JSON-LD `url`. |
| `NEXT_PUBLIC_SUPABASE_URL` | All | No | Supabase dashboard → **Project Settings → API → URL** | Safe to expose to browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | No | Supabase dashboard → **Project Settings → API → anon (public) key** | Safe to expose — RLS gates everything. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview ONLY | **YES — mark as Sensitive in Vercel** | Supabase dashboard → **Project Settings → API → service_role key** | **Server-only.** Never expose to the browser. Used by `getSupabaseAdminClient()` in [src/lib/supabase/server.ts](../src/lib/supabase/server.ts). |
| `SUPABASE_PROJECT_REF` | All | No | `ygzdyoxhvhfduxsqrgmg` (per progress doc §3) | Non-sensitive; used by tooling. |

**Setup checklist:**

- [ ] All 5 vars exist in Vercel project settings.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is flagged **Sensitive** (Vercel masks the value after save).
- [ ] `NEXT_PUBLIC_SITE_URL` for Production points at the customer-visible domain (no trailing slash, HTTPS scheme).
- [ ] If a separate staging Supabase project exists, Preview env vars point there; otherwise Preview points at the same prod Supabase project (current state).
- [ ] No `.env.local`, `.env`, or `.env.production` files committed to git (`git status` should show none staged).

---

## 3. DNS / TLS / Domain

1. Vercel project → **Settings → Domains** → Add `<your-domain>.com` (and `www.<your-domain>.com` if desired — pick one as canonical and 301 the other).
2. Vercel shows the required DNS records. Add them at the registrar (A record `76.76.21.21` and/or CNAME `cname.vercel-dns.com`).
3. Wait for DNS propagation (typically minutes; up to 48 hours worst case).
4. Vercel automatically provisions a TLS certificate via Let's Encrypt once DNS resolves.
5. **Verification:**
   ```bash
   curl -I https://<your-domain>.com           # 200 or 301 to canonical
   curl -vI https://<your-domain>.com 2>&1 | grep "SSL certificate verify"
   ```

---

## 4. Preview deployment verification

Every commit to `main` triggers a Vercel preview build. Run the following against the preview URL **before** promoting to production.

### 4.1 Build verification

- [ ] Vercel "Building" → "Ready" without errors.
- [ ] Build log shows `Generating static pages using 15 workers (237/237)`.
- [ ] No warnings in build log about missing env vars.

### 4.2 SEO regression sweep against preview

```bash
BASE=https://<preview-url>.vercel.app npm run seo:check
```

Expected: **all checks PASS** (the exact total varies between local and remote because the local-only prerender-manifest check is replaced with 5 remote sitemap-URL sanity fetches).

If anything fails, **do NOT promote to production**. Investigate the failure, fix it in a separate commit, redeploy, re-run `seo:check`.

---

## 5. Production deployment

### 5.1 Promoting preview to production

1. Vercel dashboard → **Deployments** → find the preview deployment that passed §4.
2. Click "..." → **Promote to Production**.
3. Wait for the production deployment to switch (typically ~10 seconds).
4. Confirm `https://<your-domain>.com` now serves the new build.

### 5.2 Production smoke test matrix (§A)

Run from a **fresh incognito session** against the production URL.

| # | Area | Check | How |
|---|---|---|---|
| 1 | Build | Production deployment status = "Ready" | Vercel dashboard |
| 2 | Domain | Custom domain resolves to Vercel; TLS valid | `curl -I https://...` |
| 3 | Redirect | `http://...` → `https://...` works | Browser |
| 4 | Robots | `/robots.txt` returns `disallow: /admin/`, `disallow: /api/`, `sitemap: ...` | `curl https://.../robots.txt` |
| 5 | Sitemap | `/sitemap.xml` returns 231 entries, all absolute, no duplicates | `curl https://.../sitemap.xml` |
| 6 | Cache | `/sitemap.xml` `Cache-Control` is not `no-store` | `curl -I` |
| 7 | Cache | `/_next/static/...` returns `cache-control: public, max-age=31536000, immutable` | DevTools Network |
| 8 | SEO | `BASE=https://... npm run seo:check` exits 0 with all checks PASS | Local terminal |
| 9 | Admin gate | `/admin` (unauthenticated) → redirect to `/admin/login` | Incognito browser |
| 10 | Admin disallow | `/admin/leads` (unauthenticated) → redirect to `/admin/login` | Incognito browser |
| 11 | API gate | `/api/...` paths return 401/redirect (or 404 if not exposed) | Manual probe |
| 12 | Security headers | Default Vercel security headers present (`x-frame-options`, `referrer-policy`) | `curl -I` |
| 13 | RTL | Mobile + desktop render RTL with Arabic font correctly | Browser + DevTools |
| 14 | Build log | No env-var warnings | Vercel build log |
| 15 | First curl | `curl https://.../sa/riyadh` returns 200 with Arabic content | Local terminal |

---

## 6. Admin smoke test matrix (§B)

Use a real admin account on the production URL. **Use a clearly-test phone number** (e.g. an internal number) for any lead-creation step.

| # | Flow | Check |
|---|---|---|
| 1 | Sign-in | `/admin/login` accepts valid email/password; redirects to `/admin/leads` |
| 2 | Cookie auth | Refreshing the page keeps the session (cookie persists across reload) |
| 3 | Role gate | A `viewer`-role account cannot reach admin write-paths (read-only or redirect) |
| 4 | Leads list | `/admin/leads` renders the latest 50 leads with status filter working |
| 5 | Lead detail | Click into one lead → detail card + activity-log timeline render |
| 6 | Status change | Change lead status `new` → `reviewed`; activity-log row appears |
| 7 | Assignment | `/admin/leads/[id]` routing panel: pick company → pick branch → "Assign to company" → new `lead_company_routing` row |
| 8 | WhatsApp preview | Arabic message renders with customer notes, lead number, pickup date |
| 9 | Copy message | "Copy message" button → activity log shows `whatsapp_copied` |
| 10 | Open WhatsApp | "Open WhatsApp" with real branch number → wa.me opens with Arabic prefilled in new tab |
| 11 | Mark as sent | "Mark as sent" → routing `company_response_status='sent'`; lead status auto-advances `new`/`reviewed` → `sent_to_company` |
| 12 | Reassignment | Assign again → new routing row appended; previous routings stay as history |
| 13 | Sign-out | Sign out → redirect to `/admin/login`; refreshing keeps logged-out state |
| 14 | Companies/Branches CRUD | Create one test company + branch; **archive both at end of smoke testing** |
| 15 | Cars CRUD | Create one test car; archive at end |
| 16 | Offers CRUD | Create one test offer with ≥1 price tier; archive at end |

---

## 7. Public lead form smoke test matrix (§C)

Run from a **fresh incognito session** so rate limiting starts at 0. **Mark every test lead with `[SMOKE TEST]` in `customer_notes`** so the operator can identify them later — see §10.

| # | Flow | Check |
|---|---|---|
| 1 | Homepage submit | Fill `/` lead form with valid Saudi phone (`+9665XXXXXXXX`), submit → success UI shows real `lead_number` LTR/monospace |
| 2 | Lead reaches DB | `/admin/leads` shows the new lead with all expected fields |
| 3 | Source page | DB `source_page` column shows `/` |
| 4 | Phone normalisation | Submit with `05XXXXXXXX` → DB stores `+9665XXXXXXXX` |
| 5 | Arabic-Indic digits | Submit with `٠٥XXXXXXXX` → DB stores normalised form |
| 6 | Past pickup date | Submit with a past `pickup_date` → inline Arabic error block shown; no DB row |
| 7 | Same-day pickup/return | DB shows `rental_days = 1` (max(diff, 1) floor) |
| 8 | Customer notes (no URL) | Submit with notes "child seat, deliver to hotel" → DB stores the notes |
| 9 | Customer notes (with URL) | Submit with notes containing `https://example.com` → DB stores `[رابط محذوف]` placeholder |
| 10 | Rate limit | Submit 11 leads in rapid succession from same IP → 11th rejected with `"تم تجاوز الحد المسموح..."` |
| 11 | Duplicate detection | Submit two leads with same phone within 24h → admin lead detail shows ⚠ duplicate card |
| 12 | Honeypot | Submit with the honeypot field populated → fake-success sentinel returned; **no DB row** |
| 13 | City pages | Submit from `/sa/jeddah` → DB `source_page` is `/sa/jeddah`; pickup_date defaulted to today-in-Riyadh |
| 14 | Car detail | Submit from `/sa/riyadh/economy/hyundai-accent` → DB row has `selected_car_id` set; `source_page` matches |
| 15 | Consent | DB shows `consent_accepted=true`, `consent_text_version='v1-2026-05'`, `consent_ip` populated, `consent_accepted_at` set |

---

## 8. SEO verification

Run automated + manual checks against the production URL.

### 8.1 Automated (`npm run seo:check` with `BASE`)

```bash
BASE=https://<your-domain>.com npm run seo:check
```

Expected: all checks PASS. Behaviour vs local:
- Skips the local `.next/prerender-manifest.json` check.
- Adds 5 sitemap-URL sanity fetches.
- All metadata, JSON-LD, privacy, sitemap-shape checks run unchanged.

> **Note on host mismatch.** If the deploy's `NEXT_PUBLIC_SITE_URL` is set to the intended production domain (e.g. `https://cars-renting.com`) but you're testing against a Vercel preview URL (e.g. `https://saudi-car-rental.vercel.app`), the sitemap will emit `cars-renting.com` URLs. The script detects this and prints `ℹ Sitemap URLs reference host=..., BASE host=... — fetching paths against BASE.`, then fetches the *paths* against `BASE`. This is correct: the script is verifying the deploy serves each path; the canonical URL is an env-config concern, not a route-reachability concern.

### 8.2 Manual SEO checks

Per [32_PRE_LAUNCH_REGRESSION_CHECKLIST.md §3](32_PRE_LAUNCH_REGRESSION_CHECKLIST.md), run against production:

- [ ] **Lighthouse** (mobile + desktop) on `/`, `/sa/riyadh`, `/sa/riyadh/economy`, `/sa/riyadh/economy/hyundai-accent`, `/sa/airports/king-khalid`.
  - Performance ≥85 mobile, ≥95 desktop.
  - Accessibility = 100.
  - SEO = 100.
  - Best Practices ≥95.
- [ ] **Schema.org / Google Rich Results** validators on the same 5 URLs. **No errors.**
- [ ] **Mobile visual review** on a real device or DevTools mobile emulation.
- [ ] **Accessibility** quick-check (color contrast, `lang="ar"` + `dir="rtl"`, form labels, heading hierarchy).
- [ ] **Vercel production spot checks**:
  - `/_next/static/...` returns long-max-age `Cache-Control`.
  - `/sitemap.xml` `Cache-Control` is reasonable (not `no-store`).
  - Lead-form POST returns `Cache-Control: no-store`.
  - `/admin/*` returns 401 / redirect from unauthenticated browser.

---

## 9. Rollback plan

Three layers, in order of preference.

### 9.1 Instant deploy rollback (preferred)

Vercel dashboard → **Deployments** → previous good deployment → **Promote to Production**.

- Takes ~10 seconds.
- Restores the previous build verbatim.
- **Zero DB impact** — the rolled-back build has the same DB connection.
- **Use this first.** Any further investigation can happen after the rollback.

### 9.2 Git revert + redeploy

If the previous deployment is also bad:

```bash
git revert <bad-commit-sha>
git push origin main
```

Vercel auto-deploys the revert (~3 minutes). Then promote to production.

### 9.3 DB-side rollback (rare)

If admin edits in the DB are causing public-page corruption (e.g. an admin accidentally set every city `public_status='draft'`):

- The DB-overlay augmentation pattern means **the static `data.ts` fallback already takes over automatically** for the public site.
- Public pages stay alive with static content.
- Operator should revert the admin edit via **Supabase Studio → SQL Editor**:
  ```sql
  -- Example: re-publish all cities
  update public.cities set public_status='published' where status='active' and public_status='draft';
  ```
- No code rollback needed; no Vercel redeploy.

### 9.4 Pre-launch rollback rehearsal

Before public launch, **do one practice rollback against the preview environment** to confirm the operator knows the dashboard flow. Document the time it took. Expected: under 30 seconds end-to-end.

---

## 10. Smoke-test lead policy — important

During §7 production lead-form testing, **multiple test leads will be created in the production DB**. These rows are real and traceable.

**Rules:**
- Every smoke-test submission **MUST include `[SMOKE TEST]`** as the first characters of `customer_notes`. This is the identifier.
- Use a phone number you control for every smoke-test submission. The admin can later filter `customer_notes LIKE '[SMOKE TEST]%'` in `/admin/leads` to find them.
- **Do NOT delete smoke-test leads after testing.** They're indistinguishable from real customer activity in the audit log; deletion is destructive. Instead:
  - Set their status to `archived` via the admin UI.
  - The `lead_activity_logs` cascade leaves a paper trail.
- **Do NOT delete real customer leads** under any circumstances unless the customer has explicitly requested deletion in writing (PII / GDPR-style request) — that's a separate operator procedure outside this runbook.

This policy is reinforced by [01_NON_NEGOTIABLE_RULES.md](01_NON_NEGOTIABLE_RULES.md) — every lead action is logged with date/time; the platform is auditable by design.

---

## 11. Launch sign-off checklist

Before declaring the platform **publicly launched**, the operator must be able to tick every line below. This is the canonical launch gate.

### Code + repo

- [ ] `main` is at the commit being deployed (no local changes uncommitted).
- [ ] `npx tsc --noEmit` exit 0.
- [ ] `npm run build` succeeds; worker tally **237/237**, prerendered routes **236**.
- [ ] `npm run seo:check` (local) exits 0 — 240/240 checks PASS.
- [ ] No `_smoke-test-*.ts` files at repo root.
- [ ] No `.env*` files committed.

### Vercel environment

- [ ] All 5 env vars (§2) configured for Production scope.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` flagged Sensitive in Vercel.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the customer domain.
- [ ] Preview env vars configured (same as Production unless separate staging Supabase).
- [ ] Production branch = `main`.
- [ ] No env-var warnings in latest production build log.

### Domain + TLS

- [ ] Custom domain resolves to Vercel.
- [ ] TLS certificate valid; no browser warning.
- [ ] HTTP → HTTPS redirect works.
- [ ] `robots.txt` reachable and correct.
- [ ] `sitemap.xml` reachable and contains 231 entries.

### Smoke tests against production URL

- [ ] §A (production) all 15 items pass.
- [ ] §B (admin) all 16 items pass.
- [ ] §C (public lead form) all 15 items pass — every test lead marked `[SMOKE TEST]` in notes.
- [ ] `BASE=https://... npm run seo:check` exits 0.

### Manual SEO + accessibility

- [ ] Lighthouse targets met on 5 URLs (mobile + desktop).
- [ ] Google Rich Results Test: no errors on 5 URLs.
- [ ] Schema.org validator: no errors.
- [ ] Mobile visual review clean.
- [ ] Accessibility quick-check (32_*.md §3.4) clean.

### Rollback preparedness

- [ ] One rollback rehearsal completed against preview environment.
- [ ] Operator knows the Vercel dashboard rollback flow.
- [ ] Supabase SQL Editor access confirmed for §9.3 scenarios.

### Documentation

- [ ] `ai-docs/31_PROJECT_PROGRESS_STATUS.md` updated with Task 7 entry + launch date.
- [ ] Any deviations from this runbook noted in the progress doc under "Recent Operational Fixes".

---

## 12. Post-launch monitoring (Day 0–7)

For the first week after launch, do a daily light-touch check:

- [ ] Vercel dashboard → no failed deployments or function errors.
- [ ] `/admin/leads` → real leads coming in, distinct from `[SMOKE TEST]` entries.
- [ ] Supabase dashboard → no failed queries / RLS denials in logs.
- [ ] Sample 3 public URLs daily and confirm they render correctly.
- [ ] Watch for any inbound report of broken pages, mistyped Arabic, or RTL alignment issues.

If anything looks off, the §9 rollback plan is one click away.

---

## 13. Future enhancements (deferred)

These are explicitly **out of Task 7 scope** but worth tracking:

- **Pricing migration** (Task 6.4 — see progress doc §9). Per-car prices currently come from `data.ts`; live ranking from `offers` table is a future task.
- **Homepage DB overlay** (Task 6.2E — see progress doc §9). The `/` page still renders from `data.ts`.
- **Monitoring / alerting integration** (Sentry, LogRocket, etc.). Phase 2.
- **Email / SMS notification on new leads.** Manual-first per `01_NON_NEGOTIABLE_RULES.md`; deferred.
- **Analytics integration** (GA4 / Plausible). Phase 2 — see `21_ANALYTICS_AND_EVENT_TRACKING.md`.
- **Schema additions** to `cities.lat`/`lng`/`partnerCount` so JSON-LD `LocalBusiness` can read from DB rather than `data.ts`. Not needed for launch.
- **Custom 404 page styling.** Default Next.js / Vercel 404 is acceptable for MVP.
- **Image hosting + optimisation** for car / company logos beyond URL-paste. Future task.

---

## 14. Updating this runbook

When a new Vercel env var is required, a new smoke-test category emerges, or the rollback procedure changes:

- Update §2 (env vars) and the launch sign-off (§11) in lockstep.
- If `npm run seo:check` gains new checks against `BASE=<url>`, update §4.2 + §8.1.
- Keep this doc tight; deeper context belongs in the linked `ai-docs/` files.
