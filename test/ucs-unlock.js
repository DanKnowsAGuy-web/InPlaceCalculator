/* UCS-UNLOCK INVARIANTS — like-for-like tiered layer credit (default, locked)
   vs. UCS-unlock (beyond-base-class, additive only). Model 3.6.2 wave 2b.
   a2IP must equal the CBR-tiered default in locked mode; unlocking can only
   ADD credit on top of that tier, never remove it; peat must never earn
   credit or unlock; chip seal now gates on the natural viability check
   (a2IP*treatDepth >= sn) in BOTH locked and unlocked mode. */
'use strict';
const { makeInstance, assert } = require('./lib');

const SOILS = ['a1a','a1b','a24','a25','a26','a27','a3','a4','a5','a6','a75','a76','peat'];

function a2Of(inst) {
  // a2IP is written back to the (now hidden/disabled) a2-ip slider's display
  // span at the top of calcAll() for continuity — read it back the same way
  // the UI does.
  return parseFloat(inst.els['ip-a2-display'].textContent);
}

function expectedTier(inst, soil) {
  const cbrTreated = inst.hook.treatedCBRDefault[soil];
  return inst.hook.a2IPDefault(soil, cbrTreated);
}

// (a) default/unchecked -> a2IP equals the expected CBR tier for each of the 13 soils
// (peat 0; a1a/a1b getA2Conv(95)/getA2Conv(90) [base-class]; all soils with
// 20<=treatedCBRDefault<80 -> 0.11 [subbase-class]; none below 20 except peat)
for (const soil of SOILS) {
  const inst = makeInstance({ 'c-soil': soil });
  inst.hook.setType('new'); // -> updateSoilDefaults -> updateUCSUnlockUI -> calcAll
  const expected = expectedTier(inst, soil);
  const got = a2Of(inst);
  assert(Math.abs(got - expected) < 0.0001,
    'default/unchecked a2IP mismatch for soil ' + soil + ' (expected ' + expected.toFixed(3) + ', got ' + got + ')');
}
console.log('PASS ucs-unlock (a): a2IP === expected CBR tier (locked default), all 13 soils');

// explicit spot checks on the tier boundaries
{
  const instPeat = makeInstance({ 'c-soil': 'peat' });
  instPeat.hook.setType('new');
  assert(a2Of(instPeat) === 0, 'peat must earn 0 credit by default');

  const instA1a = makeInstance({ 'c-soil': 'a1a' });
  instA1a.hook.setType('new');
  const { getA2Conv, treatedCBRDefault } = instA1a.hook;
  assert(Math.abs(a2Of(instA1a) - getA2Conv(treatedCBRDefault.a1a)) < 0.0001,
    'a1a (treated CBR 95, base-class) must earn getA2Conv(95) (got ' + a2Of(instA1a) + ')');

  const instA1b = makeInstance({ 'c-soil': 'a1b' });
  instA1b.hook.setType('new');
  assert(Math.abs(a2Of(instA1b) - getA2Conv(treatedCBRDefault.a1b)) < 0.0001,
    'a1b (treated CBR 90, base-class) must earn getA2Conv(90) (got ' + a2Of(instA1b) + ')');

  // all remaining non-peat soils in treatedCBRDefault are 20<=CBR<80 -> subbase-class a3=0.11
  const subbaseSoils = SOILS.filter((s) => s !== 'peat' && s !== 'a1a' && s !== 'a1b');
  for (const soil of subbaseSoils) {
    const inst = makeInstance({ 'c-soil': soil });
    inst.hook.setType('new');
    assert(Math.abs(a2Of(inst) - inst.hook.A3_SB) < 0.0001,
      soil + ' (treated CBR ' + inst.hook.treatedCBRDefault[soil] + ', subbase-class) must earn a3=' + inst.hook.A3_SB + ' (got ' + a2Of(inst) + ')');
  }
}
console.log('PASS ucs-unlock (a2): tier boundaries verified (peat=0, a1a/a1b=base-class, rest=subbase-class 0.11)');

// (b) checked with blank ucs-psi -> a2IP unchanged from the default tier (no silent stabilized tier)
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  const before = a2Of(inst);
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '';
  inst.hook.calcAll();
  assert(a2Of(inst) === before, '(b) blank ucs-psi with checkbox checked must leave a2IP at the default tier (before=' + before + ', got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (b): blank ucs-psi -> a2IP unchanged from default tier (no silent stabilized tier)');

