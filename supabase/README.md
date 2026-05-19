# Supabase — Saudi Car Rental Platform

This directory holds the database schema for the Saudi Car Rental Platform.
Everything in `migrations/` is **version-controlled, reviewable, and applied
in order** to both the local Supabase stack and the cloud project.

## Project

- **Cloud project name:** `saudi-car-rental`
- **Region:** Frankfurt (`eu-central-1`)
- **Database:** Postgres 15
- **Auth:** Supabase Auth (extends `auth.users` via `public.users`)

## Prerequisites

Install the Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# Linux / Windows
# See https://supabase.com/docs/guides/cli for platform-specific instructions
```

Verify:

```bash
supabase --version   # 1.x or newer
```

Docker is required for the local stack (`supabase start`).

## One-time setup

1. **Sign in to the CLI:**

   ```bash
   supabase login
   ```

2. **Link this repo to the cloud project:**

   ```bash
   supabase link --project-ref <YOUR_PROJECT_REF>
   ```

   The project ref is the string in the cloud project's URL, e.g.
   `https://supabase.com/dashboard/project/<this-part>`.

3. **Populate `.env.local`** at the repo root with the values listed in
   `.env.example`. Get the values from the cloud dashboard:
   *Project Settings → API*.

## Daily workflow

### Run the schema against a local Postgres

```bash
supabase start            # boots local stack (Postgres, Studio, Auth, etc.)
supabase db reset         # wipes local DB and re-applies all migrations
```

Local Studio is then available at `http://127.0.0.1:54323`.

### Apply migrations to the cloud project

```bash
supabase db push          # applies new migrations to the linked cloud project
```

### Detect drift

```bash
supabase db diff          # shows differences between local migrations and cloud
```

### Regenerate TypeScript types

After any schema change, regenerate types so the app stays in sync:

```bash
supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Commit the regenerated file.

## Adding a new migration

1. Create a new file in `migrations/` with a timestamp-prefixed name:

   ```
   YYYYMMDDHHMMSS_short_description.sql
   ```

2. Write the SQL. Migrations are **forward-only** — there are no automatic
   rollbacks. Be careful with destructive operations.

3. Test locally: `supabase db reset`.

4. Push: `supabase db push`.

5. Regenerate types if the schema changed (see above).

## Migration map (this task)

| # | File | Purpose |
|---|------|---------|
| 01 | `20260519000001_init_extensions.sql` | Enable `pgcrypto`, `citext` |
| 02 | `20260519000002_create_enums.sql` | All enum types |
| 03 | `20260519000003_create_cities.sql` | Cities + SEO metadata |
| 04 | `20260519000004_create_airports.sql` | Airports + SEO metadata |
| 05 | `20260519000005_create_companies.sql` | Rental partners |
| 06 | `20260519000006_create_branches.sql` | Branches + WhatsApp |
| 07 | `20260519000007_create_users.sql` | App users extending `auth.users` |
| 08 | `20260519000008_create_car_categories.sql` | Categories |
| 09 | `20260519000009_create_cars.sql` | Generic car models (no price) |
| 10 | `20260519000010_create_offers.sql` | Concrete offers + starts-from pricing |
| 11 | `20260519000011_create_leads.sql` | Lead requests + consent |
| 12 | `20260519000012_create_lead_company_routing.sql` | Per-company routing |
| 13 | `20260519000013_create_lead_customer_followups.sql` | Customer-side follow-up |
| 14 | `20260519000014_create_lead_activity_logs.sql` | Append-only timeline |
| 15 | `20260519000015_create_company_quality_metrics.sql` | Internal scoring |
| 16 | `20260519000016_create_functions_and_triggers.sql` | All functions + triggers |
| 17 | `20260519000017_create_indexes.sql` | Performance indexes |
| 18 | `20260519000018_enable_rls_and_policies.sql` | RLS enabled; no active policies |

## Security model (MVP)

- **Server-first access.** Public pages and admin actions both go through
  Next.js server-side code using `SUPABASE_SERVICE_ROLE_KEY`.
- **Browser/anon client is NOT used for reads in MVP.** A
  `src/lib/supabase/browser.ts` file exists for future use only.
- **RLS is enabled on every table** as defense-in-depth, but no `CREATE POLICY`
  statements are active in MVP. Future policies live as comments in migration
  #18 and are enabled only by deliberate decisions logged in
  `16_DECISION_LOG.md`.

## Critical reminders

- **Never** commit `.env.local`, service role keys, or database passwords.
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser — it bypasses
  RLS and would expose all customer data.
- **Lead phone numbers** must always be normalized to `+9665XXXXXXXX` in
  application code before insert. The DB enforces this with a CHECK
  constraint but does not normalize.
- **`lead_number` is auto-generated** by a trigger; the application must
  never set it directly.
- **`last_updated_at` on `offers`** is distinct from `updated_at`. It must
  be touched only when price or availability changes; application logic
  controls this.

## Promoting the first owner

After signing up the first owner via Supabase Auth, run this in Supabase Studio
SQL editor (replace the email):

```sql
update public.users
set role = 'owner'
where email = 'you@example.com';
```
