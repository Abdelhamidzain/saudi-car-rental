-- =============================================================================
-- Migration: 20260519000003_create_cities
-- Purpose:   Cities table — referenced by branches, offers, and leads.
--
-- Promoted from a text slug to a full table because the platform is SEO-driven
-- and needs Arabic/English names, priority, display order, min price, and
-- SEO title/description metadata per city.
-- =============================================================================

create table public.cities (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name_ar              text not null,
  name_en              text not null,
  priority             int  not null default 100,
  display_order        int  not null default 100,
  min_price_from       numeric(10, 2) null,
  seo_title_ar         text null,
  seo_description_ar   text null,
  seo_title_en         text null,
  seo_description_en   text null,
  status               public.entity_status  not null default 'active',
  public_status        public.public_status  not null default 'draft',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint cities_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on table public.cities is
  'Cities supported by the platform. Public pages query only rows with public_status = ''published'' and status = ''active''.';

comment on column public.cities.priority is
  'Lower number = higher priority in ranked lists. Default 100 leaves room above and below.';

comment on column public.cities.min_price_from is
  'Lowest "starts from" price found across offers in this city. Indicative only; updated by an admin job.';
