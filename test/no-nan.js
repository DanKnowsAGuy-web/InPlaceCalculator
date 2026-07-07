/* NO-NAN SWEEP — every soil x traffic x project-type combination must produce
   finite outputs and finite auto-set depths. (Catches the historical A-7-6 bug,
   where base depth became the string "undefined".) */
'use strict';
const { makeInstance, assert } = require('./lib');

const SOILS = ['a1a','a1b','a24','a25','a26','a27','a3','a4','a5','a6','a75','a76','peat'];
const TRAFFIC = ['vlight','light','medlow','medium','medhigh','heavy'];
const TYPES = ['new','fdr'];

let checked = 0;
for (const type of TYPES) {
  for (const soil of SOILS) {
    for (const traffic of TRAFFIC) {
      const inst = makeInstance({ 'c-soil': soil, 'c-traffic': traffic });
      inst.hook.setType(type);           // calls updateSoilDefaults -> calcAll
      const depth = parseFloat(inst.els['c-base-depth'].value);
      const sb = parseFloat(inst.els['c-subbase-depth'].value);
      assert(isFinite(depth), type + '/' + soil + '/' + traffic + ': base depth not finite (' + inst.els['c-base-depth'].value + ')');
      assert(isFinite(sb), type + '/' + soil + '/' + traffic + ': sub-base depth not finite');
      for (const id of ['ct-val','rt-total-conv','rt-total-ip','rt-F-conv','rt-direct-conv']) {
        const v = inst.getNum(id);
        assert(isFinite(v), type + '/' + soil + '/' + traffic + ': ' + id + ' not finite ("' + inst.getText(id) + '")');
      }
      const noteTxt = inst.getText('c-base-depth-source') + inst.getText('c-thickness-note');
      assert(noteTxt.indexOf('undefined') === -1 && noteTxt.indexOf('NaN') === -1,
        type + '/' + soil + '/' + traffic + ': "undefined"/"NaN" leaked into UI text');
      checked++;
    }
  }
}
console.log('PASS no-nan: ' + checked + ' soil/traffic/type combinations all finite');
