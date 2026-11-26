/**
 * Pure frame-rate-independent smooth scroll math (60Hz / 90Hz / 120Hz / 144Hz+).
 * Uses exponential decay so perceived glide speed is identical at every refresh rate.
 */

export interface ScrollStepResult {
  next: number;
  settled: boolean;
}

/**
 * Clamps a desired scroll position within valid document bounds.
 */
export function clampScrollTarget(target: number, maxScroll: number): number {
  if (!Number.isFinite(target) || !Number.isFinite(maxScroll)) return 0;
  const safeMax = Math.max(0, maxScroll);
  if (target <= 0) return 0;
  if (target >= safeMax) return safeMax;
  return target;
}

/**
 * Normalizes a WheelEvent deltaY into CSS pixels regardless of deltaMode.
 */
export function normalizeWheelDelta(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number
): number {
  if (!Number.isFinite(deltaY)) return 0;
  if (deltaMode === 1) {
    // DOM_DELTA_LINE (typical Firefox / Linux mouse wheel)
    return deltaY * 36;
  }
  if (deltaMode === 2) {
    // DOM_DELTA_PAGE
    return deltaY * Math.max(320, viewportHeight * 0.85);
  }
  return deltaY;
}

/**
 * Detects discrete notched mouse-wheel events versus continuous high-precision
 * OS trackpad momentum gestures so trackpads retain native OS inertia while
 * notched mouse wheels gain smooth interpolated high-Hz gliding.
 */
export function isNotchedWheelEvent(
  deltaY: number,
  deltaMode: number,
  deltaX = 0
): boolean {
  if (!Number.isFinite(deltaY) || deltaY === 0) return false;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
  if (deltaMode !== 0) return true;

  const absY = Math.abs(deltaY);
  // Standard notched mouse wheels on Windows/Chrome/Linux emit >= 48px integer jumps (often 100 or 120)
  return absY >= 48 && Number.isInteger(deltaY);
}

/**
 * Advances current scroll position toward target using frame-rate-independent
 * exponential damping: factor = 1 - exp(-lambda * dtSeconds).
 */
export function stepSmoothScroll(
  current: number,
  target: number,
  dtMs: number,
  lambda = 12,
  settleThreshold = 0.5
): ScrollStepResult {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return { next: 0, settled: true };
  }

  const diff = target - current;
  if (Math.abs(diff) <= settleThreshold) {
    return { next: target, settled: true };
  }

  // Clamp dt to [1ms, 50ms] so waking from a background tab never leaps wildly
  const safeDtSeconds = Math.min(50, Math.max(1, Number.isFinite(dtMs) ? dtMs : 16.67)) / 1000;
  const factor = 1 - Math.exp(-lambda * safeDtSeconds);
  const next = current + diff * factor;

  if (Math.abs(target - next) <= settleThreshold) {
    return { next: target, settled: true };
  }

  return { next, settled: false };
}
