# Changelog — In-Place BaseGrade Project Savings Estimator

Model version appears in the page footer and on every printed estimate. Bump it with
any change to the model, defaults, or sources, and record the change here.

## model 3.5 — 2026-07-08

- **Root-cause fix**: a stray extra `</div>` in the traffic-loading field (left
  over from well before today) closed that field one tag too early. Browsers
  silently repair mismatched HTML, so nothing crashed — but everything after
  that point (Regional cost index, the derived-value strip, every accordion
  section, results table, disclaimer, CTA, print footer) ended up nested
  *outside* `.wrap` instead of inside it, so none of it ever received the
  dark card background. That's what was producing low-contrast, hard-to-read
  content lower on the page. Removed the stray tag; `.wrap` now correctly
  contains the entire page (verified: its box height now matches the body's).
- `.print-footer` had an inline `display:flex` that permanently overrode the
  "hidden on screen" rule, so the print footer was always visible on screen
  too. Moved that layout declaration into the print-only media rule so it's
  flex only while actually printing, hidden otherwise.
- Changed the page background from light beige to match the dark card
  (`--ink`), removing the light margins ("white sides") visible around the
  card on wide screens — the whole page is now dark-themed, screen only
  (print still renders on white paper as before).
- Reverted the Engineering/Contingency row to 3 columns (matching the row
  above it — the earlier 2-column attempt broke alignment with Overhead/
  Profit/Tax) and shortened the label to "Engineering / inspection (%)" so
  it fits on one line in both languages without wrapping.

## model 3.4 — 2026-07-08

- Fixed the combined-total hero block (headline number + sub-line + sensitivity
  range + break-even narrative): it was a `flex-direction:row` container with
  five children and no wrap protection, so on wide screens — and especially in
  print, where the block has no fixed width — those five pieces got squeezed
  side by side into tall, narrow, small-print slivers instead of stacking.
  Changed to a column layout.
- Print stylesheet: `ct-range` and `#ct-breakeven` carried near-white inline
  text colors sized for the dark screen background; on white print paper they
  were effectively invisible, showing as a blank area under the total. Both
  now get explicit dark print colors. Added an explicit `@page` margin and
  `page-break-inside:avoid` on the print header/footer/params and each results
  row, to stop borders and content from being cut awkwardly across a page break.
- Cost-foot grid: "Construction engineering / inspection (%)" and "Contingency
  (%)" shared a 3-column row with a trailing empty cell; the long CE label
  wrapped to two lines there, stretching the whole row (and, since CSS Grid
  stretches every cell in a row to match, an oddly tall Contingency box with
  dead space beneath its stepper). Narrowed the row to 2 columns so CE's label
  fits on one line in both languages.
- Bumped select/plain-input padding slightly (12px 14px → 13px 18px) so the
  State and Regional construction cost index dropdowns don't sit flush against
  their own edges.

## model 3.3 — 2026-07-07

- English/Spanish language toggle (button next to the headline; persists via
  localStorage, also settable at load by remembered preference). Static copy —
  every label, field-source note, disclaimer, and the full embedded assumptions
  register — is translated by walking the page's text nodes against a
  professionally translated dictionary (524 entries, consistent technical
  glossary: subrasante, subbase, número estructural, VAN for NPV, etc.), built
  to never touch anything the calculator computes live (results, savings,
  sliders). Every dynamically generated message (chip-seal viability, break-even
  narrative, sensitivity range, climate warning, print summary, share links) is
  hand-written bilingual, not machine-translated at runtime. Numbers, currency,
  citations (AASHTO/FHWA/NCHRP/etc.) and technical abbreviations (CBR, ESAL, SN,
  a1/a2/a3, SY, CY...) are identical in both languages by design.

## model 3.2 — 2026-07-07

- Data-sources-and-assumptions register embedded in the calculator itself: a "View data
  sources & assumptions" button below the disclaimer opens a full-screen register
  (also reachable at `#assumptions`), replacing the separate assumptions repo/page
- Register content brought current with models 3.0–3.1: RCF Laboratorios CBR attribution
  correction (was GTS), a2 re-based to the published stabilized-base range, NPV lifecycle
  method, cost-foot split, sub-base/swell/prime/dosage entries, 78% retired (50% labeled
  placeholder), $30/gal marked 2017 list price, Prescott updated to 19 years, climate
  applicability entry, FDR deferral, open verification register
- The old standalone assumptions page now redirects here

## model 3.1 — 2026-07-07

- Climate note: always-visible cure-window/temperature statement (water-based, 24–72 h rain-free, 50–140°F) with the arid-dominant field record stated; selecting a wet/freeze-thaw region (Northeast, Midwest, Pacific, South Atlantic) adds an explicit warning that performance defaults are unverified there and that base depths are not frost-adjusted
- FDR deferral made explicit in the UI: reclamation mode stays disabled until the model credits the existing milled material's structural value on the conventional side (offering it sooner would bias the comparison toward In-Place)
- Method note pending item (6): no wet/cold durability lab series yet

## model 3.0 — 2026-07-07

**Phase 3 (power-user layer):**
- Break-even output: cumulative-NPV view under the headline (day-one delta, overtake year, end-of-period advantage)
- Sensitivity band now names its top-3 driving assumptions (one-at-a-time influence)
- Currency-symbol setting (display only; math is unit-agnostic) + metric equivalents (m²/m³ in the derived strip, gal/m² beside the dosage)
- Advanced rate builder: treatment-pass $/SY derived from crew $/hr ÷ production SY/hr (FHWA-CFL production rates)
- "Load worked example — Cerro Colorado, Peru (2018)" preset reproducing the signed municipal ledger on screen
- Printed estimates now carry the model version and a full assumptions snapshot (every input value)
- "Copy scenario link" — all inputs encoded in a shareable URL
- GitHub Actions CI running the full test suite on every push/PR

**Phase 2 (credibility engine):**
- Required SN solved from the AASHTO 1993 design equation: editable design ESALs + subgrade CBR→Mr (2555×CBR^0.64), reliability by road class
- Functional a2 slider, re-based to the published stabilized-base range 0.18–0.27 (SUDAS 5J-3 / FHWA-SA-98-042); auto-floor 0.18 for A-7-5/A-7-6/peat with per-soil field-evidence notes
- Independent In-Place treatment depth (auto-matched to the conventional structure's SN contribution)
- AASHTO minimum asphalt-thickness floors; chip seal gated by ESAL threshold (≤50k default) with zero structural credit
- Lifecycle rebuilt to FHWA LCCA practice: constant-dollar NPV at a real discount rate (default 4%), 35-yr analysis period, rehab events in real $, salvage credit, chip-seal reseal cycle
- Unverified "78%" statistic retired from the headline and defaults (50% labeled planning placeholder)
- CE % + contingency % lines; mandatory mix-design lump sum; exclusion-transparency block; WSDOT 10% tie band

**Phase 1 (Peru reproducibility & input integrity):**
- Conventional sub-base layer (auto-set by soil/traffic) driving excavation/haul/aggregate volumes and a3 structural credit
- Earthwork swell factor (bank→loose) on hauled volumes
- Typed-zero fix: a user-entered 0 is honored in every field
- Prime/tack coat line; equal-surface mode with optional specified thickness
- Cost foot: direct subtotal + overhead/profit/tax (replacing single 20% markup)
- A-7-6 crash fix; CBR data re-attributed to RCF Laboratorios, Arequipa (ISO/IEC 17025); stale copy corrected
- Test suite: Peru ledger regression (honest quantities), typed-zero, no-NaN sweep, defaults snapshot, citation completeness

## Prior — main (pre-audit)
- Computed product cost (price/gal × dosage × depth), $1.35/SY treatment labor, mobilization lines, low/expected/high range, road-class-derived rates
