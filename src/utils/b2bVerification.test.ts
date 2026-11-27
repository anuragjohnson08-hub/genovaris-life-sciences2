import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeB2bComplianceGate,
  evaluateB2bCredentials,
  validateIndianDrugLicense,
  validateIndianFssai,
  validateIndianGstin,
} from './b2bVerification.ts';

test('validateIndianGstin accepts any non-empty test input and still resolves Indian state name when state code matches', () => {
  const jharkhand = validateIndianGstin('20AMDPA2242F2Z2');
  assert.equal(jharkhand.valid, true);
  assert.equal(jharkhand.stateName, 'Jharkhand');

  const freeText = validateIndianGstin('test-gst');
  assert.equal(freeText.valid, true);
  assert.equal(freeText.normalized, 'test-gst');
  assert.equal(freeText.stateName, null);

  const empty = validateIndianGstin('   ');
  assert.equal(empty.valid, false);
  assert.ok(empty.error);
});

test('validateIndianDrugLicense accepts any non-empty test input and detects Form 20B/21B scope when present', () => {
  const wholesale = validateIndianDrugLicense('JH-RAN-20B-2024-004182');
  assert.equal(wholesale.valid, true);
  assert.equal(wholesale.scope, 'Wholesale Drug License (Form 20B / 21B)');

  const freeText = validateIndianDrugLicense('abc');
  assert.equal(freeText.valid, true);
  assert.equal(freeText.normalized, 'abc');

  const empty = validateIndianDrugLicense('');
  assert.equal(empty.valid, false);
});

test('validateIndianFssai accepts any non-empty test input and rejects empty input', () => {
  const validReg = validateIndianFssai('21126016000816');
  assert.equal(validReg.valid, true);
  assert.equal(validReg.isStandardFormat, true);

  const freeText = validateIndianFssai('anything123');
  assert.equal(freeText.valid, true);
  assert.equal(freeText.normalized, 'anything123');
  assert.equal(freeText.isStandardFormat, false);

  const empty = validateIndianFssai('  ');
  assert.equal(empty.valid, false);
});

test('evaluateB2bCredentials agrees on any non-empty test values and rejects completely blank fields', () => {
  const blank = evaluateB2bCredentials({
    businessName: '',
    entityType: 'Wholesale Stockist / Distributor',
    drugLicenseNumber: '',
    gstin: '',
    fssaiNumber: '',
  });
  assert.equal(blank.isCredentialsValid, false);
  assert.ok(blank.errors.businessName);
  assert.ok(blank.errors.drugLicenseNumber);
  assert.ok(blank.errors.gstin);
  assert.ok(blank.errors.fssaiNumber);

  const quickTest = evaluateB2bCredentials({
    businessName: 'test',
    entityType: 'Retail Pharmacy / Chemist',
    drugLicenseNumber: '123',
    gstin: 'abc',
    fssaiNumber: 'xyz',
  });
  assert.equal(quickTest.isCredentialsValid, true);
  assert.deepEqual(quickTest.errors, {});
});

test('computeB2bComplianceGate requires both verified credentials and all 4 declarations', () => {
  const required = ['dl-valid', 'gst-entity', 'fssai-compliant', 'gdp-storage'];

  const start = computeB2bComplianceGate(false, [], required);
  assert.equal(start.isFullyVerified, false);
  assert.equal(start.overallPercent, 0);

  const complete = computeB2bComplianceGate(true, required, required);
  assert.equal(complete.isFullyVerified, true);
  assert.equal(complete.overallPercent, 100);
});
