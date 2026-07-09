/* US-DEFAULTS SMOKE — the default run must be finite, internally consistent,
   and match the pinned snapshot. If a default deliberately changes, update the
   SNAPSHOT values below in the same commit and say so in the commit message. */
'use strict';
const { makeInstance, assert, approx } = require('./lib');

const inst = makeInstance();
inst.hook.calcAll();
const g = (id) => inst.getNum(id);

for (const id of ['ct-val','rt-total-conv','rt-total-ip','rt-total-sav','rt-direct-conv','rt-direct-ip','rt-ohp-conv','rt-F-sav']) {
  assert(isFinite(g(id)), id + ' not finite: "' + inst.getText(id) + '"');
}

// Internal consistency: direct + OH/profit/tax = total (allow $2 rounding)
assert(Math.abs(g('rt-direct-conv') + g('rt-ohp-conv') - g('rt-total-conv')) <= 2, 'conv: direct + foot != total');
assert(Math.abs(g('rt-direct-ip') + g('rt-ohp-ip') - g('rt-total-ip')) <= 2, 'ip: direct + foot != total');
// Foot = 37% of direct at defaults (10% OH + 7% profit + 10% CE + 10% contingency, 0 tax)
approx(g('rt-ohp-conv'), g('rt-direct-conv') * 0.37, 0.02, 'conv foot = 37% of direct');
// Combined = construction savings + lifecycle savings
assert(Math.abs(g('rt-total-sav') + g('rt-F-sav') - g('ct-val')) <= 3, 'combined != construction + lifecycle');

/* SNAPSHOT — pinned from the default run (1 mi, 2 lanes, 12 ft, A-3, medium,
   new construction, national region). Tolerance 0.5%. Update deliberately only. */
/* Re-pinned 2026-07-09 (model 3.6.0, wave 1, items 5-6). Deliberate re-baseline,
   two changes: (5) the new aggregate compacted-density input defaults to 140
   lb/ft^3 (was hardcoded 110), raising conventional base/sub-base tonnage ~27%;
   (6) excavation rate default raised $5.00 -> $8.00/CY (TxDOT statewide average
   low bid). Both raise rt-direct-conv only (conventional-only cost lines), so
   construction savings flip from slightly negative to clearly positive at
   defaults (-10,715 -> +72,110). See CHANGELOG.md model 3.6.0. */
/* Re-pinned 2026-07-09 (model 3.6.1, wave 2, methodology change, not a
   regression). In-Place is now modeled by default as an improved subgrade
   (Mr uplift only) rather than a structural base: a2IP defaults to 0.00
   (was 0.20), so the In-Place side's asphalt must carry its full required SN
   on its own instead of getting a 0.20 x treatDepth layer-coefficient credit
   subtracted from it first. Structural credit is now available only after a
   project-specific 7-day UCS test is entered (UCS-unlock). At A-3 defaults
   this raises rt-direct-ip materially (asphalt tonnage on the In-Place side
   goes up) and flips rt-total-sav (construction savings alone) from positive
   to negative; lifecycle NPV savings still dominate the combined total
   (ct-val), which stays positive. This is the intended defensibility
   correction, not a bug — see CHANGELOG.md model 3.6.1 and the "Improved-
   subgrade Mr pathway" / "Structural (a2) credit" assumptions-register
   entries. */
/* Re-pinned 2026-07-09 (model 3.6.2, wave 2b, structural pathway rework,
   second deliberate re-baseline). The 3.6.1 improved-subgrade Mr-blend
   default was reviewed and rejected as the wrong physical model for a thin
   treated layer sitting in the base-course position; it is replaced by
   standard AASHTO multi-layer treatment — the treated layer now earns a
   like-for-like CBR-tiered layer coefficient (a2IPDefault) from the SAME
   correlations the conventional side already uses. At A-3 defaults
   (treatedCBRDefault.a3 = 60, a subbase-class tier, a2 = A3_SB = 0.11) this
   restores some of the In-Place asphalt-thickness credit that the 3.6.1
   Mr-only default removed: rt-direct-ip drops back down (912,853 -> 824,809)
   and rt-total-sav / ct-val both move back toward — but do not fully return
   to — the pre-3.6.1 (wave-1) figures, because the default tier (a3=0.11) is
   still well below the old flat a2IP=0.20 assumption it replaced. Not a
   regression — see CHANGELOG.md model 3.6.2 and the "Like-for-like tiered
   layer credit" / "Layer coefficients" assumptions-register entries. */
const SNAPSHOT = {
  'rt-direct-conv': 745378,
  'rt-direct-ip': 824809,
  'rt-total-sav': -108820,
  'ct-val': 248226
};
for (const k in SNAPSHOT) approx(g(k), SNAPSHOT[k], 0.005, 'snapshot ' + k);
console.log('PASS us-defaults: consistent + snapshot matched (combined ' + inst.getText('ct-val') + ')');
