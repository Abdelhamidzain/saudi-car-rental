/**
 * SEO / Sitemap / Structured Data regression sweep (Task 6.3 + Task 7).
 *
 * Usage:
 *   npm run seo:check                              # local, read-only
 *   npm run seo:check -- --fallback                # local + opt-in DB pass
 *   BASE=https://my-site.vercel.app npm run seo:check   # remote (e.g. Vercel)
 *
 * When BASE is set:
 *   - Skips the local prod-server boot (target is already remote).
 *   - Skips the .next/prerender-manifest.json route-count check (it's a
 *     local-only build artefact; doesn't exist on Vercel's runner).
 *   - Replaces the manifest check with a sanity sweep: fetch 5 evenly-spaced
 *     sitemap URLs and assert each returns 200 (catches deploy-time route
 *     drift even without access to the build manifest).
 *   - All other assertions (metadata, JSON-LD, privacy) run unchanged.
 *
 * When BASE is unset:
 *   - Original local behaviour: boot/reuse a prod server on PORT=3299, run
 *     all assertions against http://localhost:3299, including the prerender
 *     manifest check.
 *
 * --fallback works in both modes BUT mutates the DB connected to the env
 * vars in .env.local. **Do not pair --fallback with a production BASE
 * unless that's truly intended** — the script prints a confirmation prompt
 * to stderr if it detects this combo.
 *
 * What it asserts (default, read-only):
 *   1. Build baseline: 236 prerendered routes (from .next/prerender-manifest.json).
 *   2. Sitemap: 231 entries, no duplicates, all absolute URLs.
 *   3. Metadata patterns on 13 representative routes:
 *      - <title>, OG/Twitter title+description, canonical
 *      - Arabic title patterns (city / category / car / airport)
 *      - No "تأجير سيارات ب" wording (Task 6.2B `9090d39` invariant)
 *   4. JSON-LD per route:
 *      - WebSite + Organization on every public route (Task 6.2X invariant)
 *      - Exactly one LocalBusiness on home / city / category / airport
 *      - Zero LocalBusiness on /about, /contact, /privacy, car detail
 *      - No "الرياض" in LocalBusiness.name on non-Riyadh routes (no Riyadh leak)
 *      - Product schema on car-detail with static lowPrice/highPrice
 *        (proves pricing wasn't accidentally migrated)
 *      - Breadcrumb item names match overlay
 *   5. Public privacy: no whatsapp_number, internal_notes, trust_level,
 *      approval_status, consent_ip, customer_phone, customer_email,
 *      lead_activity_logs, auth.users in rendered HTML.
 *
 * Opt-in --fallback pass:
 *   Flips one row at a time (city public_status=draft, category status=archived,
 *   car status=archived), curls 4 affected URLs, asserts each renders cleanly,
 *   restores. Restoration is in try/finally; if restoration fails, the script
 *   prints rollback SQL and exits non-zero.
 *
 * Server bootstrap:
 *   If a prod server isn't already listening on PORT (default 3299), the
 *   script runs `npm run build` (if .next/BUILD_ID missing) and spawns
 *   `npm run start` on that port. The spawned server is killed on exit.
 *
 * Exits 0 on all PASS, non-zero on any failure.
 */

