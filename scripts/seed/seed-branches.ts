import type { SupabaseClient } from "@supabase/supabase-js";
import { partners } from "@/lib/data";
import {
  log,
  normalizeSaudiPhone,
  PARTNER_SLUG,
  warn,
} from "./seed-utils";

export interface SeedBranchesResult {
  inserted: number;
  existed: number;
  skippedCities: string[];
}

export async function seedBranches(
  supabase: SupabaseClient,
): Promise<SeedBranchesResult> {
  const { data: cityRows, error: cityErr } = await supabase
    .from("cities")
    .select("id, slug");
  if (cityErr) throw new Error(`seedBranches: city lookup: ${cityErr.message}`);
  const cityIdBySlug = new Map<string, string>();
  for (const row of cityRows ?? []) cityIdBySlug.set(row.slug, row.id);

  const { data: companyRows, error: companyErr } = await supabase
    .from("companies")
    .select("id, slug");
  if (companyErr)
    throw new Error(`seedBranches: company lookup: ${companyErr.message}`);
  const companyIdBySlug = new Map<string, string>();
  for (const row of companyRows ?? []) companyIdBySlug.set(row.slug, row.id);

  let inserted = 0;
  let existed = 0;
  const skippedCitiesSet = new Set<string>();

  for (const partner of partners) {
    const companySlug = PARTNER_SLUG[partner.name];
    const company_id = companySlug
      ? companyIdBySlug.get(companySlug)
      : undefined;
    if (!company_id) {
      throw new Error(
        `seedBranches: company for partner "${partner.name}" not found. Seed companies first.`,
      );
    }

    // is_main_branch flag goes on the alphabetically first VALID city per company.
    const validCitiesForPartner = partner.cities
      .filter((slug) => {
        if (!cityIdBySlug.has(slug)) {
          skippedCitiesSet.add(slug);
          return false;
        }
        return true;
      })
      .slice()
      .sort();

    const mainCitySlug = validCitiesForPartner[0];

    for (const citySlug of validCitiesForPartner) {
      const city_id = cityIdBySlug.get(citySlug)!;
      const whatsapp = normalizeSaudiPhone(partner.phone);

      // Lookup-then-insert for idempotency: one branch per (company_id, city_id).
      const { data: existing, error: lookupErr } = await supabase
        .from("branches")
        .select("id")
        .eq("company_id", company_id)
        .eq("city_id", city_id)
        .limit(1)
        .maybeSingle();
      if (lookupErr)
        throw new Error(`seedBranches: lookup: ${lookupErr.message}`);

      if (existing) {
        existed++;
        continue;
      }

      const { error: insertErr } = await supabase.from("branches").insert({
        company_id,
        city_id,
        district: null,
        phone: whatsapp,
        whatsapp_number: whatsapp,
        is_main_branch: citySlug === mainCitySlug,
        status: "active" as const,
      });
      if (insertErr)
        throw new Error(`seedBranches: insert: ${insertErr.message}`);
      inserted++;
    }
  }

  const skippedCities = Array.from(skippedCitiesSet).sort();
  for (const slug of skippedCities) {
    warn("branches", `skipped unsupported partner city "${slug}"`);
  }

  log(
    "branches",
    `inserted ${inserted}  existed ${existed}` +
      (skippedCities.length
        ? `  (skipped cities: ${skippedCities.join(", ")})`
        : ""),
  );

  return { inserted, existed, skippedCities };
}
