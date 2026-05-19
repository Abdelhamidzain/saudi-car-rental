-- =============================================================================
-- Migration: 20260519000009_create_cars
-- Purpose:   Generic car models. NEVER stores price.
--
-- Per file 20 (database migration plan), price is a property of an offer,
-- not of a car. A car like "Toyota Yaris" exists once; many offers from
-- different companies and cities reference it with their own starts-from
-- prices.
-- =============================================================================

create table public.cars (
  id                uuid primary key default gen_random_uuid(),
  brand             text not null,
  brand_ar          text not null,
  model             text not null,
  model_ar          text not null,
  slug              text not null unique,
  year              int  null,
  category_id       uuid not null references public.car_categories(id) on delete restrict,
  seats             int  null,
  transmission      text null,
  fuel_type         text null,
  features_json     jsonb null,
  image_url         text null,
  description_ar    text null,
  status            public.entity_status not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint cars_slug_format        check (slug ~ '^[a-z0-9-]+$'),
  constraint cars_year_range         check (year is null or (year between 1990 and 2100)),
  constraint cars_seats_range        check (seats is null or (seats between 1 and 100)),
  constraint cars_transmission_check check (transmission is null or transmission in ('automatic', 'manual'))
);

comment on table public.cars is
  'Generic car models. Price lives on offers, never on cars.';

comment on column public.cars.features_json is
  'Free-form structured features list. Application-defined shape.';
