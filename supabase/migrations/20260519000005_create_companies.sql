-- =============================================================================
-- Migration: 20260519000005_create_companies
-- Purpose:   Rental companies — the partners that fulfill leads.
--
-- Public pages must show only companies with public_status = 'published' and
-- status = 'active'. trust_level is internal-only and never exposed to
-- customer-facing UI per the project's non-negotiable rules.
-- =============================================================================

create table public.companies (
  id                            uuid primary key default gen_random_uuid(),
  name_ar                       text not null,
  name_en                       text not null,
  slug                          text not null unique,
  logo_url                      text null,
  website_url                   text null,
  google_maps_url               text null,
  rating_snapshot               numeric(2, 1) null,
  reviews_count_snapshot        int  null,
  rating_snapshot_verified_at   timestamptz null,
  trust_level                   public.trust_level    not null default 'new_partner',
  public_status                 public.public_status  not null default 'draft',
  internal_notes                text null,
  status                        public.entity_status  not null default 'active',
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),

  constraint companies_slug_format          check (slug ~ '^[a-z0-9-]+$'),
  constraint companies_rating_range         check (rating_snapshot is null or (rating_snapshot >= 0.0 and rating_snapshot <= 5.0)),
  constraint companies_reviews_non_negative check (reviews_count_snapshot is null or reviews_count_snapshot >= 0)
);

comment on table public.companies is
  'Rental companies (partners). trust_level is internal-only. Public badges live elsewhere in app logic.';

comment on column public.companies.trust_level is
  'Internal classification for ranking, routing, and approval workflow. NEVER expose to customer-facing UI.';

comment on column public.companies.rating_snapshot is
  'Manually verified rating snapshot from external source (e.g. Google Maps). Updated at admin-defined cadence.';
