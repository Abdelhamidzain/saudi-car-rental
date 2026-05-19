import type { SupabaseClient } from "@supabase/supabase-js";
import { carModels } from "@/lib/data";
import { log } from "./seed-utils";

// Strip the brand prefix from the full name to get the model on its own.
// "Hyundai Accent" / "Hyundai" → "Accent"
function extractModel(fullName: string, brand: string): string {
  const trimmed = fullName.trim();
  if (trimmed.toLowerCase().startsWith(brand.toLowerCase())) {
    return trimmed.slice(brand.length).trim() || trimmed;
  }
  return trimmed;
}

export async function seedCars(supabase: SupabaseClient): Promise<void> {
  const { data: catRows, error: catErr } = await supabase
    .from("car_categories")
    .select("id, slug");
  if (catErr) throw new Error(`seedCars: category lookup: ${catErr.message}`);

  const catIdBySlug = new Map<string, string>();
  for (const row of catRows ?? []) catIdBySlug.set(row.slug, row.id);

  const rows = carModels.map((m) => {
    const category_id = catIdBySlug.get(m.category);
    if (!category_id) {
      throw new Error(
        `seedCars: car "${m.slug}" references unknown category "${m.category}". Seed categories first.`,
      );
    }
    return {
      slug: m.slug,
      brand: m.brand,
      brand_ar: m.brandAr,
      model: extractModel(m.nameEn, m.brand),
      model_ar: extractModel(m.nameAr, m.brandAr),
      year: m.year,
      category_id,
      seats: m.seats,
      transmission: m.transmission.toLowerCase(), // CHECK: 'automatic' | 'manual'
      fuel_type: m.fuel.toLowerCase(),
      features_json: m.features,
      description_ar: m.description,
      status: "active" as const,
    };
  });

  const { error } = await supabase
    .from("cars")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`seedCars: ${error.message}`);

  log("cars", `upserted ${rows.length}`);
}
