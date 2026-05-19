/**
 * Strip URLs out of `customer_notes` and replace them with the Arabic
 * placeholder "[رابط محذوف]" (link removed).
 *
 * Rules:
 *   - Matches `http://…` and `https://…` (greedy until next whitespace).
 *   - Matches bare `www.…` ONLY when it starts at the beginning of the
 *     string or follows a whitespace character — so embedded text like
 *     `awww.example` is left alone.
 *   - Never throws. Never rejects. The submission still succeeds; we only
 *     replace the link substring. Admin sees the placeholder and can ask
 *     the customer for clarification.
 *
 * Pure function — no DB, no I/O. Tested independently in the smoke test.
 */

const URL_REPLACEMENT = "[رابط محذوف]";

// One pattern, two alternatives:
//   1. https?://…  — protocol-prefixed URLs anywhere
//   2. (?<!\S)www\.…  — bare www that isn't part of a longer word
const URL_REGEX = /https?:\/\/\S+|(?<!\S)www\.\S+/gi;

export function stripUrlsFromNotes(input: string): string {
  if (!input) return input;
  return input.replace(URL_REGEX, URL_REPLACEMENT);
}
