import type { SupabaseClient } from "@supabase/supabase-js";
import { cities } from "@/lib/data";
import { log } from "./seed-utils";

export async function seedCities(supabase: SupabaseClient): Promise<void> {
  const rows = cities.map((c, i) => ({
    slug: c.slug,
    name_ar: c.nameAr,
    name_en: c.nameEn,
    priority: i + 1,
    display_order: (i + 1) * 10,
    min_price_from: c.minPrice,
    status: "active" as const,
    public_status: "published" as const,
  }));

  const { error } = await supabase
    .from("cities")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`seedCities: ${error.message}`);

  log("cities", `upserted ${rows.length}`);
}
