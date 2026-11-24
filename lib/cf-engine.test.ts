import test from 'node:test';
import assert from 'node:assert/strict';
import {
  combineCertainty,
  formatIncidentCode,
  formatRepairCode,
  getCertaintyWeight,
  runDiagnosis,
} from './cf-engine';
import { INITIAL_INCIDENTS, INITIAL_REPAIRS, INITIAL_RULES } from './seed-data';

test('BAB 3 Scenario 1: G001 (Pasti ya) + G002 (Pasti ya) yields Create Ulang ONT 84.00%', () => {
  const result = runDiagnosis(
    { 1: 1, 2: 1 },
    INITIAL_INCIDENTS,
    INITIAL_REPAIRS,
    INITIAL_RULES
  );

  assert.equal(result.ok, true);
  assert.equal(result.selectedCount, 2);
  assert.ok(result.candidates.length >= 5);

  const top = result.candidates[0];
  assert.equal(top.repairId, 1);
  assert.equal(top.repairName, 'Create Ulang ONT');
  assert.equal(top.cf, 0.84);
  assert.equal(top.percentage, 84);
  assert.equal(top.trace.length, 2);
  assert.equal(top.trace[0].cfAfter, 0.6);
  assert.equal(top.trace[1].cfAfter, 0.84);
});

test('BAB 3 Scenario 2: G001 (1.0) + G002 (0.8) + G003 (1.0) yields Create Ulang ONT 95.84%', () => {
  const result = runDiagnosis(
    { 1: 1, 2: 2, 3: 1 },
    INITIAL_INCIDENTS,
    INITIAL_REPAIRS,
    INITIAL_RULES
  );

  assert.equal(result.ok, true);
  const createUlangOnt = result.candidates.find((c) => c.repairId === 1);
  assert.ok(createUlangOnt);
  assert.equal(createUlangOnt.cf, 0.9584);
  assert.equal(createUlangOnt.percentage, 95.84);
  assert.equal(createUlangOnt.trace.length, 3);
});

test('Single symptom G007 (Internet lambat = Pasti ya) matches history record #351', () => {
  const result = runDiagnosis(
    { 7: 1 },
    INITIAL_INCIDENTS,
    INITIAL_REPAIRS,
    INITIAL_RULES
  );

  assert.equal(result.ok, true);
  assert.equal(result.candidates.length, 2);
  assert.equal(result.candidates[0].repairId, 17); // Update Profile
  assert.equal(result.candidates[0].cf, 0.6);
  assert.equal(result.candidates[1].repairId, 11); // Restart ONT
  assert.equal(result.candidates[1].cf, 0.4);
});

test('Empty selection is rejected with Indonesian validation message', () => {
  const result = runDiagnosis({}, INITIAL_INCIDENTS, INITIAL_REPAIRS, INITIAL_RULES);
  assert.equal(result.ok, false);
  assert.equal(result.candidates.length, 0);
  assert.ok(result.error && result.error.includes('minimal satu'));
});

test('Conflicting and negative certainty values follow MYCIN CF rules', () => {
  // Opposite signs: +0.6 combined with -0.3 -> (0.6 - 0.3) / (1 - 0.3) = 0.3 / 0.7 = 0.42857...
  const mixed = combineCertainty(0.6, -0.3);
  assert.equal(Number(mixed.toFixed(4)), 0.4286);

  // Both negative: -0.4 combined with -0.5 -> -0.4 + (-0.5) * (1 - 0.4) = -0.7
  const bothNeg = combineCertainty(-0.4, -0.5);
  assert.equal(Number(bothNeg.toFixed(4)), -0.7);

  // Purely negative selection excludes repair (cfCombined <= 0)
  const negResult = runDiagnosis({ 13: 9 }, INITIAL_INCIDENTS, INITIAL_REPAIRS, INITIAL_RULES);
  assert.equal(negResult.ok, true);
  assert.equal(negResult.candidates.length, 0);
});

test('Code formatters and certainty weights map deterministically', () => {
  assert.equal(formatIncidentCode(1), 'G001');
  assert.equal(formatIncidentCode(14), 'G014');
  assert.equal(formatRepairCode(1), 'R01');
  assert.equal(formatRepairCode(17), 'R17');
  assert.equal(getCertaintyWeight(1), 1.0);
  assert.equal(getCertaintyWeight(5), -0.2);
  assert.equal(getCertaintyWeight(9), -1.0);
  assert.equal(getCertaintyWeight(0), 0);
});
