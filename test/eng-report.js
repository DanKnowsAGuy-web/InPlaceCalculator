/* ENGINEER'S REPORT EXPORT — buildEngReport() must produce a report that
   agrees exactly with the already-rendered on-page numbers (required SN, W18,
   Mr, S0, construction totals, model version), surfaces the per-soil Pending
   warning and UCS-unlock tier where applicable, never leaks 'undefined'/'NaN'
   into the HTML, and renders bilingually via the existing LANG mechanism.
   buildEngReport() must never call window.print() itself — that is the
   click-handler's (openEngReport()) job, exercised only by a human/browser. */
'use strict';
const { makeInstance, assert } = require('./lib');

// (a) defaults: required SN / W18 / Mr / S0 / treated-layer tier / construction
// totals / model version all present and consistent with the on-page values
{
  const inst = makeInstance();
  inst.hook.calcAll();
  const html = inst.hook.buildEngReport();
  const lc = inst.hook.getLastCalc();

  assert(!!lc, '(a) window.__lastCalc must be stashed by calcAll()');
  assert(html.length > 500, '(a) report HTML looks too short: ' + html.length);

  const snPage = inst.getText('d-sn').trim();
  assert(html.indexOf(lc.sn.toFixed(2)) >= 0,
    '(a) report must include the required SN (' + lc.sn.toFixed(2) + '), page shows ' + snPage);
  assert(html.indexOf(Math.round(lc.esals).toLocaleString()) >= 0,
    '(a) report must include the W18 (design ESALs) value');
  assert(html.indexOf(Math.round(lc.mrNative).toLocaleString()) >= 0,
    '(a) report must include the Mr value');
  assert(html.indexOf('0.45') >= 0, '(a) report must include S0 = 0.45');
  assert(html.indexOf(lc.tierLabelEn) >= 0, '(a) report must include the treated-layer tier basis text');

  ['rt-total-conv', 'rt-total-ip', 'rt-total-sav'].forEach((id) => {
    const val = inst.getText(id).trim();
    assert(val && html.indexOf(val) >= 0, '(a) report must include ' + id + ' (' + val + ') matching the on-page total');
  });

  assert(/model 3\.\d+\.\d+/.test(html), '(a) report must include the model version string');
  assert(!/undefined/.test(html) && !/NaN/.test(html), '(a) report must not contain undefined/NaN at defaults');
}
console.log('PASS eng-report (a): defaults — SN/W18/Mr/S0/tier/totals/version all present and consistent');

// (b) soil a4 (Pending default) -> Pending warning text appears in the report's §3
{
  const inst = makeInstance({ 'c-soil': 'a4' });
  inst.hook.setType('new');
  const html = inst.hook.buildEngReport();
  assert(/Pending verification/.test(html), '(b) soil a4 (Pending default) must surface the Pending warning in the report');
}
console.log('PASS eng-report (b): Pending-default soil (a4) surfaces the Pending warning');

// (c) UCS unlocked @450 psi -> a2 = 0.20 and 450 psi shown
{
  const inst = makeInstance({ 'c-soil': 'a3' });
  inst.hook.setType('new');
  inst.els['ucs-unlock-ack'].checked = true;
  inst.els['ucs-psi'].value = '450';
  inst.hook.calcAll();
  const html = inst.hook.buildEngReport();
  assert(/a2=0\.20/.test(html), '(c) UCS-unlocked report must show a2=0.20');
  assert(html.indexOf('450 psi') >= 0, '(c) UCS-unlocked report must show the entered psi value');
  assert(!/undefined/.test(html) && !/NaN/.test(html), '(c) UCS-unlocked report must not contain undefined/NaN');
}
console.log('PASS eng-report (c): UCS-unlock @450 psi -> a2=0.20 shown with the psi value');

// (d) sweep several scenarios (defaults, soils, UCS on/off, chip seal, equal surface) for
// no 'undefined'/'NaN' anywhere in the generated HTML
{
  const SOILS = ['a1a', 'a1b', 'a24', 'a25', 'a26', 'a27', 'a3', 'a4', 'a5', 'a6', 'a75', 'a76', 'peat'];
  for (const soil of SOILS) {
    const inst = makeInstance({ 'c-soil': soil });
    inst.hook.setType('new');
    const html = inst.hook.buildEngReport();
    assert(!/undefined/.test(html), '(d) soil ' + soil + ': report contains "undefined"');
    assert(!/NaN/.test(html), '(d) soil ' + soil + ': report contains "NaN"');
  }
  const instChip = makeInstance({ 'c-soil': 'a1a', 'c-traffic': 'vlight' });
  instChip.hook.setRoadClass('local');
  instChip.hook.setType('new');
  instChip.hook.setSurface('chipseal');
  const htmlChip = instChip.hook.buildEngReport();
  assert(!/undefined/.test(htmlChip) && !/NaN/.test(htmlChip), '(d) chip-seal scenario: no undefined/NaN');

  const instEq = makeInstance();
  instEq.hook.setSurface('equal');
  const htmlEq = instEq.hook.buildEngReport();
  assert(!/undefined/.test(htmlEq) && !/NaN/.test(htmlEq), '(d) equal-surface scenario: no undefined/NaN');
}
console.log('PASS eng-report (d): no undefined/NaN across 13 soils, chip-seal, and equal-surface scenarios');

// (e) LANG='es' -> Spanish header
{
  const inst = makeInstance();
  inst.hook.setLang('es');
  const html = inst.hook.buildEngReport();
  assert(html.indexOf('Informe de Revisión de Ingeniería') >= 0, '(e) LANG=es must produce the Spanish report header');
  assert(!/undefined/.test(html) && !/NaN/.test(html), '(e) Spanish report must not contain undefined/NaN');
  inst.hook.setLang('en'); // leave global-ish state predictable, defensive only (each test uses a fresh instance)
}
console.log('PASS eng-report (e): LANG=es produces the Spanish report header');

// (f) hostile project name must be escaped — user text renders as text, never markup
{
  const inst = makeInstance();
  inst.els['c-project-name'] = inst.els['c-project-name'] || { value: '' };
  inst.els['c-project-name'].value = '<img src=x onerror="hacked()"><script>bad()</script>';
  inst.hook.calcAll();
  const html = inst.hook.buildEngReport();
  assert(html.indexOf('<img') < 0 && html.indexOf('<script') < 0,
    '(f) hostile project name must not inject raw markup into the report HTML');
  assert(html.indexOf('&lt;img') >= 0,
    '(f) hostile project name must appear HTML-escaped in the report');
}
console.log('PASS eng-report (f): project name is HTML-escaped (no markup injection)');

console.log('PASS eng-report: all Engineer\'s Report export invariants hold');