import { spawn, execSync, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import { createClient } from "@supabase/supabase-js";

// ─── Config ──────────────────────────────────────────────────────────────
const PORT = Number(process.env.SEO_CHECK_PORT ?? 3299);
const REMOTE_BASE = process.env.BASE?.replace(/\/$/, "") ?? "";
const IS_REMOTE = REMOTE_BASE.length > 0;
const BASE = IS_REMOTE ? REMOTE_BASE : `http://localhost:${PORT}`;
const RUN_FALLBACK = process.argv.includes("--fallback");

if (IS_REMOTE && !/^https?:\/\//.test(BASE)) {
  console.error(`FATAL: BASE must start with http:// or https:// (got: ${BASE})`);
  process.exit(2);
}

async function warnIfDangerousFallback(): Promise<void> {
  if (!IS_REMOTE || !RUN_FALLBACK) return;
  // Heuristic: a custom production domain + --fallback is a foot-gun.
  if (BASE.includes("vercel.app") || BASE.includes("localhost")) return;
  console.error(`\n⚠ WARNING: --fallback is enabled against a non-localhost / non-Vercel-preview BASE (${BASE}).`);
  console.error(`   This will mutate the DB connected to .env.local — likely your production Supabase.`);
  console.error(`   The mutations are restored in try/finally, but a mid-run crash leaves drift.`);
  console.error(`   Sleeping 5 seconds — Ctrl+C now to abort.\n`);
  await new Promise((r) => setTimeout(r, 5000));
}

// Routes tested by the default pass.
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  cityRiyadh: "/sa/riyadh",
  cityJeddah: "/sa/jeddah",
  cityKhobar: "/sa/khobar",
  catRiyadhEconomy: "/sa/riyadh/economy",
  catJeddahLuxury: "/sa/jeddah/luxury",
  carRiyadhHyundai: "/sa/riyadh/economy/hyundai-accent",
  carJeddahMercedes: "/sa/jeddah/luxury/mercedes-e-class",
  airportKKIA: "/sa/airports/king-khalid",
  airportKAIA: "/sa/airports/king-abdulaziz",
} as const;

// Expected prerendered-route count (from .next/prerender-manifest.json's
// `routes` key) and sitemap entry count. The count rose from 236 to 237
// when Task 11.8A added the `/sa` → `/` redirect page (a prerendered
// route that is intentionally NOT in the sitemap).
const EXPECTED_PRERENDERED_ROUTES = 237;
const EXPECTED_SITEMAP_COUNT = 231;

// ─── Result tracking ─────────────────────────────────────────────────────
type Result = { name: string; passed: boolean; detail?: string };
const results: Result[] = [];
function check(name: string, condition: boolean, detail?: string) {
  results.push({ name, passed: condition, detail });
  const icon = condition ? "✅" : "❌";
  console.log(`  ${icon} ${name}${!condition && detail ? `  —  ${detail}` : ""}`);
}

// ─── HTTP helpers ────────────────────────────────────────────────────────
function fetchUrl(url: string, maxRedirects = 3): Promise<{ status: number; body: string }> {
  const getter = url.startsWith("https://") ? httpsGet : httpGet;
  return new Promise((resolve, reject) => {
    const req = getter(url, { timeout: 15_000, headers: { "user-agent": "seo-regression/1.0" } }, (res) => {
      // Follow redirects (Vercel sometimes returns 308 from custom domains).
      const status = res.statusCode ?? 0;
      const loc = res.headers.location;
      if ([301, 302, 307, 308].includes(status) && loc && maxRedirects > 0) {
        res.resume();
        const next = loc.startsWith("http") ? loc : new URL(loc, url).toString();
        fetchUrl(next, maxRedirects - 1).then(resolve, reject);
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status, body }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error(`timeout ${url}`)); });
  });
}

function isPortListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = httpGet({ host: "localhost", port, path: "/", timeout: 1500 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

async function waitForPort(port: number, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortListening(port)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server did not come up on port ${port} within ${timeoutMs}ms`);
}

// ─── HTML / JSON-LD parsing helpers ──────────────────────────────────────
function extractTitle(html: string): string | null {
  const m = html.match(/<title>([^<]*)<\/title>/);
  return m ? m[1] : null;
}

function extractMeta(html: string, attr: "property" | "name", key: string): string | null {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s+content="([^"]*)"`);
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractCanonical(html: string): string | null {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  return m ? m[1] : null;
}

function extractJsonLdBlocks(html: string): unknown[] {
  const re = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  const out: unknown[] = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      // Bad JSON — record nothing; count assertions will catch it.
    }
  }
  return out;
}

