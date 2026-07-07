/* PERU PRESET — the in-UI "Load worked example" button must reproduce the same
   ledger as test/peru-regression.js. Guards against the preset and the regression
   test drifting apart (PERU_EXAMPLE in index.html mirrors the regression inputs). */
'use strict';
const { makeInstance, approx, assert } = require('./lib');

const inst = makeInstance();
inst.hook.loadPeruExample();

const conv = inst.getNum('rt-total-conv');
const ip   = inst.getNum('rt-total-ip');
approx(conv, 107363.84, 0.01, 'preset: conventional total (Budget B)');
approx(ip,   100684.80, 0.01, 'preset: In-Place total (Budget A)');
const savPct = 100 * (conv - ip) / conv;
assert(savPct > 5.9 && savPct < 6.6, 'preset: savings % ≈ 6.22 (got ' + savPct.toFixed(2) + ')');
// currency symbol switched to soles for the example
assert(inst.getText('rt-total-conv').indexOf('S/') === 0, 'preset: totals display in S/ (got "' + inst.getText('rt-total-conv') + '")');

console.log('PASS peru-preset: worked example reproduces the ledger (' + inst.getText('rt-total-conv') + ' vs ' + inst.getText('rt-total-ip') + ', ' + savPct.toFixed(2) + '%)');
