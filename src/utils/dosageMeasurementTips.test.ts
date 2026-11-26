import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectNutrientUnitKey,
  getPrimaryMeasurementTip,
  getUnitMeasurementTip,
} from './dosageMeasurementTips';

test('detectNutrientUnitKey accurately identifies IU, mcg, mg, and g strings', () => {
  assert.equal(detectNutrientUnitKey('1000 mg'), 'mg');
  assert.equal(detectNutrientUnitKey('45 mcg'), 'mcg');
  assert.equal(detectNutrientUnitKey('250 IU'), 'iu');
  assert.equal(detectNutrientUnitKey('4.5 g'), 'g');
  assert.equal(detectNutrientUnitKey('60 IU / 600 IU'), 'iu');
  assert.equal(detectNutrientUnitKey('0 g / 0 g'), 'g');
  assert.equal(detectNutrientUnitKey('As directed'), null);
});

test('getPrimaryMeasurementTip tailors measurement guidance for powder servings and tablet schedules', () => {
  const halfPowder = getPrimaryMeasurementTip('protizen-hp-powder', 0.5);
  assert.ok(halfPowder.title.includes('15 g'));
  assert.ok(halfPowder.practicalEquivalent.includes('1–1.5 level tablespoons'));

  const onePowder = getPrimaryMeasurementTip('protizen-hp-powder', 1);
  assert.ok(onePowder.practicalEquivalent.includes('30 g'));

  const twoPowder = getPrimaryMeasurementTip('protizen-hp-powder', 2);
  assert.ok(twoPowder.title.includes('60 g'));

  const childPowder = getPrimaryMeasurementTip('protizen-hp-powder', 0);
  assert.ok(childPowder.title.toLowerCase().includes('pediatric'));

  const oneTab = getPrimaryMeasurementTip('bonebro-tablets', 1);
  assert.equal(oneTab.unitKey, 'tablet');

  const twoTabs = getPrimaryMeasurementTip('bonebro-tablets', 2);
  assert.ok(twoTabs.title.includes('2 / day'));

  const reviewTab = getPrimaryMeasurementTip('red-xt-tablets', 0);
  assert.ok(reviewTab.title.toLowerCase().includes('clinician'));
});

test('getUnitMeasurementTip returns complete guidance for every supported unit', () => {
  const units = ['tablet', 'powder-serving', 'g', 'mg', 'mcg', 'iu'] as const;
  for (const unit of units) {
    const tip = getUnitMeasurementTip(unit);
    assert.equal(tip.unitKey, unit);
    assert.ok(tip.title.length > 5);
    assert.ok(tip.howToMeasure.length > 20);
    assert.ok(tip.practicalEquivalent.length > 5);
    assert.ok(tip.precisionNote.length > 10);
  }
});
