import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  buildCookieConsentRecord,
  parseCookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
  type StorageLike,
} from './cookieConsent';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

test('buildCookieConsentRecord maps accepted, rejected, and custom decisions accurately', () => {
  const accepted = buildCookieConsentRecord('accepted', undefined, '2026-11-25T00:00:00.000Z');
  assert.deepEqual(accepted, {
    necessary: true,
    analytics: true,
    marketing: true,
    decision: 'accepted',
    updatedAt: '2026-11-25T00:00:00.000Z',
  });

  const rejected = buildCookieConsentRecord('rejected', undefined, '2026-11-25T00:00:00.000Z');
  assert.deepEqual(rejected, {
    necessary: true,
    analytics: false,
    marketing: false,
    decision: 'rejected',
    updatedAt: '2026-11-25T00:00:00.000Z',
  });

  const custom = buildCookieConsentRecord(
    'custom',
    { analytics: false, marketing: true },
    '2026-11-25T00:00:00.000Z',
  );
  assert.deepEqual(custom, {
    necessary: true,
    analytics: false,
    marketing: true,
    decision: 'custom',
    updatedAt: '2026-11-25T00:00:00.000Z',
  });
});

test('readCookieConsent and writeCookieConsent persist and restore preferences cleanly', () => {
  const storage = createMemoryStorage();
  assert.equal(readCookieConsent(storage), null);

  const saved = buildCookieConsentRecord(
    'custom',
    { analytics: false, marketing: true },
    '2026-11-25T05:00:00.000Z',
  );
  assert.equal(writeCookieConsent(storage, saved), true);

  const restored = readCookieConsent(storage);
  assert.deepEqual(restored, saved);
});

test('parseCookieConsentRecord rejects corrupted JSON or missing boolean flags and enforces necessary=true', () => {
  assert.equal(parseCookieConsentRecord(null), null);
  assert.equal(parseCookieConsentRecord('{bad json'), null);
  assert.equal(parseCookieConsentRecord(JSON.stringify({ analytics: 'yes', marketing: false })), null);

  const storage = createMemoryStorage();
  storage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({ necessary: false, analytics: true, marketing: false, decision: 'custom', updatedAt: '2026-11-25T01:00:00.000Z' }),
  );
  const restored = readCookieConsent(storage);
  assert.equal(restored?.necessary, true);
  assert.equal(restored?.analytics, true);
  assert.equal(restored?.marketing, false);
});

test('readCookieConsent and writeCookieConsent fail gracefully when storage throws', () => {
  const brokenStorage: StorageLike = {
    getItem: () => {
      throw new Error('Blocked');
    },
    setItem: () => {
      throw new Error('QuotaExceeded');
    },
  };

  assert.equal(readCookieConsent(brokenStorage), null);
  assert.equal(
    writeCookieConsent(brokenStorage, buildCookieConsentRecord('accepted')),
    false,
  );
});
