import type { ProductFormulation } from '../types/medicine';
import { resolvePublicAssetUrl } from '../utils/assetUrl';

export interface ChecklistItemDefinition {
  id: string;
  badge: string;
  title: string;
  description: string;
}

export const INFORMED_CHOICE_CHECKLIST: ChecklistItemDefinition[] = [
  {
    id: 'drug-license-active',
    badge: 'Drug Control',
    title: 'Active State Drug License (Form 20/21 or 20B/21B) held for resale or dispensing.',
    description:
      'We hold a valid, non-expired retail or wholesale Drug License issued by the State Drug Control Authority authorizing pharmaceutical stock purchase, storage, and trade.',
  },
  {
    id: 'gst-authorized-entity',
    badge: 'B2B Trade Only',
    title: 'Registered Indian GST business entity authorized for B2B pharmaceutical procurement.',
    description:
      'Orders are placed strictly on behalf of a licensed pharmacy, hospital, clinic, or stockist firm with an active GSTIN—not for unauthorized consumer resale.',
  },
  {
    id: 'fssai-nutraceutical-permit',
    badge: 'FSSAI Permit',
    title: 'Valid FSSAI registration/license for nutraceutical & clinical nutrition inventory.',
    description:
      'Our establishment maintains current FSSAI compliance required to stock, store, and distribute dietary and protein formulations such as Protizen-HP™.',
  },
  {
    id: 'gdp-storage-traceability',
    badge: 'GDP & Audit',
    title: 'Good Distribution Practice (GDP) storage, batch traceability & anti-diversion compliance.',
    description:
      'We maintain temperature-safe (<25°C dry bay) storage, batch-to-invoice billing records, and agree not to divert stock to unlicensed sellers or unapproved online marketplaces.',
  },
];

