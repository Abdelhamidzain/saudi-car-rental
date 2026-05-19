-- =============================================================================
-- Migration: 20260519000019_harden_function_security
-- Purpose:   Address non-breaking Supabase security advisor warnings.
--
-- Two hardening steps:
--
--   1. Pin search_path on the two trigger functions that did not already
--      declare one (set_updated_at, generate_lead_number). This closes the
--      "function_search_path_mutable" advisor warning. The other two
--      functions (handle_new_user, auth_role) already pin search_path.
--
--   2. Revoke EXECUTE on every public.* function we own from the public,
--      anon, and authenticated roles, so none of them are reachable via
--      PostgREST RPC (POST /rest/v1/rpc/<fn>). Trigger functions still
--      fire normally — trigger execution does NOT check EXECUTE on the
--      function for the row's inserting/updating role.
--
--      auth_role() is intentionally locked down too; when RLS policies that
--      depend on it are later activated, EXECUTE will be re-granted in the
--      same migration that enables those policies.
--
-- Not addressed in this migration (deferred):
--   - citext extension lives in the public schema. Moving it later requires
--     dropping and recreating public.users.email (citext type), so it is
--     deferred to a future hardening pass.
-- =============================================================================

-- 1. Pin search_path -----------------------------------------------------------

alter function public.set_updated_at()       set search_path = public;
alter function public.generate_lead_number() set search_path = public;

-- 2. Revoke PostgREST RPC exposure --------------------------------------------

revoke execute on function public.set_updated_at()       from public, anon, authenticated;
revoke execute on function public.generate_lead_number() from public, anon, authenticated;
revoke execute on function public.handle_new_user()      from public, anon, authenticated;
revoke execute on function public.auth_role()            from public, anon, authenticated;
