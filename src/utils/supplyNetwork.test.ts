import test from 'node:test';
import assert from 'node:assert/strict';
import { INDIAN_SUPPLY_LOCATIONS } from '../data/indianLocations.ts';
import {
  computeSupplyNetworkStats,
  deriveLocationVerificationMarkers,
  filterSupplyLocations,
  SUPPLY_NETWORK_ZONES,
} from './supplyNetwork.ts';

test('computeSupplyNetworkStats summarizes all Indian locations, states/UTs, and zones accurately', () => {
  const stats = computeSupplyNetworkStats(INDIAN_SUPPLY_LOCATIONS);

  assert.equal(stats.totalLocations, INDIAN_SUPPLY_LOCATIONS.length);
  assert.equal(
    stats.availableCount + stats.unavailableCount,
    stats.totalLocations,
  );
  assert.equal(stats.stateCount, 36, 'expected all 28 Indian States & 8 UTs');
  assert.ok(stats.coveragePercent > 50 && stats.coveragePercent < 90);

  const sumZones = SUPPLY_NETWORK_ZONES.filter((z) => z !== 'All').reduce(
    (sum, zone) => sum + stats.zoneCounts[zone],
    0,
  );
  assert.equal(sumZones, stats.totalLocations);
});

test('filterSupplyLocations filters by availability, zone, and search query cleanly', () => {
  const all = filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
    query: '',
    availability: 'all',
    zone: 'All',
  });
  assert.equal(all.length, INDIAN_SUPPLY_LOCATIONS.length);

  const unavailableOnly = filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
    query: '',
    availability: 'unavailable',
    zone: 'All',
  });
  assert.ok(unavailableOnly.length > 0);
  assert.ok(unavailableOnly.every((loc) => !loc.available));

  const eastUnavailable = filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
    query: '',
    availability: 'unavailable',
    zone: 'East',
  });
  assert.ok(eastUnavailable.length > 0);
  assert.ok(
    eastUnavailable.every((loc) => !loc.available && loc.zone === 'East'),
  );

  const byPincode = filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
    query: '560001',
    availability: 'all',
    zone: 'All',
  });
  assert.equal(byPincode.length, 1);
  assert.equal(byPincode[0].city, 'Bengaluru');

  const byState = filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
    query: 'jharkhand',
    availability: 'available',
    zone: 'All',
  });
  assert.ok(byState.length >= 4);
  assert.ok(byState.every((loc) => loc.state === 'Jharkhand' && loc.available));

  const empty = filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
    query: 'Atlantis',
    availability: 'all',
    zone: 'All',
  });
  assert.equal(empty.length, 0);
});

test('deriveLocationVerificationMarkers reflects hub, corridor, and live B2B buyer verification states', () => {
  const ranchi = INDIAN_SUPPLY_LOCATIONS.find((l) => l.pincode === '834001')!;
  const mumbai = INDIAN_SUPPLY_LOCATIONS.find((l) => l.pincode === '400001')!;
  const deoghar = INDIAN_SUPPLY_LOCATIONS.find((l) => l.pincode === '814112')!;

  const unverifiedRanchi = deriveLocationVerificationMarkers(
    ranchi,
    { isFullyVerified: false, credentialsVerified: false },
    { gstStateName: null },
  );
  assert.equal(unverifiedRanchi.isPrimaryHub, true);
  assert.equal(unverifiedRanchi.corridorMarker, 'Primary Dispatch Hub');
  assert.equal(unverifiedRanchi.corridorVerified, true);
  assert.equal(unverifiedRanchi.buyerMarkerTone, 'required');
  assert.equal(unverifiedRanchi.buyerMarkerLabel, 'B2B License Required');

  const partialMumbai = deriveLocationVerificationMarkers(
    mumbai,
    { isFullyVerified: false, credentialsVerified: true },
    { gstStateName: 'Maharashtra' },
  );
  assert.equal(partialMumbai.corridorMarker, 'Verified B2B Corridor');
  assert.equal(partialMumbai.buyerMarkerTone, 'partial');
  assert.equal(partialMumbai.buyerMarkerLabel, 'Declarations Pending');

  const verifiedSameState = deriveLocationVerificationMarkers(
    ranchi,
    { isFullyVerified: true, credentialsVerified: true },
    { gstStateName: 'Jharkhand' },
  );
  assert.equal(verifiedSameState.buyerMarkerTone, 'same-state');
  assert.equal(
    verifiedSameState.buyerMarkerLabel,
    'Home GST State · B2B Verified',
  );

  const verifiedCrossState = deriveLocationVerificationMarkers(
    mumbai,
    { isFullyVerified: true, credentialsVerified: true },
    { gstStateName: 'Jharkhand' },
  );
  assert.equal(verifiedCrossState.buyerMarkerTone, 'verified');
  assert.equal(verifiedCrossState.buyerMarkerLabel, 'Partner B2B Verified');

  const pausedDeoghar = deriveLocationVerificationMarkers(
    deoghar,
    { isFullyVerified: true, credentialsVerified: true },
    { gstStateName: 'Jharkhand' },
  );
  assert.equal(pausedDeoghar.corridorVerified, false);
  assert.equal(pausedDeoghar.corridorMarker, 'Dispatch Route Paused');
});
