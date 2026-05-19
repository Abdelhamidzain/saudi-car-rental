import type { SupabaseClient } from "@supabase/supabase-js";
import { partners } from "@/lib/data";
import { log, PARTNER_EN_NAME, PARTNER_SLUG } from "./seed-utils";

export async function seedCompanies(supabase: SupabaseClient): Promise<void> {
  const rows = partners.map((p) => {
    const slug = PARTNER_SLUG[p.name];
    const name_en = PARTNER_EN_NAME[p.name];
    if (!slug || !name_en) {
      throw new Error(
        `seedCompanies: partner "${p.name}" has no English/slug mapping in seed-utils.ts`,
      );
    }
    const rating = parseFloat(p.rating);
    return {
      slug,
      name_ar: p.name,
      name_en,
      rating_snapshot: Number.isFinite(rating) ? rating : null,
      reviews_count_snapshot: null,
      trust_level: "new_partner" as const,
      public_status: "published" as const,
      status: "active" as const,
      internal_notes:
        "Seeded from static data. Phone is bootstrap data, not verified.",
    };
  });

  const { error } = await supabase
    .from("companies")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`seedCompanies: ${error.message}`);

  log("companies", `upserted ${rows.length}`);
}
