# Changelog — In-Place BaseGrade Project Savings Estimator

Model version appears in the page footer and on every printed estimate. Bump it with
any change to the model, defaults, or sources, and record the change here.

## model 3.8.0 — earned reveal + UX consolidation — 2026-07-10

No math/default changes (all 10 test files stay green, no snapshot re-baselines). Ships
a formal UX critique's six findings — the critique named three concrete problems this
release fixes: **reveal-shows-no-result** (the combined-total number rendered from page
load, before the visitor had answered anything, while the reveal note claimed it was
"above" it), **1.9:1 trust text** (`.field-source` citations at 11px italic
`rgba(255,255,255,0.25)` were functionally unreadable), and **~15 CTAs** (six duplicated
next-step buttons scattered across three locations).

1. **Earned reveal (P0).** `.combined-total` (the 72px number, verdict, sub-line, range,
   influence, breakeven) moved out of `.results-block` (previously below all six A–F
   accordions) to a direct sibling of `#stage-2-note`, right after it — new order:
   note → combined-total → `#stage-2-wrap`. Gated the same way as the note
   (`revealStage2()`/`editStage1()` toggle `.visible` on both). `#stage-2-note`'s "The
   savings estimate above" corrected to "below" (EN+ES) to match the real order.
   `revealStage2()` now scrolls to the note instead of the summary bar. Print CSS gets
   an explicit `display:flex!important` override so the total still leads the printed
   summary regardless of on-screen reveal state.
2. **Gate the sticky bar (P0).** `.sticky-bar` used to show the combined total from page
   load; now hidden until `revealStage2()` adds `.visible`. Also fixed a latent bug:
   `var stage2Revealed = false` executed *after* `applyStateFromURL()` could already
   call `revealStage2()` on a shared-link load, silently resetting the flag back to
   `false` and breaking sticky-bar gating for shared links. Declaration now runs first.
3. **Progress-pip indicator removed (P0).** The 7 `.progress-pip` dots had no CSS
   (invisible) and `markPip()`'s semantics were wrong — pips lit up when a section's
   *savings* were nonzero, not when the user had touched that question group.
   Reimplementing true per-question touch-tracking would be invasive for a component
   that was never visibly rendered; deleted the dead HTML block, `markPip()`, its 7
   call sites, and the "N / 7" counter instead of rebuilding it.
4. **Readable trust text (P1).** `.field-source` raised 11px italic
   `rgba(255,255,255,0.25)` (~1.9:1 contrast) → 12.5px non-italic
   `rgba(255,255,255,0.58)` (~6:1). Every field-source note over ~140 characters (55 of
   them) restructured into a short always-visible summary (the existing
   Default:/Source:/Auto-set: clause, unchanged) followed by a native
   `<details><summary>Why this default?</summary>` holding the remainder verbatim — no
   citation content deleted or reworded, only re-housed. New standalone EN fragments
   created by the split got their own `ES_I18N` entries (51 new keys); every
   pre-existing text node's content is untouched so its old translation keeps matching.
   `.disclaimer` raised 10px/0.16 alpha → 12px/0.45 alpha.
5. **Consolidated actions (P1).** Six top-bar buttons and five bottom buttons collapsed
   to: `[Text an expert] [Share / export ▾] [View data sources & assumptions]` (top,
   under the note) and `[Text an expert] [Share / export ▾]` (bottom). The dropdown
   holds Print summary / Engineer's report (PDF) / Copy scenario link / Email this
   estimate — accessible (aria-haspopup/aria-expanded, Esc + outside-click close),
   engineer's report gets its own icon (was sharing print's). Standalone bottom
   `.assump-bar` removed (redundant with the top-utility-row and action-bar copies);
   orphaned `.assump-bar` CSS removed. Before: ~13 always-visible action buttons.
   After: 6.
6. **Credibility-first opener (P1, owner-approved voice change).** "Most road failures
   start underground. Here's what that's costing you." → "A savings estimate you can
   defend." + a subhead naming the FHWA/AASHTO/state-DOT sourcing directly. Old
   ES_I18N keys for the retired strings replaced, not orphaned. Stopped the
   `.calc-header` top-bar `accentPulse` infinite animation (static top bar; decorative
   motion undermines the credibility register) and removed the now-unused
   `@keyframes`.

