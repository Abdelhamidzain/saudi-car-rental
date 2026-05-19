-- =============================================================================
-- Migration: 20260519000006_create_branches
-- Purpose:   Branches belong to a company and are located in a city.
--
-- whatsapp_number is the routing target for manual MVP lead handoff. When
-- present, it MUST be stored in the normalized E.164-style Saudi format
-- (+9665XXXXXXXX). Normalization happens in the application layer; the
-- database enforces the format with a CHECK constraint.
-- =============================================================================

create table public.branches (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  city_id           uuid not null references public.cities(id)    on delete restrict,
  district          text null,
  address_ar        text null,
  address_en        text null,
  google_maps_url   text null,
  phone             text null,
  whatsapp_number   text null,
  working_hours     jsonb null,
  is_main_branch    boolean not null default false,
  status            public.entity_status not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint branches_whatsapp_format
    check (whatsapp_number is null or whatsapp_number ~ '^\+9665\d{8}$')
);

comment on table public.branches is
  'A company branch in a specific city. whatsapp_number is the lead-routing destination.';

comment on column public.branches.whatsapp_number is
  'Saudi WhatsApp number in normalized form: +9665XXXXXXXX. Enforced by DB CHECK constraint.';

comment on column public.branches.working_hours is
  'Structured JSON for working hours. Suggested shape: { "sat": [["08:00","22:00"]], "sun": [...], ... }. Format is application-defined.';
