import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampScrollTarget,
  isNotchedWheelEvent,
  normalizeWheelDelta,
  stepSmoothScroll,
} from './smoothScroll';

test('clampScrollTarget keeps values within [0, maxScroll]', () => {
  assert.equal(clampScrollTarget(-120, 2000), 0);
  assert.equal(clampScrollTarget(450, 2000), 450);
  assert.equal(clampScrollTarget(3500, 2000), 2000);
  assert.equal(clampScrollTarget(Number.NaN, 2000), 0);
});

test('normalizeWheelDelta converts line and page wheel modes cleanly to pixels', () => {
  assert.equal(normalizeWheelDelta(100, 0, 900), 100);
  assert.equal(normalizeWheelDelta(3, 1, 900), 108);
  assert.equal(normalizeWheelDelta(1, 2, 1000), 850);
});

test('isNotchedWheelEvent distinguishes notched mouse wheels from fine trackpad gestures', () => {
  assert.equal(isNotchedWheelEvent(100, 0, 0), true);
  assert.equal(isNotchedWheelEvent(-120, 0, 0), true);
  assert.equal(isNotchedWheelEvent(3, 1, 0), true);
  assert.equal(isNotchedWheelEvent(6, 0, 0), false);
  assert.equal(isNotchedWheelEvent(18.5, 0, 0), false);
  assert.equal(isNotchedWheelEvent(50, 0, 80), false);
});

test('stepSmoothScroll is frame-rate independent across 60Hz, 90Hz, and 120Hz', () => {
  // Simulate 100ms of scrolling from 0 -> 200 at 60Hz (6 steps of 16.666ms) vs 120Hz (12 steps of 8.333ms)
  let pos60 = 0;
  for (let i = 0; i < 6; i += 1) {
    pos60 = stepSmoothScroll(pos60, 200, 100 / 6, 12).next;
  }

  let pos90 = 0;
  for (let i = 0; i < 9; i += 1) {
    pos90 = stepSmoothScroll(pos90, 200, 100 / 9, 12).next;
  }

  let pos120 = 0;
  for (let i = 0; i < 12; i += 1) {
    pos120 = stepSmoothScroll(pos120, 200, 100 / 12, 12).next;
  }

  assert.ok(Math.abs(pos60 - pos90) < 0.01);
  assert.ok(Math.abs(pos90 - pos120) < 0.01);
  assert.ok(pos120 > 120 && pos120 < 200);
});

test('stepSmoothScroll settles cleanly once within threshold', () => {
  const res = stepSmoothScroll(199.7, 200, 11.1, 12, 0.5);
  assert.equal(res.next, 200);
  assert.equal(res.settled, true);
});
