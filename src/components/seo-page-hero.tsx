import type { ReactNode } from 'react'
import { NoSSR } from './no-ssr'

/**
 * SeoPageHero — the canonical SSR hero scaffold for all NON-homepage public
 * SEO routes (`/sa/[city]`, `/sa/[city]/[category]`, `/sa/airports/[airport]`,
 * `/sa/[city]/[category]/[car]`, and any future SEO landing page such as
 * `/sa/company/[slug]`, `/sa/offer/[id]`, etc.).
 *
 * ## The contract
 *
 * Visible page-content text emitted to raw SSR HTML by this component is
 * intentionally limited to:
 *   1. The H1 (passed as the `h1` prop — typically wraps a styled
 *      `<span>` for the gold accent on a portion of the heading).
 *   2. One short Arabic intro paragraph (passed as `introText`, rendered
 *      as `<p className="hero-subtitle">` immediately under the H1).
 *
 * Everything else on the page — breadcrumb, pills, lead form, body
 * sections, FAQ accordion, internal-link clusters — is passed in via
 * slot props (`preH1`, `postIntro`, `rightColumn`) plus body content
 * rendered after this component, and is wrapped in `<NoSSR>` internally
 * so callers don't repeat that boilerplate. None of that content
 * appears in raw SSR HTML; it hydrates after JS loads.
 *
 * ## Homepage is intentionally EXCLUDED from this pattern
 *
 * The homepage has its own bespoke 2-glow hero with different glow
 * dimensions and a different slot structure (no intro paragraph). It
 * does not use this component. See `src/app/(site)/page.tsx` and
 * `src/components/homepage-client-content.tsx`.
 *
 * ## Future upgrade path
 *
 * If we later decide to expand the SSR set (e.g. add a small
 * internal-links block or a compact trust block below the intro),
 * add one new optional prop to this component and render it in the
 * appropriate position. **All routes that use `<SeoPageHero>` inherit
 * the change automatically.** Pages that don't want the new SSR
 * content simply don't pass that prop.
 *
 * ## H1 rule
 *
 * The caller must pass exactly one H1 worth of content via the `h1`
 * prop. Do not render a separate `<h1>` outside this component on a
 * page that also uses `<SeoPageHero>` — that would duplicate H1s.
 *
 * ## Intro paragraph rule
 *
 * `introText` must be a single short Arabic paragraph (target 30-70
 * words). Do not include overclaims (e.g. "أفضل عرض", "مرخصة",
 * "استلام فوري") or fake trust phrases. Keep the main keyword
 * `تأجير سيارات` as the primary focus; do not stuff secondary
 * keywords. Wording is reviewed per route by the operator.
 */
export type SeoPageHeroProps = {
  /** H1 inner content. May include a `<span>` for the gold accent. */
  h1: ReactNode
  /** Single short Arabic intro paragraph rendered below the H1. */
  introText: string
  /** Optional client-only slot rendered above the H1 (typical: breadcrumb). */
  preH1?: ReactNode
  /** Optional client-only slot rendered below the intro P (typical: pills). */
  postIntro?: ReactNode
  /** Optional client-only slot for the lead form (renders inside `<div id="form">`). */
  rightColumn?: ReactNode
  /**
   * Optional extra hero decorations rendered after the default
   * `hero-grid` + `hero-glow` — e.g. the second glow on the car-detail
   * page. Most routes won't need this.
   */
  extraDecorations?: ReactNode
}

export function SeoPageHero({
  h1,
  introText,
  preH1,
  postIntro,
  rightColumn,
  extraDecorations,
}: SeoPageHeroProps) {
  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-glow" style={{ width: 400, height: 400, top: -100, right: -100 }} />
      {extraDecorations}
      <div className="container">
        <div className="hero-inner">
          <div className="hero-text">
            {preH1 && <NoSSR>{preH1}</NoSSR>}
            <h1 className="hero-title">{h1}</h1>
            <p className="hero-subtitle">{introText}</p>
            {postIntro && <NoSSR>{postIntro}</NoSSR>}
          </div>
          {rightColumn && (
            <div id="form">
              <NoSSR>{rightColumn}</NoSSR>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
