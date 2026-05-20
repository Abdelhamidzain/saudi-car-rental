/**
 * City-page DB overlay adapter (Task 6.2B).
 *
 * Returns ONLY the few text/number fields the city public page renders, in
 * the camelCase shape the existing JSX already consumes. The page combines
 * this overlay with the static `data.ts` city via a `??` chain — so:
 *
 *   - DB up, row visible → overlay applies, visible text reflects DB.
 *   - DB down OR row unpublished/archived → returns null, page falls back
 *     fully to `data.ts`.
 *
 * `generateLocalBusinessSchema` continues to receive the FULL static City
 * from `data.ts` (with lat/lng/partnerCount/description that the DB doesn't
 * have). JSON-LD output is unaffected by this adapter — by design.
 *
 * Deliberate non-overlays for this sub-task (deferred):
 *   - seo_title_ar / seo_description_ar — content shift, separate task.
 *   - partnerCount, description, lat, lng — no DB columns.
 *   - airports / partners / categories / car models / city guides — cross-
 *     entity migration, deferred to later 6.2 sub-tasks.
 */

import "server-only";
import { getPublishedCityBySlug } from "@/lib/public-data/cities";

export type CityPageOverlay = {
  cityNameAr: string;
  cityNameEn: string;
  /**
   * Indicative starts-from price for the city, or null when the DB row
   * doesn't have one yet. The page falls back to the static city's
   * `minPrice` in that case.
   */
  cityMinPrice: number | null;
};

export async function getCityPageOverlayFromDb(
  slug: string,
): Promise<CityPageOverlay | null> {
  if (!slug) return null;
  try {
    const city = await getPublishedCityBySlug(slug);
    if (!city) return null;
    return {
      cityNameAr: city.name_ar,
      cityNameEn: city.name_en,
      cityMinPrice: city.min_price_from,
    };
  } catch (e) {
    console.error("[getCityPageOverlayFromDb] failed; page falls back to static", e);
    return null;
  }
}
