/**
 * Request-scoped Supabase server client bound to cookies.
 *
 * Used inside server components, server actions, and route handlers that need
 * to read the *authenticated* user's session. Distinct from
 * `getSupabaseAdminClient` (service role, bypasses RLS).
 *
 * This client respects RLS — but since MVP has no active policies, anything
 * it can do for an authenticated user is determined by app-side role checks
 * (see `require-role.ts`).
 */

import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export async function getSupabaseAuthClient(): Promise<SupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        // In some contexts (server components rendering), cookies are
        // read-only. The middleware handles refresh writes; here we swallow
        // the error so reads work even from RSC.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ignore
        }
      },
    },
  });
}
