/* SOLVER ROUND-TRIP — decoupled numerical-correctness smoke test for solveSN,
   independent of the DOM. For a grid of (esals, mr) pairs, solve for the
   required SN, then back-substitute into the AASHTO 1993 predicted-log10(W18)
   equation and confirm the round-trip holds within tolerance. */
'use strict';
const { makeInstance, assert } = require('./lib');

const inst = makeInstance();
const { solveSN, SN_S0, SN_DPSI, zrByRoadClass } = inst.hook;

assert(typeof solveSN === 'function', 'solveSN exposed');

function predicted(sn, zr, mr) {
  const s1 = sn + 1;
  return zr * SN_S0 + 9.36 * (Math.log(s1) / Math.LN10) - 0.20
    + (Math.log(SN_DPSI / 2.7) / Math.LN10) / (0.40 + 1094 / Math.pow(s1, 5.19))
    + 2.32 * (Math.log(mr) / Math.LN10) - 8.07;
}

const esalsGrid = [1000, 5000, 50000, 300000, 1000000, 3000000, 7000000, 15000000];
const mrGrid = [1500, 2500, 4000, 6000, 9000, 14000];
const zr = zrByRoadClass['arterial'];

let checked = 0;
for (const esals of esalsGrid) {
  for (const mr of mrGrid) {
    const sn = solveSN(esals, zr, mr);
    assert(isFinite(sn) && sn >= 0.5 && sn <= 9.0, 'solveSN(' + esals + ',' + mr + ') out of bisection bounds: ' + sn);
    const target = Math.log(esals) / Math.LN10;
    const back = predicted(sn, zr, mr);
    // Round-trip should match to a tight tolerance, except at the clamped bisection
    // bounds (sn=0.5 or sn=9.0) where the equation may not be exactly satisfiable.
    if (sn > 0.5 && sn < 9.0) {
      assert(Math.abs(back - target) < 0.01, 'round-trip mismatch at esals=' + esals + ' mr=' + mr + ' sn=' + sn + ': predicted ' + back.toFixed(4) + ' vs target ' + target.toFixed(4));
    }
    checked++;
  }
}
console.log('PASS solver-roundtrip: ' + checked + ' (esals, mr) pairs round-trip through solveSN within tolerance');