export const GENOVARIS_PRODUCTS: ProductFormulation[] = [
  {
    id: 1,
    slug: 'bonebro-tablets',
    code: 'GL-01',
    name: 'Bonebro™',
    tagline: 'Strengthening Bones, Nourishing Life · Balanced Nutrition, Stronger Future',
    subtitle: 'Comprehensive bone strength, density & remineralization tablets',
    category: 'bone-skeletal',
    categoryLabel: 'Bone & Skeletal',
    dosageForm: 'Oral Tablets',
    packDetail: 'Calcium Carbonate 1000 mg + K2-7 + Zinc + Magnesium + D3',
    icon: 'bone',
    medallionBg: '#E3ECE8',
    brochureImage: resolvePublicAssetUrl('assets/aistudio/IMG-20260924-WA0006_f109ee7a.jpg'),
    cardImage: resolvePublicAssetUrl('assets/cards/bonebro-card.jpg'),
    compositionLine:
      'Calcium Carbonate 1000 mg + Vit. K2-7 45 mcg + Zinc Sulphate 7.5 mg + Magnesium Oxide 50 mg + Vit. D3 250 IU',
    summary:
      'A synergistic bone-health formulation combining high-strength Calcium Carbonate with Vitamin K2-7, Magnesium, Zinc, and Vitamin D3 to support bone mineral density, calcium utilization, and skeletal remineralization.',
    quickPoints: [
      {
        label: 'What it helps',
        text: 'Stronger bones, daily calcium support & fracture prevention',
      },
      {
        label: 'Key ingredients',
        text: 'Calcium + Vitamin D3, Vitamin K2-7, Magnesium & Zinc',
      },
      {
        label: 'Common customers',
        text: 'Older adults, post-menopausal women & pregnancy care',
      },
    ],
    clinicalMechanism:
      'Vitamin D3 promotes intestinal and renal calcium absorption while Vitamin K2-7 directs calcium into skeletal tissue and away from arterial walls. Magnesium Oxide and Zinc Sulphate complement mineralization and connective tissue repair.',
    keyHighlights: [
      {
        title: 'Supports Bone Strength & Density',
        detail:
          'Calcium, Magnesium, and Vitamin K2-7 work in synergy for optimal bone mineralization and fracture risk reduction in osteoporosis care.',
      },
      {
        title: 'Enhances Calcium Utilization',
        detail:
          'Vitamin K2-7 helps direct calcium into bones and away from arteries, supporting bone mineral density (BMD).',
      },
      {
        title: 'Enhances Growth & Tissue Repair',
        detail:
          'Zinc Sulphate supports normal skeletal growth, collagen turnover, and connective tissue repair.',
      },
      {
        title: 'Maintains Absorption of Calcium',
        detail:
          'Vitamin D3 aids effective calcium absorption from the GI tract and kidney for steady bone remineralization.',
      },
    ],
    indications: [
      'Senile Osteoporosis',
      'Post-Menopausal Osteoporosis',
      'Drug-Induced Osteoporosis',
      'Pregnancy & Lactation',
    ],
    activeIngredients: [
      {
        name: 'Calcium Carbonate',
        amount: '1000 mg',
        standardization: 'High-elemental bone mineral',
        role: 'Reduces fracture risk; essential osteoporosis therapy',
        nutrientGroup: 'Calcium',
      },
      {
        name: 'Magnesium Oxide',
        amount: '50 mg',
        standardization: 'Mineral matrix cofactor',
        role: 'Bone mineralization & connective tissue synthesis',
        nutrientGroup: 'Magnesium',
      },
      {
        name: 'Vitamin K2-7',
        amount: '45 mcg',
        standardization: 'Bioactive menaquinone-7',
        role: 'Directs calcium to bones & helps maintain BMD',
        nutrientGroup: 'Vitamin K',
      },
      {
        name: 'Zinc Sulphate',
        amount: '7.5 mg',
        standardization: 'Essential trace mineral',
        role: 'Normal growth, tissue repair & bone matrix development',
        nutrientGroup: 'Zinc',
      },
      {
        name: 'Vitamin D3',
        amount: '250 IU',
        standardization: 'Cholecalciferol',
        role: 'GI & renal calcium absorption and bone remineralization',
        nutrientGroup: 'Vitamin D',
      },
    ],
    directions:
      'Take as directed by your physician, typically after a meal with a full glass of water to optimize calcium absorption.',
    timingWindow: 'With Meals',
    cautions: [
      'Consult your prescribing physician before use if taking vitamin K antagonist anticoagulants (such as warfarin).',
      'Separate intake by at least 2 hours from oral iron tablets, thyroid hormones (levothyroxine), or tetracycline/fluoroquinolone antibiotics.',
      'Check total daily Vitamin D3 and Calcium intake if combining with other supplements.',
    ],
    contraindications:
      'Contraindicated in hypercalcemia, hypercalciuria, or severe renal impairment unless directed by a specialist.',
    faqs: [
      {
        id: 'bonebro-dosage-daily',
        topic: 'dosage',
        question: 'How many Bonebro™ tablets should be taken daily, and with or without food?',
        answer:
          'Standard adult use is 1 tablet once daily right after a main meal with a full glass of water.',
        points: [
          {
            icon: 'dose',
            lead: 'Standard adult dose',
            text: '1 tablet once daily with a full glass of water.',
          },
          {
            icon: 'clock',
            lead: 'Take after a meal',
            text: 'Stomach acid during meals boosts Calcium Carbonate absorption and stays gentle on digestion.',
          },
          {
            icon: 'alert',
            lead: 'Higher intake',
            text: 'Only take 2 divided tablets daily when specifically prescribed by a physician.',
          },
        ],
      },
      {
        id: 'bonebro-dosage-missed',
        topic: 'dosage',
        question: 'What should I do if I miss a daily Bonebro™ dose?',
        answer:
          'Take the missed tablet after your next meal the same day, or skip it if close to the next dose.',
        points: [
          {
            icon: 'clock',
            lead: 'Same day',
            text: 'Take the missed tablet after your next main meal.',
          },
          {
            icon: 'check',
            lead: 'Next day close by',
            text: 'Skip the missed dose and return to your normal routine.',
          },
          {
            icon: 'alert',
            lead: 'Never double up',
            text: 'Avoid taking two tablets together to make up for a missed day.',
          },
        ],
      },
      {
        id: 'bonebro-sourcing-matrix',
        topic: 'sourcing',
        question:
          'How are the Calcium Carbonate, Vitamin K2-7, and trace minerals sourced and standardized?',
        answer:
          'Bonebro™ pairs pharmaceutical-grade Calcium Carbonate with bioactive K2-7, Magnesium, Zinc, and Vitamin D3.',
        points: [
          {
            icon: 'leaf',
            lead: 'Core bone mineral',
            text: 'Pharmaceutical-grade Calcium Carbonate (1000 mg) per tablet.',
          },
          {
            icon: 'check',
            lead: 'Bioactive cofactors',
            text: 'Vitamin K2-7 (45 mcg), Magnesium Oxide (50 mg), Zinc Sulphate (7.5 mg), and Vitamin D3 (250 IU).',
          },
          {
            icon: 'shield',
            lead: 'Quality control',
            text: 'Batch-standardized to label potency under Genovaris Lifesciences specifications.',
          },
        ],
      },
      {
        id: 'bonebro-sourcing-synergy',
        topic: 'sourcing',
        question:
          'Why is Vitamin K2-7 included alongside Calcium Carbonate and Vitamin D3?',
        answer:
          'Vitamin D3 aids calcium uptake while Vitamin K2-7 helps guide calcium into bones.',
        points: [
          {
            icon: 'drop',
            lead: 'Vitamin D3 (uptake)',
            text: 'Helps the gut and kidneys absorb dietary and tablet calcium effectively.',
          },
          {
            icon: 'check',
            lead: 'Vitamin K2-7 (direction)',
            text: 'Activates bone-matrix proteins that guide calcium into bones and away from arteries.',
          },
          {
            icon: 'leaf',
            lead: 'Magnesium & Zinc',
            text: 'Support bone mineralization and connective tissue repair.',
          },
        ],
      },
      {
        id: 'bonebro-safety-separation',
        topic: 'safety',
        question:
          'Can Bonebro™ be taken at the same time as oral iron (such as RED-XT™) or thyroid medication?',
        answer:
          'Separate Bonebro™ by at least 2 hours from iron tablets, thyroid medicine, and certain antibiotics.',
        points: [
          {
            icon: 'clock',
            lead: 'Keep a 2-hour gap',
            text: 'High-strength calcium competes with iron and binds select prescriptions in the gut.',
          },
          {
            icon: 'alert',
            lead: 'Medicines to space out',
            text: 'Oral iron (like RED-XT™), levothyroxine, and tetracycline or fluoroquinolone antibiotics.',
          },
        ],
      },
      {
        id: 'bonebro-safety-anticoagulants',
        topic: 'safety',
        question:
          'Is Bonebro™ safe to use if I take blood thinners like warfarin?',
        answer:
          'Consult your doctor first because each tablet contains 45 mcg of Vitamin K2-7.',
        points: [
          {
            icon: 'alert',
            lead: 'Vitamin K2-7 interaction',
            text: 'Each tablet supplies 45 mcg of Vitamin K2-7, which can affect warfarin INR balance.',
          },
          {
            icon: 'shield',
            lead: 'Physician review',
            text: 'Check with your prescribing doctor before starting or changing your daily dose.',
          },
        ],
      },
    ],
    featured: true,
  },
  {
    id: 2,
    slug: 'red-xt-tablets',
    code: 'GL-02',
    name: 'RED-XT™',
    tagline: 'Nourishing Blood, Enriching Life · Safe, Effective & Essential Because Every Drop Counts',
    subtitle: 'High-absorption hematinic, maternal & hemoglobin support tablets',
    category: 'hematinic-maternal',
    categoryLabel: 'Hematinic & Maternal',
    dosageForm: 'Oral Tablets',
    packDetail: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg + B12 + B6 + D3 1000 IU',
    icon: 'droplet',
    medallionBg: '#F2E4E7',
    brochureImage: resolvePublicAssetUrl('assets/aistudio/IMG-20260924-WA0005_45f9ef0d.jpg'),
    cardImage: resolvePublicAssetUrl('assets/cards/red-xt-card.jpg'),
    compositionLine:
      'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg + Cyanocobalamin 15 mcg + Pyridoxine HCl 3 mg + Vit. D3 1000 IU',
    summary:
      'An advanced hematinic tablet featuring Ferrous Ascorbate (offering superior absorption compared to ferrous sulphate) paired with Folic Acid, Vitamin B12, Vitamin B6, and Vitamin D3 1000 IU for healthy red blood cell formation and maternal care.',
    quickPoints: [
      {
        label: 'What it helps',
        text: 'Low iron (anaemia), tiredness & healthy blood levels',
      },
      {
        label: 'Key ingredients',
        text: 'High-absorption Iron + Folic Acid, B12, B6 & Vitamin D3',
      },
      {
        label: 'Common customers',
        text: 'Pregnancy/maternal care, general weakness & iron support',
      },
    ],
    clinicalMechanism:
      'Ferrous Ascorbate maintains iron in its soluble ferrous state for up to 52% higher bioavailability compared to ferrous sulphate, while Folic Acid, Cyanocobalamin, and Pyridoxine HCl act as essential cofactors in erythropoiesis and hemoglobin synthesis.',
    keyHighlights: [
      {
        title: 'Superior Iron Absorption (Ferrous Ascorbate)',
        detail:
          'Possesses superior absorption (52%) compared to ferrous sulphate, facilitating oxygen transport, utilization, and cellular proliferation.',
      },
      {
        title: 'Maternal & RBC Support (Folic Acid 1.5 mg)',
        detail:
          'Produces healthy red blood cells, helps prevent megaloblastic anaemia, and supports fetal brain and spinal cord development during pregnancy.',
      },
      {
        title: 'Neurological & Hemoglobin Cofactors (B12 & B6)',
        detail:
          'Cyanocobalamin (15 mcg) and Pyridoxine HCl (3 mg) support nerve function, protein metabolism, and hemoglobin synthesis.',
      },
      {
        title: 'Skeletal Mineral Balance (Vitamin D3 1000 IU)',
        detail:
          'Regulates healthy blood levels of calcium and phosphorus while supporting bone mineralization.',
      },
    ],
    indications: [
      'Iron Deficiency Anaemia',
      'Pregnancy & Lactation',
      'General Weakness',
      'Osteoporosis Support',
    ],
    activeIngredients: [
      {
        name: 'Ferrous Ascorbate',
        amount: '100 mg',
        standardization: 'High-bioavailability iron complex',
        role: 'Superior absorption (52% vs ferrous sulphate); oxygen transport & cell growth',
        nutrientGroup: 'Iron',
      },
      {
        name: 'Folic Acid',
        amount: '1.5 mg',
        standardization: 'Pharmaceutical grade folate',
        role: 'Healthy RBC production & prenatal brain/spinal cord development',
        nutrientGroup: 'Folate',
      },
      {
        name: 'Cyanocobalamin (Vit. B12)',
        amount: '15 mcg',
        standardization: 'Neuro-hematinic cofactor',
        role: 'Supports brain, nerve function & healthy RBC maturation',
        nutrientGroup: 'Vitamin B12',
      },
      {
        name: 'Pyridoxine HCl (Vit. B6)',
        amount: '3 mg',
        standardization: 'Heme synthesis cofactor',
        role: 'Protein metabolism, neurological health & hemoglobin synthesis',
        nutrientGroup: 'Vitamin B6',
      },
      {
        name: 'Vitamin D3',
        amount: '1000 IU',
        standardization: 'Cholecalciferol',
        role: 'Maintains blood calcium & phosphorus levels; supports bone mineralization',
        nutrientGroup: 'Vitamin D',
      },
    ],
    directions:
      'Take one tablet daily or as directed by your healthcare professional. Avoid taking simultaneously with tea, coffee, or high-dose calcium tablets for best iron absorption.',
    timingWindow: 'Morning',
    cautions: [
      'Keep out of reach of children; accidental overdose of iron-containing products requires immediate medical attention.',
      'Separate from calcium-rich supplements (such as Bonebro™) and antacids by at least 2 hours to maximize iron absorption.',
      'Mild darkening of stools is a harmless, expected effect of oral iron supplementation.',
    ],
    contraindications:
      'Contraindicated in hemochromatosis, hemosiderosis, or non-iron-deficiency hemolytic anaemias.',
    faqs: [
      {
        id: 'redxt-dosage-timing',
        topic: 'dosage',
        question: 'What is the recommended daily dose and best time to take RED-XT™?',
        answer:
          'Standard adult intake is 1 tablet once daily in the morning with water or a light non-dairy snack.',
        points: [
          {
            icon: 'dose',
            lead: 'Daily dose',
            text: '1 tablet once daily for adults.',
          },
          {
            icon: 'clock',
            lead: 'Best timing',
            text: 'Morning with plain water, or with a light non-dairy snack if your stomach is sensitive.',
          },
          {
            icon: 'alert',
            lead: 'Lab-guided limit',
            text: 'Do not exceed 1 tablet daily unless advised by a doctor after hemoglobin and ferritin tests.',
          },
        ],
      },
      {
        id: 'redxt-dosage-tea-calcium',
        topic: 'dosage',
        question: 'How long should I wait between RED-XT™ and tea, coffee, milk, or calcium tablets?',
        answer:
          'Leave at least 2 hours between RED-XT™ and tea, coffee, dairy, antacids, or calcium supplements.',
        points: [
          {
            icon: 'clock',
            lead: 'Minimum 2-hour gap',
            text: 'Space apart from tea, coffee, milk, antacids, and calcium tablets (such as Bonebro™).',
          },
          {
            icon: 'drop',
            lead: 'Why spacing matters',
            text: 'Tannins and calcium bind oral iron in the stomach and sharply lower iron uptake.',
          },
        ],
      },
      {
        id: 'redxt-sourcing-iron',
        topic: 'sourcing',
        question:
          'How is Ferrous Ascorbate sourced and why is it used instead of ferrous sulphate?',
        answer:
          'Ferrous Ascorbate keeps iron soluble in the gut for up to 52% higher absorption than ferrous sulphate.',
        points: [
          {
            icon: 'drop',
            lead: 'Higher absorption (52%)',
            text: 'Standardized iron–ascorbate complex stays soluble in the GI tract compared to ferrous sulphate.',
          },
          {
            icon: 'check',
            lead: 'Gentler tolerability',
            text: 'Formulated for steady daily compliance in maternal and anaemia care.',
          },
        ],
      },
      {
        id: 'redxt-sourcing-cofactors',
        topic: 'sourcing',
        question:
          'Why does RED-XT™ pair iron with Folic Acid (1.5 mg), B12, B6, and Vitamin D3 (1000 IU)?',
        answer:
          'Folic Acid, B12, and B6 support red blood cell formation while Vitamin D3 supports bone mineral balance.',
        points: [
          {
            icon: 'leaf',
            lead: 'RBC & prenatal cofactors',
            text: 'Folic Acid (1.5 mg), Vitamin B12 (15 mcg), and Vitamin B6 (3 mg) assist hemoglobin synthesis.',
          },
          {
            icon: 'shield',
            lead: 'Skeletal support',
            text: 'Vitamin D3 (1000 IU) helps regulate blood calcium and phosphorus balance.',
          },
        ],
      },
      {
        id: 'redxt-safety-side-effects',
        topic: 'safety',
        question: 'Is mild darkening of stools normal when taking RED-XT™?',
        answer:
          'Yes, mild darkening of stools is a harmless and expected effect of oral iron.',
        points: [
          {
            icon: 'check',
            lead: 'Normal & harmless',
            text: 'Mild stool darkening simply reflects unabsorbed oral iron passing naturally.',
          },
          {
            icon: 'alert',
            lead: 'When to stop & call a doctor',
            text: 'Severe stomach pain, persistent nausea, or any sign of allergic reaction.',
          },
        ],
      },
      {
        id: 'redxt-safety-storage',
        topic: 'safety',
        question: 'How should RED-XT™ be stored safely around children?',
        answer:
          'Keep intact blister strips locked in a cool, dry place well out of reach of children.',
        points: [
          {
            icon: 'shield',
            lead: 'Child-safe storage',
            text: 'Store locked and out of sight — accidental iron ingestion in children needs urgent medical care.',
          },
          {
            icon: 'check',
            lead: 'Keep in blister strip',
            text: 'Leave tablets inside the moisture-barrier pack in a cool, dry spot away from sunlight.',
          },
        ],
      },
    ],
    featured: true,
  },
  {
    id: 3,
    slug: 'cerebra-cb',
    code: 'GL-03',
    name: 'CEREBRA-CB™',
    tagline: 'Advanced Daily Nutrition for Energy, Immunity, Focus & Longevity',
    subtitle: 'Neuroprotective cognitive, memory & daily cellular vitality formulation',
    category: 'neuro-cognitive',
    categoryLabel: 'Neuro & Cognitive',
    dosageForm: 'Oral Neuro-Nutritional Tablets',
    packDetail: 'Cerebroprotein 90 mg + Omega-3 (30%) 150 mg + Vit. E + D3 + B12',
    icon: 'brain',
    medallionBg: '#E3ECF2',
    brochureImage: resolvePublicAssetUrl('assets/aistudio/IMG-20260924-WA0007_fb97e132.jpg'),
    cardImage: resolvePublicAssetUrl('assets/cards/cerebra-cb-card.jpg'),
    compositionLine:
      'Cerebroprotein 90 mg + Omega-3 Fatty Acid (30%) 150 mg + Vit. E 7.5 mg + Vit. D3 300 IU + Vit. B12 1.2 mcg',
    summary:
      'A specialized neuro-nutritional formulation combining Cerebroprotein (90 mg) with Omega-3 Fatty Acids, Vitamin E, Vitamin D3, and Vitamin B12 to support neuronal metabolism, memory, vigilance, and neuroprotection.',
    quickPoints: [
      {
        label: 'What it helps',
        text: 'Memory, focus, brain care & everyday mental energy',
      },
      {
        label: 'Key ingredients',
        text: 'Cerebroprotein + Omega-3, Vitamin E, D3 & B12',
      },
      {
        label: 'Common customers',
        text: 'Adults seeking focus, nerve support & recovery care',
      },
    ],
    clinicalMechanism:
      'Cerebroprotein acts on the central nervous system to support neuronal resilience, acetylcholine signaling, and learning pathways, complemented by Omega-3 fatty acids and Vitamin E antioxidant protection.',
    keyHighlights: [
      {
        title: 'Targeted Neuronal Protection (Cerebroprotein 90 mg)',
        detail:
          'Acts on the central nervous system to protect neurons, regulate neuronal metabolism, and support memory, attention, and vigilance.',
      },
      {
        title: 'Cognitive & Cardiovascular Lipids (Omega-3 150 mg)',
        detail:
          'Promotes heart health, supports balanced inflammatory pathways, and nourishes brain and eye function.',
      },
      {
        title: 'Antioxidant Cellular Defense (Vitamin E 7.5 mg)',
        detail:
          'Protects cells from oxidative stress caused by free radicals while supporting immune, skin, eye, and vascular health.',
      },
      {
        title: 'Essential Neuro-Metabolic Vitamins (D3 & B12)',
        detail:
          'Vitamin D3 (300 IU) maintains skeletal strength while Vitamin B12 (1.2 mcg) supports central nervous system function and DNA synthesis.',
      },
    ],
    indications: [
      'Cognitive Support',
      'Neuroprotective Effects',
      'Mood Enhancement',
      'Daily Nutritional Support',
    ],
    activeIngredients: [
      {
        name: 'Cerebroprotein',
        amount: '90 mg',
        standardization: 'Neurotrophic peptide complex',
        role: 'Protects neurons; supports acetylcholine, learning, memory & vigilance',
        nutrientGroup: 'Neurotrophic Peptides',
      },
      {
        name: 'Omega-3 Fatty Acid (30%)',
        amount: '150 mg',
        standardization: '30% standardized marine/omega lipids',
        role: 'Supports cognitive brain function, heart health & eye wellness',
        nutrientGroup: 'Omega-3 Fatty Acids',
      },
      {
        name: 'Vitamin E',
        amount: '7.5 mg',
        standardization: 'Antioxidant tocopherol',
        role: 'Protects cells from oxidative stress & supports immune and vascular health',
        nutrientGroup: 'Vitamin E',
      },
      {
        name: 'Vitamin D3',
        amount: '300 IU',
        standardization: 'Cholecalciferol',
        role: 'Prevents vitamin D deficiency and supports bone health',
        nutrientGroup: 'Vitamin D',
      },
      {
        name: 'Vitamin B12',
        amount: '1.2 mcg',
        standardization: 'Essential cobalamin',
        role: 'Supports RBC production, DNA synthesis & central nervous system function',
        nutrientGroup: 'Vitamin B12',
      },
    ],
    directions:
      'Take one tablet daily after food with water, or as advised by your healthcare professional.',
    timingWindow: 'With Meals',
    cautions: [
      'Consult a physician prior to use if you have a history of seizure disorders, severe renal impairment, or are taking anticoagulant therapy.',
      'Not intended to diagnose, treat, cure, or prevent any medical disease without clinician supervision.',
    ],
    contraindications:
      'Contraindicated in known hypersensitivity to cerebroprotein hydrolysates or any listed excipients.',
    faqs: [
      {
        id: 'cerebra-dosage-timing',
        topic: 'dosage',
        question: 'How and when is CEREBRA-CB™ best taken each day?',
        answer:
          'Take 1 intact tablet daily with water right after breakfast or lunch.',
        points: [
          {
            icon: 'dose',
            lead: 'Standard adult dose',
            text: '1 intact tablet daily with a full glass of water.',
          },
          {
            icon: 'clock',
            lead: 'Morning or midday meal',
            text: 'Food aids fat-soluble Omega-3, Vitamin E, and D3 uptake while avoiding late-evening alertness.',
          },
        ],
      },
      {
        id: 'cerebra-dosage-crushing',
        topic: 'dosage',
        question: 'Can CEREBRA-CB™ tablets be split, crushed, or taken twice daily?',
        answer:
          'Swallow tablets whole with water; only use twice-daily dosing when prescribed by a doctor.',
        points: [
          {
            icon: 'check',
            lead: 'Swallow whole',
            text: 'Do not crush or chew tablets unless a pharmacist specifically instructs you to.',
          },
          {
            icon: 'alert',
            lead: 'Twice-daily dosing',
            text: 'Higher morning-and-midday schedules for neuro-recovery require a physician’s prescription.',
          },
        ],
      },
      {
        id: 'cerebra-sourcing-peptide',
        topic: 'sourcing',
        question:
          'What is Cerebroprotein (90 mg) in CEREBRA-CB™ and what is its clinical role?',
        answer:
          'Cerebroprotein is a standardized neurotrophic peptide complex supporting neuronal metabolism, memory, and vigilance.',
        points: [
          {
            icon: 'leaf',
            lead: 'Standardized peptide',
            text: '90 mg neurotrophic peptide complex formulated for central nervous system support.',
          },
          {
            icon: 'check',
            lead: 'Cognitive pathways',
            text: 'Supports neuronal protection, acetylcholine activity, attention, learning, and memory.',
          },
        ],
      },
      {
        id: 'cerebra-sourcing-omega',
        topic: 'sourcing',
        question:
          'What does "Omega-3 Fatty Acid (30%) 150 mg" mean on the composition line?',
        answer:
          'Each tablet delivers 150 mg of Omega-3 lipids standardized to 30% active omega concentration.',
        points: [
          {
            icon: 'drop',
            lead: 'Standardized strength',
            text: '150 mg Omega-3 fatty acids per tablet standardized to 30% active omega lipids.',
          },
          {
            icon: 'check',
            lead: 'Daily benefits',
            text: 'Supports brain function, cardiovascular health, and eye wellness consistently.',
          },
        ],
      },
      {
        id: 'cerebra-safety-special-groups',
        topic: 'safety',
        question:
          'Is CEREBRA-CB™ suitable during pregnancy, lactation, or for individuals under 18?',
        answer:
          'CEREBRA-CB™ is intended for adult use; pregnant, nursing, or under-18 individuals need specialist guidance first.',
        points: [
          {
            icon: 'shield',
            lead: 'Adult formulation',
            text: 'Designed specifically for adult neuro-nutritional care.',
          },
          {
            icon: 'alert',
            lead: 'Specialist review required',
            text: 'Pregnant or breastfeeding individuals and anyone under 18 must consult a doctor before use.',
          },
        ],
      },
      {
        id: 'cerebra-safety-cautions',
        topic: 'safety',
        question:
          'What medical conditions or prescriptions require physician review before use?',
        answer:
          'Speak with your doctor first if you have seizure history, severe kidney disease, peptide allergy, or take blood thinners.',
        points: [
          {
            icon: 'alert',
            lead: 'Conditions to review',
            text: 'History of seizure disorders, severe renal impairment, or hypersensitivity to cerebroprotein.',
          },
          {
            icon: 'shield',
            lead: 'Medication check',
            text: 'Review with your physician if taking anticoagulant or antiplatelet therapy.',
          },
        ],
      },
    ],
    featured: true,
  },
  {
    id: 4,
    slug: 'protizen-hp-powder',
    code: 'GL-04',
    name: 'Protizen-HP™',
    tagline: 'Advanced Nutrition, Superior Performance · Nutrition that Works Hard to Build & Nourish Body',
    subtitle: 'High-protein whey & skimmed milk powder with DHA, vitamins & minerals',
    category: 'clinical-nutrition',
    categoryLabel: 'High-Protein Nutrition',
    dosageForm: 'Nutritional Powder (Vanilla & Chocolate)',
    packDetail: 'Sugar Free · Trans Fats Free · Gluten Free · With Whey Protein & DHA',
    icon: 'nutrition',
    medallionBg: '#EFE8E2',
    brochureImage: resolvePublicAssetUrl('assets/aistudio/IMG-20260924-WA0004_386980f8.jpg'),
    cardImage: resolvePublicAssetUrl('assets/cards/protizen-hp-card.jpg'),
    compositionLine:
      'Whey Protein + Skimmed Milk Protein + DHA + 10 Essential Vitamins + 11 Essential Minerals (Sugar Free · Gluten Free)',
    summary:
      'A balanced, sugar-free, trans-fat-free, and gluten-free nutritional protein powder formulated with high-quality Whey Protein, Skimmed Milk Protein, DHA, and 21 vitamins and minerals to support muscle repair, maternal & family nutrition, immunity, and daily recovery.',
    quickPoints: [
      {
        label: 'What it helps',
        text: 'Daily protein, strength, immunity & faster recovery',
      },
      {
        label: 'Key ingredients',
        text: 'Whey & Milk Protein + DHA + 21 Vitamins & Minerals',
      },
      {
        label: 'Store highlights',
        text: 'Sugar Free, Gluten Free · Vanilla & Chocolate flavours',
      },
    ],
    clinicalMechanism:
      'Provides complete essential amino acids from skimmed milk and whey protein alongside DHA for cognitive wellness and bioavailable Calcium, Phosphorus, Iron, Zinc, and B-complex vitamins for energy metabolism and skeletal maintenance.',
    keyHighlights: [
      {
        title: 'Supports Muscle Health',
        detail:
          'High-quality whey and skimmed milk protein helps support muscle repair, growth, and daily maintenance.',
      },
      {
        title: 'Brain & Cognitive Support',
        detail:
          'Enriched with DHA (100 mg per 100 g) and B-vitamins to contribute to normal brain function, memory, and focus.',
      },
      {
        title: 'Strengthens Immunity & Bone Health',
        detail:
          'Protein paired with Vitamins A, C, D3, E, Zinc, Selenium, Calcium (600 mg/100 g), and Phosphorus (425 mg/100 g) supports immune and skeletal wellness.',
      },
      {
        title: 'Energy & Daily Recovery — Zero Sugar',
        detail:
          'Formulated with 0.00 g Sugar, 0.00 g Trans Fats, and Gluten-Free ingredients in smooth Vanilla and Chocolate flavors.',
      },
    ],
    indications: [
      'Muscle Health',
      'Brain & Cognitive Support',
      'Immunity',
      'Bone Health',
      'Energy & Recovery',
    ],
    dietaryFlags: ['Sugar Free', 'Trans Fats Free', 'Gluten Free', 'Vanilla & Chocolate'],
    activeIngredients: [
      {
        name: 'Protein (Skimmed Milk & Whey Protein)',
        amount: '15 g / 100 g (4.5 g / 30 g)',
        standardization: 'Includes Whey Protein 2000 mg/100 g (600 mg/30 g)',
        role: 'Muscle repair, lean mass maintenance & recovery',
        nutrientGroup: 'Protein',
      },
      {
        name: 'DHA (Docosahexaenoic Acid)',
        amount: '100 mg / 100 g (30 mg / 30 g)',
        standardization: 'Cognitive omega-3 lipid',
        role: 'Normal brain development, memory & visual wellness',
        nutrientGroup: 'Omega-3 Fatty Acids',
      },
      {
        name: 'Calcium & Phosphorus',
        amount: '600 mg & 425 mg / 100 g',
        standardization: '180 mg & 127 mg per 30 g serving',
        role: 'Bone density and overall skeletal support',
        nutrientGroup: 'Calcium',
      },
      {
        name: 'Essential Vitamin Matrix (A, D3, B1, B2, B6, C, E, Folic Acid)',
        amount: 'Vit. A 2000 IU, D3 200 IU, Folic Acid 1 mg / 100 g',
        standardization: 'Overages added to compensate loss on storage',
        role: 'Energy metabolism, red blood cell & immune defense',
        nutrientGroup: 'Vitamin D',
      },
      {
        name: 'Essential Mineral Matrix (Iron, Zinc, Selenium, Chromium)',
        amount: 'Iron 5 mg, Zinc 5 mg, Selenium 60 mcg / 100 g',
        standardization: 'Includes Copper, Manganese, Potassium & Iodine',
        role: 'Oxygen transport, antioxidant enzymes & metabolic balance',
        nutrientGroup: 'Iron',
      },
    ],
    nutritionalFacts: [
      { nutrient: 'Whey Protein', per100g: '2000 mg', per30g: '600 mg' },
      { nutrient: 'Total Protein', per100g: '15 g', per30g: '4.5 g' },
      { nutrient: 'Carbohydrates', per100g: '45 g', per30g: '21 g' },
      { nutrient: 'Sugar / Trans Fats', per100g: '0.00 g', per30g: '0 g' },
      { nutrient: 'DHA', per100g: '100 mg', per30g: '30 mg' },
      { nutrient: 'Calcium', per100g: '600 mg', per30g: '180 mg' },
      { nutrient: 'Phosphorus', per100g: '425 mg', per30g: '127 mg' },
      { nutrient: 'Vitamin A / Vitamin D3', per100g: '2000 IU / 200 IU', per30g: '600 IU / 60 IU' },
      { nutrient: 'Vitamin B1 / B2 / B6', per100g: '2.5 / 2.5 / 2.0 mg', per30g: '0.75 / 0.75 / 0.60 mg' },
      { nutrient: 'Vitamin C / Vitamin E', per100g: '10.0 mg / 2.0 mg', per30g: '3 mg / 0.60 mg' },
      { nutrient: 'Folic Acid / Niacinamide', per100g: '1.0 mg / 10.0 mg', per30g: '0.30 mg / 3 mg' },
      { nutrient: 'Iron / Zinc Sulphate', per100g: '5.0 mg / 5.0 mg', per30g: '1.5 mg / 1.5 mg' },
      { nutrient: 'Selenium / Chromium', per100g: '60 mcg / 75 mcg', per30g: '18 mcg / 22.5 mcg' },
    ],
    directions:
      'Mix 2–3 tablespoons (approx. 30 g) of Protizen-HP™ powder in a glass of lukewarm milk or water, stir briskly until dissolved, and consume once or twice daily as advised by a nutritionist or physician.',
    timingWindow: 'Daily Nutrition',
    cautions: [
      'Contains milk-derived ingredients (skimmed milk powder and whey protein); not suitable for individuals with dairy/milk protein allergy.',
      'Dietary supplement; not intended for medicinal use to replace prescribed therapy.',
      'Close the lid tightly after every use and store in a cool, dry place.',
    ],
    contraindications:
      'Known allergy to dairy proteins or any listed ingredient. Consult a clinician in severe renal protein-restricted diets.',
    faqs: [
      {
        id: 'protizen-dosage-measuring',
        topic: 'dosage',
        question: 'How many tablespoons make one serving of Protizen-HP™, and how do I mix it?',
        answer:
          'One 30 g serving equals 2 to 3 level tablespoons stirred into 200 ml of lukewarm milk or water.',
        points: [
          {
            icon: 'dose',
            lead: 'One standard serving (30 g)',
            text: 'Measure 2 to 3 level tablespoons of dry powder.',
          },
          {
            icon: 'drop',
            lead: 'Mixing liquid',
            text: 'Stir briskly into 200 ml of lukewarm milk or water until smooth.',
          },
          {
            icon: 'clock',
            lead: 'Daily frequency',
            text: 'Once daily for routine nutrition, or twice daily (60 g split AM/PM) for maternal or recovery care.',
          },
        ],
      },
      {
        id: 'protizen-dosage-hot-liquids',
        topic: 'dosage',
        question: 'Can Protizen-HP™ be mixed into boiling hot milk or tea?',
        answer:
          'Use lukewarm milk or water — avoid boiling liquids to prevent clumping and protect vitamins.',
        points: [
          {
            icon: 'alert',
            lead: 'Skip boiling liquids',
            text: 'Very hot milk or water can clump whey protein and degrade heat-sensitive Vitamin C.',
          },
          {
            icon: 'check',
            lead: 'Keep powder dry',
            text: 'Always use a clean, dry spoon and snap the tin lid shut immediately after scooping.',
          },
        ],
      },
      {
        id: 'protizen-sourcing-protein',
        topic: 'sourcing',
        question:
          'What protein sources are used in Protizen-HP™ and does it contain dairy?',
        answer:
          'Protizen-HP™ blends Skimmed Milk Powder and Whey Protein with DHA and 21 vitamins and minerals; it contains dairy.',
        points: [
          {
            icon: 'leaf',
            lead: 'Dual dairy protein',
            text: 'Skimmed Milk Powder + Whey Protein (15 g total protein and 2000 mg whey per 100 g).',
          },
          {
            icon: 'check',
            lead: 'Added micronutrients',
            text: 'Enriched with DHA (100 mg/100 g), 10 essential vitamins, and 11 minerals.',
          },
          {
            icon: 'alert',
            lead: 'Allergen note',
            text: 'Milk-derived formula — not suitable for dairy-free diets.',
          },
        ],
      },
      {
        id: 'protizen-sourcing-dietary',
        topic: 'sourcing',
        question:
          'Is Protizen-HP™ sugar free, trans-fat free, and gluten free?',
        answer:
          'Yes — 0.00 g Sugar, 0.00 g Trans Fats, Gluten Free, available in Vanilla and Chocolate flavors.',
        points: [
          {
            icon: 'check',
            lead: 'Certified clean profile',
            text: '0.00 g Sugar, 0.00 g Trans Fats, and Gluten Free per visual detailer.',
          },
          {
            icon: 'leaf',
            lead: 'Flavor options',
            text: 'Sweetened with non-caloric sweetener in smooth Vanilla and Chocolate.',
          },
        ],
      },
      {
        id: 'protizen-safety-allergens',
        topic: 'safety',
        question:
          'Who should avoid Protizen-HP™ or consult a clinician before using it?',
        answer:
          'Avoid in dairy allergy, and consult a specialist if following a kidney protein-restricted diet.',
        points: [
          {
            icon: 'alert',
            lead: 'Milk protein allergy',
            text: 'Do not use if allergic or hypersensitive to cow’s milk or whey protein.',
          },
          {
            icon: 'shield',
            lead: 'Kidney conditions',
            text: 'Anyone on a medically prescribed protein-restricted renal diet should check daily limits with their doctor.',
          },
        ],
      },
      {
        id: 'protizen-safety-combining',
        topic: 'safety',
        question:
          'Can Protizen-HP™ be combined safely with Bonebro™ or RED-XT™?',
        answer:
          'Yes, as a dietary supplement — just separate it from iron tablets (RED-XT™) if mixed with milk.',
        points: [
          {
            icon: 'check',
            lead: 'Modest micronutrient levels',
            text: 'Each 30 g serving contains 180 mg Calcium, 60 IU Vitamin D3, and 1.5 mg Iron.',
          },
          {
            icon: 'clock',
            lead: 'Pairing with RED-XT™',
            text: 'Take Protizen-HP™ at a different time of day than iron tablets (especially when mixed in milk) so iron absorbs fully.',
          },
        ],
      },
    ],
    featured: true,
  },
];
