import test from 'node:test';
import assert from 'node:assert/strict';
import { INDIAN_SUPPLY_LOCATIONS } from '../data/indianLocations.ts';
import {
  checkSupplyTransportAvailability,
  deterministicPincodeBucket,
  findIndianLocationByCityOrLabel,
  findIndianLocationByPincode,
  isValidIndianPincode,
  sanitizePincodeInput,
} from './supplyTransport.ts';

test('INDIAN_SUPPLY_LOCATIONS contains only Indian 6-digit pincodes across all states/UTs with both available and unavailable demo entries', () => {
  assert.ok(
    INDIAN_SUPPLY_LOCATIONS.length >= 70,
    'expected comprehensive Indian city dataset',
  );

  const uniquePincodes = new Set<string>();
  let availableCount = 0;
  let unavailableCount = 0;

  for (const loc of INDIAN_SUPPLY_LOCATIONS) {
    assert.match(
      loc.pincode,
      /^[1-8]\d{5}$/,
      `expected valid Indian civilian pincode for ${loc.city}: ${loc.pincode}`,
    );
    assert.equal(
      uniquePincodes.has(loc.pincode),
      false,
      `duplicate pincode ${loc.pincode}`,
    );
    uniquePincodes.add(loc.pincode);
    if (loc.available) availableCount += 1;
    else unavailableCount += 1;
  }

  assert.ok(availableCount >= 40, 'expected plenty of available Indian cities');
  assert.ok(
    unavailableCount >= 18,
    'expected realistic randomized unavailable Indian cities for demo',
  );
});

test('sanitizePincodeInput strips non-digits and caps length at 6', () => {
  assert.equal(sanitizePincodeInput('834-001 '), '834001');
  assert.equal(sanitizePincodeInput('abc400001999'), '400001');
  assert.equal(sanitizePincodeInput(''), '');
});

test('isValidIndianPincode accepts valid 6-digit Indian pincodes and rejects non-Indian formats', () => {
  assert.equal(isValidIndianPincode('834001'), true);
  assert.equal(isValidIndianPincode('400001'), true);
  assert.equal(isValidIndianPincode('012345'), false);
  assert.equal(isValidIndianPincode('90210'), false);
  assert.equal(isValidIndianPincode('8340012'), false);
  assert.equal(isValidIndianPincode('SW1A1A'), false);
});

test('checkSupplyTransportAvailability resolves exact Indian cities accurately for available and unavailable demo locations', () => {
  const ranchi = checkSupplyTransportAvailability('834001');
  assert.equal(ranchi.status, 'available');
  assert.equal(ranchi.available, true);
  assert.equal(ranchi.tier, 'direct-hub');
  assert.match(ranchi.detail, /Ranchi, Jharkhand/);

  const mumbai = checkSupplyTransportAvailability('400001');
  assert.equal(mumbai.status, 'available');
  assert.equal(mumbai.available, true);
  assert.match(mumbai.detail, /Mumbai, Maharashtra/);

  // Randomly unavailable Indian cities in dataset
  for (const pin of ['814112', '422001', '625001', '313001', '171001', '744101']) {
    const result = checkSupplyTransportAvailability(pin);
    assert.equal(result.status, 'unavailable', `expected ${pin} unavailable`);
    assert.equal(result.available, false);
    assert.match(result.headline, /not available/i);
  }
});

test('checkSupplyTransportAvailability supports resolving Indian city names when pincode is empty and rejects foreign cities', () => {
  const byCity = checkSupplyTransportAvailability('', 'Nashik, Maharashtra');
  assert.equal(byCity.pincode, '422001');
  assert.equal(byCity.status, 'unavailable');
  assert.equal(byCity.available, false);

  const byCityAvail = checkSupplyTransportAvailability('', 'Bengaluru');
  assert.equal(byCityAvail.pincode, '560001');
  assert.equal(byCityAvail.status, 'available');
  assert.equal(byCityAvail.available, true);

  const foreignCity = checkSupplyTransportAvailability('', 'London');
  assert.equal(foreignCity.status, 'invalid');
  assert.match(foreignCity.detail, /Only Indian locations/i);
});

test('unlisted valid Indian pincodes yield a deterministic randomized mix of available and unavailable demo outcomes', () => {
  let avail = 0;
  let unavail = 0;
  for (let i = 10; i < 60; i += 1) {
    const pin = `4110${i}`;
    const res = checkSupplyTransportAvailability(pin);
    assert.ok(res.status === 'available' || res.status === 'unavailable');
    if (res.available) avail += 1;
    else unavail += 1;
  }
  assert.ok(avail > 0 && unavail > 0, 'expected both available and unavailable outcomes');
  assert.equal(
    deterministicPincodeBucket('411025'),
    deterministicPincodeBucket('411025'),
  );
  assert.equal(findIndianLocationByPincode('834001')?.city, 'Ranchi');
  assert.equal(findIndianLocationByCityOrLabel('Jaipur')?.pincode, '302001');
});
