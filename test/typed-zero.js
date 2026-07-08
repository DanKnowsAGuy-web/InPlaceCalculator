/* TYPED-ZERO INTEGRITY — a user-entered 0 must be used in the math.
   For each field where 0 is a meaningful value and the default is non-zero,
   the combined output with '0' must differ from the output with a blank field
   (blank legitimately falls back to the default). */
'use strict';
const { makeInstance, assert } = require('./lib');

/* field -> optional extra setup so the field actually participates in the result */
const FIELDS = {
  'a-haul-agg': {},
  'a-haul-soil': {},
  'a-truck-rate': {},
  'b-excav-rate': {},
  'c-agg': {},
  'c-subbase-cost': { 'c-subbase-depth': 6 },
  'c-place-rate': {},
  'ip-price-gal': {},
  'c-ip-labor': {},
  'd-asp-mat': {},
  'd-asp-place': {},
  'd-prime': {},
  'e-tc-rate': {},
  'e-conv-mob': {},
  'e-ip-mob': {},
  'c-mixdesign': {},
  'l-fail': {},
  'l-ext': {},
  'l-rehab-cost': {},
  'l-discount': {},
  'oh-pct': {},
  'profit-pct': {},
  'ce-pct': {},
  'cont-pct': {}
};

/* Observe both the combined savings AND the conventional total: fields that apply
   equally to both sides (e.g. prime coat) cancel in savings but must move the totals. */
function outputsWith(fieldId, value, setup) {
  const inst = makeInstance();
  for (const k in setup) inst.set(k, setup[k]);
  inst.set(fieldId, value);
  inst.hook.calcAll();
  const combined = inst.getNum('ct-val');
  const convTotal = inst.getNum('rt-total-conv');
  assert(isFinite(combined) && isFinite(convTotal), fieldId + ': output not finite');
  return { combined, convTotal };
}

let tested = 0;
for (const id in FIELDS) {
  const setup = FIELDS[id];
  const z = outputsWith(id, '0', setup);
  const b = outputsWith(id, '', setup);
  assert(z.combined !== b.combined || z.convTotal !== b.convTotal,
    id + ": typed 0 produced the same result as blank — 0 is being silently replaced by the default " +
    '(zero=' + z.combined + '/' + z.convTotal + ', blank=' + b.combined + '/' + b.convTotal + ')');
  tested++;
}
console.log('PASS typed-zero: ' + tested + ' fields honor a typed 0');
