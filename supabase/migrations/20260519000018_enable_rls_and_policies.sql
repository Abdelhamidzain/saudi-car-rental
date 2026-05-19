-- =============================================================================
-- Migration: 20260519000018_enable_rls_and_policies
-- Purpose:   Strict-by-default Row Level Security.
--
-- Policy stance (per project decision #2):
--   - RLS is ENABLED on every table.
--   - NO CREATE POLICY statements are activated in MVP.
--   - All public page reads happen via Next.js server-side queries using
--     SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
--   - All admin actions happen via authenticated server actions also using
--     SUPABASE_SERVICE_ROLE_KEY, with role checks done in app code against
--     public.users.role.
--   - RLS is defense-in-depth, not the primary auth layer.
--   - The browser/anon Supabase client is prepared (browser.ts) but is NOT
--     used for reads in MVP.
--
-- Future policies (Phase 2 company dashboards, optional anon reads) are
-- included BELOW AS COMMENTS so they can be enabled deliberately without
-- having to re-derive them.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------

alter table public.cities                   enable row level security;
alter table public.airports                 enable row level security;
alter table public.companies                enable row level security;
alter table public.branches                 enable row level security;
alter table public.users                    enable row level security;
alter table public.car_categories           enable row level security;
alter table public.cars                     enable row level security;
alter table public.offers                   enable row level security;
alter table public.leads                    enable row level security;
alter table public.lead_company_routing     enable row level security;
alter table public.lead_customer_followups  enable row level security;
alter table public.lead_activity_logs       enable row level security;
alter table public.company_quality_metrics  enable row level security;

-- ===========================================================================
-- =====  END OF ACTIVE POLICY STATEMENTS  ===================================
-- ===========================================================================
--
-- Everything below is commented-out scaffolding for FUTURE policy work.
-- Do not uncomment without an explicit decision logged in 16_DECISION_LOG.md.
--
-- ---------------------------------------------------------------------------
-- FUTURE POLICY GROUP A — Public anon SELECT on customer-facing reference data
-- ---------------------------------------------------------------------------
-- Enable these ONLY if/when we decide to move public reads from server-side
-- queries to client-side queries. In MVP, server-side queries with the
-- service role key bypass RLS and are the only access path.
--
-- create policy "anon_select_published_cities"
--   on public.cities for select to anon
--   using (status = 'active' and public_status = 'published');
--
-- create policy "anon_select_published_airports"
--   on public.airports for select to anon
--   using (status = 'active' and public_status = 'published');
--
-- create policy "anon_select_published_car_categories"
--   on public.car_categories for select to anon
--   using (status = 'active');
--
-- create policy "anon_select_published_cars"
--   on public.cars for select to anon
--   using (status = 'active');
--
-- create policy "anon_select_published_companies"
--   on public.companies for select to anon
--   using (status = 'active' and public_status = 'published');
--
-- create policy "anon_select_published_offers"
--   on public.offers for select to anon
--   using (
--     status = 'active'
--     and public_status = 'published'
--     and approval_status in ('approved', 'auto_approved')
--   );
--
-- ---------------------------------------------------------------------------
-- FUTURE POLICY GROUP B — Authenticated admin/editor full access
-- ---------------------------------------------------------------------------
-- Enable these when we move from server-action-with-service-role to
-- direct authenticated queries from the admin dashboard. Helper function
-- public.auth_role() is already defined in the functions migration.
--
-- create policy "admin_full_access_leads"
--   on public.leads for all to authenticated
--   using (public.auth_role() in ('owner', 'admin'))
--   with check (public.auth_role() in ('owner', 'admin'));
--
-- (Repeat the pattern above for each operational table:
--    lead_company_routing, lead_customer_followups, lead_activity_logs,
--    companies, branches, cars, offers, company_quality_metrics, users.)
--
-- ---------------------------------------------------------------------------
-- FUTURE POLICY GROUP C — Company-scoped access for Phase 2 company dashboards
-- ---------------------------------------------------------------------------
-- Enable these when the company dashboard is built. Company users may only
-- see leads assigned to their own company.
--
-- create policy "company_user_select_assigned_leads"
--   on public.leads for select to authenticated
--   using (
--     public.auth_role() in ('company_owner', 'branch_manager', 'sales_agent')
--     and assigned_company_id = (
--       select company_id from public.users where id = auth.uid()
--     )
--   );
--
-- create policy "company_user_select_own_company"
--   on public.companies for select to authenticated
--   using (
--     public.auth_role() in ('company_owner', 'branch_manager', 'sales_agent')
--     and id = (select company_id from public.users where id = auth.uid())
--   );
--
-- (Repeat for branches, offers, lead_company_routing, lead_customer_followups
-- with appropriate company/branch scoping.)
--
-- ===========================================================================
