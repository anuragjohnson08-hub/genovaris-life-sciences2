export type CookieDecision = 'accepted' | 'rejected' | 'custom';

export interface CookiePreferenceToggles {
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentRecord {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decision: CookieDecision;
  updatedAt: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export const COOKIE_CONSENT_STORAGE_KEY = 'genovaris_cookie_consent_v2';

export const DEFAULT_COOKIE_TOGGLES: CookiePreferenceToggles = {
  analytics: true,
  marketing: false,
};

export function buildCookieConsentRecord(
  decision: CookieDecision,
  customPrefs?: Partial<CookiePreferenceToggles>,
  timestamp: string = new Date().toISOString(),
): CookieConsentRecord {
  if (decision === 'accepted') {
    return {
      necessary: true,
      analytics: true,
      marketing: true,
      decision: 'accepted',
      updatedAt: timestamp,
    };
  }

  if (decision === 'rejected') {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      decision: 'rejected',
      updatedAt: timestamp,
    };
  }

  return {
    necessary: true,
    analytics: Boolean(customPrefs?.analytics ?? DEFAULT_COOKIE_TOGGLES.analytics),
    marketing: Boolean(customPrefs?.marketing ?? DEFAULT_COOKIE_TOGGLES.marketing),
    decision: 'custom',
    updatedAt: timestamp,
  };
}

export function parseCookieConsentRecord(raw: string | null): CookieConsentRecord | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentRecord> | null;
    if (!parsed || typeof parsed !== 'object') return null;

    if (
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean'
    ) {
      return null;
    }

    const decision: CookieDecision =
      parsed.decision === 'accepted' ||
      parsed.decision === 'rejected' ||
      parsed.decision === 'custom'
        ? parsed.decision
        : 'custom';

    const updatedAt =
      typeof parsed.updatedAt === 'string' && parsed.updatedAt.length > 0
        ? parsed.updatedAt
        : new Date().toISOString();

    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      decision,
      updatedAt,
    };
  } catch {
    return null;
  }
}

export function readCookieConsent(storage?: StorageLike | null): CookieConsentRecord | null {
  if (!storage) return null;
  try {
    return parseCookieConsentRecord(storage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeCookieConsent(
  storage: StorageLike | null | undefined,
  record: CookieConsentRecord,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}
