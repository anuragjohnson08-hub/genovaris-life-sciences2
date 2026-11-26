export type DosageUnitKey =
  | 'tablet'
  | 'powder-serving'
  | 'g'
  | 'mg'
  | 'mcg'
  | 'iu';

export interface MeasurementTip {
  unitKey: DosageUnitKey;
  badge: string;
  title: string;
  howToMeasure: string;
  practicalEquivalent: string;
  precisionNote: string;
}

const UNIT_TIPS: Record<DosageUnitKey, MeasurementTip> = {
  tablet: {
    unitKey: 'tablet',
    badge: 'Pre-measured unit',
    title: 'Measuring oral tablets',
    howToMeasure:
      'Each tablet is factory-calibrated to its exact label strength. Swallow the intact tablet whole with a full glass (200–250 ml) of room-temperature water.',
    practicalEquivalent: '1 tablet = 1 complete pre-measured unit dose',
    precisionNote:
      'Do not crush, chew, or self-split non-scored tablets unless explicitly instructed by your prescribing physician or pharmacist.',
  },
  'powder-serving': {
    unitKey: 'powder-serving',
    badge: 'Scoop / Spoon measure',
    title: 'Measuring nutritional powder (30 g)',
    howToMeasure:
      'Use a clean, dry tablespoon or calibrated 30 g kitchen scoop. Fill loosely and level the top edge gently with a flat knife without packing the powder down.',
    practicalEquivalent: '1 serving (30 g) ≈ 2 to 3 level tablespoons in 200 ml lukewarm milk or water',
    precisionNote:
      'Avoid boiling liquids (which can clump whey protein and reduce heat-sensitive vitamins) and avoid wet spoons inside the tin.',
  },
  g: {
    unitKey: 'g',
    badge: 'Gram (g)',
    title: 'How grams (g) are measured',
    howToMeasure:
      'Grams measure macronutrient mass such as protein or total powder weight. A digital kitchen scale provides exact gram accuracy, while level tablespoons offer a reliable daily estimate.',
    practicalEquivalent: '1 g = 1,000 mg · 30 g powder ≈ 2–3 level tablespoons',
    precisionNote:
      'For Protizen-HP™, macronutrient grams reflect the dry powder alone before adding milk.',
  },
  mg: {
    unitKey: 'mg',
    badge: 'Milligram (mg)',
    title: 'How milligrams (mg) are measured',
    howToMeasure:
      'Milligrams measure active mineral and botanical weights (one-thousandth of a gram). In Genovaris tablets and powders, milligram strengths are pre-blended uniformly per unit dose.',
    practicalEquivalent: '1,000 mg = 1 g (e.g., 1 tablet of Bonebro™ = 1,000 mg CaCO₃)',
    precisionNote:
      'Always compare total daily milligrams across all supplements you take so you stay within clinician-advised upper limits.',
  },
  mcg: {
    unitKey: 'mcg',
    badge: 'Microgram (mcg / µg)',
    title: 'How micrograms (mcg) are measured',
    howToMeasure:
      'Micrograms measure high-potency trace nutrients like Vitamin K2-7, Vitamin B12, Selenium, and Chromium at one-millionth of a gram—too tiny for household spoons, so they rely on lab-verified tablet or scoop uniformity.',
    practicalEquivalent: '1,000 mcg = 1 mg (45 mcg K2-7 = 0.045 mg)',
    precisionNote:
      'Because mcg doses are highly concentrated, follow the exact tablet or scoop count on the container label.',
  },
  iu: {
    unitKey: 'iu',
    badge: 'International Unit (IU)',
    title: 'How International Units (IU) are measured',
    howToMeasure:
      'IU measures the biological activity of fat-soluble vitamins like Vitamin D3 and Vitamin A rather than raw physical weight, allowing accurate potency comparisons across formulations.',
    practicalEquivalent: 'For Vitamin D3: 40 IU = 1 mcg (1,000 IU = 25 mcg; 250 IU = 6.25 mcg)',
    precisionNote:
      'When combining multiple products containing Vitamin D3 (such as Bonebro™ and RED-XT™), sum the IU values together and review with your doctor.',
  },
};

export function getUnitMeasurementTip(unitKey: DosageUnitKey): MeasurementTip {
  return UNIT_TIPS[unitKey];
}

export function detectNutrientUnitKey(amountText: string): DosageUnitKey | null {
  const normalized = amountText.toLowerCase();
  if (/\biu\b/.test(normalized)) return 'iu';
  if (/\bmcg\b|µg/.test(normalized)) return 'mcg';
  if (/\bmg\b/.test(normalized)) return 'mg';
  if (/\d\s*g\b/.test(normalized)) return 'g';
  return null;
}

export function getPrimaryMeasurementTip(
  productSlug: string,
  dailyUnits: number
): MeasurementTip {
  if (productSlug === 'protizen-hp-powder') {
    if (dailyUnits <= 0) {
      return {
        ...UNIT_TIPS['powder-serving'],
        title: 'Pediatric powder measurement',
        howToMeasure:
          'For children under 12, use only the exact gram or teaspoon quantity recommended by a pediatrician or pediatric dietitian.',
        practicalEquivalent: '1 level teaspoon ≈ 5 g · 1 level tablespoon ≈ 10–15 g',
        precisionNote:
          'Always measure dry powder with a clean spoon before stirring into lukewarm milk or water.',
      };
    }
    if (dailyUnits < 1) {
      return {
        ...UNIT_TIPS['powder-serving'],
        title: 'Measuring a half serving (15 g)',
        howToMeasure:
          'Measure 1 to 1.5 level tablespoons of dry Protizen-HP™ powder into 150–200 ml of lukewarm milk or water and stir briskly until dissolved.',
        practicalEquivalent: '15 g (½ serving) ≈ 1–1.5 level tablespoons',
        precisionNote:
          'Level the tablespoon lightly instead of heaping so adolescent daily micronutrient intake stays consistent.',
      };
    }
    if (dailyUnits >= 2) {
      return {
        ...UNIT_TIPS['powder-serving'],
        title: 'Measuring two daily servings (60 g)',
        howToMeasure:
          'Prepare two separate 30 g glasses—one in the morning and one in the evening—using 2–3 level tablespoons per 200 ml of lukewarm milk or water.',
        practicalEquivalent: '60 g total = 2 × (2–3 level tablespoons)',
        precisionNote:
          'Splitting into two 30 g servings improves protein utilization and mixes smoothly without clumping.',
      };
    }
    return UNIT_TIPS['powder-serving'];
  }

  if (dailyUnits <= 0) {
    return {
      ...UNIT_TIPS.tablet,
      title: 'Why adult tablets require clinician dosing',
      howToMeasure:
        'Each Genovaris tablet is pre-compressed at adult therapeutic strength and should not be halved or crushed for pediatric or specialist-review cases.',
      practicalEquivalent: '1 adult tablet = fixed full-strength unit dose',
      precisionNote:
        'Ask a physician for an age- or pregnancy-appropriate dosage form and exact measured schedule.',
    };
  }

  if (dailyUnits >= 2) {
    return {
      ...UNIT_TIPS.tablet,
      title: 'Measuring divided tablet doses (2 / day)',
      howToMeasure:
        'Take 1 intact tablet at two separate meal times (such as breakfast and dinner/lunch) with a full glass of water each time rather than taking both at once.',
      practicalEquivalent: '2 tablets / day = 1 whole tablet × 2 separate meals',
      precisionNote:
        'Dividing doses supports steady absorption and gentler gastrointestinal tolerance.',
    };
  }

  return UNIT_TIPS.tablet;
}
