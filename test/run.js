/* Run the full Phase 1 suite: node test/run.js */
'use strict';
const tests = ['peru-regression', 'typed-zero', 'no-nan', 'us-defaults', 'citations'];
let failed = 0;
for (const t of tests) {
  try {
    require('./' + t);
  } catch (e) {
    failed++;
    console.error('FAIL ' + t + ': ' + e.message);
  }
}
if (failed) { console.error(failed + ' test file(s) failed'); process.exit(1); }
console.log('ALL TESTS PASSED (' + tests.length + ' files)');
