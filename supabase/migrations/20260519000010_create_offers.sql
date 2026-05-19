-- =============================================================================
-- Migration: 20260519000010_create_offers
-- Purpose:   Concrete rental offers. Combination of company + branch + car + city.
--
-- All prices are indicative "starts-from" values per the project's
-- non-negotiable pricing rules. Final price is confirmed by the company
-- after the lead is routed.
--
-- last_updated_at is intentionally distinct from updated_at:
--   updated_at      — bumped on every row update (generic audit timestamp)
--   last_updated_at — bumped ONLY when price/availability changes, controlled
--                     by application logic. Drives "Updated Prices" badge
--                     and price-freshness ranking.
-- =============================================================================

create table public.offers (
  id                            uuid primary key default gen_random_uuid(),
  company_id                    uuid not null references public.companies(id)      on delete cascade,
  branch_id                     uuid not null references public.branches(id)       on delete cascade,
  car_id                        uuid not null references public.cars(id)           on delete restrict,
  city_id                       uuid not null references public.cities(id)         on delete restrict,
  airport_id                    uuid null     references public.airports(id)       on delete set null,

  daily_price_from              numeric(10, 2) null,
  weekly_price_from             numeric(10, 2) null,
  monthly_price_from            numeric(10, 2) null,
  deposit_amount                numeric(10, 2) null,
  insurance_included            boolean null,
  insurance_type                text null,
  mileage_limit                 int  null,
  delivery_available            boolean not null default false,
  airport_delivery_available    boolean not null default false,

  price_status                  public.price_status        not null default 'starts_from',
  availability_status           public.availability_status not null default 'needs_confirmation',
  approval_status               public.approval_status     not null default 'pending_review',

  last_updated_at               timestamptz null,

  status                        public.entity_status not null default 'active',
  public_status                 public.public_status not null default 'draft',
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),

  constraint offers_daily_price_non_negative   check (daily_price_from   is null or daily_price_from   >= 0),
  constraint offers_weekly_price_non_negative  check (weekly_price_from  is null or weekly_price_from  >= 0),
  constraint offers_monthly_price_non_negative check (monthly_price_from is null or monthly_price_from >= 0),
  constraint offers_deposit_non_negative       check (deposit_amount     is null or deposit_amount     >= 0),
  constraint offers_mileage_non_negative       check (mileage_limit      is null or mileage_limit      >= 0)
);

comment on table public.offers is
  'Concrete rental offers. Public listing requires public_status=''published'' AND approval_status IN (''approved'', ''auto_approved'') AND status=''active''.';

comment on column public.offers.last_updated_at is
  'Last time PRICE or AVAILABILITY changed. Distinct from updated_at. Application logic controls when this is updated.';

comment on column public.offers.daily_price_from is
  'Indicative "starts-from" daily price in SAR. NEVER treated as a confirmed final price.';
