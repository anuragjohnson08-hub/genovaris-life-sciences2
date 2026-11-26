export interface SpringState {
  x: number;
  v: number;
  t: number;
  k: number;
  c: number;
}

export interface BiteCircle {
  cx: number;
  cy: number;
  r: number;
}

export interface BiteCluster {
  angleDeg: number;
  x: number;
  y: number;
  circles: BiteCircle[];
}

export interface CrumbParticle {
  life: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
}

export interface FlickPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface CookieCardMorphMetrics {
  bodyOpacity: number;
  doneOpacity: number;
  doneTranslateY: number;
  borderRadius: number;
  tickDashOffset: number;
  overflowHidden: boolean;
}

export const BITE_ANGLES_DEG = [-42, 28, 196] as const;

export const COOKIE_BITE_SPRINGS = {
  pop: [520, 16] as const,
  settle: [280, 22] as const,
  soft: [260, 24] as const,
  height: [230, 22] as const,
  bite: [700, 22] as const,
  wobble: [190, 9] as const,
  vanish: [600, 34] as const,
  tick: [160, 20] as const,
} as const;

export function clampValue(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function createSpring(
  initialValue: number,
  k: number = 400,
  c: number = 30,
  reducedMotion: boolean = false,
): SpringState {
  return {
    x: initialValue,
    v: 0,
    t: initialValue,
    k,
    c: reducedMotion ? 2 * Math.sqrt(k) : c,
  };
}

export function tuneSpring(
  spring: SpringState,
  k: number,
  c: number,
  reducedMotion: boolean = false,
): void {
  spring.k = k;
  spring.c = reducedMotion ? 2 * Math.sqrt(k) : c;
}

export function stepSpring(spring: SpringState, dt: number): void {
  const acceleration = -spring.k * (spring.x - spring.t) - spring.c * spring.v;
  spring.v += acceleration * dt;
  spring.x += spring.v * dt;
}

export function isSpringSettled(
  spring: SpringState,
  positionEps: number = 0.02,
  velocityEps: number = 0.05,
): boolean {
  return (
    Math.abs(spring.x - spring.t) <= positionEps &&
    Math.abs(spring.v) <= velocityEps
  );
}

/**
 * Generates the three scalloped bite cutouts on the 64x64 cookie rim,
 * each composed of one main rim cutout plus three inner teeth marks.
 */
export function buildCookieBiteGeometry(): BiteCluster[] {
  return BITE_ANGLES_DEG.map((angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    const cx = 32 + Math.cos(rad) * 30;
    const cy = 32 + Math.sin(rad) * 30;
    const circles: BiteCircle[] = [{ cx, cy, r: 13 }];

    [-52, 0, 52].forEach((toothOffsetDeg) => {
      const q = rad + Math.PI + (toothOffsetDeg * Math.PI) / 180;
      circles.push({
        cx: cx + Math.cos(q) * 11.5,
        cy: cy + Math.sin(q) * 11.5,
        r: 5.2,
      });
    });

    return { angleDeg, x: cx, y: cy, circles };
  });
}

export function createCrumbPool(count: number = 18): CrumbParticle[] {
  return Array.from({ length: count }, () => ({
    life: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 0,
    vr: 0,
  }));
}

export function spawnCrumbBurst(
  pool: CrumbParticle[],
  cursorIndex: number,
  originX: number,
  originY: number,
  count: number,
  power: number,
  rng: () => number = Math.random,
): number {
  let idx = cursorIndex;
  for (let i = 0; i < count; i++) {
    const crumb = pool[idx % pool.length];
    idx += 1;
    const angle = rng() * Math.PI * 2;
    crumb.life = 0.75 + rng() * 0.35;
    crumb.x = originX - 32;
    crumb.y = originY - 32;
    crumb.vx = Math.cos(angle) * power * (0.4 + rng());
    crumb.vy = -Math.abs(Math.sin(angle)) * power * (0.6 + rng()) - 40;
    crumb.r = 0;
    crumb.vr = (rng() - 0.5) * 900;
  }
  return idx;
}

export function stepCrumbParticle(crumb: CrumbParticle, dt: number): void {
  if (crumb.life <= 0) return;
  crumb.life = Math.max(0, crumb.life - dt);
  crumb.vy += 900 * dt;
  crumb.x += crumb.vx * dt;
  crumb.y += crumb.vy * dt;
  crumb.r += crumb.vr * dt;
}

export function createInitialFlickState(): FlickPhysicsState {
  return { x: 0, y: 0, vx: -60, vy: 0 };
}

export function stepFlickPhysics(flick: FlickPhysicsState, dt: number): void {
  flick.vx -= 620 * dt;
  flick.x += flick.vx * dt;
  if (flick.x < -46) {
    flick.vy += 1500 * dt;
    flick.y += flick.vy * dt;
  }
}

export function computeCookieCardMorph(
  morphProgress: number,
  morphTarget: number,
  currentHeight: number,
  tickProgress: number,
): CookieCardMorphMetrics {
  const m = clampValue(morphProgress, 0, 1);
  const bodyOpacity = clampValue(1 - m * 2.2, 0, 1);
  const doneOpacity = clampValue(m * 2.2 - 1.2, 0, 1);
  const doneTranslateY = (1 - doneOpacity) * 8;
  const borderRadius = Math.min(24, Math.max(0, currentHeight) / 2);
  const tickDashOffset = 1 - clampValue(tickProgress, 0, 1);
  const overflowHidden = morphTarget > 0 || m > 0.01;

  return {
    bodyOpacity,
    doneOpacity,
    doneTranslateY,
    borderRadius,
    tickDashOffset,
    overflowHidden,
  };
}