## model 3.7.3 — plain-English verdict, top-3 drivers, email-this-estimate, quick-start copy — 2026-07-09

No math/default changes (all 10 test files stay green, no snapshot re-baselines):

1. **Plain-English verdict sentence.** New `#ct-verdict` line in the combined-total
   hero, written by `calcAll()` alongside the combined total. States in one sentence
   whether In-Place wins from day one, wins after a break-even year, wins on
   lifecycle only, or — honestly, never hidden — loses on these inputs (with guidance
   on when In-Place typically wins). EN/ES via inline `LANG` ternaries, matching the
   existing `#ct-breakeven` pattern.
2. **"The three inputs that swing this estimate most."** New `#ct-influence` line
   below `#ct-range`, populated in `updateRange()` from the existing per-key
   `influence` array (reuses the same computation that already drives the
   "Largest drivers of the band" note). Lists the top 3 by delta with each input's
   +/- half-range. Cleared (not stale) whenever `updateRange()` returns early because
   structural credit is unlocked.
3. **"Email this estimate" button**, added to both the top action bar and the bottom
   CTA section (matching the existing `cta-btn-secondary` icon-button style). New
   `emailEstimate()` function reuses the scenario-link URL construction from
   `copyScenarioLink()` and opens a `mailto:` with a compact plain-text body: project
   name, geometry/soil/traffic line, the verdict sentence, construction/lifecycle/
   combined savings, break-even line, the scenario link, and model version. Guarded
   in try/catch like `copyScenarioLink()`.
4. **Quick-start copy pass** (copy-only). How-to strip: "1 Set dimensions / below" ->
   "1 Answer the quick questions / project basics below"; "2 Open sections / review &
   adjust" -> "2 See your savings / instant, defensible estimate"; "3 See savings /
   total at bottom" -> "3 Fine-tune if you want / open any section — optional".
   Parameters header "Project parameters — drives all sections below" -> "Quick
   questions — these build your estimate" (7/7 progress counter unchanged). All new/
   changed strings added to `ES_I18N`.

New dynamically-written ids (`ct-verdict`, `ct-influence`) added to
`I18N_DYNAMIC_IDS` so the static translator walker skips them.

## model 3.7.2 — 65+ legibility pass + action buttons relocated — 2026-07-09

No math changes; UI legibility and layout only (owner-requested, audience skews 65+):

1. **Selection-card descriptor text raised to a >=14px floor with stronger contrast**
   (decision text is not fine print): traffic cards tc-name 15->17, tc-desc 12->15
   (alpha .72->.85), tc-range 10->13, tc-esal/tc-sn 9->12.5 (alpha .38->.62); mobile
   variants raised to 16/15/12. Road-class cards rc-name 13->16, rc-desc 11->14
   (alpha .58->.80), rc-range 9->12. "Your estimate is ready" note 14/13 -> 17/15.
   Language-toggle buttons 11px -> 13px with larger tap targets. Source citations
   (field-source, 11px) deliberately unchanged — small/muted is intentional there.
2. **"View data sources & assumptions" button duplicated at the top**, next to the
   EN/ES toggle (compact variant; same openAssumptions()). Bottom button unchanged.
3. **Action bar added directly under the "Your estimate is ready" note** (before the
   A-F cost sections): Text an expert, Print summary, Engineer's report, Copy
   scenario link, and View data sources & assumptions. Same handlers as the bottom
   CTA section (which remains). Both Copy-link labels stay in sync (class-based
   label updates in setLang/copyScenarioLink); mobile stacks the bar vertically.

## model 3.7.1 — default opening scenario + state-default labeling — 2026-07-09

No math changes; two default/labeling changes (owner-approved):

