-- =============================================================================
-- Migration: 20260519000008_create_car_categories
-- Purpose:   Car categories (Economy, Family, SUV, Luxury, etc.).
--
-- Referenced by cars and (optionally) leads. Drives category landing pages
-- and request-form category selection.
-- =============================================================================

create table public.car_categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name_ar      text not null,
  name_en      text not null,
  icon         text null,
  sort_order   int  not null default 100,
  status       public.entity_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint car_categories_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on table public.car_categories is
  'Car categories used for grouping, search filters, and SEO landing pages.';
