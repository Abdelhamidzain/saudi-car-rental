/**
 * Saudi mobile phone normalizer.
 *
 * Accepts the common shapes a customer might type and returns a value matching
 * the DB constraint `^\+9665\d{8}$`. Returns null when the input cannot be
 * coerced to a valid Saudi mobile number.
 *
 * Accepted inputs (after stripping spaces, dashes, parens, dots, NBSP):
 *   05XXXXXXXX        → +9665XXXXXXXX
 *   5XXXXXXXX         → +9665XXXXXXXX
 *   00966 5XXXXXXXX   → +9665XXXXXXXX
 *   966 5XXXXXXXX     → +9665XXXXXXXX
 *  +966 5XXXXXXXX     → +9665XXXXXXXX
 *
 * Arabic-Indic digits (٠-٩, U+0660–U+0669) are converted to ASCII before
 * matching. Eastern-Arabic-Indic digits (Persian, U+06F0–U+06F9) are NOT
 * supported in MVP — Saudi keyboards use Arabic-Indic.
 *
 * Returns null for:
 *   - Non-mobile prefix (anything not starting with 5 after country code)
 *   - Wrong length
 *   - Non-Saudi country codes
 *   - Empty / unparseable input
 */

const ARABIC_INDIC_ZERO = 0x0660;
const ARABIC_INDIC_NINE = 0x0669;

function convertArabicDigits(input: string): string {
  let out = "";
  for (const char of input) {
    const code = char.codePointAt(0);
    if (
      code !== undefined &&
      code >= ARABIC_INDIC_ZERO &&
      code <= ARABIC_INDIC_NINE
    ) {
      out += String.fromCharCode(0x30 + (code - ARABIC_INDIC_ZERO));
    } else {
      out += char;
    }
  }
  return out;
}

export function normalizeSaudiPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;

  // 1. Normalize digits + strip formatting.
  const asciiDigits = convertArabicDigits(raw);
  const stripped = asciiDigits.replace(/[\s\-(). ]/g, "");

  // 2. Peel off the country prefix.
  let local: string;
  if (stripped.startsWith("+966")) {
    local = stripped.slice(4);
  } else if (stripped.startsWith("00966")) {
    local = stripped.slice(5);
  } else if (stripped.startsWith("966")) {
    local = stripped.slice(3);
  } else if (stripped.startsWith("0")) {
    local = stripped.slice(1);
  } else {
    local = stripped;
  }

  // 3. Local part must now be exactly 9 digits starting with 5.
  if (!/^5\d{8}$/.test(local)) return null;

  return `+966${local}`;
}
