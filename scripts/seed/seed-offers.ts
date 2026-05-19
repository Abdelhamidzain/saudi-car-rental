/**
 * Seeds the `offers` table.
 *
 * Weekly price policy (IMPORTANT — read before changing):
 *
 *   weekly_price_from = round(daily_price_from × 7 × 0.85, 2)
 *
 * This 15%-weekly-discount formula is BOOTSTRAP/DEMO SEED DATA ONLY. It is
 * applied here, once, at seed time, to give every offer a plausible starting
 * weekly price.
 *
 * It is NOT a business rule:
 *   - There is no DB trigger, no generated column, and no application
 *     constant enforcing this relationship.
 *   - `offers.weekly_price_from` is a plain editable field. The stored value
 *     is the source of truth — the app must read it, not recompute it from
 *     `daily_price_from`.
 *   - Admins can override `weekly_price_from` from the admin dashboard.
 *     Future company-dashboard users may also be able to suggest or update
 *     weekly prices, subject to approval rules.
 *   - If `daily_price_from` is later edited, `weekly_price_from` does NOT
 *     change automatically. Any re-derivation must be a deliberate admin
 *     action.
 *
 * Re-running this seed will not overwrite an existing offer's weekly price:
 * the seed is lookup-then-insert keyed on
 * (company_id, branch_id, car_id, city_id), so edits made via the admin
 * dashboard survive subsequent seed runs.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { carModels, partners } from "@/lib/data";
import {
  log,
  PARTNER_PRICE_MULTIPLIER,
  PARTNER_SLUG,
  round2,
} from "./seed-utils";

export interface SeedOffersResult {
  inserted: number;
  existed: number;
}

interface BranchRow {
  id: string;
  company_id: string;
  city_id: string;
}

export async function seedOffers(
  supabase: SupabaseClient,
): Promise<SeedOffersResult> {
  const now = new Date().toISOString();

  // ---- lookups -------------------------------------------------------------

  const { data: cityRows, error: cityErr } = await supabase
    .from("cities")
    .select("id, slug");
  if (cityErr) throw new Error(`seedOffers: city lookup: ${cityErr.message}`);
  const cityIdBySlug = new Map<string, string>();
  for (const row of cityRows ?? []) cityIdBySlug.set(row.slug, row.id);

  const { data: companyRows, error: companyErr } = await supabase
    .from("companies")
    .select("id, slug");
  if (companyErr)
    throw new Error(`seedOffers: company lookup: ${companyErr.message}`);
  const companyIdBySlug = new Map<string, string>();
  for (const row of companyRows ?? []) companyIdBySlug.set(row.slug, row.id);

  const { data: carRows, error: carErr } = await supabase
    .from("cars")
    .select("id, slug");
  if (carErr) throw new Error(`seedOffers: car lookup: ${carErr.message}`);
  const carIdBySlug = new Map<string, string>();
  for (const row of carRows ?? []) carIdBySlug.set(row.slug, row.id);

  const { data: branchRows, error: branchErr } = await supabase
    .from("branches")
    .select("id, company_id, city_id");
  if (branchErr)
    throw new Error(`seedOffers: branch lookup: ${branchErr.message}`);
  const branchIdByCompanyCity = new Map<string, string>();
  for (const row of (branchRows ?? []) as BranchRow[]) {
    branchIdByCompanyCity.set(`${row.company_id}::${row.city_id}`, row.id);
  }

  // ---- existing offers (composite-key set) ---------------------------------

  const { data: existingOffers, error: existingErr } = await supabase
    .from("offers")
    .select("company_id, branch_id, car_id, city_id");
  if (existingErr)
    throw new Error(`seedOffers: existing lookup: ${existingErr.message}`);

  const existingSet = new Set<string>();
  for (const row of existingOffers ?? []) {
    existingSet.add(
      `${row.company_id}::${row.branch_id}::${row.car_id}::${row.city_id}`,
    );
  }

  // ---- build candidate rows ------------------------------------------------

  const candidates: Array<{
    company_id: string;
    branch_id: string;
    car_id: string;
    city_id: string;
    daily_price_from: number;
    weekly_price_from: number;
    monthly_price_from: number;
    price_status: "starts_from";
    availability_status: "needs_confirmation";
    approval_status: "auto_approved";
    public_status: "published";
    status: "active";
    last_updated_at: string;
  }> = [];

  let existed = 0;

  for (const partner of partners) {
    const companySlug = PARTNER_SLUG[partner.name];
    const company_id = companySlug
      ? companyIdBySlug.get(companySlug)
      : undefined;
    if (!company_id) {
      throw new Error(
        `seedOffers: company for partner "${partner.name}" not found. Seed companies first.`,
      );
    }
    const multiplier = PARTNER_PRICE_MULTIPLIER[partner.name] ?? 1.0;

    for (const citySlug of partner.cities) {
      const city_id = cityIdBySlug.get(citySlug);
      if (!city_id) continue; // unsupported city, already warned in seedBranches

      const branch_id = branchIdByCompanyCity.get(`${company_id}::${city_id}`);
      if (!branch_id) {
        throw new Error(
          `seedOffers: no branch for company "${partner.name}" + city "${citySlug}". Seed branches first.`,
        );
      }

      for (const car of carModels) {
        const car_id = carIdBySlug.get(car.slug);
        if (!car_id) {
          throw new Error(
            `seedOffers: car "${car.slug}" not found. Seed cars first.`,
          );
        }

        const key = `${company_id}::${branch_id}::${car_id}::${city_id}`;
        if (existingSet.has(key)) {
          existed++;
          continue;
        }

        const daily = round2(car.dailyPrice * multiplier);
        const monthly = round2(car.monthlyPrice * multiplier);
        // Bootstrap/demo seed value only — 15% weekly discount applied
        // once at seed time. NOT a business rule. The stored value is
        // the source of truth and is editable by admins. See file header.
        const weekly = round2(daily * 7 * 0.85);

        candidates.push({
          company_id,
          branch_id,
          car_id,
          city_id,
          daily_price_from: daily,
          weekly_price_from: weekly,
          monthly_price_from: monthly,
          price_status: "starts_from",
          availability_status: "needs_confirmation",
          approval_status: "auto_approved",
          public_status: "published",
          status: "active",
          last_updated_at: now,
        });
      }
    }
  }

  // ---- batched insert ------------------------------------------------------

  let inserted = 0;
  const BATCH = 500;
  for (let i = 0; i < candidates.length; i += BATCH) {
    const slice = candidates.slice(i, i + BATCH);
    const { error: insErr } = await supabase.from("offers").insert(slice);
    if (insErr) throw new Error(`seedOffers: insert batch: ${insErr.message}`);
    inserted += slice.length;
  }

  log("offers", `inserted ${inserted}  existed ${existed}`);
  return { inserted, existed };
}
