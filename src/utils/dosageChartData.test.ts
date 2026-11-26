import test from 'node:test';
import assert from 'node:assert/strict';
import { GENOVARIS_PRODUCTS } from '../data/products';
import {
  getDosageGuidelineChartData,
  getRetailBoxSpec,
} from './dosageChartData';

test('getDosageGuidelineChartData builds valid profile and weight-band chart series for all four products', () => {
  for (const product of GENOVARIS_PRODUCTS) {
    const chart = getDosageGuidelineChartData(product);
    assert.ok(chart.byProfile.length >= 4, `Expected >=4 profile points for ${product.slug}`);
    assert.equal(chart.byWeight.length, 4, `Expected 4 weight bands for ${product.slug}`);
    assert.ok(chart.maxDomain > chart.upperLimitValue);

    for (const point of [...chart.byProfile, ...chart.byWeight]) {
      assert.ok(point.minIntake <= point.maxIntake);
      if (point.clinicianReview) {
        assert.equal(point.rangeBase, 0);
        assert.equal(point.rangeSpan, 0);
      } else {
        assert.ok(point.rangeSpan > 0, `Expected positive rangeSpan for ${point.id}`);
      }
    }
  }
});

test('getDosageGuidelineChartData reflects product-specific units and clinical guardrails', () => {
  const protizen = GENOVARIS_PRODUCTS.find((p) => p.slug === 'protizen-hp-powder');
  const cerebra = GENOVARIS_PRODUCTS.find((p) => p.slug === 'cerebra-cb');
  const redXt = GENOVARIS_PRODUCTS.find((p) => p.slug === 'red-xt-tablets');
  assert.ok(protizen && cerebra && redXt);

  const protizenChart = getDosageGuidelineChartData(protizen);
  assert.equal(protizenChart.unit, 'g / day');
  assert.equal(protizenChart.upperLimitValue, 60);

  const cerebraChart = getDosageGuidelineChartData(cerebra);
  const maternalPoint = cerebraChart.byProfile.find((p) => p.id === 'pregnancy');
  assert.equal(maternalPoint?.clinicianReview, true);

  const redXtChart = getDosageGuidelineChartData(redXt);
  assert.equal(redXtChart.upperLimitValue, 1);
});

test('getRetailBoxSpec maps tablet cartons and powder tin properly with fallback support', () => {
  const bonebro = GENOVARIS_PRODUCTS.find((p) => p.slug === 'bonebro-tablets');
  const protizen = GENOVARIS_PRODUCTS.find((p) => p.slug === 'protizen-hp-powder');
  assert.ok(bonebro && protizen);

  assert.equal(getRetailBoxSpec(bonebro).packStyle, 'tablet-box');
  assert.equal(getRetailBoxSpec(protizen).packStyle, 'powder-tin');

  const fallback = getRetailBoxSpec({ ...bonebro, slug: 'custom-sku' });
  assert.equal(fallback.packStyle, 'tablet-box');
  assert.equal(fallback.slug, 'custom-sku');
});
