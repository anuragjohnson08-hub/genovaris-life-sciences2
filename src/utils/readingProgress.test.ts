import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonographSections,
  computeMonographProgress,
  formatReadingProgressPercent,
  getActiveMonographSection,
} from './readingProgress';

test('buildMonographSections excludes nutritional profile when absent and includes it when present', () => {
  const standard = buildMonographSections({ nutritionalFacts: undefined });
  assert.equal(standard.length, 9);
  assert.equal(
    standard.some((s) => s.id === 'monograph-nutrition-facts'),
    false
  );

  const withNutrition = buildMonographSections({
    nutritionalFacts: [{ nutrient: 'Protein', per100g: '30 g', per30g: '9 g' }],
  });
  assert.equal(withNutrition.length, 10);
  const nutritionIdx = withNutrition.findIndex(
    (s) => s.id === 'monograph-nutrition-facts'
  );
  const compositionIdx = withNutrition.findIndex(
    (s) => s.id === 'monograph-composition'
  );
  assert.equal(nutritionIdx, compositionIdx + 1);
});

test('computeMonographProgress clamps cleanly across start, midpoint, end, and overscroll', () => {
  // Container starts at y=100, height=3000, viewport=900, topOffset=80
  // startScroll = 20, endScroll = 2200, distance = 2180
  assert.equal(computeMonographProgress(0, 100, 3000, 900, 80), 0);
  assert.equal(computeMonographProgress(-40, 100, 3000, 900, 80), 0);
  assert.equal(computeMonographProgress(20, 100, 3000, 900, 80), 0);

  const mid = computeMonographProgress(1110, 100, 3000, 900, 80);
  assert.equal(Math.round(mid * 100), 50);

  assert.equal(computeMonographProgress(2200, 100, 3000, 900, 80), 1);
  assert.equal(computeMonographProgress(3500, 100, 3000, 900, 80), 1);
});

test('computeMonographProgress handles short containers and invalid numbers safely', () => {
  assert.equal(computeMonographProgress(0, 100, 500, 900, 80), 0);
  assert.equal(computeMonographProgress(50, 100, 500, 900, 80), 1);
  assert.equal(computeMonographProgress(Number.NaN, 100, 3000, 900, 80), 0);
});

test('getActiveMonographSection identifies the last section above the reading line', () => {
  const sections = buildMonographSections({ nutritionalFacts: undefined });
  const sectionTops = [
    { id: 'monograph-overview', top: 120 },
    { id: 'monograph-dosage-calculator', top: 680 },
    { id: 'monograph-dosage-chart', top: 1400 },
    { id: 'monograph-composition', top: 2600 },
    { id: 'monograph-faq', top: 3800 },
  ];

  const initial = getActiveMonographSection(sections, sectionTops, 0, 180);
  assert.equal(initial?.id, 'monograph-overview');
  assert.equal(initial?.index, 0);

  const atCalculator = getActiveMonographSection(sections, sectionTops, 550, 180);
  assert.equal(atCalculator?.id, 'monograph-dosage-calculator');
  assert.equal(atCalculator?.label, 'Dosage calculator');

  const atFaq = getActiveMonographSection(sections, sectionTops, 3700, 180);
  assert.equal(atFaq?.id, 'monograph-faq');
  assert.equal(atFaq?.index, 8);
  assert.equal(atFaq?.total, 9);
});

test('formatReadingProgressPercent rounds and clamps safely', () => {
  assert.equal(formatReadingProgressPercent(-0.2), 0);
  assert.equal(formatReadingProgressPercent(0), 0);
  assert.equal(formatReadingProgressPercent(0.426), 43);
  assert.equal(formatReadingProgressPercent(1.4), 100);
  assert.equal(formatReadingProgressPercent(Number.NaN), 0);
});
