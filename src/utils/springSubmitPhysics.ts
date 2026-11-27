export interface SpringChannel {
  x: number;
  v: number;
  t: number;
  k: number;
  c: number;
}

export const SPRINGY_MORPH_CONFIG = {
  stiffness: 300,
  damping: 20,
} as const;

export const SPRINGY_SHAKE_CONFIG = {
  stiffness: 700,
  damping: 10,
  impulseVelocity: 420,
} as const;

export const CHAR_NOPE_STAGGER_MS = 14;
export const CHAR_FLY_STAGGER_MS = 16;
export const CHAR_DROP_STAGGER_MS = 18;

export function createSpring(
  initial: number,
  stiffness = 400,
  damping = 30
): SpringChannel {
  return { x: initial, v: 0, t: initial, k: stiffness, c: damping };
}

export function tuneSpring(
  spring: SpringChannel,
  stiffness: number,
  damping: number,
  reducedMotion = false
): void {
  spring.k = stiffness;
  spring.c = reducedMotion ? 2 * Math.sqrt(stiffness) : damping;
}

/**
 * Advances a spring channel by dt seconds using 4 substeps for stability,
 * matching the DesignBookmark Motion spring engine.
 */
export function stepSpring(
  spring: SpringChannel,
  dtSeconds: number,
  substeps = 4
): void {
  const clampedDt = Math.min(Math.max(0, dtSeconds), 1 / 30);
  const subDt = clampedDt / substeps;
  for (let i = 0; i < substeps; i++) {
    const accel = -spring.k * (spring.x - spring.t) - spring.c * spring.v;
    spring.v += accel * subDt;
    spring.x += spring.v * subDt;
  }
}

export function isSpringSettled(
  spring: SpringChannel,
  positionEps = 0.08,
  velocityEps = 0.25
): boolean {
  return (
    Math.abs(spring.x - spring.t) <= positionEps &&
    Math.abs(spring.v) <= velocityEps
  );
}

/**
 * Splits button text into renderable glyphs, converting ASCII spaces to
 * non-breaking spaces so inline-block character spans preserve exact spacing.
 */
export function splitAnimatedGlyphs(label: string): string[] {
  return Array.from(label).map((ch) => (ch === ' ' ? '\u00A0' : ch));
}

/**
 * Computes milliseconds to wait after launching character fly-up before
 * morphing the pill to the green confirmation state (.25s + chars * 16ms).
 */
export function computeFlyPhaseMs(charCount: number): number {
  return Math.round(250 + Math.max(0, charCount) * CHAR_FLY_STAGGER_MS);
}

/**
 * Computes total hold duration before resetting back to idle (2.8s + chars * 16ms).
 */
export function computeSuccessHoldMs(charCount: number): number {
  return Math.round(2800 + Math.max(0, charCount) * CHAR_FLY_STAGGER_MS);
}
