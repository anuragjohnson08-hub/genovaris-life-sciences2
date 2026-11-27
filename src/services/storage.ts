import type {
  RegimenEntry,
  SupplyInquiryInput,
  SupplyInquiryRecord,
} from '../types/medicine';
import { GENOVARIS_PRODUCTS } from '../data/products';
import type { B2bStoredVerification } from '../utils/b2bVerification';

const REGIMEN_KEY = 'genovaris_supply_shortlist_v1';
const CHECKLIST_KEY = 'genovaris_b2b_compliance_checklist_v2';
const B2B_VERIFICATION_KEY = 'genovaris_b2b_credentials_v1';
const INQUIRIES_KEY = 'genovaris_supply_inquiries_v1';

const DEFAULT_B2B_VERIFICATION: B2bStoredVerification = {
  businessName: '',
  entityType: 'Wholesale Stockist / Distributor',
  drugLicenseNumber: '',
  gstin: '',
  fssaiNumber: '',
  verified: false,
  verifiedAt: null,
  gstStateName: null,
  drugLicenseScope: null,
};

interface StoredRegimenItem {
  slug: string;
  addedAt: string;
  notes: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or storage restriction errors cleanly
  }
}

export function loadSavedShortlist(): RegimenEntry[] {
  const stored = readJson<StoredRegimenItem[]>(REGIMEN_KEY, []);
  const entries: RegimenEntry[] = [];
  for (const item of stored) {
    const formulation = GENOVARIS_PRODUCTS.find((p) => p.slug === item.slug);
    if (formulation) {
      entries.push({
        slug: item.slug,
        addedAt: item.addedAt,
        notes: item.notes,
        formulation,
      });
    }
  }
  return entries;
}

export function saveShortlistItems(entries: RegimenEntry[]): void {
  const compact: StoredRegimenItem[] = entries.map((entry) => ({
    slug: entry.slug,
    addedAt: entry.addedAt,
    notes: entry.notes,
  }));
  writeJson(REGIMEN_KEY, compact);
}

export function loadChecklistIds(): string[] {
  return readJson<string[]>(CHECKLIST_KEY, []);
}

export function saveChecklistIds(ids: string[]): void {
  writeJson(CHECKLIST_KEY, Array.from(new Set(ids)));
}

export function loadB2bVerification(): B2bStoredVerification {
  const stored = readJson<Partial<B2bStoredVerification>>(
    B2B_VERIFICATION_KEY,
    DEFAULT_B2B_VERIFICATION
  );
  return {
    ...DEFAULT_B2B_VERIFICATION,
    ...stored,
  };
}

export function saveB2bVerification(state: B2bStoredVerification): void {
  writeJson(B2B_VERIFICATION_KEY, state);
}

export function loadSupplyInquiries(): SupplyInquiryRecord[] {
  return readJson<SupplyInquiryRecord[]>(INQUIRIES_KEY, []);
}

export function appendSupplyInquiry(
  input: SupplyInquiryInput
): SupplyInquiryRecord {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const record: SupplyInquiryRecord = {
    id: `${Date.now()}-${randomDigits}`,
    referenceCode: `GL-SUP-2026-${randomDigits}`,
    fullName: input.fullName.trim(),
    organization: input.organization.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    inquiryType: input.inquiryType.trim(),
    productSlugs: [...input.productSlugs],
    cityRegion: input.cityRegion.trim(),
    pincode: (input.pincode ?? '').trim() || undefined,
    b2bLicenseSummary: input.b2bLicenseSummary,
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
  };

  const existing = loadSupplyInquiries();
  const next = [record, ...existing].slice(0, 25);
  writeJson(INQUIRIES_KEY, next);
  return record;
}