type LdNode = Record<string, unknown> & { "@type"?: string };
function flattenLdNodes(blocks: unknown[]): LdNode[] {
  const out: LdNode[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const graph = (block as Record<string, unknown>)["@graph"];
    if (Array.isArray(graph)) out.push(...(graph as LdNode[]));
    else out.push(block as LdNode);
  }
  return out;
}

function findByType(nodes: LdNode[], type: string | string[]): LdNode[] {
  const types = Array.isArray(type) ? type : [type];
  return nodes.filter((n) => types.includes(n["@type"] ?? ""));
}

// ─── Prerendered-route count via .next/prerender-manifest.json ───────────
function countPrerenderedRoutes(): number {
  const path = ".next/prerender-manifest.json";
  if (!existsSync(path)) return -1;
  try {
    const m = JSON.parse(readFileSync(path, "utf8")) as { routes?: Record<string, unknown> };
    return Object.keys(m.routes ?? {}).length;
  } catch {
    return -1;
  }
}

// ─── Server bootstrap ────────────────────────────────────────────────────
let spawnedServer: ChildProcess | null = null;

async function ensureServer(): Promise<void> {
  if (IS_REMOTE) {
    // Sanity-check the remote URL is reachable.
    const { status } = await fetchUrl(`${BASE}/`).catch(() => ({ status: 0 }));
    if (status === 0) {
      console.error(`FATAL: cannot reach ${BASE}/ — is the URL correct and the deploy live?`);
      process.exit(2);
    }
    console.log(`Targeting remote BASE=${BASE} (status / = ${status}).`);
    return;
  }
  if (await isPortListening(PORT)) {
    console.log(`Detected prod server already listening on :${PORT} — reusing.`);
    return;
  }
  if (!existsSync(".next/BUILD_ID")) {
    console.log("No prod build found — running `npm run build` first...");
    execSync("npm run build", { stdio: "inherit" });
  }
  console.log(`Spawning prod server on :${PORT}...`);
  spawnedServer = spawn("npm", ["run", "start"], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "ignore", "ignore"],
    detached: false,
  });
  spawnedServer.on("exit", () => { spawnedServer = null; });
  await waitForPort(PORT);
  console.log(`Server up on :${PORT}.`);
}

function stopServer(): void {
  if (spawnedServer && !spawnedServer.killed) {
    spawnedServer.kill("SIGTERM");
    spawnedServer = null;
  }
}

