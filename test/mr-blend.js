/* MR-BLEND UNIT TESTS — mrFromCBR / mrEffective, the depth-weighted log-space
   blend that anchors the improved-subgrade Mr pathway (model 3.6.1). */
'use strict';
const { makeInstance, assert, approx } = require('./lib');

const inst = makeInstance();
const { mrFromCBR, mrEffective } = inst.hook;

assert(typeof mrFromCBR === 'function', 'mrFromCBR exposed');
assert(typeof mrEffective === 'function', 'mrEffective exposed');

const cbrT = 60, cbrN = 12; // A-3-like: treated 60, native 12

// w=0 edge: no treatment depth -> effective Mr equals native Mr exactly
approx(mrEffective(0, cbrT, cbrN), mrFromCBR(cbrN), 0.0001, 'mrEffective(0,...) == mrFromCBR(native)');

// w=1 edge: treatment depth at the 30" influence depth -> effective Mr equals treated Mr exactly
approx(mrEffective(30, cbrT, cbrN), mrFromCBR(cbrT), 0.0001, 'mrEffective(30,...) == mrFromCBR(treated)');

// clamp holds beyond the influence depth: identical to the 30" result
approx(mrEffective(60, cbrT, cbrN), mrEffective(30, cbrT, cbrN), 0.0001, 'mrEffective(60,...) clamps to the 30" result');

// interior point (15") lies strictly between native and treated Mr when treated > native
const mrMid = mrEffective(15, cbrT, cbrN);
const mrLo = mrFromCBR(cbrN), mrHi = mrFromCBR(cbrT);
assert(mrMid > mrLo && mrMid < mrHi, 'mrEffective(15,...) lies strictly between native and treated Mr (' + mrLo.toFixed(1) + ' < ' + mrMid.toFixed(1) + ' < ' + mrHi.toFixed(1) + ')');

// monotonic increase in treatment depth for cbrTreated > cbrNative
let prev = mrEffective(0, cbrT, cbrN);
for (let d = 3; d <= 30; d += 3) {
  const cur = mrEffective(d, cbrT, cbrN);
  assert(cur >= prev - 1e-9, 'mrEffective monotonic increasing at depth ' + d + ' (prev=' + prev.toFixed(3) + ', cur=' + cur.toFixed(3) + ')');
  prev = cur;
}

// finite for the peat edge case (native = treated = 1, floored at 0.5 internally by mrFromCBR)
assert(isFinite(mrEffective(7, 1, 1)), 'mrEffective finite for peat (native=treated=1)');
approx(mrEffective(7, 1, 1), mrFromCBR(1), 0.0001, 'mrEffective(peat) == mrFromCBR(1) regardless of depth (no uplift)');

console.log('PASS mr-blend: mrFromCBR/mrEffective edges, clamp, monotonicity, and peat floor all verified');
