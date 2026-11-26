import {
  INDIAN_SUPPLY_LOCATIONS,
  type IndianSupplyLocation,
} from '../data/indianLocations.ts';

export type TransportAvailabilityStatus =
  | 'available'
  | 'unavailable'
  | 'invalid';

export type TransportServiceTier =
  | 'direct-hub'
  | 'regional-corridor'
  | 'pan-india-freight'
  | 'unserviceable';

export interface TransportAvailabilityResult {
  status: TransportAvailabilityStatus;
  available: boolean;
  pincode: string;
  tier?: TransportServiceTier;
  locationName?: string;
  regionLabel?: string;
  etaLabel?: string;
  headline: string;
  detail: string;
}

// Civilian Indian postal pincodes span 100000–855999 (9xxxxx is Army Postal Service)
const VALID_INDIAN_PINCODE = /^[1-8]\d{5}$/;
const APS_PINCODE = /^9\d{5}$/;

const INDIAN_CIRCLE_BY_FIRST_DIGIT: Record<
  string,
  { regionLabel: string; etaLabel: string }
> = {
  '1': {
    regionLabel: 'North India (Delhi NCR, Punjab, Haryana, HP & J&K)',
    etaLabel: '3–4 business days via pharma freight',
  },
  '2': {
    regionLabel: 'North-Central India (Uttar Pradesh & Uttarakhand)',
    etaLabel: '2–4 business days via pharma freight',
  },
  '3': {
    regionLabel: 'West India (Rajasthan & Gujarat)',
    etaLabel: '3–5 business days via pharma freight',
  },
  '4': {
    regionLabel: 'West & Central India (Maharashtra, MP, Chhattisgarh & Goa)',
    etaLabel: '3–4 business days via pharma freight',
  },
  '5': {
    regionLabel: 'South-Central India (Karnataka, Telangana & Andhra Pradesh)',
    etaLabel: '3–5 business days via pharma freight',
  },
  '6': {
    regionLabel: 'South India (Tamil Nadu, Kerala & Puducherry)',
    etaLabel: '4–5 business days via pharma freight',
  },
  '7': {
    regionLabel: 'East & North-East India (West Bengal, Odisha & Assam)',
    etaLabel: '2–4 business days via east-zone carrier',
  },
  '8': {
    regionLabel: 'Jharkhand & Bihar Corridor',
    etaLabel: '1–2 business days via regional carrier',
  },
};

const LOCATION_BY_PINCODE = new Map<string, IndianSupplyLocation>(
  INDIAN_SUPPLY_LOCATIONS.map((loc) => [loc.pincode, loc]),
);

export function sanitizePincodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

export function isValidIndianPincode(raw: string): boolean {
  const cleaned = raw.trim();
  return VALID_INDIAN_PINCODE.test(cleaned) || APS_PINCODE.test(cleaned);
}

export function findIndianLocationByPincode(
  rawPincode: string,
): IndianSupplyLocation | null {
  return LOCATION_BY_PINCODE.get(rawPincode.trim()) ?? null;
}

export function findIndianLocationByCityOrLabel(
  rawQuery: string,
): IndianSupplyLocation | null {
  const normalized = rawQuery.trim().toLowerCase();
  if (!normalized) return null;

  for (const loc of INDIAN_SUPPLY_LOCATIONS) {
    const cityLower = loc.city.toLowerCase();
    const combined = `${cityLower}, ${loc.state.toLowerCase()}`;
    if (normalized === cityLower || normalized === combined) {
      return loc;
    }
  }

  return null;
}

/**
 * Deterministic seeded pseudo-random hash (0–99) for unlisted Indian pincodes
 * so GitHub demos reproducibly show ~30% randomly unavailable Indian areas.
 */