// ─── Group 1: build + sitemap ────────────────────────────────────────────
async function checkBuildAndSitemap(): Promise<void> {
  console.log(`\n[1/5] ${IS_REMOTE ? "Remote sitemap + URL reachability" : "Build artefacts + sitemap"}`);

  if (IS_REMOTE) {
    // The prerender manifest is a local-only artefact. Replace it with a
    // remote sanity sweep: fetch 5 evenly-spaced sitemap URLs.
  } else {
    const prerenderedRoutes = countPrerenderedRoutes();
    check(
      `Prerendered route count = ${EXPECTED_PRERENDERED_ROUTES}`,
      prerenderedRoutes === EXPECTED_PRERENDERED_ROUTES,
      prerenderedRoutes === -1 ? ".next/prerender-manifest.json missing — was the build run?" : `actual=${prerenderedRoutes}`,
    );
  }

  const sm = await fetchUrl(`${BASE}/sitemap.xml`);
  check("/sitemap.xml returns 200", sm.status === 200, `actual=${sm.status}`);

  const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(`Sitemap has ${EXPECTED_SITEMAP_COUNT} entries`, locs.length === EXPECTED_SITEMAP_COUNT, `actual=${locs.length}`);

  const dupes = locs.filter((u, i) => locs.indexOf(u) !== i);
  check("Sitemap has no duplicate URLs", dupes.length === 0, dupes.slice(0, 3).join(", "));

  const nonAbs = locs.filter((u) => !u.startsWith("https://"));
  check("All sitemap URLs are absolute (https://)", nonAbs.length === 0, nonAbs.slice(0, 3).join(", "));

  const hasQuery = locs.filter((u) => u.includes("?") || u.includes("#"));
  check("No sitemap URL contains query/fragment", hasQuery.length === 0, hasQuery.slice(0, 3).join(", "));

  if (IS_REMOTE && locs.length > 0) {
    // Sample 5 evenly-spaced URLs and assert they all return 200. Catches
    // route-drift on the deployed runner without needing the build manifest.
    //
    // If the sitemap URLs point at a DIFFERENT host than BASE (typical when
    // testing a Vercel preview URL while NEXT_PUBLIC_SITE_URL is set to the
    // intended production domain), rewrite the fetch URL to use BASE. We're
    // verifying the deploy serves the path correctly; the canonical URL
    // embedded in the sitemap is an env-config concern documented in the
    // runbook (§2: NEXT_PUBLIC_SITE_URL on Vercel).
    const sitemapHost = (() => { try { return new URL(locs[0]).host; } catch { return ""; } })();
    const baseHost = (() => { try { return new URL(BASE).host; } catch { return ""; } })();
    const hostMismatch = sitemapHost && baseHost && sitemapHost !== baseHost;
    if (hostMismatch) {
      console.log(`  ℹ Sitemap URLs reference host=${sitemapHost}, BASE host=${baseHost} — fetching paths against BASE.`);
    }
    const step = Math.max(1, Math.floor(locs.length / 5));
    const samples = [0, step, step * 2, step * 3, locs.length - 1].map((i) => locs[i]).filter(Boolean);
    for (const sourceUrl of samples) {
      const fetchTarget = hostMismatch
        ? (() => { try { return BASE + new URL(sourceUrl).pathname; } catch { return sourceUrl; } })()
        : sourceUrl;
      const { status } = await fetchUrl(fetchTarget).catch(() => ({ status: 0 }));
      const label = hostMismatch ? new URL(fetchTarget).pathname || "/" : sourceUrl.replace(BASE, "");
      check(`Remote sitemap URL reachable: ${label}`, status === 200, `actual=${status}, fetched=${fetchTarget}`);
    }
  }
}

// ─── Group 2: metadata patterns ──────────────────────────────────────────
type PageProbe = {
  route: string;
  html: string;
  title: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  twTitle: string | null;
  twDesc: string | null;
  canonical: string | null;
  ldBlocks: unknown[];
  ldNodes: LdNode[];
};
const pages = new Map<string, PageProbe>();

async function probeAll(): Promise<void> {
  console.log("\n[2/5] Fetching 13 representative routes");
  for (const [key, route] of Object.entries(ROUTES)) {
    const { status, body } = await fetchUrl(`${BASE}${route}`);
    if (status !== 200) {
      check(`${route} returns 200`, false, `actual=${status}`);
      continue;
    }
    const blocks = extractJsonLdBlocks(body);
    pages.set(key, {
      route,
      html: body,
      title: extractTitle(body),
      ogTitle: extractMeta(body, "property", "og:title"),
      ogDesc: extractMeta(body, "property", "og:description"),
      twTitle: extractMeta(body, "name", "twitter:title"),
      twDesc: extractMeta(body, "name", "twitter:description"),
      canonical: extractCanonical(body),
      ldBlocks: blocks,
      ldNodes: flattenLdNodes(blocks),
    });
  }
  check(`All 13 routes fetched`, pages.size === Object.keys(ROUTES).length);
}

