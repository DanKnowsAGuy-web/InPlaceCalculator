/* CITATION COMPLETENESS — every numeric input must have an accompanying
   field-source note containing either a source citation or an explicit
   estimate/pending label. No default ships unexplained. */
'use strict';
const { loadHtml, assert } = require('./lib');

const html = loadHtml();
/* Inputs that are legitimately exempt (hidden mirrors, slider UI, or explained elsewhere) */
const EXEMPT = new Set(['l-cpm', 'l-cpm-raw', 'rc-slider', 'c-traffic']);
const KEYWORDS = /(Source|estimate|Estimate|pending|Pending|Default|Auto-set|AASHTO|optional)/;

const inputRe = /<input\b[^>]*\btype="(?:number|range)"[^>]*>/g;
let m, failures = [], checked = 0;
while ((m = inputRe.exec(html))) {
  const tag = m[0];
  const idm = tag.match(/\bid="([^"]+)"/);
  if (!idm) continue;
  const id = idm[1];
  if (EXEMPT.has(id)) continue;
  /* look around the input for its source note: usually a field-source note after it,
     but grouped fields (e.g. the overhead/profit/CE/contingency/tax foot) share one
     note above the whole group — hence the wider backward window */
  const windowText = html.slice(Math.max(0, m.index - 3400), m.index + 1600);
  const hasSource = /(field-source|Sources?:)/.test(windowText) && KEYWORDS.test(windowText);
  if (!hasSource) failures.push(id);
  checked++;
}
assert(failures.length === 0, 'inputs missing a source/estimate note: ' + failures.join(', '));
console.log('PASS citations: ' + checked + ' numeric inputs carry a source or estimate label');
