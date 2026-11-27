export type TherapeuticCategory =
  | 'all'
  | 'bone-skeletal'
  | 'hematinic-maternal'
  | 'neuro-cognitive'
  | 'clinical-nutrition';

export type TimingWindow = 'Morning' | 'With Meals' | 'Daily Nutrition' | 'As Directed';

export type FormulationIconKey = 'bone' | 'droplet' | 'brain' | 'nutrition';

export interface ActiveIngredient {
  name: string;
  amount: string;
  standardization: string;
  role: string;
  nutrientGroup: string;
}

export interface NutritionalFactRow {
  nutrient: string;
  per100g: string;
  per30g: string;
}

export type FaqTopic = 'dosage' | 'sourcing' | 'safety';

export type FaqFilterTopic = 'all' | FaqTopic;

export type FaqBulletIcon =
  | 'dose'
  | 'clock'
  | 'check'
  | 'alert'
  | 'leaf'
  | 'shield'
  | 'drop';

export interface ProductFaqPoint {
  icon: FaqBulletIcon;
  lead: string;
  text: string;
}

export interface ProductFaqItem {
  id: string;
  topic: FaqTopic;
  question: string;
  answer: string;
  points?: ProductFaqPoint[];
}

export interface ProductQuickPoint {
  label: string;
  text: string;
}

export interface ProductFormulation {
  id: number;
  slug: string;
  code: string;
  name: string;
  tagline: string;
  subtitle: string;
  category: Exclude<TherapeuticCategory, 'all'>;
  categoryLabel: string;
  dosageForm: string;
  packDetail: string;
  icon: FormulationIconKey;
  medallionBg: string;
  brochureImage: string;
  cardImage?: string;
  compositionLine: string;
  summary: string;
  quickPoints: ProductQuickPoint[];
  clinicalMechanism: string;
  keyHighlights: Array<{ title: string; detail: string }>;
  indications: string[];
  activeIngredients: ActiveIngredient[];
  nutritionalFacts?: NutritionalFactRow[];
  directions: string;
  timingWindow: TimingWindow;
  cautions: string[];
  contraindications: string;
  dietaryFlags?: string[];
  faqs?: ProductFaqItem[];
  featured: boolean;
}

export interface RegimenEntry {
  slug: string;
  addedAt: string;
  notes: string;
  formulation: ProductFormulation;
}

export interface B2bLicenseSummary {
  businessName: string;
  entityType: string;
  drugLicenseNumber: string;
  gstin: string;
  fssaiNumber: string;
  gstStateName?: string | null;
  verifiedAt?: string | null;
}

export interface SupplyInquiryRecord {
  id: string;
  referenceCode: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  inquiryType: string;
  productSlugs: string[];
  cityRegion: string;
  pincode?: string;
  b2bLicenseSummary?: B2bLicenseSummary;
  message: string;
  createdAt: string;
}

export interface SupplyInquiryInput {
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  inquiryType: string;
  productSlugs: string[];
  cityRegion: string;
  pincode?: string;
  b2bLicenseSummary?: B2bLicenseSummary;
  message: string;
  acknowledgedDisclaimer: boolean;
}

export interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  inquiryType?: string;
  pincode?: string;
  b2bVerification?: string;
  message?: string;
  acknowledgedDisclaimer?: string;
}

export interface RegimenInteractionNotice {
  nutrientGroup: string;
  productNames: string[];
  guidance: string;
}

export interface RegimenScheduleGroup {
  window: TimingWindow;
  items: ProductFormulation[];
}
