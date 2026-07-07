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
// Foot = 17% of direct at defaults (10% OH + 7% profit, 0 tax)
approx(g('rt-ohp-conv'), g('rt-direct-conv') * 0.17, 0.02, 'conv foot = 17% of direct');
// Combined = construction savings + lifecycle savings
assert(Math.abs(g('rt-total-sav') + g('rt-F-sav') - g('ct-val')) <= 3, 'combined != construction + lifecycle');

/* SNAPSHOT — pinned from the Phase 1 default run (1 mi, 2 lanes, 12 ft, A-3, medium,
   new construction, national region). Tolerance 0.5%. Update deliberately only. */
/* Pinned 2026-07-07 (Phase 1). Note: construction savings are NEGATIVE at defaults —
   an honest consequence of consumer-priced product ($30/gal × 0.12 × 9" = $32.40/SY);
   this was already true on main (−$32,689 there; swell factor narrows it here).
   The combined total stays positive via lifecycle savings. */
const SNAPSHOT = {
  'rt-direct-conv': 750955,
  'rt-direct-ip': 767108,
  'rt-total-sav': -18899,
  'ct-val': 563191
};
for (const k in SNAPSHOT) approx(g(k), SNAPSHOT[k], 0.005, 'snapshot ' + k);
console.log('PASS us-defaults: consistent + snapshot matched (combined ' + inst.getText('ct-val') + ')');
