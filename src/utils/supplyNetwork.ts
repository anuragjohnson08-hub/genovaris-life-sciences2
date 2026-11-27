import type { IndianSupplyLocation } from '../data/indianLocations.ts';
import type {
  B2bComplianceGateStatus,
  B2bStoredVerification,
} from './b2bVerification.ts';

export type SupplyZoneFilter = 'All' | IndianSupplyLocation['zone'];

export type SupplyAvailabilityFilter = 'all' | 'available' | 'unavailable';

export interface SupplyNetworkFilters {
  query: string;
  availability: SupplyAvailabilityFilter;
  zone: SupplyZoneFilter;
}

export interface SupplyNetworkStats {
  totalLocations: number;
  availableCount: number;
  unavailableCount: number;
  coveragePercent: number;
  stateCount: number;
  zoneCounts: Record<SupplyZoneFilter, number>;
}

export type BuyerVerificationTone =
  | 'same-state'
  | 'verified'
  | 'partial'
  | 'required';

export interface LocationVerificationMarkers {
  corridorMarker: string;
  corridorVerified: boolean;
  isPrimaryHub: boolean;
  requiredLicenses: string;
  buyerMarkerLabel: string;
  buyerMarkerTone: BuyerVerificationTone;
}

export const SUPPLY_NETWORK_ZONES: readonly SupplyZoneFilter[] = [
  'All',
  'East',
  'North',
  'West',
  'South',
  'Central',
  'North-East',
  'Islands',
] as const;

export const GENOVARIS_NETWORK_CREDENTIALS = {
  hubName: 'Genovaris Lifesciences · Lalpur Hub, Ranchi',
  hubPincode: '834001',
  gstin: '20AMDPA2242F2Z2',
  fssai: '21126016000816',
} as const;

export function computeSupplyNetworkStats(
  locations: readonly IndianSupplyLocation[],
): SupplyNetworkStats {
  const zoneCounts: Record<SupplyZoneFilter, number> = {
    All: locations.length,
    East: 0,
    North: 0,
    West: 0,
    South: 0,
    Central: 0,
    'North-East': 0,
    Islands: 0,
  };

  let availableCount = 0;
  let unavailableCount = 0;
  const states = new Set<string>();

  for (const loc of locations) {
    zoneCounts[loc.zone] += 1;
    states.add(loc.state);
    if (loc.available) {
      availableCount += 1;
    } else {
      unavailableCount += 1;
    }
  }

  const coveragePercent =
    locations.length === 0
      ? 0
      : Math.round((availableCount / locations.length) * 100);

  return {
    totalLocations: locations.length,
    availableCount,
    unavailableCount,
    coveragePercent,
    stateCount: states.size,
    zoneCounts,
  };
}

export function deriveLocationVerificationMarkers(
  location: IndianSupplyLocation,
  b2bGate: Pick<
    B2bComplianceGateStatus,
    'isFullyVerified' | 'credentialsVerified'
  >,
  b2bVerification: Pick<B2bStoredVerification, 'gstStateName'>,
): LocationVerificationMarkers {
  const isPrimaryHub = location.pincode === GENOVARIS_NETWORK_CREDENTIALS.hubPincode;

  const corridorMarker = isPrimaryHub
    ? 'Primary Dispatch Hub'
    : location.available
      ? 'Verified B2B Corridor'
      : 'Dispatch Route Paused';

  let buyerMarkerLabel: string;
  let buyerMarkerTone: BuyerVerificationTone;

  if (b2bGate.isFullyVerified) {
    if (
      b2bVerification.gstStateName &&
      b2bVerification.gstStateName.toLowerCase() ===
        location.state.toLowerCase()
    ) {
      buyerMarkerLabel = 'Home GST State · B2B Verified';
      buyerMarkerTone = 'same-state';
    } else {
      buyerMarkerLabel = 'Partner B2B Verified';
      buyerMarkerTone = 'verified';
    }
  } else if (b2bGate.credentialsVerified) {
    buyerMarkerLabel = 'Declarations Pending';
    buyerMarkerTone = 'partial';
  } else {
    buyerMarkerLabel = 'B2B License Required';
    buyerMarkerTone = 'required';
  }

  return {
    corridorMarker,
    corridorVerified: location.available,
    isPrimaryHub,
    requiredLicenses: 'DL 20B/21B · GSTIN · FSSAI',
    buyerMarkerLabel,
    buyerMarkerTone,
  };
}

export function filterSupplyLocations(
  locations: readonly IndianSupplyLocation[],
  filters: SupplyNetworkFilters,
): IndianSupplyLocation[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return locations.filter((loc) => {
    if (filters.availability === 'available' && !loc.available) {
      return false;
    }
    if (filters.availability === 'unavailable' && loc.available) {
      return false;
    }
    if (filters.zone !== 'All' && loc.zone !== filters.zone) {
      return false;
    }
    if (normalizedQuery) {
      const matchesCity = loc.city.toLowerCase().includes(normalizedQuery);
      const matchesState = loc.state.toLowerCase().includes(normalizedQuery);
      const matchesPincode = loc.pincode.includes(normalizedQuery);
      const matchesZone = loc.zone.toLowerCase().includes(normalizedQuery);
      if (!matchesCity && !matchesState && !matchesPincode && !matchesZone) {
        return false;
      }
    }
    return true;
  });
}
