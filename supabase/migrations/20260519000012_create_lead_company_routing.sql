-- =============================================================================
-- Migration: 20260519000012_create_lead_company_routing
-- Purpose:   Per-lead, per-company routing record. Tracks WhatsApp handoff
--            and company response.
--
-- generated_message is snapshotted at send time so the audit trail is
-- stable even if the lead or templates change later.
-- =============================================================================

create table public.lead_company_routing (
  id                            uuid primary key default gen_random_uuid(),
  lead_id                       uuid not null references public.leads(id)     on delete cascade,
  company_id                    uuid not null references public.companies(id) on delete restrict,
  branch_id                     uuid null     references public.branches(id)  on delete set null,
  whatsapp_number               text null,
  generated_message             text null,
  sent_by_user_id               uuid null references public.users(id) on delete set null,
  sent_at                       timestamptz null,
  company_response_status       public.company_response_status not null default 'not_sent',
  company_confirmed_price       numeric(10, 2) null,
  company_alternative_offer     text null,
  company_notes                 text null,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),

  constraint lcr_whatsapp_format
    check (whatsapp_number is null or whatsapp_number ~ '^\+9665\d{8}$'),

  constraint lcr_confirmed_price_non_negative
    check (company_confirmed_price is null or company_confirmed_price >= 0)
);

comment on table public.lead_company_routing is
  'One row per lead-to-company routing event. generated_message is the WhatsApp text snapshotted at send time.';

comment on column public.lead_company_routing.generated_message is
  'Snapshot of the WhatsApp message text at the moment it was generated for the company. Audit-stable.';
