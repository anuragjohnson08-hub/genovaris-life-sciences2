import type { ProductFormulation } from '../types/medicine';

export type WeightUnit = 'kg' | 'lb';

export type LifeStage =
  | 'standard'
  | 'pregnancy-lactation'
  | 'senior'
  | 'recovery';

export type SupportGoal = 'maintenance' | 'targeted';

export type DosageStatus = 'standard' | 'enhanced' | 'clinician-review';

export interface DosageProfileInput {
  age: number;
  weight: number;
  weightUnit: WeightUnit;
  lifeStage: LifeStage;
  goal: SupportGoal;
}

export interface DosageInputValidation {
  valid: boolean;
  errors: {
    age?: string;
    weight?: string;
  };
}

export interface NutrientDeliveryItem {
  label: string;
  amount: string;
  note?: string;
}

export interface DosageCalculationResult {
  status: DosageStatus;
  statusLabel: string;
  suggestedAmount: string;
  servingDetail: string;
  schedule: string;
  dailyUnits: number;
  unitLabel: string;
  rationale: string;
  proteinTargetNote?: string;
  nutrientDeliveries: NutrientDeliveryItem[];
  administrationTips: string[];
  safetyNotes: string[];
}

const KG_PER_LB = 0.45359237;

export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit
): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (from === to) return Math.round(value * 10) / 10;
  const converted = from === 'lb' ? value * KG_PER_LB : value / KG_PER_LB;
  return Math.round(converted * 10) / 10;
}

export function getWeightInKg(weight: number, unit: WeightUnit): number {
  return convertWeight(weight, unit, 'kg');
}

export function getDefaultDosageProfile(productSlug: string): DosageProfileInput {
  switch (productSlug) {
    case 'bonebro-tablets':
      return {
        age: 52,
        weight: 64,
        weightUnit: 'kg',
        lifeStage: 'standard',
        goal: 'maintenance',
      };
    case 'red-xt-tablets':
      return {
        age: 30,
        weight: 58,
        weightUnit: 'kg',
        lifeStage: 'standard',
        goal: 'maintenance',
      };
    case 'cerebra-cb':
      return {
        age: 42,
        weight: 68,
        weightUnit: 'kg',
        lifeStage: 'standard',
        goal: 'maintenance',
      };
    case 'protizen-hp-powder':
    default:
      return {
        age: 34,
        weight: 66,
        weightUnit: 'kg',
        lifeStage: 'standard',
        goal: 'maintenance',
      };
  }
}

