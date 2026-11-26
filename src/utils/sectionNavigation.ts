export const HOME_SECTION_IDS = [
  'products',
  'responsible-use',
  'contact',
  'disclaimer',
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const HEADER_SCROLL_OFFSET = 76;
export const FAST_SCROLL_DURATION_MS = 460;
export const FAST_SCROLL_EVENT = 'genovaris:fast-scroll-start';

const SECTION_LOOKUP: Record<string, HomeSectionId> = {
  products: 'products',
  'product-information': 'products',
  'responsible-use': 'responsible-use',
  contact: 'contact',
  consultations: 'contact',
  disclaimer: 'disclaimer',
};

export function resolveSectionIdFromPathOrHash(
  pathname: string,
  hash: string,
): HomeSectionId | null {
  const cleanHash = hash.replace(/^#/, '').trim().toLowerCase();
  if (cleanHash && SECTION_LOOKUP[cleanHash]) {
    return SECTION_LOOKUP[cleanHash];
  }

  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  if (cleanPath && SECTION_LOOKUP[cleanPath]) {
    return SECTION_LOOKUP[cleanPath];
  }

  return null;
}

export interface SectionOffset {
  id: HomeSectionId;
  top: number;
}

export function computeActiveHomeSection(
  sections: SectionOffset[],
  scrollY: number,
  headerOffset: number = HEADER_SCROLL_OFFSET + 48,
  viewportHeight: number = 900,
  docHeight: number = 4000,
): HomeSectionId | null {
  if (sections.length === 0) return null;

  const sorted = [...sections].sort((a, b) => a.top - b.top);
  const readingLine = Math.max(0, scrollY) + headerOffset;

  if (readingLine < sorted[0].top) {
    return null;
  }

  if (docHeight > viewportHeight && scrollY + viewportHeight >= docHeight - 28) {
    return sorted[sorted.length - 1].id;
  }

  let active: HomeSectionId = sorted[0].id;
  for (const section of sorted) {
    if (section.top <= readingLine) {
      active = section.id;
    } else {
      break;
    }
  }

  return active;
}

export function computeFastScrollPosition(
  startY: number,
  targetY: number,
  elapsedMs: number,
  durationMs: number = FAST_SCROLL_DURATION_MS,
): { y: number; done: boolean } {
  if (durationMs <= 0 || elapsedMs >= durationMs) {
    return { y: targetY, done: true };
  }
  if (elapsedMs <= 0) {
    return { y: startY, done: false };
  }

  const progress = Math.min(1, Math.max(0, elapsedMs / durationMs));
  // Crisp ease-out power curve: snappy launch, silky zero-overshoot landing
  const eased = 1 - Math.pow(1 - progress, 3.2);
  const y = startY + (targetY - startY) * eased;

  if (Math.abs(targetY - y) < 0.5) {
    return { y: targetY, done: true };
  }

  return { y, done: false };
}

let activeScrollCancel: (() => void) | null = null;

export function cancelActiveFastScroll(): void {
  if (activeScrollCancel) {
    activeScrollCancel();
    activeScrollCancel = null;
  }
}

export function fastScrollToY(
  targetYOrGetter: number | (() => number),
  options?: { durationMs?: number; instant?: boolean },
): void {
  if (typeof window === 'undefined') return;

  cancelActiveFastScroll();
  window.dispatchEvent(new CustomEvent(FAST_SCROLL_EVENT));

  const getClampedTarget = () => {
    const rawTarget =
      typeof targetYOrGetter === 'function'
        ? targetYOrGetter()
        : targetYOrGetter;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    return Math.min(Math.max(0, rawTarget), maxScroll);
  };

  const initialTarget = getClampedTarget();
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (options?.instant || prefersReducedMotion) {
    window.scrollTo(0, initialTarget);
    return;
  }

  const startY = window.scrollY;
  const distance = Math.abs(initialTarget - startY);
  if (distance < 2) {
    window.scrollTo(0, initialTarget);
    return;
  }

  // Crisp fast-scroll glide: 280ms for nearby sections, capped at 420ms for full-page jumps
  const baseDuration =
    options?.durationMs ??
    Math.min(420, Math.max(280, 240 + distance * 0.055));

  let rafId = 0;
  let startTime: number | null = null;

  const cleanup = () => {
    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('wheel', onUserInterrupt);
    window.removeEventListener('touchstart', onUserInterrupt);
    window.removeEventListener('keydown', onUserInterrupt);
  };

  const onUserInterrupt = () => {
    cleanup();
    activeScrollCancel = null;
  };

  activeScrollCancel = cleanup;
  window.addEventListener('wheel', onUserInterrupt, { passive: true });
  window.addEventListener('touchstart', onUserInterrupt, { passive: true });
  window.addEventListener('keydown', onUserInterrupt, { passive: true });

  const step = (now: number) => {
    if (startTime === null) {
      startTime = now;
    }

    const liveTarget = getClampedTarget();
    const { y, done } = computeFastScrollPosition(
      startY,
      liveTarget,
      now - startTime,
      baseDuration,
    );
    window.scrollTo(0, y);

    if (done) {
      window.scrollTo(0, getClampedTarget());
      cleanup();
      activeScrollCancel = null;
    } else {
      rafId = window.requestAnimationFrame(step);
    }
  };

  rafId = window.requestAnimationFrame(step);
}

export function notifyAnchorScrollStart(): void {
  if (typeof window === 'undefined') return;
  cancelActiveFastScroll();
  window.dispatchEvent(new CustomEvent(FAST_SCROLL_EVENT));
}

export function scrollToDocumentAnchor(
  anchorId: string,
  options?: { instant?: boolean },
): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  notifyAnchorScrollStart();

  const element = document.getElementById(anchorId);
  if (!element) return false;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const behavior: ScrollBehavior =
    options?.instant || prefersReducedMotion ? 'instant' : 'smooth';

  element.scrollIntoView({ behavior, block: 'start' });
  return true;
}

export function handleInPageAnchorClick(
  event: { preventDefault: () => void },
  anchorId: string,
): void {
  if (typeof window === 'undefined') return;
  notifyAnchorScrollStart();

  // If the URL hash already matches this anchor (e.g., user scrolled away and
  // re-clicked the same nav link), explicitly smooth-scroll to the anchor.
  // Otherwise, let the browser perform native document anchor scrolling via
  // CSS `scroll-behavior: smooth` and `scroll-padding-top`.
  if (window.location.hash === `#${anchorId}`) {
    event.preventDefault();
    scrollToDocumentAnchor(anchorId);
  }
}

export function fastScrollToSection(
  sectionId: HomeSectionId,
  options?: { durationMs?: number; instant?: boolean; offset?: number },
): boolean {
  return scrollToDocumentAnchor(sectionId, { instant: options?.instant });
}

export function fastScrollToTop(options?: {
  durationMs?: number;
  instant?: boolean;
}): void {
  if (typeof window === 'undefined') return;

  notifyAnchorScrollStart();

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const behavior: ScrollBehavior =
    options?.instant || prefersReducedMotion ? 'instant' : 'smooth';

  const topAnchor = document.getElementById('top');
  if (topAnchor) {
    topAnchor.scrollIntoView({ behavior, block: 'start' });
    return;
  }

  window.scrollTo({ top: 0, behavior });
}
