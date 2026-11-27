import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPRINGY_MORPH_CONFIG,
  SPRINGY_SHAKE_CONFIG,
  computeFlyPhaseMs,
  computeSuccessHoldMs,
  createSpring,
  isSpringSettled,
  splitAnimatedGlyphs,
  stepSpring,
  tuneSpring,
} from './springSubmitPhysics.ts';

test('stepSpring converges morph spring to target width smoothly with underdamped settle', () => {
  const widthSpring = createSpring(
    256,
    SPRINGY_MORPH_CONFIG.stiffness,
    SPRINGY_MORPH_CONFIG.damping
  );
  widthSpring.t = 216;

  for (let frame = 0; frame < 90; frame++) {
    stepSpring(widthSpring, 1 / 60);
  }

  assert.ok(Math.abs(widthSpring.x - 216) < 0.5);
  assert.equal(isSpringSettled(widthSpring), true);
});

test('shake spring recoils on impulse velocity and returns to zero', () => {
  const shake = createSpring(
    0,
    SPRINGY_SHAKE_CONFIG.stiffness,
    SPRINGY_SHAKE_CONFIG.damping
  );
  shake.v += SPRINGY_SHAKE_CONFIG.impulseVelocity;

  let peakAbs = 0;
  for (let frame = 0; frame < 140; frame++) {
    stepSpring(shake, 1 / 60);
    peakAbs = Math.max(peakAbs, Math.abs(shake.x));
  }

  assert.ok(peakAbs > 6, 'shake should visibly recoil');
  assert.ok(Math.abs(shake.x) < 0.2, 'shake should settle back to 0');
});

test('tuneSpring applies critical damping when prefers-reduced-motion is active', () => {
  const s = createSpring(0, 300, 20);
  tuneSpring(s, 300, 20, true);
  assert.ok(Math.abs(s.c - 2 * Math.sqrt(300)) < 1e-6);
});

test('splitAnimatedGlyphs preserves spaces as non-breaking spaces and computes stagger timing accurately', () => {
  const glyphs = splitAnimatedGlyphs('Submit supply');
  assert.equal(glyphs.length, 13);
  assert.equal(glyphs[6], '\u00A0');
  assert.equal(computeFlyPhaseMs(21), 250 + 21 * 16);
  assert.equal(computeSuccessHoldMs(21), 2800 + 21 * 16);
});