1. **Default soil: A-3 fine sand → A-6 clayey soil.** Rationale (documented in the
   soil field's source note): weak-subgrade improvement is the product's primary use
   case, and A-6 carries the strongest natural-soil lab evidence in the per-soil
   table (Baja California 09-2025, Estimated badge) — whereas A-3 became the
   weakest-evidenced soil (Pending) after the 3.6 audit traced its 125% figure to a
   prepared stone blend. A-3 had been the default only because of that
   since-corrected attribution. At defaults this changes the opening numbers from
   construction −$108,820 / combined $248,226 to construction +$180,785 / combined
   $537,831. Every soil remains selectable; per-soil evidence notes and Pending
   warnings unchanged. `us-defaults` snapshot re-pinned deliberately (see test
   comment).
2. **State/pricing default made explicit.** The state selector's empty option now
   reads "— No state selected: national-average pricing —" and its source note
   states the 1.00 default index and clarifies the regional index applies equally
   to both alternatives (scales the size of savings, never the direction). EN + ES.
3. `test/eng-report.js` version assertion generalized to any `model X.Y.Z` string
   (was hardcoded to 3.7.0).

## model 3.7.0 — engineer's report export — 2026-07-09

Pure output feature — no change to any AASHTO or cost math. Adds a second, separate
print artifact aimed at a reviewing engineer, alongside the existing sales-facing
print snapshot (untouched).

1. **New optional input**: "Project name / location" (`c-project-name`, plain text,
   blank default, not used in any calculation) near the top of the project-parameters
   section. Appears on the printed Engineer's Report only.
2. **New button**, "Engineer's report (PDF / print)" (next to the existing "Print
   summary" button): populates a hidden `#eng-report` container via `buildEngReport()`,
   adds `eng-report-mode` to `<body>`, calls `window.print()`, and removes the class on
   `afterprint` (with a 2s fallback timeout). Print CSS scopes entirely on
   `body.eng-report-mode` — the existing print snapshot (`.print-header`/
   `.print-params`/`.print-assumptions`/`.results-block`, all inside `.wrap`) is
   completely unaffected when this mode is not active; `#eng-report` is always
   `display:none` on screen.
3. **`buildEngReport()`** performs no new math — it formats values `calcAll()`
   already derived. `calcAll()` now stashes its raw inputs/results into
   `window.__lastCalc` on every run (soil, road class, ESALs, Mr, SN, layer
   coefficients, thicknesses, LCCA parameters, etc.); the report also reads several
   already-rendered result-table cells and `#ip-treatedcbr-info` directly, so every
   number in the report is guaranteed to match the on-screen figures.
4. **Report content**: header (project name/date/model version + the "planning-level
   estimate, not a sealed design" disclaimer); §1 AASHTO-93 design inputs (W18, R%/Z_R,
   S0=0.45, ΔPSI=1.95, design subgrade CBR, Mr with citation, required SN); §2
   Conventional vs. In-Place alternative sections (layer thicknesses, coefficients and
   their basis, SN provided/required, surface mode); §3 treated-layer evidence basis
   (treated CBR, per-soil field-evidence text incl. the Pending-verification warning,
   UCS-unlock status/tier); §4 cost summary (sections A–E, direct cost, markups,
   construction totals/savings, then LCCA: discount citation, analysis period, annual
   maintenance, rehab cycles, salvage method, lifecycle NPVs, combined value, and the
   sensitivity band); §5 key assumptions & limitations (AASHTO-93 planning-method note,
   the four most influential unit-cost defaults with sources, the climate caveat, mix-
   design/testing requirement, Pending-default flag); §6 a Prepared-by/Reviewed-by(PE)
   signature block with blank note lines; §7 a compact transcription aid for
   independent verification in PaveXpress or equivalent AASHTO-93 software; and a
   footer with the model version and the live assumptions-register URL. Renders fully
   bilingually (EN/ES) via `LANG`, matching whichever language is active on screen.
5. **i18n**: the new field's label/note and the new button's label are added to
   `ES_I18N` (translated via the existing static text-walker); the report's own
   internal strings are built bilingually inline (same pattern `calcAll()` already
   uses for its dynamic result text).
6. **Tests**: new `test/eng-report.js` (6 checks) — defaults produce a report whose
   SN/W18/Mr/S0/treated-tier/construction-totals/model-version all match the on-page
   values; soil A-4 (Pending default) surfaces the Pending warning in §3; UCS-unlock
   @450 psi shows a2=0.20 with the psi value; a 13-soil × chip-seal × equal-surface
   sweep contains no `undefined`/`NaN`; `LANG='es'` produces the Spanish header;
   a hostile project name is HTML-escaped (no markup injection).
   Registered in `test/run.js` (now 10 files, all green); Peru regression/preset
   untouched.
7. **Review fixes (post-verification)**: the user-entered project name is HTML-escaped
   before insertion (XSS guard); `body.eng-report-mode` print CSS also hides
   `.print-params` (`#print-params`/`#print-assumptions` are body-level siblings of
   `.wrap`, not children — without this the regular print snapshot's parameter strip
   leaked above the report); equal-surface scenarios get a §2 note distinguishing the
   AASHTO structural section from the as-priced wear course; the project-name
   placeholder translates to Spanish.

## model 3.6.2 — wave 2b (structural pathway rework) — 2026-07-09

Replaces the model 3.6.1 "improved-subgrade Mr pathway" default with standard AASHTO
multi-layer treatment: the treated layer earns a CBR-tiered structural layer
coefficient (a2) from the SAME correlations the conventional aggregate base already
uses, instead of raising the native subgrade's resilient modulus. The 3.6.1 default
was reviewed and rejected — it treated a thin treated layer sitting in the
base-course position as if it were deep blended subgrade, denying it any layer role
while the conventional side kept full base credit. Like-for-like tiering removes
that asymmetry by applying identical correlations to both sides.

1. **Both sides share one required SN again**: `sn = solveSN(esals, zr,
   mrFromCBR(sgCBR))`, solved once from native subgrade Mr. The `snIP =
   solveSN(esals, zr, mrEff)` branch is removed from the default path; `snIP` is now
   just `sn`. `mrEffective()`, `MR_INFLUENCE_DEPTH_IN`, and `treatedCBRDefault` are
   all retained in the code — `mrEffective()` is unit-tested (`test/mr-blend.js`) but
   not used in this default calculation, kept for a possible future full-depth
   blended/reclamation mode; `treatedCBRDefault` now drives the tiered credit below
   instead of the Mr blend.
2. **New default layer coefficient, `a2IPDefault(soil, cbrTreated)`**: base-class
   (treated CBR ≥80) gets `getA2Conv(cbrTreated)` — the identical 0.14–0.18
   interpolation/cap the conventional base already uses; subbase-class (20–79) gets
   `A3_SB` (0.11) — the identical coefficient the conventional sub-base earns; below
   20, or on peat (policy floor), earns nothing. `thickIP = aspThick(sn,
   a2IP*treatDepth, minAC)` replaces the old zero-credit default.
3. **UCS-unlock is now additive-only**: `a2IP = Math.max(a2IPDefault(soil,
   cbrTreated), deriveA2FromUCS(psi))` when unlocked — a project-specific 7-day UCS
   result can only ADD credit beyond the CBR-based tier, into the published
   stabilized-base a2 classes (0.15/0.20/0.23, SUDAS 5J-3), never remove the tier the
   CBR evidence already earned. Peat stays force-locked at 0 regardless.
4. **Chip-seal gate reverts to its natural form, valid in both modes**:
   `chipSealViable = (esals<=csEsalMax) && (a2IP*treatDepth >= sn)`, with the
   `ucsUnlocked &&` condition removed. The `btn-chipseal` toggle is no longer
   force-disabled by the unlock checkbox — strong granular soils (treated CBR ≥80)
   can now legitimately reach chip-seal viability at the default tier alone, without
   a UCS test, the same way a conventional aggregate base at that CBR would.
5. **UI/copy rework (EN + ES)**: the UCS-unlock panel explanation, the treated-CBR
   field-source note, the on-page thickness-note text, and the chip-seal status
   messages all now describe the like-for-like tiered-credit default instead of the
   Mr-blend pathway. Assumptions register rewritten to match: "Layer coefficients,"
   a new "Like-for-like tiered layer credit (default) — model 3.6.2" entry replacing
   "Improved-subgrade Mr pathway," "Treated subgrade CBR by soil class," "Structural
   (a2) credit — UCS-unlock, beyond-base-class" (renamed/reworded from "conditional
   unlock"), and "Chip-seal gate — zero structural credit, natural form."
6. **Tests**: `test/ucs-unlock.js` rewritten for the new tiered semantics — locked
   mode matches `a2IPDefault` per soil, unlocking never decreases `a2IP` (13 soils ×
   4 psi values), and the chip-seal gate is exercised in locked mode (a1a/vlight
   viable, a4/heavy not viable). `test/us-defaults.js` re-baselined a second time
   (dated comment). `test/mr-blend.js` unchanged (still function-level). All 9 test
   files green: Peru regression/preset, typed-zero, no-nan (156 combos), citations,
   solver-roundtrip.

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