export function deterministicPincodeBucket(pincode: string): number {
  let hash = 2166136261;
  for (let i = 0; i < pincode.length; i += 1) {
    hash ^= pincode.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 100;
}

/**
 * Checks whether Genovaris Lifesciences supply transportation is available
 * for a given Indian 6-digit pincode (or matched Indian city when pincode is blank).
 * Strictly supports Indian locations only.
 */
export function checkSupplyTransportAvailability(
  rawPincode: string,
  rawCityRegion?: string,
): TransportAvailabilityResult {
  const cleanedPin = rawPincode.trim();
  const cityMatch =
    !cleanedPin && rawCityRegion
      ? findIndianLocationByCityOrLabel(rawCityRegion)
      : null;

  const effectivePin = cleanedPin || cityMatch?.pincode || '';

  if (!effectivePin) {
    const hasUnmatchedCity = Boolean(rawCityRegion && rawCityRegion.trim());
    return {
      status: 'invalid',
      available: false,
      pincode: '',
      headline: hasUnmatchedCity
        ? 'Indian 6-digit pincode required'
        : 'Enter an Indian 6-digit pincode to check',
      detail: hasUnmatchedCity
        ? 'Only Indian locations are supported. Select an Indian city or enter a valid 6-digit Indian pincode (e.g., 834001).'
        : 'Provide a valid 6-digit Indian location pincode (e.g., 834001) to check supply transportation availability.',
    };
  }

  if (APS_PINCODE.test(effectivePin)) {
    return {
      status: 'unavailable',
      available: false,
      pincode: effectivePin,
      tier: 'unserviceable',
      regionLabel: 'Army Postal Service (APS), India',
      headline: `Supply transport not available at ${effectivePin}`,
      detail:
        'Army Postal Service (APS), India — Direct commercial medicine freight is not available for APS pincodes.',
    };
  }

  if (!VALID_INDIAN_PINCODE.test(effectivePin)) {
    return {
      status: 'invalid',
      available: false,
      pincode: effectivePin,
      headline: 'Only valid Indian pincodes are supported',
      detail:
        'Enter a valid 6-digit Indian pincode starting with digits 1–8 (e.g., 834001, 400001, 560001).',
    };
  }

  // 1. Exact Indian city dataset match (covers all 28 States & 8 UTs with demo availability)
  const exactLocation = LOCATION_BY_PINCODE.get(effectivePin);
  if (exactLocation) {
    const locationLabel = `${exactLocation.city}, ${exactLocation.state}`;
    if (!exactLocation.available) {
      return {
        status: 'unavailable',
        available: false,
        pincode: effectivePin,
        tier: 'unserviceable',
        locationName: locationLabel,
        regionLabel: locationLabel,
        headline: `Supply transport not available at ${effectivePin}`,
        detail: `${locationLabel} — ${exactLocation.note}`,
      };
    }

    const tier: TransportServiceTier = effectivePin.startsWith('834')
      ? 'direct-hub'
      : effectivePin.startsWith('8')
        ? 'regional-corridor'
        : 'pan-india-freight';

    return {
      status: 'available',
      available: true,
      pincode: effectivePin,
      tier,
      locationName: locationLabel,
      regionLabel: locationLabel,
      etaLabel: exactLocation.etaLabel,
      headline: `Supply transport available at ${effectivePin}`,
      detail: `${locationLabel} · ${exactLocation.etaLabel ?? exactLocation.note}.`,
    };
  }

  // 2. Ranchi home hub prefix (834xxx) is always serviceable
  if (effectivePin.startsWith('834')) {
    return {
      status: 'available',
      available: true,
      pincode: effectivePin,
      tier: 'direct-hub',
      regionLabel: 'Ranchi Dispatch Hub, Jharkhand',
      etaLabel: 'Same-day / 24h direct van dispatch',
      headline: `Supply transport available at ${effectivePin}`,
      detail:
        'Ranchi Dispatch Hub, Jharkhand · Same-day / 24h direct van dispatch.',
    };
  }

  // 3. Always-unavailable remote Indian sectors (Islands, Ladakh, Sikkim hill)
  const numericPin = Number(effectivePin);
  if (
    (numericPin >= 744000 && numericPin <= 744999) ||
    (numericPin >= 682551 && numericPin <= 682559) ||
    (numericPin >= 194000 && numericPin <= 194999) ||
    (numericPin >= 737000 && numericPin <= 737999)
  ) {
    return {
      status: 'unavailable',
      available: false,
      pincode: effectivePin,
      tier: 'unserviceable',
      regionLabel: 'Remote Indian Territory Sector',
      headline: `Supply transport not available at ${effectivePin}`,
      detail:
        'Standard direct surface supply transportation is currently unavailable in this remote Indian sector.',
    };
  }

  // 4. Other valid Indian pincodes: deterministic ~30% demo unavailability across India
  const circle = INDIAN_CIRCLE_BY_FIRST_DIGIT[effectivePin[0]];
  const bucket = deterministicPincodeBucket(effectivePin);
  if (bucket < 30) {
    return {
      status: 'unavailable',
      available: false,
      pincode: effectivePin,
      tier: 'unserviceable',
      regionLabel: circle.regionLabel,
      headline: `Supply transport not available at ${effectivePin}`,
      detail: `${circle.regionLabel} — Direct carrier dispatch is not currently active for this Indian pincode.`,
    };
  }

  return {
    status: 'available',
    available: true,
    pincode: effectivePin,
    tier: effectivePin.startsWith('8') ? 'regional-corridor' : 'pan-india-freight',
    regionLabel: circle.regionLabel,
    etaLabel: circle.etaLabel,
    headline: `Supply transport available at ${effectivePin}`,
    detail: `${circle.regionLabel} · ${circle.etaLabel}.`,
  };
}
