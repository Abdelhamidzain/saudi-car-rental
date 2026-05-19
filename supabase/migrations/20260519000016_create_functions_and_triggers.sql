-- =============================================================================
-- Migration: 20260519000016_create_functions_and_triggers
-- Purpose:   Database-side automation.
--
-- Functions defined here:
--   1. public.set_updated_at()         — generic updated_at touch trigger
--   2. public.generate_lead_number()   — collision-safe SCR-YYYYMM-NNNNN generator
--   3. public.handle_new_user()        — auto-create public.users on auth.users insert
--   4. public.auth_role()              — helper for future RLS policies
--
-- Triggers attached here:
--   - set_updated_at on every table with an updated_at column
--   - generate_lead_number BEFORE INSERT on leads
--   - on_auth_user_created AFTER INSERT on auth.users
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. set_updated_at  -- touch updated_at on every UPDATE
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic trigger function. Sets updated_at = now() on UPDATE. Attach to every table with an updated_at column.';

-- Attach to all tables with updated_at:

create trigger trg_cities_set_updated_at
  before update on public.cities
  for each row execute function public.set_updated_at();

create trigger trg_airports_set_updated_at
  before update on public.airports
  for each row execute function public.set_updated_at();

create trigger trg_companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger trg_branches_set_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();

create trigger trg_users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_car_categories_set_updated_at
  before update on public.car_categories
  for each row execute function public.set_updated_at();

create trigger trg_cars_set_updated_at
  before update on public.cars
  for each row execute function public.set_updated_at();

create trigger trg_offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

create trigger trg_leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create trigger trg_lcr_set_updated_at
  before update on public.lead_company_routing
  for each row execute function public.set_updated_at();

create trigger trg_lcf_set_updated_at
  before update on public.lead_customer_followups
  for each row execute function public.set_updated_at();

create trigger trg_cqm_set_updated_at
  before update on public.company_quality_metrics
  for each row execute function public.set_updated_at();

-- Note: public.lead_activity_logs intentionally has NO updated_at and NO
-- set_updated_at trigger — log entries are append-only.

-- ----------------------------------------------------------------------------
-- 2. generate_lead_number  -- collision-safe SCR-YYYYMM-NNNNN generator
-- ----------------------------------------------------------------------------
--
-- Design:
--   - Lead number format:  SCR-YYYYMM-00001
--   - Counter resets at the start of each calendar month (UTC).
--   - Concurrency safety:  pg_advisory_xact_lock keyed by the YYYYMM prefix.
--       * Lock is per-month, so January and February inserts never block each
--         other.
--       * Lock is held until COMMIT (xact = transaction-scoped).
--       * Under READ COMMITTED isolation (Supabase default), once the lock is
--         acquired the MAX() query sees all previously committed lead_numbers
--         for the same month.
--   - The trigger is a no-op if lead_number is already set, so backfills and
--     imports can supply their own value if needed.
--
create or replace function public.generate_lead_number()
returns trigger
language plpgsql
as $$
declare
  v_year_month  text := to_char(now() at time zone 'UTC', 'YYYYMM');
  v_prefix      text := 'SCR-' || v_year_month || '-';
  v_lock_key    bigint := hashtext(v_prefix);
  v_next_seq    int;
begin
  if new.lead_number is not null then
    return new;
  end if;

  -- Serialize concurrent inserts within the same month
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(
           max((substring(lead_number from '\d+$'))::int),
           0
         ) + 1
  into   v_next_seq
  from   public.leads
  where  lead_number like v_prefix || '%';

  new.lead_number := v_prefix || lpad(v_next_seq::text, 5, '0');
  return new;
end;
$$;

comment on function public.generate_lead_number() is
  'Generates lead_number in SCR-YYYYMM-NNNNN format. Collision-safe via pg_advisory_xact_lock keyed by month prefix.';

create trigger trg_leads_generate_lead_number
  before insert on public.leads
  for each row execute function public.generate_lead_number();

-- ----------------------------------------------------------------------------
-- 3. handle_new_user  -- auto-create public.users on auth.users insert
-- ----------------------------------------------------------------------------
--
-- Fires whenever a new row appears in auth.users (Supabase Auth sign-up,
-- invitation acceptance, or admin-created user). Inserts the matching
-- public.users row with role = 'viewer'. First owner is promoted manually
-- via SQL in Supabase Studio.
--
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, status)
  values (new.id, new.email::citext, 'viewer', 'active')
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a matching public.users row when a new auth.users row is created. role defaults to viewer.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. auth_role  -- helper for future RLS policies
-- ----------------------------------------------------------------------------
--
-- Returns the public.users.role of the currently-authenticated user.
-- Returns NULL if no row exists. Marked STABLE so the planner can cache it
-- within a query. Marked SECURITY DEFINER so policies can call it without
-- needing direct SELECT on public.users.
--
-- Not used by any active policy in MVP (server-first approach) but defined
-- now so future Phase 2 policies don't have to add it later.
--
create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

comment on function public.auth_role() is
  'Helper for RLS policies. Returns the role of the currently authenticated user, or NULL.';