function checkMetadata(): void {
  console.log("\n[3/5] Metadata patterns + Arabic title invariants");

  // Per-route title expectations (exact match when known; prefix match otherwise).
  const titleExpectations: Record<string, string> = {
    cityRiyadh: "تأجير سيارات في الرياض — أسعار من 89 ريال/يوم",
    cityJeddah: "تأجير سيارات في جدة — أسعار من 99 ريال/يوم",
    cityKhobar: "تأجير سيارات في الخبر — أسعار من 42 ريال/يوم",
    catRiyadhEconomy: "تأجير سيارات اقتصادية في الرياض — من 79 ريال/يوم",
    catJeddahLuxury: "تأجير سيارات فاخرة في جدة — من 299 ريال/يوم",
    carRiyadhHyundai: "تأجير سيارة هيونداي اكسنت في الرياض — من 79 ريال يومياً",
    carJeddahMercedes: "تأجير سيارة مرسيدس E-Class في جدة — من 399 ريال يومياً",
  };

  for (const [key, expected] of Object.entries(titleExpectations)) {
    const p = pages.get(key);
    if (!p) continue;
    const t = p.title ?? "";
    // Title may have site-name suffix; match prefix.
    check(`${p.route} title starts with "${expected.slice(0, 32)}..."`, t.startsWith(expected), `actual="${t}"`);
  }

  // Negative invariant: no title contains "تأجير سيارات ب" (the reverted بـ form).
  for (const [key, p] of pages) {
    if (!p.title) continue;
    const allTitles = [p.title, p.ogTitle ?? "", p.twTitle ?? ""].join(" || ");
    check(`${p.route}: no "تأجير سيارات ب" (Task 6.2B revert invariant)`, !allTitles.includes("تأجير سيارات ب"), `found in ${key}: ${allTitles.slice(0, 100)}...`);
  }

  // Canonical present where expected.
  for (const key of ["cityRiyadh", "catRiyadhEconomy", "carRiyadhHyundai", "airportKKIA"] as const) {
    const p = pages.get(key);
    if (!p) continue;
    check(`${p.route} has a canonical link`, !!p.canonical, `actual=${p.canonical}`);
  }

  // OG / Twitter on city/category/car pages.
  for (const key of ["cityRiyadh", "catRiyadhEconomy", "carRiyadhHyundai"] as const) {
    const p = pages.get(key);
    if (!p) continue;
    check(`${p.route} has og:title`, !!p.ogTitle);
    check(`${p.route} has og:description`, !!p.ogDesc);
    check(`${p.route} has twitter:title`, !!p.twTitle);
    check(`${p.route} has twitter:description`, !!p.twDesc);
  }
}

