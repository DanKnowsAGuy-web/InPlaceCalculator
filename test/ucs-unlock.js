/* UCS-UNLOCK INVARIANTS — locked-vs-unlocked structural (a2) credit gating.
   a2IP must never silently default to a nonzero tier; peat must never be
   unlockable; unlocking must gate chip seal; unchecking mid-chip-seal must
   force back to HMA. */
'use strict';
const { makeInstance, assert } = require('./lib');

const SOILS = ['a1a','a1b','a24','a25','a26','a27','a3','a4','a5','a6','a75','a76','peat'];

function a2Of(inst) {
  // a2IP is written back to the (now hidden/disabled) a2-ip slider's display
  // span at the top of calcAll() for continuity — read it back the same way
  // the UI does.
  return parseFloat(inst.els['ip-a2-display'].textContent);
}

// (a) default/unchecked -> a2IP === 0 across all 13 soils
for (const soil of SOILS) {
  const inst = makeInstance({ 'c-soil': soil });
  inst.hook.setType('new'); // -> updateSoilDefaults -> updateUCSUnlockUI -> calcAll
  assert(a2Of(inst) === 0, 'default/unchecked a2IP !== 0 for soil ' + soil + ' (got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (a): a2IP === 0 unchecked, all 13 soils');

// (b) checked with blank ucs-psi -> a2IP === 0 (no silent tier)
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '';
  inst.hook.calcAll();
  assert(a2Of(inst) === 0, '(b) blank ucs-psi with checkbox checked must not silently assume a tier (got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (b): blank ucs-psi -> a2IP === 0');

// (c) ucs-psi=193 -> a2IP === 0.15 (pins the exact GTS ND product-alone boundary)
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '193';
  inst.hook.calcAll();
  assert(a2Of(inst) === 0.15, '(c) ucs-psi=193 must yield a2IP=0.15 (got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (c): ucs-psi=193 (GTS ND boundary) -> a2IP === 0.15');

// (d) ucs-psi=450 -> 0.20, ucs-psi=700 -> 0.23
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '450';
  inst.hook.calcAll();
  assert(a2Of(inst) === 0.20, '(d) ucs-psi=450 must yield a2IP=0.20 (got ' + a2Of(inst) + ')');
  inst.els['ucs-psi'].value = '700';
  inst.hook.calcAll();
  assert(a2Of(inst) === 0.23, '(d) ucs-psi=700 must yield a2IP=0.23 (got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (d): ucs-psi=450 -> 0.20, ucs-psi=700 -> 0.23');

// (e) toggling the checkbox off while surfaceMode==='chipseal' forces 'hma'
{
  const inst = makeInstance({ 'c-soil': 'a1a', 'c-traffic': 'vlight' });
  inst.hook.setRoadClass('local');
  inst.hook.setType('new');
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '700';
  inst.hook.updateUCSUnlockUI(); // recomputes with unlocked credit, enables chip-seal btn
  inst.hook.setSurface('chipseal');
  assert(inst.hook.getSurfaceMode() === 'chipseal', 'precondition: surfaceMode should be chipseal before toggling off');
  inst.els['ucs-unlock-ack'].checked = false;
  inst.hook.updateUCSUnlockUI();
  assert(inst.hook.getSurfaceMode() === 'hma', '(e) unchecking mid-chip-seal must force surfaceMode back to hma (got ' + inst.hook.getSurfaceMode() + ')');
  assert(inst.els['btn-chipseal'].disabled === true, '(e) chip-seal button must be disabled once unlock is unchecked');
  assert(a2Of(inst) === 0, '(e) a2IP must return to 0 once unlock is unchecked');
}
console.log('PASS ucs-unlock (e): unchecking mid-chip-seal forces hma, disables the button, zeroes a2IP');

// (f) soil==='peat' forces the checkbox unchecked/disabled and a2IP===0 regardless of ucs-psi
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '700';
  inst.hook.calcAll();
  assert(a2Of(inst) === 0.23, 'precondition: a3 unlocked at 700 psi should be 0.23');
  const soilEl = inst.els['c-soil'];
  soilEl.value = 'peat';
  inst.hook.updateSoilDefaults();
  assert(inst.els['ucs-unlock-ack'].checked === false, '(f) peat must force the acknowledgment unchecked');
  assert(inst.els['ucs-unlock-ack'].disabled === true, '(f) peat must force the acknowledgment disabled');
  assert(a2Of(inst) === 0, '(f) peat must yield a2IP=0 regardless of a previously entered ucs-psi (got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (f): peat forces unlock unchecked/disabled, a2IP === 0');

console.log('PASS ucs-unlock: all locked/unlocked invariants hold');
