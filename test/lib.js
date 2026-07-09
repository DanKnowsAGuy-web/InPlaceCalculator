/* Shared loader: runs the calculator's real <script> from index.html in a stubbed DOM,
   seeded with the HTML default values, and returns hooks + element map. No dependencies. */
'use strict';
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, '..', 'index.html');

function loadHtml() {
  return fs.readFileSync(HTML_PATH, 'utf8');
}

/* Extract default values for every <input> (value attr) and <select> (selected option). */
function extractDefaults(html) {
  const defaults = {};
  const inputRe = /<input\b[^>]*>/g;
  let m;
  while ((m = inputRe.exec(html))) {
    const tag = m[0];
    const idm = tag.match(/\bid="([^"]+)"/);
    if (!idm) continue;
    const vm = tag.match(/\bvalue="([^"]*)"/);
    defaults[idm[1]] = vm ? vm[1] : '';
  }
  const selectRe = /<select\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g;
  while ((m = selectRe.exec(html))) {
    const id = m[1], body = m[2];
    let sel = body.match(/<option\s+value="([^"]*)"[^>]*\bselected\b/);
    if (!sel) sel = body.match(/<option\s+value="([^"]*)"/);
    defaults[id] = sel ? sel[1] : '';
  }
  return defaults;
}

function makeInstance(overridesBeforeInit) {
  const html = loadHtml();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const defaults = extractDefaults(html);

  const els = {};
  function stub(id) {
    if (!els[id]) els[id] = {
      value: (defaults[id] !== undefined ? defaults[id] : ''),
      textContent: '', innerHTML: '', style: {}, min: '', max: '',
      classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      options: [{ text: '—' }], selectedIndex: 0, scrollIntoView(){}
    };
    return els[id];
  }
  // pre-create every element that has a default so init sees them
  Object.keys(defaults).forEach(stub);
  if (overridesBeforeInit) {
    for (const id in overridesBeforeInit) stub(id).value = overridesBeforeInit[id];
  }

  const document = {
    getElementById: stub,
    querySelectorAll: () => [],
    querySelector: () => stub('__q'),
    addEventListener(){}
  };
  const window = { addEventListener(){}, scrollTo(){}, print(){}, location: {} };
  const hook = {};
  const expose = ';__hook.calcAll=calcAll;__hook.setType=setType;__hook.updateSoilDefaults=updateSoilDefaults;' +
    '__hook.setSurface=setSurface;__hook.setTraffic=setTraffic;__hook.setRoadClass=setRoadClass;' +
    '__hook.loadPeruExample=loadPeruExample;' +
    '__hook.mrFromCBR=mrFromCBR;__hook.mrEffective=mrEffective;__hook.solveSN=solveSN;__hook.deriveA2FromUCS=deriveA2FromUCS;' +
    '__hook.updateUCSUnlockUI=updateUCSUnlockUI;__hook.SN_S0=SN_S0;__hook.SN_DPSI=SN_DPSI;' +
    '__hook.zrByRoadClass=zrByRoadClass;__hook.treatedCBRDefault=treatedCBRDefault;' +
    '__hook.a2IPDefault=a2IPDefault;__hook.getA2Conv=getA2Conv;__hook.A3_SB=A3_SB;' +
    '__hook.getSurfaceMode=function(){return surfaceMode;};';
  const fn = new Function('document', 'window', '__hook', script + expose);
  fn(document, window, hook);

  function set(id, v) { stub(id).value = String(v); }
  function getNum(id) {
    const el = els[id]; if (!el) return NaN;
    const t = (el.textContent || el.innerHTML || '').toString();
    const v = parseFloat(t.replace(/[^0-9.\-]/g, ''));
    return v;
  }
  function getText(id) { const el = els[id]; return el ? (el.textContent || el.innerHTML || '') : ''; }
  return { els, hook, set, getNum, getText, defaults, stub };
}

function assert(cond, msg) { if (!cond) throw new Error('ASSERT FAILED: ' + msg); }
function approx(actual, expected, tolFrac, label) {
  const tol = Math.abs(expected) * tolFrac;
  assert(Math.abs(actual - expected) <= tol,
    label + ': expected ' + expected + ' ±' + (tolFrac * 100) + '%, got ' + actual);
}

module.exports = { loadHtml, extractDefaults, makeInstance, assert, approx };
