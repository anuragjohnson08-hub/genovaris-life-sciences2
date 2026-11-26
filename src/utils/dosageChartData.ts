import type { ProductFormulation } from '../types/medicine';

export type ChartDimension = 'profile' | 'weight';

export interface DosageGuidelinePoint {
  id: string;
  label: string;
  shortLabel: string;
  minIntake: number;
  typicalIntake: number;
  maxIntake: number;
  /** Stacked bar helpers for Recharts range visualization */
  rangeBase: number;
  rangeSpan: number;
  clinicianReview: boolean;
  rangeDisplay: string;
  activeDelivery: string;
  timing: string;
  guidance: string;
}

export interface ProductDosageGuidelineChart {
  unit: string;
  yAxisLabel: string;
  maxDomain: number;
  upperLimitValue: number;
  upperLimitLabel: string;
  subtitle: string;
  byProfile: DosageGuidelinePoint[];
  byWeight: DosageGuidelinePoint[];
}

export interface RetailBoxSpec {
  slug: string;
  packStyle: 'tablet-box' | 'powder-tin';
  packSizeLabel: string;
  retailFormat: string;
  storageTag: string;
  shelfCategory: string;
  frontAccentHex: string;
  secondaryAccentHex: string;
  spineBgHex: string;
  badgeText: string;
  shortComposition: string;
}

export const RETAIL_BOX_SPECS: Record<string, RetailBoxSpec> = {
  'bonebro-tablets': {
    slug: 'bonebro-tablets',
    packStyle: 'tablet-box',
    packSizeLabel: '10 × 10 Tablets',
    retailFormat: 'Alu-Alu / Blister Retail Carton',
    storageTag: 'Store below 25°C · Dry',
    shelfCategory: 'Ortho & Bone Bay',
    frontAccentHex: '#0F4C81',
    secondaryAccentHex: '#18A999',
    spineBgHex: '#0B3A63',
    badgeText: 'High-Elemental Calcium + K2-7',
    shortComposition: 'Calcium Carb. 1000 mg · K2-7 45 mcg · Zn · Mg · D3',
  },
  'red-xt-tablets': {
    slug: 'red-xt-tablets',
    packStyle: 'tablet-box',
    packSizeLabel: '10 × 10 Tablets',
    retailFormat: 'Moisture-Shield Retail Carton',
    storageTag: 'Keep away from children',
    shelfCategory: 'Hematinic & Maternal Bay',
    frontAccentHex: '#B81D46',
    secondaryAccentHex: '#E04F6D',
    spineBgHex: '#8E1435',
    badgeText: '52% Higher Iron Absorption',
    shortComposition: 'Ferrous Ascorbate 100 mg · Folic Acid 1.5 mg · B12 · D3',
  },
  'cerebra-cb': {
    slug: 'cerebra-cb',
    packStyle: 'tablet-box',
    packSizeLabel: '10 × 10 Tablets',
    retailFormat: 'Neuro-Care Retail Carton',
    storageTag: 'Cool, dry & dark place',
    shelfCategory: 'Neuro & Cognitive Bay',
    frontAccentHex: '#1652B8',
    secondaryAccentHex: '#0EA5E9',
    spineBgHex: '#103D8B',
    badgeText: 'Neurotrophic + Omega-3',
    shortComposition: 'Cerebroprotein 90 mg · Omega-3 150 mg · E · D3 · B12',
  },
  'protizen-hp-powder': {
    slug: 'protizen-hp-powder',
    packStyle: 'powder-tin',
    packSizeLabel: '200 g / 400 g Tin',
    retailFormat: 'Airtight Retail Nutrition Canister',
    storageTag: 'Close lid tightly · Dry',
    shelfCategory: 'Clinical Nutrition Shelf',
    frontAccentHex: '#8F122D',
    secondaryAccentHex: '#C88A2E',
    spineBgHex: '#6A0C20',
    badgeText: 'Sugar Free · Gluten Free',
    shortComposition: 'Whey & Skimmed Milk Protein · DHA · 21 Vit. & Min.',
  },
};

