export interface MonographSectionMeta {
  id: string;
  label: string;
}

export interface ActiveMonographSection {
  id: string;
  label: string;
  index: number;
  total: number;
}

/**
 * Builds the ordered list of clinical monograph sections present for a product.
 * Conditional sections (e.g., Protizen-HP nutritional profile) are included only
 * when rendered on the ProductDetailPage.
 */
export function buildMonographSections(product: {
  nutritionalFacts?: ReadonlyArray<unknown>;
}): MonographSectionMeta[] {
  const sections: MonographSectionMeta[] = [
    { id: 'monograph-overview', label: 'Overview' },
    { id: 'monograph-dosage-calculator', label: 'Dosage calculator' },
    { id: 'monograph-dosage-chart', label: 'Dosage guideline' },
    { id: 'monograph-visual-aid', label: 'Visual aid' },
    { id: 'monograph-highlights', label: 'Clinical highlights' },
    { id: 'monograph-composition', label: 'Active composition' },
  ];

  if (product.nutritionalFacts && product.nutritionalFacts.length > 0) {
    sections.push({
      id: 'monograph-nutrition-facts',
      label: 'Nutritional profile',
    });
  }

  sections.push(
    { id: 'monograph-synergy-usage', label: 'Synergy & usage' },
    { id: 'monograph-cautions', label: 'Cautions & safety' },
    { id: 'monograph-faq', label: 'FAQs' }
  );

  return sections;
}

/**
 * Computes clamped [0, 1] reading progress through a monograph container.
 * Progress starts at 0 when the container top aligns with the reading top
 * offset and reaches 1 when the container bottom reaches the bottom of the viewport.
 */
export function computeMonographProgress(
  scrollY: number,
  containerTop: number,
  containerHeight: number,
  viewportHeight: number,
  topOffset = 80
): number {
  if (
    !Number.isFinite(scrollY) ||
    !Number.isFinite(containerTop) ||
    !Number.isFinite(containerHeight) ||
    !Number.isFinite(viewportHeight)
  ) {
    return 0;
  }

  const startScroll = Math.max(0, containerTop - topOffset);
  const endScroll = containerTop + containerHeight - viewportHeight;
  const scrollableDistance = endScroll - startScroll;

  if (scrollableDistance <= 0) {
    return scrollY >= startScroll ? 1 : 0;
  }

  const raw = (scrollY - startScroll) / scrollableDistance;
  if (raw <= 0) return 0;
  if (raw >= 1) return 1;
  return raw;
}

/**
 * Determines which monograph section is currently active given document-relative
 * top offsets for each section and the current scroll position.
 */
export function getActiveMonographSection(
  sections: MonographSectionMeta[],
  sectionTops: Array<{ id: string; top: number }>,
  scrollY: number,
  readingLineOffset = 180
): ActiveMonographSection | null {
  if (sections.length === 0) return null;

  const topMap = new Map<string, number>();
  for (const item of sectionTops) {
    if (Number.isFinite(item.top)) {
      topMap.set(item.id, item.top);
    }
  }

  const threshold = (Number.isFinite(scrollY) ? scrollY : 0) + readingLineOffset;
  let activeIndex = 0;

  for (let i = 0; i < sections.length; i += 1) {
    const top = topMap.get(sections[i].id);
    if (top !== undefined && top <= threshold) {
      activeIndex = i;
    }
  }

  return {
    id: sections[activeIndex].id,
    label: sections[activeIndex].label,
    index: activeIndex,
    total: sections.length,
  };
}

/**
 * Converts a [0, 1] progress ratio into an integer percentage from 0 to 100.
 */
export function formatReadingProgressPercent(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.round(clamped * 100);
}
