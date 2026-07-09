/* PERU REGRESSION — the governing acceptance test.
   Reproduces the Cerro Colorado municipal comparison (2018, Arequipa) with HONEST
   quantities and unit rates from the signed ledger. Currency: Peruvian soles.

   Budget A (In-Place, 1,280 m², IGV incl.):  S/100,684.80
     scarification 1,484.80 | treated base 15cm 53,708.80 | prime 6,169.60 | 2" cold-mix 39,321.60
   Budget B (conventional):                    S/107,363.84
     cut 512 m³ 3,471.36 | stockpile 1,889.28 | haul-off 665.6 m³ (=512×1.30 swell) ≤15km 12,480.00
     subgrade shaping 3,353.60 | sub-base 25cm 24,000.00 | base 15cm 16,678.40
     prime 6,169.60 | 2" cold-mix 39,321.60
   Savings: S/6,679.04 = 6.22%.

   Mapping notes:
   - Geometry 0.1926 mi × 1 lane × 13.55 ft = 1,280 m² (1,531 SY). Base 6" (15cm),
     sub-base 10" (25cm) → conventional structure 16" (Peru: 40cm).
   - Excavation rate S/10.62/CY covers cut + stockpile + shaping minus the shared
     proof/scarify line (S/0.97/SY both sides = Peru's scarification).
   - Haul: bank 680.5 CY × swell 1.30 × 9.32 mi × S/1.514/CY-mi = S/12,480 (ledger:
     665.6 m³ loose at S/18.75/m³, ≤15 km). Aggregate haul = 0 (unit prices are delivered).
   - Product: 0.083 gal/SY/in (= field 0.589 gal/m² at 15cm) at S/61.63/gal (≈$18.96,
     the implied all-in binder price) + S/4.39/SY treatment labor.
   - Surface: identical both sides (equal mode), specified 2", S/236.17/ton, prime S/4.03/SY.
   - Peru budget prices are tax-inclusive (administración directa) → overhead/profit/tax = 0.
*/
'use strict';
const { makeInstance, approx, assert } = require('./lib');

const inst = makeInstance({ 'c-soil': 'a1b', 'c-traffic': 'medhigh' });
const { set, hook, getNum } = inst;

const inputs = {
  'c-miles': 0.1926, 'c-lanes': 1, 'c-lanewidth': 13.55, 'c-life': 20,
  'c-base-depth': 6, 'c-subbase-depth': 10, 'c-cbr-conv': 80,
  /* Phase 2 engine inputs, from the Peru record: EG-2013 design loading 1,702,886 ESALs;
     native subgrade series CBR 55%; treated 15 cm = 6"; a2 at the 0.20 default */
  'c-esals': 1702886, 'c-subgrade-cbr': 55, 'c-treat-depth': 6, 'a2-ip': 0.20,
  'c-mixdesign': 0, 'ce-pct': 0, 'cont-pct': 0, 'e-other': 0,
  'a-haul-agg': 0, 'a-haul-soil': 9.32, 'a-truck-rate': 1.5137, 'a-swell': 1.30,
  'b-excav-rate': 10.6243, 'b-proof-passes': 3, 'b-roller-rate': 355.6,
  'b-roller-prod': 1100, 'b-subgrade-mitig': 0,
  'c-agg': 31.69, 'c-subbase-cost': 23.21, 'c-place-rate': 3.05, 'c-lifts': 1,
  'c-agg-density': 110, /* as-bid 2018 ledger reproduction — model default is 140 */
  'ip-price-gal': 61.63, 'ip-dosage': 0.083, 'c-ip-labor': 4.39,
  'd-asp-mat': 200, 'd-asp-place': 36.17, 'd-prime': 4.03, 'd-surface-thick': 2,
  'e-conv-days': 0, 'e-ip-days': 0, 'e-tc-rate': 0, 'e-conv-mob': 0, 'e-ip-mob': 0,
  'oh-pct': 0, 'profit-pct': 0, 'tax-pct': 0
};
for (const id in inputs) set(id, inputs[id]);
hook.setSurface('equal');   // triggers calcAll

const PERU = { conv: 107363.84, ip: 100684.80, sav: 6679.04 };
const conv = getNum('rt-total-conv');
const ip   = getNum('rt-total-ip');
const sav  = getNum('rt-total-sav');

approx(conv, PERU.conv, 0.01, 'Conventional total (Budget B)');
approx(ip,   PERU.ip,   0.01, 'In-Place total (Budget A)');
const savPct = 100 * sav / conv;
assert(savPct > 5.9 && savPct < 6.6, 'Savings % ≈ 6.22 (got ' + savPct.toFixed(2) + ')');

// Line-item checks against the ledger
approx(getNum('rt-A-conv'), 12480.00, 0.01, 'A: haul-off (665.6 m³ ≤15km)');
approx(getNum('rt-B-conv'), 8714.24, 0.01, 'B conv: cut+stockpile+shaping');
approx(getNum('rt-B-ip'),   1484.80, 0.01, 'B In-Place: scarification');
approx(getNum('rt-C-conv'), 40678.40, 0.01, 'C conv: sub-base 25cm + base 15cm');
approx(getNum('rt-C-ip'),   53708.80, 0.01, 'C In-Place: treated base (binder+labor)');
approx(getNum('rt-D-conv'), 45491.20, 0.01, 'D: prime + 2" cold-mix (identical both sides)');
assert(Math.abs(getNum('rt-D-sav')) < 1, 'D savings = 0 in equal-surface mode');

console.log('PASS peru-regression: conv S/' + conv.toLocaleString() + ' | ip S/' + ip.toLocaleString() +
  ' | savings ' + savPct.toFixed(2) + '%  (ledger: 107,363.84 / 100,684.80 / 6.22%)');