export function getRetailBoxSpec(product: ProductFormulation): RetailBoxSpec {
  const existing = RETAIL_BOX_SPECS[product.slug];
  if (existing) return existing;
  return {
    slug: product.slug,
    packStyle: 'tablet-box',
    packSizeLabel: 'Retail Pack',
    retailFormat: product.dosageForm,
    storageTag: 'Cool & dry place',
    shelfCategory: product.categoryLabel,
    frontAccentHex: '#173A2C',
    secondaryAccentHex: '#3B6E57',
    spineBgHex: '#102B20',
    badgeText: product.categoryLabel,
    shortComposition: product.packDetail,
  };
}

function buildPoint(
  point: Omit<DosageGuidelinePoint, 'rangeBase' | 'rangeSpan'>
): DosageGuidelinePoint {
  const base = point.clinicianReview ? 0 : point.minIntake;
  const span = point.clinicianReview
    ? 0
    : Math.max(0.08 * Math.max(point.maxIntake, 1), point.maxIntake - point.minIntake);
  return {
    ...point,
    rangeBase: base,
    rangeSpan: Number(span.toFixed(2)),
  };
}

export function getDosageGuidelineChartData(
  product: ProductFormulation
): ProductDosageGuidelineChart {
  if (product.slug === 'bonebro-tablets') {
    return {
      unit: 'tablets / day',
      yAxisLabel: 'Tablets / day',
      maxDomain: 2.5,
      upperLimitValue: 2,
      upperLimitLabel: 'Typical adult ceiling (2 tabs · 2000 mg CaCO₃)',
      subtitle:
        'Compare standard vs. physician-guided divided daily tablet ranges for Bonebro™ across life stages and adult weight bands.',
      byProfile: [
        buildPoint({
          id: 'under-18',
          label: 'Under 18',
          shortLabel: '< 18 yrs',
          minIntake: 0,
          typicalIntake: 0,
          maxIntake: 0,
          clinicianReview: true,
          rangeDisplay: 'Pediatrician review',
          activeDelivery: '1000 mg CaCO₃ per adult tab',
          timing: 'As prescribed only',
          guidance:
            'Adult-strength 1000 mg Calcium Carbonate tablets should not be self-dosed for minors without pediatric guidance.',
        }),
        buildPoint({
          id: 'adult-maint',
          label: 'Adult Maintenance',
          shortLabel: 'Adult',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '1000 mg CaCO₃ · 45 mcg K2-7 · 250 IU D3',
          timing: 'Once daily after main meal',
          guidance:
            'Standard daily bone strength and remineralization support for healthy adults.',
        }),
        buildPoint({
          id: 'senior',
          label: 'Senior (55+)',
          shortLabel: 'Senior 55+',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '1000 – 2000 mg CaCO₃ · 45 – 90 mcg K2-7',
          timing: 'After lunch (or split AM/PM)',
          guidance:
            '1 tablet for routine maintenance; physicians may prescribe 2 divided tablets in post-menopausal or senile osteoporosis.',
        }),
        buildPoint({
          id: 'pregnancy',
          label: 'Pregnancy / Lactation',
          shortLabel: 'Maternal',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '1000 – 2000 mg CaCO₃ · 250 – 500 IU D3',
          timing: 'Separated 2+ hrs from iron tablets',
          guidance:
            'Supports elevated maternal skeletal demand; always space at least 2 hours away from RED-XT™ iron tablets.',
        }),
        buildPoint({
          id: 'recovery',
          label: 'Osteoporosis / Recovery',
          shortLabel: 'Targeted',
          minIntake: 1,
          typicalIntake: 2,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '1000 – 2000 mg CaCO₃ · 50 – 100 mg MgO',
          timing: 'Split after breakfast & dinner',
          guidance:
            'Divided meal-time dosing improves calcium absorption during clinician-managed bone density therapy.',
        }),
      ],
      byWeight: [
        buildPoint({
          id: 'w-under-50',
          label: 'Under 50 kg (Adult)',
          shortLabel: '< 50 kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '1000 mg CaCO₃ · 45 mcg K2-7',
          timing: 'Once daily after food',
          guidance:
            'At lower adult body weight, 1 tablet daily is typically preferred unless a physician prescribes otherwise.',
        }),
        buildPoint({
          id: 'w-50-65',
          label: '50 – 65 kg',
          shortLabel: '50–65 kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '1000 – 2000 mg CaCO₃',
          timing: 'With meals (split if 2 tabs)',
          guidance:
            '1 tablet for standard maintenance; up to 2 divided tablets when directed for osteoporosis or pregnancy.',
        }),
        buildPoint({
          id: 'w-65-80',
          label: '65 – 80 kg',
          shortLabel: '65–80 kg',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '1000 – 2000 mg CaCO₃',
          timing: 'With meals (split if 2 tabs)',
          guidance:
            '1 tablet baseline, scaling to 2 divided tablets only under clinician guidance for low BMD.',
        }),
        buildPoint({
          id: 'w-80-plus',
          label: '80+ kg',
          shortLabel: '80+ kg',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '1000 – 2000 mg CaCO₃',
          timing: 'After meals · Full glass of water',
          guidance:
            'Do not exceed 2 tablets daily without specialist monitoring of serum calcium and Vitamin D3.',
        }),
      ],
    };
  }

  if (product.slug === 'red-xt-tablets') {
    return {
      unit: 'tablet / day',
      yAxisLabel: 'Tablets / day',
      maxDomain: 1.5,
      upperLimitValue: 1,
      upperLimitLabel: 'Standard adult ceiling (1 tab · 100 mg Ferrous Asc.)',
      subtitle:
        'RED-XT™ delivers a complete adult hematinic dose in a single tablet; review profile-specific guidance and safe adult caps below.',
      byProfile: [
        buildPoint({
          id: 'under-18',
          label: 'Under 18',
          shortLabel: '< 18 yrs',
          minIntake: 0,
          typicalIntake: 0,
          maxIntake: 0,
          clinicianReview: true,
          rangeDisplay: 'Pediatrician review',
          activeDelivery: '100 mg Ferrous Ascorbate / adult tab',
          timing: 'Physician-calculated only',
          guidance:
            'High-strength adult iron tablets require weight-based pediatric evaluation and age-appropriate dosage forms.',
        }),
        buildPoint({
          id: 'adult-maint',
          label: 'Adult Maintenance',
          shortLabel: 'Adult',
          minIntake: 0.5,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day (or alt. day)',
          activeDelivery: '100 mg Ferrous Asc. · 1.5 mg Folate · 1000 IU D3',
          timing: 'Morning · Away from tea/coffee',
          guidance:
            '1 tablet daily during correction; some physicians use alternate-day dosing (0.5/day avg.) once iron stores normalize.',
        }),
        buildPoint({
          id: 'pregnancy',
          label: 'Pregnancy / Lactation',
          shortLabel: 'Maternal',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '100 mg Iron · 1.5 mg Folic Acid · 1000 IU D3',
          timing: 'Morning · 2 hrs apart from calcium',
          guidance:
            'Supports maternal RBC formation and fetal neural development; confirm hemoglobin trends with your obstetrician.',
        }),
        buildPoint({
          id: 'senior',
          label: 'Senior (55+)',
          shortLabel: 'Senior 55+',
          minIntake: 0.5,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: 'Up to 1 tablet / day',
          activeDelivery: '100 mg Ferrous Asc. · 15 mcg B12 · 1000 IU D3',
          timing: 'Morning after light non-dairy meal',
          guidance:
            'Use in adults 55+ should follow lab-confirmed iron deficiency; Ferrous Ascorbate supports gentler GI tolerance.',
        }),
        buildPoint({
          id: 'recovery',
          label: 'Iron Deficiency Support',
          shortLabel: 'Targeted',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '100 mg Ferrous Asc. (52% higher absorption)',
          timing: 'Morning with water or citrus juice',
          guidance:
            'Capped at 1 tablet daily unless physician explicitly directs otherwise after blood counts.',
        }),
      ],
      byWeight: [
        buildPoint({
          id: 'w-under-50',
          label: 'Under 50 kg (Adult)',
          shortLabel: '< 50 kg',
          minIntake: 0.5,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '0.5 – 1 tablet / day',
          activeDelivery: 'Up to 100 mg Ferrous Ascorbate',
          timing: 'After light non-dairy breakfast',
          guidance:
            'At lower adult weight, physicians occasionally recommend alternate-day dosing for optimal GI comfort.',
        }),
        buildPoint({
          id: 'w-50-65',
          label: '50 – 65 kg',
          shortLabel: '50–65 kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '100 mg Ferrous Asc. · 1.5 mg Folate',
          timing: 'Morning · Away from calcium',
          guidance:
            'Standard once-daily adult hematinic regimen.',
        }),
        buildPoint({
          id: 'w-65-80',
          label: '65 – 80 kg',
          shortLabel: '65–80 kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '100 mg Ferrous Asc. · 1000 IU D3',
          timing: 'Morning · Away from tea/coffee',
          guidance:
            'Full therapeutic strength in one tablet; never self-double dose.',
        }),
        buildPoint({
          id: 'w-80-plus',
          label: '80+ kg',
          shortLabel: '80+ kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '100 mg Ferrous Asc. · 1000 IU D3',
          timing: 'Morning · With water',
          guidance:
            'Daily cap remains 1 tablet regardless of higher body weight unless lab-directed.',
        }),
      ],
    };
  }

  if (product.slug === 'cerebra-cb') {
    return {
      unit: 'tablets / day',
      yAxisLabel: 'Tablets / day',
      maxDomain: 2.5,
      upperLimitValue: 2,
      upperLimitLabel: 'Specialist upper reference (2 tabs · 180 mg Cerebroprotein)',
      subtitle:
        'Visualize daily adult cognitive and neuroprotective intake ranges for CEREBRA-CB™ alongside specialist-review guardrails.',
      byProfile: [
        buildPoint({
          id: 'under-18',
          label: 'Under 18',
          shortLabel: '< 18 yrs',
          minIntake: 0,
          typicalIntake: 0,
          maxIntake: 0,
          clinicianReview: true,
          rangeDisplay: 'Specialist review',
          activeDelivery: '90 mg Cerebroprotein / adult tab',
          timing: 'Not self-dosed under 18',
          guidance:
            'Formulated for adult neurological support; minors require pediatric specialist review.',
        }),
        buildPoint({
          id: 'adult-maint',
          label: 'Adult Focus & Vitality',
          shortLabel: 'Adult',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '90 mg Cerebroprotein · 150 mg Omega-3',
          timing: 'Once daily after breakfast or lunch',
          guidance:
            'Standard daily neuro-nutritional support for memory, focus, and antioxidant protection.',
        }),
        buildPoint({
          id: 'pregnancy',
          label: 'Pregnancy / Lactation',
          shortLabel: 'Maternal',
          minIntake: 0,
          typicalIntake: 0,
          maxIntake: 0,
          clinicianReview: true,
          rangeDisplay: 'Obstetric review',
          activeDelivery: '90 mg Cerebroprotein / tab',
          timing: 'Only if specialist-prescribed',
          guidance:
            'Neurotrophic peptide formulations require explicit obstetrician approval during pregnancy or lactation.',
        }),
        buildPoint({
          id: 'senior',
          label: 'Senior (55+)',
          shortLabel: 'Senior 55+',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '90 – 180 mg Cerebroprotein · 300 – 600 IU D3',
          timing: 'Morning & midday after meals',
          guidance:
            '1 tablet baseline; clinicians may advise twice-daily morning/midday dosing for targeted cognitive care.',
        }),
        buildPoint({
          id: 'recovery',
          label: 'Neuro Recovery',
          shortLabel: 'Recovery',
          minIntake: 1,
          typicalIntake: 2,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '90 – 180 mg Cerebroprotein · 150 – 300 mg Omega-3',
          timing: 'After breakfast & lunch',
          guidance:
            'Targeted physician-guided neuroprotection avoiding late-evening dosing.',
        }),
      ],
      byWeight: [
        buildPoint({
          id: 'w-under-50',
          label: 'Under 50 kg (Adult)',
          shortLabel: '< 50 kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 1,
          clinicianReview: false,
          rangeDisplay: '1 tablet / day',
          activeDelivery: '90 mg Cerebroprotein · 7.5 mg Vit. E',
          timing: 'After breakfast',
          guidance:
            'Standard single-tablet daily dosing for lower adult body weight.',
        }),
        buildPoint({
          id: 'w-50-65',
          label: '50 – 65 kg',
          shortLabel: '50–65 kg',
          minIntake: 1,
          typicalIntake: 1,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '90 – 180 mg Cerebroprotein',
          timing: 'Morning / Midday with food',
          guidance:
            '1 tablet maintenance; up to 2 tablets only under neurological/medical supervision.',
        }),
        buildPoint({
          id: 'w-65-80',
          label: '65 – 80 kg',
          shortLabel: '65–80 kg',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '90 – 180 mg Cerebroprotein',
          timing: 'Morning / Midday with food',
          guidance:
            'Take with meals containing dietary fat to optimize Omega-3 and Vitamin E absorption.',
        }),
        buildPoint({
          id: 'w-80-plus',
          label: '80+ kg',
          shortLabel: '80+ kg',
          minIntake: 1,
          typicalIntake: 1.5,
          maxIntake: 2,
          clinicianReview: false,
          rangeDisplay: '1 – 2 tablets / day',
          activeDelivery: '90 – 180 mg Cerebroprotein · 300 mg Omega-3',
          timing: 'After breakfast & lunch',
          guidance:
            'Confirm divided dosing with a physician, especially if taking anticoagulants.',
        }),
      ],
    };
  }

  // Protizen-HP™ Powder (measured in grams / day: 15g, 30g, 60g)
  return {
    unit: 'g / day',
    yAxisLabel: 'Powder (g / day)',
    maxDomain: 75,
    upperLimitValue: 60,
    upperLimitLabel: 'Label upper daily serving (60 g · 2 servings)',
    subtitle:
      'Compare suggested daily Protizen-HP™ powder ranges (30 g = 1 serving of 2–3 tablespoons) across care profiles and body weights.',
    byProfile: [
      buildPoint({
        id: 'child',
        label: 'Child (< 12 yrs)',
        shortLabel: '< 12 yrs',
        minIntake: 0,
        typicalIntake: 0,
        maxIntake: 0,
        clinicianReview: true,
        rangeDisplay: 'Pediatrician review',
        activeDelivery: 'Age-tailored serving via dietitian',
        timing: 'Only as advised',
        guidance:
          'Consult a pediatrician or pediatric nutritionist to tailor protein shakes for children under 12.',
      }),
      buildPoint({
        id: 'teen',
        label: 'Adolescent (12–17)',
        shortLabel: '12–17 yrs',
        minIntake: 15,
        typicalIntake: 15,
        maxIntake: 30,
        clinicianReview: false,
        rangeDisplay: '15 – 30 g / day',
        activeDelivery: '2.3 – 4.5 g protein · 15 – 30 mg DHA',
        timing: 'Once daily in lukewarm milk',
        guidance:
          'Half-serving (15 g) gentle daily boost alongside balanced meals; confirm with pediatrician.',
      }),
      buildPoint({
        id: 'adult-maint',
        label: 'Adult Maintenance',
        shortLabel: 'Adult',
        minIntake: 30,
        typicalIntake: 30,
        maxIntake: 60,
        clinicianReview: false,
        rangeDisplay: '30 – 60 g / day',
        activeDelivery: '4.5 – 9 g protein · 30 – 60 mg DHA · 0 g sugar',
        timing: '1–2 servings daily',
        guidance:
          '30 g (1 serving) for everyday nutrition; 60 g (2 servings) for higher body weight or active training.',
      }),
      buildPoint({
        id: 'pregnancy',
        label: 'Pregnancy / Lactation',
        shortLabel: 'Maternal',
        minIntake: 30,
        typicalIntake: 60,
        maxIntake: 60,
        clinicianReview: false,
        rangeDisplay: '30 – 60 g / day',
        activeDelivery: '4.5 – 9 g protein · 30 – 60 mg DHA · 180 – 360 mg Ca',
        timing: 'Morning & evening in lukewarm milk',
        guidance:
          'Supports maternal protein, DHA, folic acid, and calcium intake with zero added sugar.',
      }),
      buildPoint({
        id: 'recovery',
        label: 'Recovery / Senior 55+',
        shortLabel: 'Recovery',
        minIntake: 30,
        typicalIntake: 60,
        maxIntake: 60,
        clinicianReview: false,
        rangeDisplay: '30 – 60 g / day',
        activeDelivery: '4.5 – 9 g powder protein (~22 g with 400 ml milk)',
        timing: 'Split AM & PM servings',
        guidance:
          'Twice-daily servings help preserve lean muscle mass, immunity, and daily energy recovery.',
      }),
    ],
    byWeight: [
      buildPoint({
        id: 'w-under-50',
        label: 'Under 50 kg',
        shortLabel: '< 50 kg',
        minIntake: 15,
        typicalIntake: 30,
        maxIntake: 30,
        clinicianReview: false,
        rangeDisplay: '15 – 30 g / day',
        activeDelivery: '2.3 – 4.5 g powder protein · 0 g sugar',
        timing: 'Once daily in lukewarm milk or water',
        guidance:
          '1 serving (30 g) comfortably complements lower-weight daily dietary protein goals (~40–50 g/day total).',
      }),
      buildPoint({
        id: 'w-50-65',
        label: '50 – 65 kg',
        shortLabel: '50–65 kg',
        minIntake: 30,
        typicalIntake: 30,
        maxIntake: 60,
        clinicianReview: false,
        rangeDisplay: '30 – 60 g / day',
        activeDelivery: '4.5 – 9 g powder protein · 30 – 60 mg DHA',
        timing: '1 serving maint. · 2 servings maternal/active',
        guidance:
          'Ideal baseline is 30 g daily, scaling to 60 g during pregnancy, lactation, or active recovery.',
      }),
      buildPoint({
        id: 'w-65-80',
        label: '65 – 80 kg',
        shortLabel: '65–80 kg',
        minIntake: 30,
        typicalIntake: 45,
        maxIntake: 60,
        clinicianReview: false,
        rangeDisplay: '30 – 60 g / day',
        activeDelivery: '4.5 – 9 g powder protein · 180 – 360 mg Ca',
        timing: '1–2 servings daily',
        guidance:
          'Higher baseline protein need (~56–90 g/day total diet); 2 servings fit active or recovery days well.',
      }),
      buildPoint({
        id: 'w-80-plus',
        label: '80+ kg',
        shortLabel: '80+ kg',
        minIntake: 30,
        typicalIntake: 60,
        maxIntake: 60,
        clinicianReview: false,
        rangeDisplay: '30 – 60 g / day (2 servings)',
        activeDelivery: '9 g powder protein (~22 g with milk) · 60 mg DHA',
        timing: 'Morning & evening servings',
        guidance:
          'Two 30 g servings match the brochure’s twice-daily recommendation for higher body-mass support.',
      }),
    ],
  };
}