// ─── Group 4: JSON-LD ────────────────────────────────────────────────────
function checkJsonLd(): void {
  console.log("\n[4/5] JSON-LD: WebSite/Org/LocalBusiness/Product invariants");

  for (const [key, p] of pages) {
    const website = findByType(p.ldNodes, "WebSite");
    const org = findByType(p.ldNodes, "Organization");
    check(`${p.route}: exactly one WebSite block (Task 6.2X layout invariant)`, website.length === 1, `count=${website.length}`);
    check(`${p.route}: exactly one Organization block (Task 6.2X)`, org.length === 1, `count=${org.length}`);
  }

  // LocalBusiness count per route. AutoRental is a LocalBusiness subtype.
  const lbExpectations: Record<string, { count: number; nameMustContain?: string; nameMustNotContain?: string }> = {
    home: { count: 1, nameMustContain: "الرياض" },             // flagship; Riyadh is correct
    about: { count: 0 },
    contact: { count: 0 },
    privacy: { count: 0 },
    cityRiyadh: { count: 1, nameMustContain: "الرياض" },
    cityJeddah: { count: 1, nameMustContain: "جدة", nameMustNotContain: "الرياض" },
    cityKhobar: { count: 1, nameMustContain: "الخبر", nameMustNotContain: "الرياض" },
    catRiyadhEconomy: { count: 1, nameMustContain: "الرياض" },
    catJeddahLuxury: { count: 1, nameMustContain: "جدة", nameMustNotContain: "الرياض" },
    carRiyadhHyundai: { count: 0 },
    carJeddahMercedes: { count: 0 },
    airportKKIA: { count: 1, nameMustContain: "الرياض" },        // KKIA is in Riyadh
    airportKAIA: { count: 1, nameMustContain: "جدة", nameMustNotContain: "الرياض" }, // KAIA is in Jeddah
  };

  for (const [key, exp] of Object.entries(lbExpectations)) {
    const p = pages.get(key);
    if (!p) continue;
    const lb = findByType(p.ldNodes, ["LocalBusiness", "AutoRental"]);
    check(`${p.route}: ${exp.count} LocalBusiness/AutoRental block(s)`, lb.length === exp.count, `count=${lb.length}, names=${lb.map((n) => n.name).join("|")}`);
    if (exp.count === 1 && exp.nameMustContain) {
      const name = (lb[0]?.name as string) ?? "";
      check(`${p.route}: LocalBusiness.name contains "${exp.nameMustContain}"`, name.includes(exp.nameMustContain), `actual="${name}"`);
    }
    if (exp.count === 1 && exp.nameMustNotContain) {
      const name = (lb[0]?.name as string) ?? "";
      check(`${p.route}: LocalBusiness.name does NOT contain "${exp.nameMustNotContain}" (no Riyadh leak)`, !name.includes(exp.nameMustNotContain), `actual="${name}"`);
    }
  }

  // Product schema on car-detail with static prices.
  const productExpectations: Record<string, { low: number; high: number; brandHint: string }> = {
    carRiyadhHyundai: { low: 79, high: 1899, brandHint: "Hyundai" },
    carJeddahMercedes: { low: 399, high: 9499, brandHint: "Mercedes" },
  };
  for (const [key, exp] of Object.entries(productExpectations)) {
    const p = pages.get(key);
    if (!p) continue;
    const products = findByType(p.ldNodes, "Product");
    check(`${p.route}: exactly one Product block`, products.length === 1, `count=${products.length}`);
    if (products.length === 1) {
      const offers = products[0]?.offers as Record<string, unknown> | undefined;
      const low = Number(offers?.lowPrice);
      const high = Number(offers?.highPrice);
      check(`${p.route}: Product.offers.lowPrice = ${exp.low} (pricing stayed static)`, low === exp.low, `actual=${low}`);
      check(`${p.route}: Product.offers.highPrice = ${exp.high} (pricing stayed static)`, high === exp.high, `actual=${high}`);
      const brand = (products[0]?.brand as Record<string, unknown> | undefined)?.name;
      check(`${p.route}: Product.brand.name contains "${exp.brandHint}"`, String(brand ?? "").includes(exp.brandHint), `actual="${brand}"`);
    }
  }

  // FAQ + Breadcrumb presence where expected.
  for (const key of ["cityRiyadh", "catRiyadhEconomy", "carRiyadhHyundai", "airportKKIA"] as const) {
    const p = pages.get(key);
    if (!p) continue;
    check(`${p.route}: has FAQPage schema`, findByType(p.ldNodes, "FAQPage").length === 1);
    check(`${p.route}: has BreadcrumbList schema`, findByType(p.ldNodes, "BreadcrumbList").length === 1);
  }
}

// ─── Group 5: public privacy / leak checks ───────────────────────────────
const FORBIDDEN_LITERALS = [
  "whatsapp_number",
  "internal_notes",
  "trust_level",
  "approval_status",
  "assigned_company_id",
  "consent_ip",
  "customer_phone",
  "customer_email",
  "lead_activity_logs",
  "auth.users",
];

function checkPrivacy(): void {
  console.log("\n[5/5] Public privacy / admin-field leak checks");
  for (const [key, p] of pages) {
    for (const literal of FORBIDDEN_LITERALS) {
      const lc = p.html.toLowerCase();
      const found = lc.includes(literal.toLowerCase());
      check(`${p.route}: no "${literal}" in HTML`, !found);
    }
  }
}

