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
/* Re-pinned 2026-07-09 (model 3.6.0, wave 1, item 5). Deliberate re-baseline: the
   new aggregate compacted-density input defaults to 140 lb/ft^3 (was hardcoded
   110), raising conventional base/sub-base tonnage ~27% and rt-direct-conv by
   roughly $50k. Construction savings flip from slightly negative to positive at
   defaults (-10,715 -> +57,643) because the conventional side carries the extra
   aggregate tonnage cost, not the In-Place side. See CHANGELOG.md model 3.6.0. */
const SNAPSHOT = {
  'rt-direct-conv': 734818,
  'rt-direct-ip': 692743,
  'rt-total-sav': 57643,
  'ct-val': 414689
};
for (const k in SNAPSHOT) approx(g(k), SNAPSHOT[k], 0.005, 'snapshot ' + k);
console.log('PASS us-defaults: consistent + snapshot matched (combined ' + inst.getText('ct-val') + ')');
