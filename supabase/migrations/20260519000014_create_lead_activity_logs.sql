-- =============================================================================
-- Migration: 20260519000014_create_lead_activity_logs
-- Purpose:   Append-only timeline of every action taken on a lead.
--
-- Activity logs are MANDATORY per the project's non-negotiable rules.
-- Every status change, WhatsApp copy/open, follow-up, and assignment must
-- be recorded here with a UTC timestamp.
--
-- This table is intentionally append-only — there is no updated_at because
-- log entries are immutable once written. If a correction is needed, write
-- a new entry rather than modifying the old one.
-- =============================================================================

create table public.lead_activity_logs (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads(id) on delete cascade,
  event_type      text not null,
  title           text not null,
  description     text null,
  old_value       text null,
  new_value       text null,
  actor_type      public.actor_type not null,
  actor_id        uuid null,
  metadata_json   jsonb null,
  created_at      timestamptz not null default now()
);

comment on table public.lead_activity_logs is
  'Append-only audit timeline for every major lead action. created_at is stored in UTC; display layer converts to Asia/Riyadh.';

comment on column public.lead_activity_logs.actor_id is
  'Free-form actor identifier interpreted in context of actor_type. For admin/company_user it references public.users.id but no FK is enforced because logs must survive user deletion.';
