-- =============================================================================
-- Migration: 20260519000013_create_lead_customer_followups
-- Purpose:   Per-lead customer-side reality check. Did the company actually
--            contact the customer? Was the price close to what we displayed?
--
-- This is critical for the platform's quality model — company-side follow-up
-- alone is not enough.
-- =============================================================================

create table public.lead_customer_followups (
  id                              uuid primary key default gen_random_uuid(),
  lead_id                         uuid not null references public.leads(id) on delete cascade,
  contacted_by_user_id            uuid null references public.users(id) on delete set null,
  followup_channel                public.followup_channel not null,
  customer_followup_status        text null,
  did_company_contact_customer    boolean null,
  did_customer_receive_offer      boolean null,
  price_match_status              public.price_match_status null,
  customer_outcome                public.customer_outcome null,
  customer_rating                 int  null,
  customer_feedback               text null,
  next_followup_at                timestamptz null,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),

  constraint lcf_rating_range check (customer_rating is null or (customer_rating between 1 and 5))
);

comment on table public.lead_customer_followups is
  'Customer-side follow-up records. Reveals true company performance vs. self-reported company response.';

comment on column public.lead_customer_followups.customer_rating is
  '1 to 5 stars given by the customer about their experience with the assigned company.';
