import type {
  FaqBulletIcon,
  FaqFilterTopic,
  FaqTopic,
  ProductFaqItem,
  ProductFaqPoint,
  ProductFormulation,
} from '../types/medicine';

const DEFAULT_ICON_BY_TOPIC: Record<FaqTopic, FaqBulletIcon> = {
  dosage: 'dose',
  sourcing: 'leaf',
  safety: 'shield',
};

/**
 * Dynamically pulls product-specific FAQs from the product data object.
 * When a formulation does not define an explicit `faqs` array, synthesizes
 * clear dosage, sourcing, and usage safety FAQs with structured bullet points
 * directly from its fields.
 */
export function getProductFaqs(product: ProductFormulation): ProductFaqItem[] {
  if (product.faqs && product.faqs.length > 0) {
    return product.faqs;
  }

  const safetyPoints: ProductFaqPoint[] = [
    {
      icon: 'alert',
      lead: 'Contraindications',
      text: product.contraindications,
    },
  ];
  if (product.cautions[0]) {
    safetyPoints.push({
      icon: 'shield',
      lead: 'Key caution',
      text: product.cautions[0],
    });
  }

  return [
    {
      id: `${product.slug}-dosage-default`,
      topic: 'dosage',
      question: `How and when should ${product.name} be taken each day?`,
      answer: `${product.directions} Recommended timing window: ${product.timingWindow} (${product.dosageForm}).`,
      points: [
        {
          icon: 'dose',
          lead: 'Directions',
          text: product.directions,
        },
        {
          icon: 'clock',
          lead: 'Recommended timing',
          text: `${product.timingWindow} (${product.dosageForm}).`,
        },
      ],
    },
    {
      id: `${product.slug}-sourcing-default`,
      topic: 'sourcing',
      question: `How is ${product.name} formulated and verified?`,
      answer: `${product.name} (${product.code}) is formulated by Genovaris Lifesciences with standardized active ingredients (${product.compositionLine}).`,
      points: [
        {
          icon: 'leaf',
          lead: 'Active composition',
          text: product.compositionLine,
        },
        {
          icon: 'check',
          lead: 'Batch verification',
          text: `Reference code ${product.code} — verify batch and expiry details directly on the physical container label.`,
        },
      ],
    },
    {
      id: `${product.slug}-safety-default`,
      topic: 'safety',
      question: `What safety precautions apply before starting ${product.name}?`,
      answer: `${product.contraindications} Always review active ingredients and directions with a qualified healthcare professional.`,
      points: safetyPoints,
    },
  ];
}

/**
 * Returns structured minimalist bullet points for an FAQ item.
 * Falls back gracefully by splitting plain-text answers into concise bullets
 * when an item does not supply explicit `points`.
 */
export function getFaqBulletPoints(item: ProductFaqItem): ProductFaqPoint[] {
  if (item.points && item.points.length > 0) {
    return item.points;
  }

  const fallbackIcon = DEFAULT_ICON_BY_TOPIC[item.topic];
  const sentences = item.answer
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return [];
  }

  return sentences.map((sentence, idx) => ({
    icon: idx === 0 ? fallbackIcon : 'check',
    lead: idx === 0 ? 'Key takeaway' : 'Note',
    text: sentence,
  }));
}

export function filterProductFaqs(
  items: ProductFaqItem[],
  topic: FaqFilterTopic
): ProductFaqItem[] {
  if (topic === 'all') return items;
  return items.filter((item) => item.topic === topic);
}

export function toggleFaqExpandedId(
  currentIds: string[],
  targetId: string,
  allowMultiple = true
): string[] {
  const exists = currentIds.includes(targetId);
  if (exists) {
    return currentIds.filter((id) => id !== targetId);
  }
  return allowMultiple ? [...currentIds, targetId] : [targetId];
}
