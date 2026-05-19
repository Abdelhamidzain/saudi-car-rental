-- =============================================================================
-- Migration: 20260519000007_create_users
-- Purpose:   Application-level users table.
--
-- public.users.id references auth.users.id 1:1. A new auth.users row triggers
-- creation of a matching public.users row with role = 'viewer'. The first
-- owner role is upgraded manually via SQL in Supabase Studio after sign-up.
--
-- company_id and branch_id are optional and reserved for Phase 2 (company
-- dashboards). In MVP they remain null for all admin/editor/viewer accounts.
-- =============================================================================

create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        citext not null unique,
  name         text null,
  phone        text null,
  role         public.user_role   not null default 'viewer',
  company_id   uuid null references public.companies(id) on delete set null,
  branch_id    uuid null references public.branches(id)  on delete set null,
  status       public.user_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.users is
  'Application-level user profile. Extends auth.users 1:1. role defaults to viewer; first owner is promoted manually.';

comment on column public.users.company_id is
  'Phase-2 hook for company dashboard scoping. Null for admin/editor/viewer accounts in MVP.';

comment on column public.users.branch_id is
  'Phase-2 hook for branch-scoped roles (branch_manager, sales_agent). Null in MVP.';