// ─── Optional --fallback pass ────────────────────────────────────────────
async function runFallbackPass(): Promise<void> {
  console.log("\n[+] Running opt-in --fallback pass (transient DB mutations)");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    check("--fallback: env vars present", false, "missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return;
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  type Mutation = {
    label: string;
    rollbackSQL: string;
    apply: () => Promise<void>;
    restore: () => Promise<void>;
    affectedRoute: string;
  };

  const mutations: Mutation[] = [
    {
      label: "city jeddah → public_status='draft'",
      rollbackSQL: `update public.cities set public_status='published' where slug='jeddah';`,
      apply: async () => { await sb.from("cities").update({ public_status: "draft" }).eq("slug", "jeddah"); },
      restore: async () => { await sb.from("cities").update({ public_status: "published" }).eq("slug", "jeddah"); },
      affectedRoute: "/sa/jeddah",
    },
    {
      label: "category luxury → status='archived'",
      rollbackSQL: `update public.car_categories set status='active' where slug='luxury';`,
      apply: async () => { await sb.from("car_categories").update({ status: "archived" }).eq("slug", "luxury"); },
      restore: async () => { await sb.from("car_categories").update({ status: "active" }).eq("slug", "luxury"); },
      affectedRoute: "/sa/jeddah/luxury",
    },
    {
      label: "car mercedes-e-class → status='archived'",
      rollbackSQL: `update public.cars set status='active' where slug='mercedes-e-class';`,
      apply: async () => { await sb.from("cars").update({ status: "archived" }).eq("slug", "mercedes-e-class"); },
      restore: async () => { await sb.from("cars").update({ status: "active" }).eq("slug", "mercedes-e-class"); },
      affectedRoute: "/sa/jeddah/luxury/mercedes-e-class",
    },
  ];

  for (const m of mutations) {
    console.log(`\n  ▶ ${m.label}`);
    console.log(`    Rollback SQL if this script is killed mid-run:`);
    console.error(`    ${m.rollbackSQL}`);
    try {
      await m.apply();
      // Give Next a beat (cached fetch could otherwise serve a stale page).
      await new Promise((r) => setTimeout(r, 500));
      const { status, body } = await fetchUrl(`${BASE}${m.affectedRoute}`);
      check(`--fallback ${m.affectedRoute} returns 200 with mutation applied`, status === 200, `actual=${status}`);
      // With overlay returning null, the page falls back to static. Since static
      // matches static, the page should render and the title should be sane.
      const t = extractTitle(body) ?? "";
      check(`--fallback ${m.affectedRoute}: title still resolves (static fallback worked)`, t.length > 10, `actual="${t}"`);
    } finally {
      try {
        await m.restore();
        check(`--fallback ${m.label}: row restored`, true);
      } catch (e) {
        check(`--fallback ${m.label}: row restored`, false, `RESTORE FAILED — run rollback SQL manually: ${m.rollbackSQL}  (error: ${(e as Error).message})`);
      }
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log(`SEO regression sweep — BASE=${BASE}${IS_REMOTE ? "" : ` (local)`}, fallback=${RUN_FALLBACK ? "on" : "off"}`);
  await warnIfDangerousFallback();

  try {
    await ensureServer();
    await checkBuildAndSitemap();
    await probeAll();
    checkMetadata();
    checkJsonLd();
    checkPrivacy();
    if (RUN_FALLBACK) await runFallbackPass();
  } finally {
    stopServer();
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n${passed === total ? "✅" : "❌"} ${passed}/${total} checks PASS`);
  if (passed < total) {
    console.log("\nFailures:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  ✗ ${r.name}${r.detail ? `\n    ${r.detail}` : ""}`);
    });
    process.exit(1);
  }
}

process.on("SIGINT", () => { stopServer(); process.exit(130); });
process.on("SIGTERM", () => { stopServer(); process.exit(143); });

main().catch((e) => {
  stopServer();
  console.error("\nFATAL:", e);
  process.exit(2);
});