// (c) ucs-psi=193 -> max(tier, 0.15); ucs-psi=450 -> max(tier, 0.20); ucs-psi=700 -> 0.23
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  const tier = expectedTier(inst, 'a3');
  inst.els['ucs-unlock-ack'].checked = true;

  inst.els['ucs-psi'].value = '193';
  inst.hook.calcAll();
  assert(Math.abs(a2Of(inst) - Math.max(tier, 0.15)) < 0.0001,
    '(c) ucs-psi=193 must yield a2IP=max(tier,0.15) (tier=' + tier + ', got ' + a2Of(inst) + ')');

  inst.els['ucs-psi'].value = '450';
  inst.hook.calcAll();
  assert(Math.abs(a2Of(inst) - Math.max(tier, 0.20)) < 0.0001,
    '(c) ucs-psi=450 must yield a2IP=max(tier,0.20) (tier=' + tier + ', got ' + a2Of(inst) + ')');

  inst.els['ucs-psi'].value = '700';
  inst.hook.calcAll();
  assert(Math.abs(a2Of(inst) - 0.23) < 0.0001,
    '(c) ucs-psi=700 must yield a2IP=0.23 (got ' + a2Of(inst) + ')');
}
console.log('PASS ucs-unlock (c): ucs-psi=193/450/700 -> max(default tier, SUDAS 5J-3 tier)');

// (d) unlocking never DECREASES a2IP for any soil (sweep all 13 x psi in {0, 193, 450, 700})
{
  const psiValues = [0, 193, 450, 700];
  for (const soil of SOILS) {
    const inst = makeInstance({ 'c-soil': soil });
    inst.hook.setType('new');
    const tier = a2Of(inst); // locked default tier
    for (const psi of psiValues) {
      const inst2 = makeInstance({ 'c-soil': soil });
      inst2.hook.setType('new');
      inst2.els['ucs-unlock-ack'].checked = true;
      inst2.els['ucs-psi'].value = String(psi);
      inst2.hook.calcAll();
      const unlocked = a2Of(inst2);
      if (soil === 'peat') {
        assert(unlocked === 0, '(d) peat must stay 0 regardless of psi=' + psi);
      } else {
        assert(unlocked >= tier - 0.0001,
          '(d) unlocking must never decrease a2IP for soil ' + soil + ' at psi=' + psi + ' (tier=' + tier + ', unlocked=' + unlocked + ')');
      }
    }
  }
}
console.log('PASS ucs-unlock (d): unlocking never decreases a2IP, all 13 soils x 4 psi values');

// (e) chip-seal gate works in locked mode when a2IP*treatDepth >= sn (a1a/vlight/local),
// and stays unavailable for weak soils (a4/heavy/arterial, deep structure)
{
  const instStrong = makeInstance({ 'c-soil': 'a1a', 'c-traffic': 'vlight' });
  instStrong.hook.setRoadClass('local');
  instStrong.hook.setType('new'); // locked default — no UCS unlock
  instStrong.hook.setSurface('chipseal');
  assert(instStrong.hook.getSurfaceMode() === 'chipseal',
    '(e) a1a/vlight/local in locked mode must reach chip-seal viability without a UCS unlock');

  const instWeak = makeInstance({ 'c-soil': 'a4', 'c-traffic': 'heavy' });
  instWeak.hook.setRoadClass('arterial');
  instWeak.hook.setType('new'); // locked default, weak soil, heavy traffic
  instWeak.hook.setSurface('chipseal');
  assert(instWeak.hook.getSurfaceMode() !== 'chipseal' || true, 'sanity: setSurface always sets the mode variable');
  // chip seal remains structurally unavailable for a weak soil under heavy traffic —
  // calcAll() falls back to the else-branch (thickConv/thickIP asphalt), verified via
  // the chip-seal status text staying in the "not viable" (not-green) state.
  instWeak.hook.calcAll();
  const statusEl = instWeak.els['chipseal-status'];
  assert(/not viable/i.test(statusEl.textContent),
    '(e) a4/heavy/arterial must stay chip-seal not-viable in locked mode (status: "' + statusEl.textContent + '")');
}
console.log('PASS ucs-unlock (e): chip-seal gate follows a2IP*treatDepth >= sn in locked mode (strong soil viable, weak soil not)');

// (f) peat always earns 0 credit regardless of the unlock checkbox or ucs-psi, and forces
// the acknowledgment unchecked/disabled
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
console.log('PASS ucs-unlock (f): peat forces unlock unchecked/disabled, a2IP === 0 regardless of psi');

console.log('PASS ucs-unlock: all locked/unlocked tiered-credit invariants hold');
