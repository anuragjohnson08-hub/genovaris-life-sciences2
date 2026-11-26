import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeActiveHomeSection,
  computeFastScrollPosition,
  resolveSectionIdFromPathOrHash,
  type SectionOffset,
} from './sectionNavigation';

test('resolveSectionIdFromPathOrHash resolves hashes and legacy section paths accurately', () => {
  assert.equal(resolveSectionIdFromPathOrHash('/', '#products'), 'products');
  assert.equal(
    resolveSectionIdFromPathOrHash('/', '#product-information'),
    'products',
  );
  assert.equal(
    resolveSectionIdFromPathOrHash('/', '#responsible-use'),
    'responsible-use',
  );
  assert.equal(resolveSectionIdFromPathOrHash('/', '#contact'), 'contact');
  assert.equal(resolveSectionIdFromPathOrHash('/', '#disclaimer'), 'disclaimer');

  assert.equal(resolveSectionIdFromPathOrHash('/products', ''), 'products');
  assert.equal(
    resolveSectionIdFromPathOrHash('/responsible-use', ''),
    'responsible-use',
  );
  assert.equal(resolveSectionIdFromPathOrHash('/contact', ''), 'contact');
  assert.equal(resolveSectionIdFromPathOrHash('/consultations', ''), 'contact');
  assert.equal(resolveSectionIdFromPathOrHash('/disclaimer', ''), 'disclaimer');

  assert.equal(resolveSectionIdFromPathOrHash('/', ''), null);
  assert.equal(
    resolveSectionIdFromPathOrHash('/products/bonebro-tablets', ''),
    null,
  );
});

test('computeActiveHomeSection tracks hero, mid-page sections, and bottom-of-page accurately', () => {
  const sections: SectionOffset[] = [
    { id: 'products', top: 680 },
    { id: 'responsible-use', top: 1900 },
    { id: 'contact', top: 3100 },
    { id: 'disclaimer', top: 4200 },
  ];

  // Above first section (in Hero)
  assert.equal(computeActiveHomeSection(sections, 0, 120, 900, 5000), null);
  assert.equal(computeActiveHomeSection(sections, 400, 120, 900, 5000), null);

  // Inside Products
  assert.equal(
    computeActiveHomeSection(sections, 620, 120, 900, 5000),
    'products',
  );

  // Inside Responsible Use
  assert.equal(
    computeActiveHomeSection(sections, 1850, 120, 900, 5000),
    'responsible-use',
  );

  // Inside Supply & Contact
  assert.equal(
    computeActiveHomeSection(sections, 3050, 120, 900, 5000),
    'contact',
  );

  // Reached bottom of document -> highlights final Disclaimer section even if short
  assert.equal(
    computeActiveHomeSection(sections, 4090, 120, 900, 5000),
    'disclaimer',
  );
});

test('computeFastScrollPosition eases smoothly from start to target and settles cleanly', () => {
  const start = computeFastScrollPosition(0, 2000, 0, 460);
  assert.equal(start.y, 0);
  assert.equal(start.done, false);

  const mid = computeFastScrollPosition(0, 2000, 230, 460);
  assert.ok(mid.y > 1400 && mid.y < 2000);
  assert.equal(mid.done, false);

  const end = computeFastScrollPosition(0, 2000, 460, 460);
  assert.equal(end.y, 2000);
  assert.equal(end.done, true);
});
