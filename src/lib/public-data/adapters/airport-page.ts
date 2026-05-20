/**
 * Airport-page DB overlay adapter (Task 6.2A).
 *
 * Returns ONLY the few text fields the airport public page renders, in the
 * camelCase shape the existing JSX already consumes. The page combines this
 * overlay with the static `data.ts` airport/city via a `??` chain — so:
 *
 *   - DB up, row visible → overlay applies, visible text reflects DB.
 *   - DB down OR row unpublished OR parent city unpublished → returns null,
 *     page falls back fully to `data.ts`.
 *
 * `generateLocalBusinessSchema` continues to receive the FULL static City
 * from `data.ts` (with lat/lng/partnerCount/nameEn that the DB doesn't have).
 * JSON-LD output is unaffected by this adapter — by design.
 */

import "server-only";
import { getPublishedAirportBySlug } from "@/lib/public-data/airports";
import { getPublishedCityById } from "@/lib/public-data/cities";

export type AirportPageOverlay = {
  airportNameAr: string;
  airportCode: string;
  cityNameAr: string;
  /**
   * Indicative starts-from price for the city, or null when the DB row
   * doesn't have one yet. The page falls back to the static city's
   * `minPrice` in that case.
   */
  cityMinPrice: number | null;
};

export async function getAirportPageOverlayFromDb(
  slug: string,
): Promise<AirportPageOverlay | null> {
  if (!slug) return null;
  try {
    const airport = await getPublishedAirportBySlug(slug);
    if (!airport) return null;
    const city = await getPublishedCityById(airport.city_id);
    if (!city) return null;
    return {
      airportNameAr: airport.name_ar,
      airportCode: airport.code,
      cityNameAr: city.name_ar,
      cityMinPrice: city.min_price_from,
    };
  } catch (e) {
    console.error("[getAirportPageOverlayFromDb] failed; page falls back to static", e);
    return null;
  }
}
