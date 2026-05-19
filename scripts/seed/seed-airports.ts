import type { SupabaseClient } from "@supabase/supabase-js";
import { airports } from "@/lib/data";
import { log, synthesizeAirportEnName } from "./seed-utils";

export async function seedAirports(supabase: SupabaseClient): Promise<void> {
  const { data: cityRows, error: cityErr } = await supabase
    .from("cities")
    .select("id, slug");
  if (cityErr) throw new Error(`seedAirports: city lookup: ${cityErr.message}`);

  const cityIdBySlug = new Map<string, string>();
  for (const row of cityRows ?? []) cityIdBySlug.set(row.slug, row.id);

  const rows = airports.map((a, i) => {
    const city_id = cityIdBySlug.get(a.citySlug);
    if (!city_id) {
      throw new Error(
        `seedAirports: airport "${a.code}" references unknown citySlug "${a.citySlug}". Seed cities first.`,
      );
    }
    return {
      code: a.code,
      slug: a.slug,
      city_id,
      name_ar: a.nameAr,
      name_en: synthesizeAirportEnName(a.slug),
      priority: i + 1,
      display_order: (i + 1) * 10,
      status: "active" as const,
      public_status: "published" as const,
    };
  });

  const { error } = await supabase
    .from("airports")
    .upsert(rows, { onConflict: "code" });
  if (error) throw new Error(`seedAirports: ${error.message}`);

  log("airports", `upserted ${rows.length}`);
}
