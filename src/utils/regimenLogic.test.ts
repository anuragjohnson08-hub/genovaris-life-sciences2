import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeChecklistProgress,
  detectRegimenInteractions,
  filterFormulations,
  groupRegimenByTiming,
  validateSupplyInquiryInput,
} from './regimenLogic';
import { GENOVARIS_PRODUCTS } from '../data/products';

test('filterFormulations filters real Genovaris Lifesciences products by category, timing, and ingredient/indication query', () => {
  const byCategory = filterFormulations(GENOVARIS_PRODUCTS, {
    category: 'bone-skeletal',
  });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].slug, 'bonebro-tablets');

  const byIngredient = filterFormulations(GENOVARIS_PRODUCTS, {
    query: 'Ferrous Ascorbate',
  });
  assert.equal(byIngredient.length, 1);
  assert.equal(byIngredient[0].slug, 'red-xt-tablets');

  const byIndication = filterFormulations(GENOVARIS_PRODUCTS, {
    query: 'Cerebroprotein',
  });
  assert.equal(byIndication.length, 1);
  assert.equal(byIndication[0].slug, 'cerebra-cb');

  const byTiming = filterFormulations(GENOVARIS_PRODUCTS, {
    timing: 'Daily Nutrition',
  });
  assert.equal(byTiming.length, 1);
  assert.equal(byTiming[0].slug, 'protizen-hp-powder');
});

test('detectRegimenInteractions flags overlapping Vitamin D across Bonebro and RED-XT', () => {
  const bonebro = GENOVARIS_PRODUCTS[0];
  const redXt = GENOVARIS_PRODUCTS[1];
  const overlap = detectRegimenInteractions([bonebro, redXt]);
  assert.ok(overlap.some((notice) => notice.nutrientGroup === 'Vitamin D'));
});

test('groupRegimenByTiming orders schedules from Morning through Daily Nutrition', () => {
  const grouped = groupRegimenByTiming(GENOVARIS_PRODUCTS);
  assert.deepEqual(
    grouped.map((g) => g.window),
    ['Morning', 'With Meals', 'Daily Nutrition']
  );
  assert.equal(grouped[0].items[0].slug, 'red-xt-tablets');
});

test('validateSupplyInquiryInput catches missing or invalid fields and accepts complete supply requests', () => {
  const invalid = validateSupplyInquiryInput({
    fullName: 'A',
    organization: '',
    email: 'invalid-email',
    phone: 'abc',
    inquiryType: '',
    productSlugs: [],
    cityRegion: '',
    message: 'Short',
    acknowledgedDisclaimer: false,
  });

  assert.ok(invalid.fullName);
  assert.ok(invalid.email);
  assert.ok(invalid.phone);
  assert.ok(invalid.inquiryType);
  assert.ok(invalid.message);
  assert.ok(invalid.acknowledgedDisclaimer);

  const valid = validateSupplyInquiryInput({
    fullName: 'Rajesh Sharma',
    organization: 'Apex Medical Distributors',
    email: 'procurement@apexmed.example',
    phone: '+91 98765 43210',
    inquiryType: 'Wholesale Supply & Stockist',
    productSlugs: ['bonebro-tablets', 'red-xt-tablets'],
    cityRegion: 'Pune, MH',
    message: 'Interested in wholesale distributor pricing and MOQ for Bonebro and RED-XT.',
    acknowledgedDisclaimer: true,
  });

  assert.deepEqual(valid, {});
});

test('computeChecklistProgress deduplicates and ignores unknown IDs', () => {
  const progress = computeChecklistProgress(
    ['verify-label', 'verify-label', 'unknown-id', 'consult-clinician'],
    ['verify-label', 'consult-clinician', 'preserve-prescriptions', 'check-timing-overlap']
  );
  assert.deepEqual(progress, { completed: 2, total: 4, percentage: 50 });
});
