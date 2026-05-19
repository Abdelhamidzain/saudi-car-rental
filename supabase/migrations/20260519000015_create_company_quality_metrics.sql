-- =============================================================================
-- Migration: 20260519000015_create_company_quality_metrics
-- Purpose:   One row per company holding computed internal-only quality
--            signals used for ranking and routing.
--
-- This table is internal-only. Its values must NEVER appear in customer-facing
-- UI per the project's non-negotiable rules. It is recomputed periodically by
-- an admin job (not part of this task).
-- =============================================================================

create table public.company_quality_metrics (
  company_id                  uuid primary key references public.companies(id) on delete cascade,
  response_speed_avg_minutes  numeric(10, 2) null,
  contact_rate                numeric(5, 4)  null,
  price_match_rate            numeric(5, 4)  null,
  deal_success_rate           numeric(5, 4)  null,
  complaint_count             int            not null default 0,
  last_price_update_at        timestamptz null,
  internal_score              numeric(6, 2) null,
  updated_at                  timestamptz not null default now(),

  constraint cqm_contact_rate_range      check (contact_rate      is null or (contact_rate      between 0 and 1)),
  constraint cqm_price_match_rate_range  check (price_match_rate  is null or (price_match_rate  between 0 and 1)),
  constraint cqm_deal_success_rate_range check (deal_success_rate is null or (deal_success_rate between 0 and 1)),
  constraint cqm_complaint_count_non_neg check (complaint_count >= 0)
);

comment on table public.company_quality_metrics is
  'Internal-only computed metrics per company. NEVER expose to customer-facing UI.';

comment on column public.company_quality_metrics.internal_score is
  'Composite ranking score. Formula and weighting to be defined later by an admin job.';