export function validateDosageInput(
  input: DosageProfileInput
): DosageInputValidation {
  const errors: DosageInputValidation['errors'] = {};

  if (!Number.isFinite(input.age) || input.age < 1 || input.age > 110) {
    errors.age = 'Enter an age between 1 and 110 years.';
  }

  const weightKg = getWeightInKg(input.weight, input.weightUnit);
  if (!Number.isFinite(input.weight) || weightKg < 15 || weightKg > 250) {
    errors.weight =
      input.weightUnit === 'kg'
        ? 'Enter a weight between 15 and 250 kg.'
        : 'Enter a weight between 33 and 550 lb.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

export function calculateProductDosage(
  product: ProductFormulation,
  input: DosageProfileInput
): DosageCalculationResult {
  const weightKg = getWeightInKg(input.weight, input.weightUnit);
  const isMinor = input.age < 18;
  const isChild = input.age < 12;
  const isOlderAdult = input.age >= 55 || input.lifeStage === 'senior';
  const isPregnancy = input.lifeStage === 'pregnancy-lactation';
  const isRecovery = input.lifeStage === 'recovery';
  const isTargeted = input.goal === 'targeted';

  if (product.slug === 'bonebro-tablets') {
    if (isMinor) {
      return {
        status: 'clinician-review',
        statusLabel: 'Pediatric consultation required',
        suggestedAmount: 'Consult a pediatrician',
        servingDetail: 'Adult-strength 1000 mg Calcium Carbonate tablet',
        schedule: 'Only as prescribed by a physician',
        dailyUnits: 0,
        unitLabel: 'tablets',
        rationale:
          'Bonebro™ delivers 1000 mg of Calcium Carbonate per tablet, formulated for adult skeletal health. Pediatric calcium and vitamin D3 dosing should be determined individually by a pediatrician.',
        nutrientDeliveries: [
          { label: 'Per 1 adult tablet', amount: '1000 mg Calcium Carb.' },
          { label: 'Vitamin K2-7 / D3', amount: '45 mcg / 250 IU' },
        ],
        administrationTips: [
          'Do not split or self-dose adult bone-density tablets for individuals under 18 without clinical review.',
        ],
        safetyNotes: [
          'Verify age-specific calcium and vitamin D intake targets with a qualified pediatrician.',
        ],
      };
    }

    const useSplitDose =
      isTargeted && (isOlderAdult || isPregnancy || isRecovery) && weightKg >= 45;
    const tablets = useSplitDose ? 2 : 1;

    return {
      status: useSplitDose ? 'enhanced' : 'standard',
      statusLabel: useSplitDose
        ? 'Divided therapeutic reference'
        : 'Standard daily reference',
      suggestedAmount: `${tablets} ${tablets === 1 ? 'tablet' : 'tablets'} / day`,
      servingDetail:
        tablets === 2
          ? '1 tablet after breakfast + 1 tablet after dinner (with clinician approval)'
          : '1 tablet once daily after a main meal',
      schedule: tablets === 2 ? 'Twice daily · After meals' : 'Once daily · After meal',
      dailyUnits: tablets,
      unitLabel: 'tablets',
      rationale:
        tablets === 2
          ? `For ${isPregnancy ? 'pregnancy/lactation' : isOlderAdult ? 'adults 55+ / post-menopausal bone support' : 'higher skeletal recovery demand'} at ${formatNumber(weightKg)} kg, physicians commonly consider split dosing so calcium absorption remains steady across meals.`
          : `For ${isOlderAdult ? 'bone maintenance in adults 55+' : isPregnancy ? 'routine maternal skeletal support' : 'daily adult bone maintenance'} at ${formatNumber(weightKg)} kg, one tablet after a meal provides balanced Calcium, Vitamin K2-7, Magnesium, Zinc, and Vitamin D3.`,
      nutrientDeliveries: [
        { label: 'Calcium Carbonate', amount: `${1000 * tablets} mg` },
        { label: 'Vitamin K2-7', amount: `${45 * tablets} mcg` },
        { label: 'Magnesium Oxide', amount: `${50 * tablets} mg` },
        { label: 'Zinc Sulphate', amount: `${formatNumber(7.5 * tablets)} mg` },
        { label: 'Vitamin D3', amount: `${250 * tablets} IU` },
      ],
      administrationTips: [
        'Take with a full glass of water right after food to enhance Calcium Carbonate and fat-soluble Vitamin K2-7/D3 absorption.',
        'Space at least 2 hours apart from oral iron (such as RED-XT™), levothyroxine, or certain antibiotics.',
      ],
      safetyNotes: [
        ...(tablets === 2
          ? [
              'Confirm twice-daily calcium dosing with your doctor, especially if you consume dairy-rich meals or other Vitamin D3 supplements.',
            ]
          : []),
        ...(weightKg < 48
          ? [
              'At lower body weight, confirm total elemental calcium tolerance with your healthcare provider.',
            ]
          : []),
        'Consult your prescribing physician before use if taking warfarin or other vitamin K antagonists.',
      ],
    };
  }

  if (product.slug === 'red-xt-tablets') {
    if (isMinor) {
      return {
        status: 'clinician-review',
        statusLabel: 'Pediatric consultation required',
        suggestedAmount: 'Consult a pediatrician',
        servingDetail: 'Adult therapeutic hematinic (100 mg Ferrous Ascorbate)',
        schedule: 'Only under medical supervision',
        dailyUnits: 0,
        unitLabel: 'tablets',
        rationale:
          'RED-XT™ contains 100 mg Ferrous Ascorbate, 1.5 mg Folic Acid, and 1000 IU Vitamin D3 per tablet. Iron dosing for children and adolescents must be weight-calculated by a physician.',
        nutrientDeliveries: [
          { label: 'Per 1 adult tablet', amount: '100 mg Ferrous Asc.' },
          { label: 'Folic Acid / Vit. D3', amount: '1.5 mg / 1000 IU' },
        ],
        administrationTips: [
          'Keep iron-containing tablets stored safely out of reach of children.',
        ],
        safetyNotes: [
          'Pediatric iron therapy requires blood count evaluation and age-appropriate dosage forms.',
        ],
      };
    }

    const lowWeightNote = weightKg < 48;

    return {
      status: isTargeted || isPregnancy ? 'enhanced' : 'standard',
      statusLabel: isPregnancy
        ? 'Maternal hematinic reference'
        : isTargeted
          ? 'Targeted iron-support reference'
          : 'Standard daily hematinic',
      suggestedAmount: '1 tablet / day',
      servingDetail: lowWeightNote
        ? '1 tablet once daily after a light meal (avoid exceeding 1 tablet without lab work)'
        : isTargeted
          ? '1 tablet once daily in the morning with water or citrus juice'
          : '1 tablet once daily in the morning or as directed by physician',
      schedule: 'Once daily · Morning',
      dailyUnits: 1,
      unitLabel: 'tablet',
      rationale: isPregnancy
        ? `At ${formatNumber(weightKg)} kg during pregnancy or lactation, one tablet daily supplies full adult Ferrous Ascorbate (100 mg), Folic Acid (1.5 mg), B12, B6, and 1000 IU Vitamin D3. Do not self-increase above 1 tablet/day without obstetric lab guidance.`
        : `One RED-XT™ tablet delivers a complete adult daily hematinic strength (100 mg Ferrous Ascorbate with 52% higher absorption vs. ferrous sulphate). Standard intake remains capped at 1 tablet/day unless a clinician advises otherwise based on hemoglobin and ferritin tests.`,
      nutrientDeliveries: [
        { label: 'Ferrous Ascorbate', amount: '100 mg' },
        { label: 'Folic Acid', amount: '1.5 mg' },
        { label: 'Vitamin B12', amount: '15 mcg' },
        { label: 'Vitamin B6', amount: '3 mg' },
        { label: 'Vitamin D3', amount: '1000 IU' },
      ],
      administrationTips: [
        'Avoid tea, coffee, milk, antacids, and calcium tablets (such as Bonebro™) within 2 hours of taking RED-XT™.',
        'If mild stomach upset occurs, take after a light, non-dairy breakfast.',
      ],
      safetyNotes: [
        ...(lowWeightNote
          ? [
              'Because your entered weight is below 48 kg, discuss alternate-day vs. daily dosing tolerance with your doctor.',
            ]
          : []),
        ...(isOlderAdult
          ? [
              'For adults 55+, iron supplementation should follow confirmed iron-deficiency lab results.',
            ]
          : []),
        'Do not exceed 1 tablet daily unless specifically instructed after blood work; account for the 1000 IU Vitamin D3 if combining supplements.',
      ],
    };
  }

  if (product.slug === 'cerebra-cb') {
    if (isMinor || isPregnancy) {
      return {
        status: 'clinician-review',
        statusLabel: isPregnancy
          ? 'Obstetric physician review advised'
          : 'Pediatric consultation required',
        suggestedAmount: 'Consult a specialist first',
        servingDetail: 'Adult neuro-nutritional tablet (90 mg Cerebroprotein)',
        schedule: 'Only as prescribed by a clinician',
        dailyUnits: 0,
        unitLabel: 'tablets',
        rationale: isPregnancy
          ? 'CEREBRA-CB™ contains Cerebroprotein (90 mg) alongside Omega-3 and micronutrients. During pregnancy or lactation, neurotrophic formulations should only be used if explicitly recommended by your obstetrician.'
          : 'CEREBRA-CB™ is formulated for adult cognitive and neuroprotective support. Individuals under 18 should consult a pediatric specialist before taking cerebroprotein supplements.',
        nutrientDeliveries: [
          { label: 'Per 1 adult tablet', amount: '90 mg Cerebroprotein' },
          { label: 'Omega-3 (30%) / Vit. E', amount: '150 mg / 7.5 mg' },
        ],
        administrationTips: [
          'Share your full supplement and prescription list with your physician before starting neuro-nutritional products.',
        ],
        safetyNotes: [
          'Avoid self-dosing neuroactive peptides during pregnancy, lactation, or under age 18.',
        ],
      };
    }

    const useEnhanced = isTargeted && (isRecovery || isOlderAdult) && weightKg >= 50;
    const tablets = useEnhanced ? 2 : 1;

    return {
      status: useEnhanced ? 'enhanced' : 'standard',
      statusLabel: useEnhanced
        ? 'Intensive neuro-support reference'
        : 'Standard cognitive reference',
      suggestedAmount: `${tablets} ${tablets === 1 ? 'tablet' : 'tablets'} / day`,
      servingDetail:
        tablets === 2
          ? '1 tablet after breakfast + 1 tablet after lunch (confirm with physician)'
          : '1 tablet once daily after breakfast or lunch',
      schedule:
        tablets === 2
          ? 'Twice daily · Morning & Midday'
          : 'Once daily · After meal',
      dailyUnits: tablets,
      unitLabel: 'tablets',
      rationale:
        tablets === 2
          ? `For targeted ${isRecovery ? 'neurological recovery' : 'senior cognitive support'} at ${formatNumber(weightKg)} kg, clinicians sometimes advise divided morning and midday dosing to sustain neuronal metabolism without disturbing evening sleep.`
          : `For daily focus, antioxidant defense, and cognitive wellness at ${formatNumber(weightKg)} kg, one tablet after a meal supplies 90 mg Cerebroprotein with Omega-3 fatty acids, Vitamin E, D3, and B12.`,
      nutrientDeliveries: [
        { label: 'Cerebroprotein', amount: `${90 * tablets} mg` },
        { label: 'Omega-3 Fatty Acid (30%)', amount: `${150 * tablets} mg` },
        { label: 'Vitamin E', amount: `${formatNumber(7.5 * tablets)} mg` },
        { label: 'Vitamin D3', amount: `${300 * tablets} IU` },
        { label: 'Vitamin B12', amount: `${formatNumber(1.2 * tablets)} mcg` },
      ],
      administrationTips: [
        'Take with a meal containing healthy dietary fats to improve absorption of Omega-3, Vitamin E, and Vitamin D3.',
        'Prefer morning or midday intake rather than late evening.',
      ],
      safetyNotes: [
        'Consult a physician prior to use if you have a history of seizure disorders, severe kidney impairment, or take blood thinners.',
        ...(tablets === 2
          ? ['Verify twice-daily Cerebroprotein intake with a neurologist or primary physician.']
          : []),
      ],
    };
  }

  // Protizen-HP™ Nutritional Powder (weight- & goal-responsive)
  if (isChild) {
    return {
      status: 'clinician-review',
      statusLabel: 'Pediatrician guidance advised',
      suggestedAmount: 'Consult a pediatrician',
      servingDetail: 'Adult & family high-protein nutritional powder',
      schedule: 'Age-tailored serving via clinician',
      dailyUnits: 0,
      unitLabel: 'servings',
      rationale:
        'For children under 12 years, daily protein and micronutrient powder quantities should be set by a pediatrician or pediatric dietitian based on growth charts and regular diet.',
      nutrientDeliveries: [
        { label: 'Per 30 g adult serving', amount: '4.5 g Protein · 30 mg DHA' },
        { label: 'Sugar / Trans Fats', amount: '0 g / 0 g' },
      ],
      administrationTips: [
        'Contains skimmed milk powder and whey protein (dairy allergens).',
      ],
      safetyNotes: [
        'Do not substitute balanced childhood meals with adult nutritional shakes without medical guidance.',
      ],
    };
  }

  const proteinFactor = isRecovery
    ? 1.2
    : isPregnancy
      ? 1.1
      : isOlderAdult
        ? 1.05
        : isTargeted
          ? 1.1
          : 0.85;
  const estDailyProteinG = Math.round(weightKg * proteinFactor);

  // Adolescent 12–17: half-serving reference (15 g)
  if (isMinor) {
    return {
      status: 'standard',
      statusLabel: 'Adolescent light serving reference',
      suggestedAmount: '15 g / day (½ serving)',
      servingDetail: '1 to 1.5 tablespoons mixed in 150–200 ml lukewarm milk or water',
      schedule: 'Once daily · Breakfast or post-activity',
      dailyUnits: 0.5,
      unitLabel: 'servings',
      rationale: `For ages 12–17 (${formatNumber(weightKg)} kg), a half-serving (15 g) of sugar-free Protizen-HP™ offers a gentle protein, DHA, calcium, and vitamin boost alongside regular meals.`,
      proteinTargetNote: `Estimated daily total diet protein reference: ~${estDailyProteinG} g/day (${proteinFactor} g/kg). Mixing 15 g powder in 200 ml milk provides ~8.8 g combined protein.`,
      nutrientDeliveries: [
        { label: 'Total Protein (powder)', amount: '2.3 g', note: 'Includes 300 mg Whey' },
        { label: 'DHA', amount: '15 mg' },
        { label: 'Calcium / Phosphorus', amount: '90 mg / 63.5 mg' },
        { label: 'Iron / Zinc', amount: '0.8 mg / 0.8 mg' },
        { label: 'Sugar / Trans Fats', amount: '0 g / 0 g' },
      ],
      administrationTips: [
        'Stir briskly in lukewarm milk or water until smooth; available in Vanilla and Chocolate flavors.',
      ],
      safetyNotes: [
        'Confirm adolescent nutritional supplementation with a pediatrician or dietitian. Contains dairy proteins.',
      ],
    };
  }

  const useTwoServings =
    isTargeted || isPregnancy || isRecovery || (isOlderAdult && weightKg >= 65) || weightKg >= 78;
  const servings = useTwoServings ? 2 : 1;
  const grams = servings * 30;
  const powderProtein = servings * 4.5;
  const withMilkProtein = Math.round((powderProtein + servings * 6.5) * 10) / 10;

  return {
    status: servings === 2 ? 'enhanced' : 'standard',
    statusLabel:
      servings === 2 ? 'Twice-daily nutrition reference' : 'Daily nutrition reference',
    suggestedAmount: `${grams} g / day (${servings} ${servings === 1 ? 'serving' : 'servings'})`,
    servingDetail:
      servings === 2
        ? '2–3 tablespoons (30 g) twice daily in lukewarm milk or water'
        : '2–3 tablespoons (30 g) once daily in lukewarm milk or water',
    schedule:
      servings === 2
        ? 'Twice daily · Morning & Evening'
        : 'Once daily · Morning or Post-Activity',
    dailyUnits: servings,
    unitLabel: 'servings',
    rationale:
      servings === 2
        ? `Based on ${formatNumber(weightKg)} kg body weight and ${isPregnancy ? 'pregnancy/lactation' : isRecovery ? 'recovery' : isOlderAdult ? 'active senior' : 'higher protein/energy'} needs, two 30 g servings match the brochure's upper daily guidance with zero added sugar.`
        : `At ${formatNumber(weightKg)} kg for everyday maintenance, one 30 g serving complements meals with whey + skimmed milk protein, DHA, 10 vitamins, and 11 minerals with 0 g sugar.`,
    proteinTargetNote: `Estimated total daily dietary protein reference: ~${estDailyProteinG} g/day (${proteinFactor} g/kg). ${grams} g Protizen-HP™ supplies ${formatNumber(powderProtein)} g protein from powder (~${formatNumber(withMilkProtein)} g when prepared with ${servings * 200} ml milk).`,
    nutrientDeliveries: [
      {
        label: 'Total Protein (powder)',
        amount: `${formatNumber(powderProtein)} g`,
        note: `Includes ${600 * servings} mg Whey Protein`,
      },
      { label: 'DHA', amount: `${30 * servings} mg` },
      { label: 'Calcium / Phosphorus', amount: `${180 * servings} mg / ${127 * servings} mg` },
      { label: 'Vitamin D3 / Vit. A', amount: `${60 * servings} IU / ${600 * servings} IU` },
      { label: 'Iron / Zinc', amount: `${formatNumber(1.5 * servings)} mg / ${formatNumber(1.5 * servings)} mg` },
      { label: 'Sugar / Trans Fats', amount: '0 g / 0 g' },
    ],
    administrationTips: [
      'Add 2–3 level tablespoons (approx. 30 g) to a glass of lukewarm milk or water and stir briskly before drinking.',
      'Close the container tightly after each scoop and store in a cool, dry place.',
    ],
    safetyNotes: [
      'Contains milk-derived ingredients (skimmed milk powder and whey protein); avoid in dairy/milk protein allergy.',
      'Individuals with kidney disease on protein-restricted diets must consult a nephrologist or dietitian first.',
    ],
  };
}
