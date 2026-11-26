import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCookieBiteGeometry,
  computeCookieCardMorph,
  createCrumbPool,
  createInitialFlickState,
  createSpring,
  isSpringSettled,
  spawnCrumbBurst,
  stepCrumbParticle,
  stepFlickPhysics,
  stepSpring,
  tuneSpring,
} from './cookieBitePhysics';

test('stepSpring converges cleanly toward target and supports critical damping for reduced motion', () => {
  const spring = createSpring(0, 260, 24, false);
  spring.t = 1;
  assert.equal(isSpringSettled(spring), false);

  for (let i = 0; i < 180; i++) {
    stepSpring(spring, 1 / 120);
  }
  assert.ok(Math.abs(spring.x - 1) < 0.01, `expected spring to settle near 1, got ${spring.x}`);
  assert.equal(isSpringSettled(spring), true);

  const reduced = createSpring(0, 400, 10, true);
  assert.equal(reduced.c, 40);
  tuneSpring(reduced, 900, 12, true);
  assert.equal(reduced.c, 60);
});

test('buildCookieBiteGeometry generates 3 rim bites with 3 teeth marks each', () => {
  const clusters = buildCookieBiteGeometry();
  assert.equal(clusters.length, 3);

  for (const cluster of clusters) {
    assert.equal(cluster.circles.length, 4);
    assert.equal(cluster.circles[0].r, 13);
    assert.equal(cluster.circles[1].r, 5.2);
    assert.equal(cluster.circles[2].r, 5.2);
    assert.equal(cluster.circles[3].r, 5.2);

    const distFromCenter = Math.hypot(cluster.x - 32, cluster.y - 32);
    assert.ok(Math.abs(distFromCenter - 30) < 0.01);
  }
});

test('spawnCrumbBurst and stepCrumbParticle apply upward burst, gravity, and life decay', () => {
  const pool = createCrumbPool(6);
  const nextCursor = spawnCrumbBurst(pool, 0, 50, 20, 4, 150, () => 0.5);
  assert.equal(nextCursor, 4);
  assert.ok(pool[0].life > 0.7);
  assert.ok(pool[0].vy < 0);

  const initialVy = pool[0].vy;
  stepCrumbParticle(pool[0], 0.1);
  assert.ok(pool[0].vy > initialVy, 'gravity should increase downward velocity');

  for (let i = 0; i < 20; i++) {
    stepCrumbParticle(pool[0], 0.1);
  }
  assert.equal(pool[0].life, 0);
});

test('stepFlickPhysics rolls cookie left and applies gravity drop past edge threshold', () => {
  const flick = createInitialFlickState();
  stepFlickPhysics(flick, 0.1);
  assert.ok(flick.x < 0);
  assert.equal(flick.y, 0);

  for (let i = 0; i < 10; i++) {
    stepFlickPhysics(flick, 0.05);
  }
  assert.ok(flick.x < -46);
  assert.ok(flick.y > 0, 'cookie should fall downward after rolling off card edge');
});

test('computeCookieCardMorph transitions smoothly from open card to confirmation pill', () => {
  const openState = computeCookieCardMorph(0, 0, 220, 0);
  assert.equal(openState.bodyOpacity, 1);
  assert.equal(openState.doneOpacity, 0);
  assert.equal(openState.borderRadius, 24);
  assert.equal(openState.overflowHidden, false);
  assert.equal(openState.tickDashOffset, 1);

  const settledPill = computeCookieCardMorph(1, 1, 44, 1);
  assert.equal(settledPill.bodyOpacity, 0);
  assert.equal(settledPill.doneOpacity, 1);
  assert.equal(settledPill.doneTranslateY, 0);
  assert.equal(settledPill.borderRadius, 22);
  assert.equal(settledPill.overflowHidden, true);
  assert.equal(settledPill.tickDashOffset, 0);
});
