export type B2bEntityType =
  | 'Wholesale Stockist / Distributor'
  | 'Retail Pharmacy / Chemist'
  | 'Hospital / Clinical Procurement'
  | 'PCD Pharma Franchise Partner';

export const B2B_ENTITY_TYPES: readonly B2bEntityType[] = [
  'Wholesale Stockist / Distributor',
  'Retail Pharmacy / Chemist',
  'Hospital / Clinical Procurement',
  'PCD Pharma Franchise Partner',
] as const;

export interface B2bCredentialsInput {
  businessName: string;
  entityType: B2bEntityType;
  drugLicenseNumber: string;
  gstin: string;
  fssaiNumber: string;
}

export interface B2bStoredVerification extends B2bCredentialsInput {
  verified: boolean;
  verifiedAt: string | null;
  gstStateName: string | null;
  drugLicenseScope: string | null;
}

export interface B2bCredentialErrors {
  businessName?: string;
  drugLicenseNumber?: string;
  gstin?: string;
  fssaiNumber?: string;
}

export interface B2bVerificationEvaluation {
  isCredentialsValid: boolean;
  errors: B2bCredentialErrors;
  normalized: B2bCredentialsInput;
  gstStateName: string | null;
  drugLicenseScope: string | null;
}

export interface B2bComplianceGateStatus {
  credentialsVerified: boolean;
  declarationsCompleted: number;
  declarationsTotal: number;
  declarationsComplete: boolean;
  isFullyVerified: boolean;
  overallPercent: number;
}

const INDIAN_GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

const FSSAI_STRICT_PATTERN = /^[12]\d{13}$/;

export function normalizeGstin(raw: string): string {
  return raw.trim();
}

export function normalizeFssai(raw: string): string {
  return raw.trim();
}

export function normalizeDrugLicense(raw: string): string {
  return raw.trim();
}

export function lookupIndianGstState(gstin: string): string | null {
  const cleaned = gstin.replace(/\s+/g, '').toUpperCase();
  if (cleaned.length < 2) return null;
  const code = cleaned.slice(0, 2);
  return INDIAN_GST_STATE_CODES[code] ?? null;
}

export function detectDrugLicenseScope(drugLicense: string): string | null {
  const upper = drugLicense.trim().toUpperCase();
  if (!upper) return null;
  if (/\b20B\b|\b21B\b|20B|21B/.test(upper)) {
    return 'Wholesale Drug License (Form 20B / 21B)';
  }
  if (/\b20C\b|\b21C\b|20C|21C/.test(upper)) {
    return 'Homeopathic / Restricted Drug License';
  }
  if (/\b20F\b|\b20G\b|20F|20G/.test(upper)) {
    return 'Schedule X Drug License (Form 20F / 20G)';
  }
  if (/(?:^|[-/\s])(20|21)(?:[-/\s]|$)/.test(upper)) {
    return 'Retail Pharmacy Drug License (Form 20 / 21)';
  }
  return 'State Drug Control Trade License';
}

export function validateIndianGstin(raw: string): {
  valid: boolean;
  normalized: string;
  stateName: string | null;
  error?: string;
} {
  const normalized = normalizeGstin(raw);
  if (!normalized) {
    return {
      valid: false,
      normalized,
      stateName: null,
      error: 'Please enter a GSTIN value to verify.',
    };
  }
  const stateName = lookupIndianGstState(normalized);
  return { valid: true, normalized, stateName };
}

export function validateIndianDrugLicense(raw: string): {
  valid: boolean;
  normalized: string;
  scope: string | null;
  error?: string;
} {
  const normalized = normalizeDrugLicense(raw);
  if (!normalized) {
    return {
      valid: false,
      normalized,
      scope: null,
      error: 'Please enter a Drug License value to verify.',
    };
  }

  return {
    valid: true,
    normalized,
    scope: detectDrugLicenseScope(normalized),
  };
}

export function validateIndianFssai(raw: string): {
  valid: boolean;
  normalized: string;
  isStandardFormat: boolean;
  error?: string;
} {
  const normalized = normalizeFssai(raw);
  if (!normalized) {
    return {
      valid: false,
      normalized,
      isStandardFormat: false,
      error: 'Please enter an FSSAI value to verify.',
    };
  }
  return {
    valid: true,
    normalized,
    isStandardFormat: FSSAI_STRICT_PATTERN.test(normalized.replace(/\D/g, '')),
  };
}

export function evaluateB2bCredentials(
  input: B2bCredentialsInput
): B2bVerificationEvaluation {
  const errors: B2bCredentialErrors = {};

  const trimmedBusiness = input.businessName.trim();
  if (!trimmedBusiness) {
    errors.businessName = 'Please enter a business or pharmacy name.';
  }

  const dl = validateIndianDrugLicense(input.drugLicenseNumber);
  if (!dl.valid && dl.error) {
    errors.drugLicenseNumber = dl.error;
  }

  const gst = validateIndianGstin(input.gstin);
  if (!gst.valid && gst.error) {
    errors.gstin = gst.error;
  }

  const fssai = validateIndianFssai(input.fssaiNumber);
  if (!fssai.valid && fssai.error) {
    errors.fssaiNumber = fssai.error;
  }

  return {
    isCredentialsValid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      businessName: trimmedBusiness,
      entityType: input.entityType,
      drugLicenseNumber: dl.normalized,
      gstin: gst.normalized,
      fssaiNumber: fssai.normalized,
    },
    gstStateName: gst.valid ? gst.stateName : null,
    drugLicenseScope: dl.valid ? dl.scope : null,
  };
}

export function computeB2bComplianceGate(
  credentialsVerified: boolean,
  checkedIds: string[],
  requiredDeclarationIds: string[]
): B2bComplianceGateStatus {
  const validSet = new Set(requiredDeclarationIds);
  const completedCount = new Set(
    checkedIds.filter((id) => validSet.has(id))
  ).size;
  const totalCount = validSet.size;
  const declarationsComplete = totalCount > 0 && completedCount === totalCount;
  const isFullyVerified = credentialsVerified && declarationsComplete;

  // Weight: 50% for official license credentials verification + 50% for mandatory declarations
  const credentialWeight = credentialsVerified ? 50 : 0;
  const declarationWeight =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 50);

  return {
    credentialsVerified,
    declarationsCompleted: completedCount,
    declarationsTotal: totalCount,
    declarationsComplete,
    isFullyVerified,
    overallPercent: credentialWeight + declarationWeight,
  };
}
