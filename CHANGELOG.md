# Changelog — In-Place BaseGrade Project Savings Estimator

Model version appears in the page footer and on every printed estimate. Bump it with
any change to the model, defaults, or sources, and record the change here.

## model 3.6.1 — wave 2 (improved-subgrade Mr migration) — 2026-07-09

Reclassifies how the In-Place treated layer contributes structurally, migrating from
an unconditional layer-coefficient (a2) credit to a two-tier model: an
**improved-subgrade Mr uplift by default**, with **structural (a2) credit available
only after a project-specific 7-day UCS test is entered.** No change to the AASHTO
1993 design equation itself; this is a change in what the In-Place side is allowed to
claim credit for, and under what evidence.

1. **Improved-subgrade Mr pathway (default)**: In-Place is now modeled by default as
   raising the subgrade's resilient modulus (Mr = 2554 × CBR^0.64), not as a
   structural base layer — no published AASHTO 1993 a2 exists for a non-traditional
   liquid stabilizer. The In-Place side's required SN (`snIP`) is now solved
   separately from the conventional side's (`sn`), using an effective Mr — a new
   `mrEffective()` depth-weighted log-space blend of treated and native Mr (treatment
   depth ÷ 30″ assumed influence depth, clamped 0–1). Labeled a planning
   approximation pending PE review, not a full layered-elastic (Odemark) solution.
2. **`a2IP` now defaults to 0.00** (was a 0.18–0.27 slider, default 0.20). The
   `a2-ip` slider still exists in the DOM (never deleted — it's referenced unguarded
   elsewhere) but is now hidden and disabled, a read-only display driven by the
   derived value. `treatedCBRDefault` (new per-soil table, anchored to the Baja
   California 09-2025 lab series and the Peru native-sand series — deliberately
   **not** the Cerro Colorado 125% figure, which was a prepared aggregate blend, not
   raw native soil) seeds a new editable **In-Place treated subgrade CBR** input that
   drives the Mr pathway.
