/**
 * Category-page DB overlay adapter (Task 6.2C).
 *
 * Returns ONLY the city/category text labels the category public page renders,
 * in the camelCase shape the existing JSX consumes. The page combines this
 * overlay with the static `data.ts` city + category via `??` chains — so:
 *
 *   - DB up, both rows visible → overlay applies, visible text reflects DB.
 *   - DB down OR either side unpublished/archived → returns null, page falls
 *     back fully to `data.ts`.
 *
 * `generateLocalBusinessSchema` continues to receive the FULL static City
 * from `data.ts` (with lat/lng/partnerCount/description the DB doesn't have).
 * The car grid, `categoryGradients`, per-category Arabic intros (`descs`),
 * and `cat.minPrice` all stay on static — they're deliberately out of scope
 * for 6.2C and tracked under Task 6.2D / SEO-content refresh.
 *
 * One-side-missing rule: if EITHER the city row or the category row is
 * unavailable in DB, the adapter returns null and the page falls back fully
 * to static. This avoids mixing a DB city name with a static category name
 * (or vice versa) on the same page.
 */

import "server-only";
import { getPublishedCityBySlug } from "@/lib/public-data/cities";
import { getActiveCarCategoryBySlug } from "@/lib/public-data/car-categories";

export type CategoryPageOverlay = {
  cityNameAr: string;
  cityNameEn: string;
  categoryNameAr: string;
  categoryNameEn: string;
};

export async function getCategoryPageOverlayFromDb(
  citySlug: string,
  categorySlug: string,
): Promise<CategoryPageOverlay | null> {
  if (!citySlug || !categorySlug) return null;
  try {
    const [city, category] = await Promise.all([
      getPublishedCityBySlug(citySlug),
      getActiveCarCategoryBySlug(categorySlug),
    ]);
    if (!city || !category) return null;
    return {
      cityNameAr: city.name_ar,
      cityNameEn: city.name_en,
      categoryNameAr: category.name_ar,
      categoryNameEn: category.name_en,
    };
  } catch (e) {
    console.error("[getCategoryPageOverlayFromDb] failed; page falls back to static", e);
    return null;
  }
}
