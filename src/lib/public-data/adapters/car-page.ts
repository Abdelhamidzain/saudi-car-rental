/**
 * Car-detail-page DB overlay adapter (Task 6.2D).
 *
 * Returns ONLY the city/category/car identity scalars the car-detail public
 * page renders, in the camelCase shape the existing JSX consumes. The page
 * combines this overlay with the static `data.ts` rows via `??` chains — so:
 *
 *   - DB up, all three rows visible → overlay applies, visible text reflects DB.
 *   - DB down OR any of city/category/car unpublished/archived → returns null,
 *     page falls back fully to `data.ts`.
 *
 * Pricing stays on static (Task 6.2D scope decision):
 *   - `car.dailyPrice` / `car.monthlyPrice` continue to come from `data.ts`.
 *   - Product JSON-LD `lowPrice` / `highPrice` continue to come from `data.ts`.
 *   - `generateCarSEOContent(car, city, cat)` continues to receive the static
 *     rows, so the SEO content blocks (hero subtitle, pricing details,
 *     why-this-car, city-tips) remain stable when DB matches static.
 *   - Live offers ranking + Product price migration is a separate sub-task.
 *
 * Three-side-missing rule: if any of the city, category, or car row is
 * unavailable in DB, the adapter returns null and the page falls back fully
 * to static. This avoids mixing a DB city/category name with a static car
 * name (or any other inconsistent combination) on the same page.
 *
 * `carNameAr` is composed as `${brand_ar} ${model_ar}` to match the static
 * `CarModel.nameAr` format ("هيونداي اكسنت" etc.).
 */

import "server-only";
import { getPublishedCityBySlug } from "@/lib/public-data/cities";
import { getActiveCarCategoryBySlug } from "@/lib/public-data/car-categories";
import { getActiveCarBySlug } from "@/lib/public-data/cars";

export type CarPageOverlay = {
  cityNameAr: string;
  cityNameEn: string;
  categoryNameAr: string;
  categoryNameEn: string;
  carBrand: string;
  carBrandAr: string;
  carModel: string;
  carModelAr: string;
  carNameAr: string;
  /** Nullable — DB column is nullable; page falls back to static when null. */
  carYear: number | null;
};

export async function getCarPageOverlayFromDb(
  citySlug: string,
  categorySlug: string,
  carSlug: string,
): Promise<CarPageOverlay | null> {
  if (!citySlug || !categorySlug || !carSlug) return null;
  try {
    const [city, category, car] = await Promise.all([
      getPublishedCityBySlug(citySlug),
      getActiveCarCategoryBySlug(categorySlug),
      getActiveCarBySlug(carSlug),
    ]);
    if (!city || !category || !car) return null;
    return {
      cityNameAr: city.name_ar,
      cityNameEn: city.name_en,
      categoryNameAr: category.name_ar,
      categoryNameEn: category.name_en,
      carBrand: car.brand,
      carBrandAr: car.brand_ar,
      carModel: car.model,
      carModelAr: car.model_ar,
      carNameAr: `${car.brand_ar} ${car.model_ar}`,
      carYear: car.year,
    };
  } catch (e) {
    console.error("[getCarPageOverlayFromDb] failed; page falls back to static", e);
    return null;
  }
}
