# Seed scripts — Saudi Car Rental Platform

TypeScript scripts that populate the Supabase database from the static data
currently shipped in [`src/lib/data.ts`](../../src/lib/data.ts).

Used to bootstrap the new `saudi-car-rental` Supabase project (project ref
`ygzdyoxhvhfduxsqrgmg`). The seed is **bootstrap data, not verified
production data** — partner phone numbers and prices come from the static
demo dataset.

## What gets seeded

| Order | Table | Source | Strategy |
|-------|-------|--------|----------|
| 1 | `cities` | `cities[]` | `upsert` by `slug` |
| 2 | `airports` | `airports[]` | `upsert` by `code` (FK to cities by slug) |
| 3 | `car_categories` | `categories[]` | `upsert` by `slug` |
| 4 | `cars` | `carModels[]` | `upsert` by `slug` (no price columns) |
| 5 | `companies` | `partners[]` | `upsert` by `slug` |
| 6 | `branches` | partners × valid cities | Lookup-then-insert on `(company_id, city_id)` |
| 7 | `offers` | partners × valid cities × cars | Lookup-then-insert on `(company_id, branch_id, car_id, city_id)` |

`public.users`, `public.leads`, and the operational lead/log/follow-up tables
are **not** seeded — those are populated only by real user actions.

## Idempotency

The seed is safe to run any number of times. Pre-run row counts equal post-run
row counts on a no-op re-run.

- Tables with a unique `slug` or `code` use `upsert`.
- `branches` and `offers` have no natural unique constraint, so they use a
  lookup-then-insert pattern keyed by their composite-identity columns.

## Prerequisites

1. **`.env.local`** at the repo root with these two variables populated from
   the Supabase dashboard (Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ygzdyoxhvhfduxsqrgmg.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   ```

   The seed uses the service role key and bypasses RLS.

2. **Migrations applied** to the project. Task 1 migrations (`01`–`18`) plus
   the Task 1.1 hardening migration (`19`) must be present. Verify with:

   ```bash
   supabase migration list --linked
   ```

3. **Node.js ≥ 20** (for native `--env-file` support).

## Running

```bash
npm run db:seed
```

Equivalent to:

```bash
node --env-file=.env.local --import tsx scripts/seed.ts
```

Expected output on a clean database:

```
[seed] cities           upserted 6
[seed] airports         upserted 5
[seed] car_categories   upserted 7
[seed] cars             upserted <N>
[seed] companies        upserted 6
[seed] branches         WARN  skipped unsupported partner city "abha"
[seed] branches         WARN  skipped unsupported partner city "tabuk"
[seed] branches         inserted <M>  existed 0  (skipped cities: abha, tabuk)
[seed] offers           inserted <K>  existed 0
[seed] done in <t>s
```

Re-running on a fully-seeded database produces:

```
[seed] cities           upserted 6
…
[seed] branches         inserted 0  existed <M>
[seed] offers           inserted 0  existed <K>
[seed] done in <t>s
```

## Decisions baked in

- **Skipped partner cities** — `partners[]` references `tabuk` and `abha`,
  which are not in the `cities[]` array. These are skipped with a warning,
  not inserted.
- **Phone normalization** — partner phones are stored as bare digits
  (`9665XXXXXXXX`); the DB CHECK requires `+9665XXXXXXXX`. The seed prepends
  `+` before insert.
- **Company defaults** — `trust_level='new_partner'`, `public_status='published'`,
  `status='active'`. `internal_notes` records that phone data is unverified.
- **One branch per (company, city)** — `is_main_branch=true` is set on the
  alphabetically-first valid city per company.
- **Offer pricing** — `daily_price_from = round(car.dailyPrice × partnerMultiplier, 2)`,
  `weekly_price_from = round(daily × 7 × 0.85, 2)`,
  `monthly_price_from = round(car.monthlyPrice × partnerMultiplier, 2)`.
  Partner multipliers live in `seed-utils.ts`.

  **Weekly price is bootstrap/demo seed data only.** The 15% weekly discount
  is applied once, at seed time, to give every offer a plausible starting
  weekly price. It is **not** a business rule:

  - There is no DB trigger, generated column, or application constant
    enforcing the daily ↔ weekly relationship.
  - `offers.weekly_price_from` is a plain editable field. The stored value
    is the source of truth — the app must read it, not recompute it from
    `daily_price_from`.
  - Admins can override `weekly_price_from` from the admin dashboard.
    Future company-dashboard users may also be able to suggest or update
    weekly prices, subject to approval rules.
  - If `daily_price_from` is later edited, `weekly_price_from` does **not**
    change automatically. Any re-derivation must be a deliberate admin
    action.
  - Re-running the seed does not overwrite existing offers' weekly prices
    (lookup-then-insert keyed on `(company_id, branch_id, car_id, city_id)`),
    so admin edits survive subsequent seed runs.
  - **TODO (Phase 2 consumer migration):** when public pages are migrated
    from `src/lib/data.ts` to database-driven data, the SEO content
    generator (`generateCarSEOContent()` in `src/lib/data.ts`) must be
    rewritten to read the stored `offers.weekly_price_from` value instead
    of recalculating weekly price from daily price. Also tracked in
    `ai-docs/10_SEO_AND_CONTENT_RULES.md`.
- **Offer defaults** — `price_status='starts_from'`,
  `availability_status='needs_confirmation'`, `approval_status='auto_approved'`,
  `public_status='published'`, `status='active'`,
  `last_updated_at` = current timestamp at seed time.

## Relationship to public pages

The seed populates the database but **does not** wire the app up to read from
it. Every public page (the 16 consumers of `@/lib/data`) still reads from the
static [`src/lib/data.ts`](../../src/lib/data.ts) file. Switching consumers
over to the database is a separate task.

## Troubleshooting

- **"Missing NEXT_PUBLIC_SUPABASE_URL"** — `.env.local` is missing or the
  variable is unset. Confirm the file exists at the repo root.
- **"violates row-level security policy"** — you're using the anon key, not
  the service role key. The seed requires `SUPABASE_SERVICE_ROLE_KEY`.
- **"referenced citySlug … not found"** — a partner references a city that
  doesn't exist in `cities[]`. Either add the city, or update the partner
  list. Currently skipped cities are reported by the seed.
- **Re-running shows large `inserted` counts** — something deleted the rows.
  Idempotency depends on prior runs leaving rows in place; check whether a
  manual `truncate` or `delete` ran between invocations.
