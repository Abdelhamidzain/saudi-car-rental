/**
 * Seed orchestrator — populates the new saudi-car-rental Supabase project
 * with the static data currently shipped in `src/lib/data.ts`.
 *
 * Run with:
 *
 *     npm run db:seed
 *
 * which expands to:
 *
 *     node --env-file=.env.local --import tsx scripts/seed.ts
 *
 * Idempotent. Safe to run repeatedly. Pre-run row counts == post-run row
 * counts on a no-op re-run.
 *
 * Order matters because of FK references:
 *   cities → airports
 *   car_categories → cars
 *   companies → branches → offers
 */

import { makeServiceClient } from "./seed/seed-utils";
import { seedCities } from "./seed/seed-cities";
import { seedAirports } from "./seed/seed-airports";
import { seedCarCategories } from "./seed/seed-car-categories";
import { seedCars } from "./seed/seed-cars";
import { seedCompanies } from "./seed/seed-companies";
import { seedBranches } from "./seed/seed-branches";
import { seedOffers } from "./seed/seed-offers";

async function main(): Promise<void> {
  const t0 = Date.now();
  const supabase = makeServiceClient();

  await seedCities(supabase);
  await seedAirports(supabase);
  await seedCarCategories(supabase);
  await seedCars(supabase);
  await seedCompanies(supabase);
  await seedBranches(supabase);
  await seedOffers(supabase);

  const seconds = ((Date.now() - t0) / 1000).toFixed(2);
  // eslint-disable-next-line no-console
  console.log(`[seed] done in ${seconds}s`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] FAILED", err);
  process.exit(1);
});
