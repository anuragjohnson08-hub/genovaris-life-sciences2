import test from 'node:test';
import assert from 'node:assert/strict';
import { GENOVARIS_PRODUCTS } from '../data/products';
import {
  calculateProductDosage,
  convertWeight,
  getDefaultDosageProfile,
  validateDosageInput,
} from './dosageCalculator';

function getProduct(slug: string) {
  const found = GENOVARIS_PRODUCTS.find((p) => p.slug === slug);
  assert.ok(found, `Expected product ${slug} to exist`);
  return found;
}

test('convertWeight accurately converts between kg and lb', () => {
  assert.equal(convertWeight(70, 'kg', 'kg'), 70);
  assert.equal(convertWeight(70, 'kg', 'lb'), 154.3);
  assert.equal(convertWeight(154.3, 'lb', 'kg'), 70);
});

test('validateDosageInput flags out-of-range age and weight values', () => {
  const invalid = validateDosageInput({
    age: 0,
    weight: 5,
    weightUnit: 'kg',
    lifeStage: 'standard',
    goal: 'maintenance',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.age);
  assert.ok(invalid.errors.weight);

  const validLb = validateDosageInput({
    age: 35,
    weight: 150,
    weightUnit: 'lb',
    lifeStage: 'standard',
    goal: 'maintenance',
  });
  assert.equal(validLb.valid, true);
  assert.deepEqual(validLb.errors, {});
});

test('Bonebro calculates 1 tablet for standard maintenance, 2 divided for targeted senior care, and clinician review for minors', () => {
  const bonebro = getProduct('bonebro-tablets');

  const maintenance = calculateProductDosage(bonebro, {
    age: 40,
    weight: 65,
    weightUnit: 'kg',
    lifeStage: 'standard',
    goal: 'maintenance',
  });
  assert.equal(maintenance.dailyUnits, 1);
  assert.equal(maintenance.suggestedAmount, '1 tablet / day');
  assert.equal(maintenance.nutrientDeliveries[0].amount, '1000 mg');

  const seniorTargeted = calculateProductDosage(bonebro, {
    age: 64,
    weight: 62,
    weightUnit: 'kg',
    lifeStage: 'senior',
    goal: 'targeted',
  });
  assert.equal(seniorTargeted.dailyUnits, 2);
  assert.equal(seniorTargeted.suggestedAmount, '2 tablets / day');
  assert.equal(seniorTargeted.nutrientDeliveries[0].amount, '2000 mg');

  const minor = calculateProductDosage(bonebro, {
    age: 14,
    weight: 48,
    weightUnit: 'kg',
    lifeStage: 'standard',
    goal: 'maintenance',
  });
  assert.equal(minor.status, 'clinician-review');
  assert.equal(minor.dailyUnits, 0);
});

test('RED-XT caps adult intake safely at 1 tablet/day and flags pediatric review under 18', () => {
  const redXt = getProduct('red-xt-tablets');

  const maternal = calculateProductDosage(redXt, {
    age: 28,
    weight: 58,
    weightUnit: 'kg',
    lifeStage: 'pregnancy-lactation',
    goal: 'targeted',
  });
  assert.equal(maternal.dailyUnits, 1);
  assert.equal(maternal.suggestedAmount, '1 tablet / day');
  assert.equal(maternal.status, 'enhanced');

  const minor = calculateProductDosage(redXt, {
    age: 15,
    weight: 50,
    weightUnit: 'kg',
    lifeStage: 'standard',
    goal: 'targeted',
  });
  assert.equal(minor.status, 'clinician-review');
  assert.equal(minor.dailyUnits, 0);
});

test('CEREBRA-CB flags obstetric specialist review in pregnancy and scales for adult recovery', () => {
  const cerebra = getProduct('cerebra-cb');

  const pregnant = calculateProductDosage(cerebra, {
    age: 31,
    weight: 60,
    weightUnit: 'kg',
    lifeStage: 'pregnancy-lactation',
    goal: 'maintenance',
  });
  assert.equal(pregnant.status, 'clinician-review');
  assert.equal(pregnant.dailyUnits, 0);

  const recoveryTargeted = calculateProductDosage(cerebra, {
    age: 50,
    weight: 72,
    weightUnit: 'kg',
    lifeStage: 'recovery',
    goal: 'targeted',
  });
  assert.equal(recoveryTargeted.dailyUnits, 2);
  assert.equal(recoveryTargeted.nutrientDeliveries[0].amount, '180 mg');
});

test('Protizen-HP adjusts powder servings by age, weight, and goal with protein target context', () => {
  const protizen = getProduct('protizen-hp-powder');

  const standard = calculateProductDosage(protizen, getDefaultDosageProfile('protizen-hp-powder'));
  assert.equal(standard.dailyUnits, 1);
  assert.equal(standard.suggestedAmount, '30 g / day (1 serving)');
  assert.ok(standard.proteinTargetNote?.includes('56 g/day'));

  const highWeightOrRecovery = calculateProductDosage(protizen, {
    age: 36,
    weight: 185,
    weightUnit: 'lb',
    lifeStage: 'recovery',
    goal: 'targeted',
  });
  assert.equal(highWeightOrRecovery.dailyUnits, 2);
  assert.equal(highWeightOrRecovery.suggestedAmount, '60 g / day (2 servings)');
  assert.equal(highWeightOrRecovery.nutrientDeliveries[0].amount, '9 g');

  const teen = calculateProductDosage(protizen, {
    age: 15,
    weight: 52,
    weightUnit: 'kg',
    lifeStage: 'standard',
    goal: 'maintenance',
  });
  assert.equal(teen.dailyUnits, 0.5);
  assert.equal(teen.suggestedAmount, '15 g / day (½ serving)');

  const youngChild = calculateProductDosage(protizen, {
    age: 8,
    weight: 26,
    weightUnit: 'kg',
    lifeStage: 'standard',
    goal: 'maintenance',
  });
  assert.equal(youngChild.status, 'clinician-review');
  assert.equal(youngChild.dailyUnits, 0);
});
