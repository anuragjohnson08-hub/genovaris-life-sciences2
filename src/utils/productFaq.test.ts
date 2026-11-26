import test from 'node:test';
import assert from 'node:assert/strict';
import { GENOVARIS_PRODUCTS } from '../data/products';
import {
  filterProductFaqs,
  getFaqBulletPoints,
  getProductFaqs,
  toggleFaqExpandedId,
} from './productFaq';

test('getProductFaqs dynamically pulls balanced dosage, sourcing, and safety FAQs with bullet points from product data', () => {
  for (const product of GENOVARIS_PRODUCTS) {
    assert.ok(product.faqs && product.faqs.length >= 6, `Expected embedded faqs on ${product.slug}`);
    const faqs = getProductFaqs(product);
    assert.deepEqual(faqs, product.faqs);

    const dosage = filterProductFaqs(faqs, 'dosage');
    const sourcing = filterProductFaqs(faqs, 'sourcing');
    const safety = filterProductFaqs(faqs, 'safety');
    assert.equal(dosage.length, 2, `Expected 2 dosage FAQs for ${product.slug}`);
    assert.equal(sourcing.length, 2, `Expected 2 sourcing FAQs for ${product.slug}`);
    assert.equal(safety.length, 2, `Expected 2 safety FAQs for ${product.slug}`);

    for (const faq of faqs) {
      const bullets = getFaqBulletPoints(faq);
      assert.ok(bullets.length >= 2, `Expected >=2 scannable bullet points on ${faq.id}`);
      for (const bullet of bullets) {
        assert.ok(bullet.lead.length > 0 && bullet.text.length > 0);
      }
    }
  }
});

test('getFaqBulletPoints converts plain-text answers into structured icon points when points are omitted', () => {
  const bullets = getFaqBulletPoints({
    id: 'plain-faq',
    topic: 'safety',
    question: 'Sample safety question?',
    answer: 'Store in a cool dry place. Keep away from young children.',
  });
  assert.equal(bullets.length, 2);
  assert.equal(bullets[0].icon, 'shield');
  assert.equal(bullets[1].icon, 'check');
  assert.equal(bullets[0].text, 'Store in a cool dry place.');
});

test('filterProductFaqs filters cleanly by all, dosage, sourcing, and safety topics', () => {
  const protizen = GENOVARIS_PRODUCTS.find((p) => p.slug === 'protizen-hp-powder');
  assert.ok(protizen);

  const all = getProductFaqs(protizen);
  assert.equal(filterProductFaqs(all, 'all').length, all.length);
  assert.ok(filterProductFaqs(all, 'dosage').every((f) => f.topic === 'dosage'));
  assert.ok(filterProductFaqs(all, 'sourcing').every((f) => f.topic === 'sourcing'));
  assert.ok(filterProductFaqs(all, 'safety').every((f) => f.topic === 'safety'));
});

test('toggleFaqExpandedId supports multi-expand and single-expand accordion modes', () => {
  const openedOne = toggleFaqExpandedId([], 'q1', true);
  assert.deepEqual(openedOne, ['q1']);

  const openedTwo = toggleFaqExpandedId(openedOne, 'q2', true);
  assert.deepEqual(openedTwo, ['q1', 'q2']);

  const closedOne = toggleFaqExpandedId(openedTwo, 'q1', true);
  assert.deepEqual(closedOne, ['q2']);

  const singleMode = toggleFaqExpandedId(['q1'], 'q2', false);
  assert.deepEqual(singleMode, ['q2']);

  const singleClose = toggleFaqExpandedId(['q2'], 'q2', false);
  assert.deepEqual(singleClose, []);
});

test('getProductFaqs synthesizes dynamic dosage, sourcing, and safety FAQs with points when product.faqs is omitted', () => {
  const base = GENOVARIS_PRODUCTS[0];
  const fallback = getProductFaqs({
    ...base,
    slug: 'future-formulation',
    name: 'FutureMed™',
    faqs: undefined,
  });
  assert.equal(fallback.length, 3);
  assert.equal(fallback[0].topic, 'dosage');
  assert.equal(fallback[1].topic, 'sourcing');
  assert.equal(fallback[2].topic, 'safety');
  assert.ok(fallback[0].question.includes('FutureMed™'));
  assert.ok(fallback[0].points && fallback[0].points.length === 2);
  assert.ok(fallback[0].points[1].text.includes(base.timingWindow));
});
