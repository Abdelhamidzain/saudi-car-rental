-- =============================================================================
-- Migration: 20260519000004_create_airports
-- Purpose:   Airports table — referenced by offers and leads.
--
-- Each airport belongs to a city. Used for airport landing pages and for
-- routing leads that originate from an airport pickup intent.
-- =============================================================================

create table public.airports (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  slug                 text not null unique,
  city_id              uuid not null references public.cities(id) on delete restrict,
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

  constraint airports_code_format check (code ~ '^[A-Z]{3}$'),
  constraint airports_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on table public.airports is
  'Airports supported by the platform. Code is the IATA three-letter code (e.g. RUH, JED, DMM).';
