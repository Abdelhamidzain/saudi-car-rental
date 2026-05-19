/**
 * Browser-side Supabase client.
 *
 * **NOT USED FOR READS IN MVP.** Public pages and admin pages both fetch data
 * via server-side queries in the MVP (decision #2 / decision #11). This file
 * exists so that when we later want client-side reads or authenticated
 * client-side mutations (e.g. real-time subscriptions in the admin dashboard),
 * the wiring is already in place.
 *
 * Uses the anon key and is therefore subject to Row Level Security. Today RLS
 * is enabled on every table with NO active policies, so this client cannot
 * read any application data — by design.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Returns a singleton browser Supabase client. Safe to call from client
 * components. Currently unused in MVP code — kept for future client-side
 * features.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example.",
    );
  }

  cachedClient = createBrowserClient<Database>(url, anonKey);
  return cachedClient;
}
