/**
 * Lead-form rate limiter.
 *
 * Single check at lead-creation time: how many leads has this IP submitted
 * in the last hour? If we're already at the cap, refuse the new lead. The
 * limiter is a defensive cap against bots; honest users won't realistically
 * see it.
 *
 * Storage is the existing `public.leads` table — no new infrastructure.
 * The query uses the existing `idx_leads_consent_ip_created_at` (added in
 * migration `…017_create_indexes.sql`) so the check is sub-millisecond on
 * MVP-scale data.
 *
 * If consent_ip is null (header missing / proxy stripped it) the check is
 * skipped — we don't punish customers for missing data we couldn't extract.
 */

import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/** Maximum leads accepted from a single IP per rolling hour. */
const MAX_LEADS_PER_IP_PER_HOUR = 10;

/** Rolling window for the rate-limit check. */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "ip_too_many" };

export async function checkLeadRateLimit(input: { ip: string | null }): Promise<RateLimitResult> {
  if (!input.ip) return { ok: true };

  const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await getSupabaseAdminClient()
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("consent_ip", input.ip)
    .gte("created_at", sinceIso);

  if (error) {
    // Fail open: never block a legitimate user because OUR query failed.
    console.error("[checkLeadRateLimit] query failed (fail-open)", error);
    return { ok: true };
  }

  if ((count ?? 0) >= MAX_LEADS_PER_IP_PER_HOUR) {
    console.warn("[checkLeadRateLimit] blocked", {
      ip: input.ip,
      count,
      cap: MAX_LEADS_PER_IP_PER_HOUR,
    });
    return { ok: false, reason: "ip_too_many" };
  }

  return { ok: true };
}
