/**
 * Admin Supabase client.
 *
 * Re-exports the server client under a name that makes intent clear in code
 * reviews: any file importing from "@/lib/supabase/admin" is expected to be
 * an admin-only path. Behaviour is identical to `getSupabaseServerClient`.
 *
 * Caller is still responsible for verifying the authenticated user's role
 * (`owner` or `admin`) before performing admin operations.
 */

export { getSupabaseServerClient as getSupabaseAdminClient } from "./server";
