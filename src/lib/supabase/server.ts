/**
 * Server-side Supabase client.
 *
 * This is the PRIMARY Supabase access path in the MVP. It uses the service
 * role key, which bypasses Row Level Security. NEVER import this from client
 * code — the service role key must never reach the browser.
 *
 * Used by:
 *   - React Server Components (RSC) rendering public pages
 *   - Server actions (lead creation, admin operations)
 *   - Route handlers (server-side webhooks, future automation)
 *
 * Auth/role enforcement for admin actions happens in application code:
 *   1. Authenticate the user via Supabase Auth (cookies in the request)
 *   2. Look up their role in public.users
 *   3. Decide whether to proceed
 *
 * The client itself does not enforce roles — it's a privileged service-role
 * client. Caller discipline is what keeps customer data safe.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Returns a singleton Supabase client configured with the service role key.
 * Safe to call from any server-only context (RSC, server actions, route
 * handlers). NEVER call from a `"use client"` module.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local (see .env.example).",
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local (see .env.example). " +
        "This key is server-only and must never be exposed to the browser.",
    );
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      // Server-side client: no session persistence, no auto refresh.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-application-name": "saudi-car-rental-server",
      },
    },
  });

  return cachedClient;
}
