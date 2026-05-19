/**
 * Calendar-date helpers in Asia/Riyadh.
 *
 * Saudi Arabia is UTC+3. JavaScript's `new Date().toISOString().split('T')[0]`
 * gives the UTC date, which can be a full day behind Riyadh during the
 * 21:00–24:00 UTC window. Pre-filling the public lead form's pickup date
 * with the UTC date — while the server validates against Riyadh date —
 * causes the server to reject "today in Riyadh" as if it were in the past.
 *
 * This module is import-safe from both client and server. No `server-only`
 * or Next.js imports — pure JavaScript / Intl.
 */

const ASIA_RIYADH_TZ = "Asia/Riyadh";

/**
 * Returns today's calendar date in Asia/Riyadh as `YYYY-MM-DD`.
 * Used by both the public lead form (client) and the server-side validator
 * so the two always agree on what "today" means.
 */
export function todayInRiyadh(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ASIA_RIYADH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const lookup: Record<string, string> = {};
  for (const p of parts) lookup[p.type] = p.value;
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}
