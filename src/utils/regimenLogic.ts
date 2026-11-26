import type {
  ProductFormulation,
  RegimenInteractionNotice,
  RegimenScheduleGroup,
  SupplyInquiryInput,
  TherapeuticCategory,
  TimingWindow,
  ValidationErrors,
} from '../types/medicine';

export interface FormulationFilterOptions {
  category?: TherapeuticCategory;
  timing?: TimingWindow | 'All';
  query?: string;
}

const TIMING_ORDER: TimingWindow[] = [
  'Morning',
  'With Meals',
  'Daily Nutrition',
  'As Directed',
];

/**
 * Filters Genovaris Lifesciences products deterministically by category, timing window, and free-text query.
 */
export function filterFormulations(
  products: ProductFormulation[],
  options: FormulationFilterOptions
): ProductFormulation[] {
  const category = options.category ?? 'all';
  const timing = options.timing ?? 'All';
  const normalizedQuery = (options.query ?? '').trim().toLowerCase();

  return products.filter((product) => {
    if (category !== 'all' && product.category !== category) {
      return false;
    }

    if (timing !== 'All' && product.timingWindow !== timing) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableFields = [
      product.name,
      product.subtitle,
      product.tagline,
      product.code,
      product.categoryLabel,
      product.compositionLine,
      product.summary,
      product.dosageForm,
      ...product.indications,
      ...product.activeIngredients.map((i) => `${i.name} ${i.role}`),
    ]
      .join(' ')
      .toLowerCase();

    return searchableFields.includes(normalizedQuery);
  });
}

/**
 * Inspects shortlisted formulations for overlapping active nutrient groups
 * so doctors, pharmacists, or patients can review cumulative daily intake.
 */
export function detectRegimenInteractions(
  selectedProducts: ProductFormulation[]
): RegimenInteractionNotice[] {
  const groupToProducts = new Map<string, string[]>();

  for (const product of selectedProducts) {
    const seenInProduct = new Set<string>();
    for (const ingredient of product.activeIngredients) {
      const group = ingredient.nutrientGroup.trim();
      if (!group || seenInProduct.has(group)) continue;
      seenInProduct.add(group);
      const list = groupToProducts.get(group) ?? [];
      list.push(product.name);
      groupToProducts.set(group, list);
    }
  }

  const notices: RegimenInteractionNotice[] = [];
  for (const [nutrientGroup, productNames] of groupToProducts.entries()) {
    if (productNames.length > 1) {
      notices.push({
        nutrientGroup,
        productNames,
        guidance: `Selected products (${productNames.join(', ')}) both contain ${nutrientGroup}. Confirm total daily intake with a qualified healthcare professional before combining.`,
      });
    }
  }

  return notices;
}

/**
 * Groups selected formulations by recommended administration window.
 */
export function groupRegimenByTiming(
  selectedProducts: ProductFormulation[]
): RegimenScheduleGroup[] {
  const grouped = new Map<TimingWindow, ProductFormulation[]>();
  for (const window of TIMING_ORDER) {
    grouped.set(window, []);
  }

  for (const product of selectedProducts) {
    const bucket = grouped.get(product.timingWindow) ?? [];
    bucket.push(product);
    grouped.set(product.timingWindow, bucket);
  }

  return TIMING_ORDER.map((window) => ({
    window,
    items: grouped.get(window) ?? [],
  })).filter((group) => group.items.length > 0);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+\d][\d\s\-()]{6,20}$/;

/**
 * Validates Supply & Distribution inquiry submissions strictly without silently substituting defaults.
 */
export function validateSupplyInquiryInput(input: SupplyInquiryInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const trimmedName = input.fullName.trim();
  if (trimmedName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  } else if (trimmedName.length > 120) {
    errors.fullName = 'Name must be 120 characters or fewer.';
  }

  const trimmedEmail = input.email.trim();
  if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Please provide a valid email address.';
  }

  const trimmedPhone = input.phone.trim();
  if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
    errors.phone = 'Please enter a valid contact number (digits, spaces, or + prefix).';
  }

  if (!input.inquiryType.trim()) {
    errors.inquiryType = 'Please select an inquiry type.';
  }

  const trimmedPincode = (input.pincode ?? '').trim();
  if (trimmedPincode && !/^[1-9]\d{5}$/.test(trimmedPincode)) {
    errors.pincode = 'Please enter a valid 6-digit Indian pincode (e.g., 834001).';
  }

  const trimmedMessage = input.message.trim();
  if (trimmedMessage.length < 15) {
    errors.message =
      'Please include at least 15 characters describing your supply or product inquiry.';
  } else if (trimmedMessage.length > 1500) {
    errors.message = 'Message must be 1,500 characters or fewer.';
  }

  if (!input.acknowledgedDisclaimer) {
    errors.acknowledgedDisclaimer =
      'Please acknowledge that product summaries are for informational and supply reference only.';
  }

  return errors;
}

export function computeChecklistProgress(
  checkedIds: string[],
  validIds: string[]
): { completed: number; total: number; percentage: number } {
  const validSet = new Set(validIds);
  const uniqueChecked = new Set(checkedIds.filter((id) => validSet.has(id)));
  const total = validSet.size;
  const completed = uniqueChecked.size;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
}
