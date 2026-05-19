/**
 * Shared utilities for seed scripts.
 *
 * - Builds a service-role Supabase client from environment variables loaded
 *   by Node's `--env-file=.env.local` flag.
 * - Defines partner Arabic→English name and slug mapping (data decisions 2,
 *   3, 8 in the Task 2 brief).
 * - Defines per-partner price multipliers for demo variation.
 * - Phone normalization from `9665XXXXXXXX` → `+9665XXXXXXXX`.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function makeServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Run with `node --env-file=.env.local …` and ensure .env.local has the variable set.",
    );
  }
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Run with `node --env-file=.env.local …` and ensure .env.local has the variable set.",
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-application-name": "saudi-car-rental-seed" },
    },
  });
}

// --- Partner identity mapping ------------------------------------------------

export const PARTNER_EN_NAME: Record<string, string> = {
  "ثيب": "Theeb",
  "يلو": "Yelo",
  "لومي": "Lumi",
  "بادجت": "Budget",
  "هانكو": "Hanco",
  "سترونج": "Strong",
};

export const PARTNER_SLUG: Record<string, string> = {
  "ثيب": "theeb",
  "يلو": "yelo",
  "لومي": "lumi",
  "بادجت": "budget",
  "هانكو": "hanco",
  "سترونج": "strong",
};

// Per-partner price multiplier for demo variation. Indicative only.
export const PARTNER_PRICE_MULTIPLIER: Record<string, number> = {
  "ثيب": 1.0,
  "يلو": 1.05,
  "لومي": 0.98,
  "بادجت": 1.1,
  "هانكو": 1.03,
  "سترونج": 0.95,
};

// --- Phone normalization -----------------------------------------------------

// `9665XXXXXXXX` → `+9665XXXXXXXX`. The DB CHECK enforces the prefixed form.
export function normalizeSaudiPhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+9665")) return trimmed;
  if (trimmed.startsWith("9665")) return "+" + trimmed;
  throw new Error(
    `normalizeSaudiPhone: unrecognized phone format "${input}". Expected 9665XXXXXXXX or +9665XXXXXXXX.`,
  );
}

// --- Airport name synthesis --------------------------------------------------

export function synthesizeAirportEnName(slug: string): string {
  const capitalized = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return `${capitalized} International Airport`;
}

// --- Logging -----------------------------------------------------------------

export function log(table: string, msg: string): void {
  // eslint-disable-next-line no-console
  console.log(`[seed] ${table.padEnd(16)} ${msg}`);
}

export function warn(table: string, msg: string): void {
  // eslint-disable-next-line no-console
  console.warn(`[seed] ${table.padEnd(16)} WARN  ${msg}`);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
