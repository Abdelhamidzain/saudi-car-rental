import type { SupabaseClient } from "@supabase/supabase-js";
import { categories } from "@/lib/data";
import { log } from "./seed-utils";

export async function seedCarCategories(
  supabase: SupabaseClient,
): Promise<void> {
  const rows = categories.map((c, i) => ({
    slug: c.slug,
    name_ar: c.nameAr,
    name_en: c.nameEn,
    icon: c.icon,
    sort_order: (i + 1) * 10,
    status: "active" as const,
  }));

  const { error } = await supabase
    .from("car_categories")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`seedCarCategories: ${error.message}`);

  log("car_categories", `upserted ${rows.length}`);
}
