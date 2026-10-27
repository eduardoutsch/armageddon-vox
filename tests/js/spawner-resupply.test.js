const test = require('node:test');
const assert = require('node:assert/strict');
require('../../js/spawner-cards.js');
const {
  getMiseryLockoutReason,
  adjPatchedUpWounds,
  setFortBracketCost,
  setPromoBaseMin,
  rollFieldPromotionCost,
  rollAirStrikeDamage,
  rollReinforcementsBracket,
  executeEnhancedResupplyPurchase
} = require('../../js/spawner-resupply.js');

test('Spawner Resupply: getMiseryLockoutReason identifies active Misery lockouts', () => {
  globalThis.state = {
    activeMiseries: [{ id: 21 }]
  };
  assert.ok(
    getMiseryLockoutReason(['Fortify']).includes('Bunkers Busted'),
    'Misery #21 must block Fortify'
  );
  assert.equal(getMiseryLockoutReason(['Tactics']), null);

  globalThis.state.activeMiseries = [{ id: 22 }];
  assert.ok(
    getMiseryLockoutReason(['Supply']).includes('Comms Jammed'),
    'Misery #22 must block Supply'
  );
  assert.ok(
    getMiseryLockoutReason(['Strike']).includes('Comms Jammed'),
    'Misery #22 must block Strike'
  );
  assert.ok(
    getMiseryLockoutReason(['Spawn']).includes('Comms Jammed'),
    'Misery #22 must block Spawn'
  );
  assert.equal(getMiseryLockoutReason(['Tactics']), null);

  globalThis.state.activeMiseries = [{ id: 23 }];
  assert.ok(
    getMiseryLockoutReason(['Tactics']).includes('The Mind Killer'),
    'Misery #23 must block Tactics'
  );

  globalThis.state.activeMiseries = [{ id: 29 }];
  assert.ok(
    getMiseryLockoutReason(['Secondary']).includes("Fate's Fetters"),
    "Misery #29 must block Secondary"
  );
});

test('Spawner Resupply: Variable X state handlers clamp and adjust correctly', () => {
  globalThis.resupplyVarState = {
    patchedUpWounds: 3,
    fortBracketCost: 5,
    promoBaseMin: 3,
    promoLastRoll: null
  };

  adjPatchedUpWounds(2);
  assert.equal(globalThis.resupplyVarState.patchedUpWounds, 5);
  adjPatchedUpWounds(-10);
  assert.equal(globalThis.resupplyVarState.patchedUpWounds, 1, 'Min wound must clamp to 1');

  setFortBracketCost('7');
  assert.equal(globalThis.resupplyVarState.fortBracketCost, 7);

  setPromoBaseMin('5');
  assert.equal(globalThis.resupplyVarState.promoBaseMin, 5);

  rollFieldPromotionCost();
  assert.ok(globalThis.resupplyVarState.promoLastRoll);
  assert.ok(globalThis.resupplyVarState.promoLastRoll.d6 >= 1 && globalThis.resupplyVarState.promoLastRoll.d6 <= 6);
  assert.equal(
    globalThis.resupplyVarState.promoLastRoll.totalCost,
    globalThis.resupplyVarState.promoLastRoll.d6 + 5
  );
});

test('Spawner Resupply: executeEnhancedResupplyPurchase checks SP and triggers card side effects', () => {
  let spLost = 0;
  globalThis.state = { sp: 10, activeMiseries: [] };
  globalThis.loseSP = (amount) => { spLost += amount; globalThis.state.sp -= amount; };
  globalThis.adjCP = (delta) => { globalThis.testCp = (globalThis.testCp || 0) + delta; };

  executeEnhancedResupplyPurchase('Basic Tactics', 2);
  assert.equal(spLost, 2);
  assert.equal(globalThis.state.sp, 8);
  assert.equal(globalThis.testCp, 1, 'Basic Tactics auto-effect gains 1 CP');
});

test('Spawner Resupply: executeEnhancedResupplyPurchase calls spendSP and tracks SP spent', () => {
  let spentAmount = 0;
  globalThis.state = { sp: 16, activeMiseries: [] };
  globalThis.spendSP = (amount) => {
    spentAmount += amount;
    globalThis.state.sp -= amount;
  };

  executeEnhancedResupplyPurchase('Field Promotion', 4);
  assert.equal(spentAmount, 4, 'Must call spendSP with 4 SP');
  assert.equal(globalThis.state.sp, 12, 'Must deduct 4 SP from state');

  delete globalThis.spendSP;
});