3. **UCS-unlock**: a new checkbox ("I have a project-specific 7-day UCS test on the
   treated soil") + psi input reclassifies the treated layer as a structural base
   once a lab result is entered — `deriveA2FromUCS()` maps it to the published SUDAS
   5J-3 tiers (<400 psi → 0.15, 400–649 → 0.20, ≥650 → 0.23; blank/non-positive input
   never defaults a tier). When unlocked, `snIP` reverts to `sn` (old Option-A math)
   and the a2 credit is subtracted from it — the Mr uplift and a layer-coefficient
   credit are never stacked for the same inches of treated soil. Discloses that the
   only product-alone 7-day UCS result in the archive (GTS, North Dakota clay,
   2011–12: 193–194 psi) falls below the 400 psi floor for any published tier — the
   box existing does not imply the product will qualify.
4. **Chip-seal gate redesigned**: chip seal is now offered only when UCS-unlocked
   (in addition to the existing ESAL-threshold and full-required-SN conditions).
   Under the default zero-a2 pathway the treated layer is explicitly not claimed as
   a structural base, so a chip-seal-only surface over an unproven "base" would
   misrepresent what AASHTO's ≤50k-ESAL surface-treatment provision assumes lies
   beneath it. The `btn-chipseal` toggle is disabled with a tooltip until unlocked;
   unchecking the acknowledgment while in chip-seal mode forces back to HMA.
5. **Sensitivity range reworked**: `a2-ip` removed from `RANGE_LOW`/`RANGE_HIGH`
   (superseded — it's a derived display, not a user assumption to range).
   `ip-treated-cbr` added as a sentinel key whose real low/high come from two new
   per-soil tables (`treatedCBRRangeLow`/`High`), since treated-CBR uncertainty is
   soil-dependent. Ranging is scoped to the default (locked) pathway only —
   `updateRange()` returns early with an explanatory note once UCS-unlock is
   checked, since ranging a discrete lab-tier value doesn't fit the tool's
   planning-uncertainty-band purpose.
6. **Assumptions register**: updated the "Layer coefficients" entry and added three
   new entries — Improved-subgrade Mr pathway, Treated subgrade CBR by soil class,
   and Structural (a2) credit — conditional unlock. The register also flags
   **"cement-blend mode"** (GTS North Dakota cement + product blends reaching
   664–746 psi at 21 days, clearing the top 0.23 tier) as a distinct, evidence-backed
   product configuration that is **not** offered by this tool — a Wave 3 candidate
   only, not a current default or unlock path.
7. **Base-course layout cleanup**: pulled the aggregate compacted density field out
   of a 3-item `.g2` grid into its own full-width row so no dangling empty grid cell
   remains now that the new treated-CBR input shares the CBR row with the
   conventional base-CBR field — same class of fix as the model 3.4 layout cleanup.

**Test suite**: three new files (`mr-blend.js`, `solver-roundtrip.js`,
`ucs-unlock.js`) plus a deliberate `us-defaults.js` snapshot re-baseline
(methodology change, not a regression): at A-3 defaults, `rt-direct-ip` rises from
$692,743 to $912,853 (In-Place asphalt must now carry its full required SN alone
without a layer-coefficient credit), flipping `rt-total-sav` (construction savings
alone) from +$72,110 to -$229,441; lifecycle NPV savings still dominate and keep the
combined total (`ct-val`) positive, $429,157 → $127,606. The Peru ledger regression
and worked-example preset are unaffected — both run in equal-surface mode with an
explicit specified surface thickness, so `sn`/`snIP`/`a2IP`/`thickConv`/`thickIP`
never enter their asserted dollar totals. All nine test files pass.

## model 3.6.0 — wave 1 (defensibility corrections) — 2026-07-09

Eight audit-verified defensibility corrections to defaults, citations, and register
text. No structural-formula changes; two defaults change materially (items 5-6) and
are called out with a deliberate snapshot re-baseline.

1. **Product price framing**: the $30/gal default note changed from "2017 list price
   — confirm current" to the current manufacturer list price (2026), confirmed
   directly with the manufacturer and explicitly negotiable for volume/contract
   pricing. Register entry re-tagged Estimated (was Pending).
2. **78% foundation-failure figure permanently struck**: verification is complete —
   NCHRP Report 602 is *Calibration and Validation of the Enhanced Integrated
   Climatic Model for Pavement Design*, a climate/moisture model containing no such
   statistic. The 50% maintenance-share default remains an explicitly labeled
   planning placeholder. Both related open-verification-register items closed.
3. **Discount-rate citation updated**: the 4% default now cites the FHWA historic
   guidance band (3–5%, FHWA LCCA Primer) and separately states the current OMB
   Circular A-94 Appendix C real 30-yr rate — 2.0% (CY2026, revised March 2026),
   noting the November 2023 A-94 revision was rescinded April 2025 by OMB Memorandum
   M-25-23. The sensitivity band's optimistic discount-rate bound changed 3% → 2% to
   match the current A-94 rate.
4. **Powell coefficient corrected**: `mrFromCBR` used Mr = 2555 × CBR^0.64;
   FHWA-HRT-12-030 prints the Powell et al. correlation as Mr = 2554 × CBR^0.64.
   Corrected the constant and added the FHWA-HRT-12-030 citation. Output change
   ~0.04%, within existing test tolerances.
5. **Aggregate compacted density made editable**: `baseTons`/`sbTons` hardcoded 110
   lb/ft³; compacted dense-graded aggregate base typically runs 135–145 pcf. Added a
   new input (default 140, range 100–160) used in both base and sub-base tonnage.
   The Peru worked-example preset and its regression test pin this field to 110
   ("as-bid 2018 ledger reproduction") so the signed ledger still reproduces exactly.
6. **Excavation default raised** $5.00 → $8.00/CY, citing TxDOT statewide average low
   bid (large quantities, 12-mo avg 2024); register notes small municipal jobs trend
   higher. The Peru preset sets its own ledger-derived excavation rate and is
   unaffected.
7. **Sensitivity range knobs pruned**: removed `oh-pct` and `profit-pct` from the
   sensitivity band — both are applied equally to each alternative's direct cost, so
   their low/high direction inverted at default geometry (mislabeled conservative/
   optimistic; actual effect ≤$400, not directional). Register note added.
8. **Conventional a2 disclosure**: the 0.14→0.18 interpolation at conventional base
   CBR 80→100 intentionally exceeds the AASHTO 1993 Equation 5.16 correlation (≈0.14
   at CBR 100) — deliberately generous to the conventional alternative; flagged as
   under engineering review. No formula change.

**Test suite**: the `us-defaults.js` snapshot was deliberately re-baselined for items
5–6 (conventional aggregate tonnage cost rises materially): `rt-direct-conv`
$684,922 → $745,378; default-scenario construction savings flips from slightly
negative (-$10,715) to positive (+$72,110); combined value $346,332 → $429,157. The
Peru ledger regression and worked-example preset are untouched and still reproduce
the signed 2018 Cerro Colorado ledger exactly (both pin excavation rate and, new
this release, aggregate density to their as-bid values). All six test files pass.

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
