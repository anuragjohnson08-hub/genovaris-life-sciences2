import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  clampScrollTarget,
  isNotchedWheelEvent,
  normalizeWheelDelta,
  stepSmoothScroll,
} from '../utils/smoothScroll';

function hasScrollableAncestor(target: EventTarget | null, deltaY: number): boolean {
  if (!(target instanceof Element)) return false;

  let node: Element | null = target;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1;

    if (isScrollable) {
      const canScrollDown = deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1;
      const canScrollUp = deltaY < 0 && node.scrollTop > 1;
      if (canScrollDown || canScrollUp) {
        return true;
      }
    }
    node = node.parentElement;
  }

  return false;
}

/**
 * Provides frame-rate-independent (60Hz / 90Hz / 120Hz / 144Hz+) smooth
 * inertial gliding for notched mouse-wheel scrolling while leaving native
 * trackpad gestures, touch scrolling, keyboard navigation, and scrollable
 * modals/drawers completely untouched.
 */
export function SmoothScrollProvider() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = 0;
    let isAnimating = false;
    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let lastTime = 0;

    const stopAnimation = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      isAnimating = false;
    };

    const tick = (now: number) => {
      const dt = lastTime > 0 ? now - lastTime : 16.67;
      lastTime = now;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetY = clampScrollTarget(targetY, maxScroll);

      const { next, settled } = stepSmoothScroll(currentY, targetY, dt, 11.5, 0.45);
      currentY = next;
      window.scrollTo({ top: next, left: 0, behavior: 'instant' });

      if (settled) {
        stopAnimation();
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (motionQuery.matches || event.ctrlKey || event.metaKey || event.defaultPrevented) {
        return;
      }

      if (!isNotchedWheelEvent(event.deltaY, event.deltaMode, event.deltaX)) {
        // Native trackpad or horizontal scroll — yield cleanly
        if (isAnimating) {
          stopAnimation();
        }
        return;
      }

      if (hasScrollableAncestor(event.target, event.deltaY)) {
        if (isAnimating) {
          stopAnimation();
        }
        return;
      }

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      if (maxScroll <= 0) return;

      event.preventDefault();

      const pixelDelta = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        window.innerHeight
      );

      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = currentY;
      }

      targetY = clampScrollTarget(targetY + pixelDelta, maxScroll);

      if (!isAnimating) {
        isAnimating = true;
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    // Immediately yield if the user uses scrollbar drag, touch, keyboard keys, or programmatic section jump
    const onManualInterrupt = () => {
      if (isAnimating) {
        stopAnimation();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerdown', onManualInterrupt, { passive: true });
    window.addEventListener('keydown', onManualInterrupt, { passive: true });
    window.addEventListener('touchstart', onManualInterrupt, { passive: true });
    window.addEventListener('hashchange', onManualInterrupt, { passive: true });
    window.addEventListener('genovaris:fast-scroll-start', onManualInterrupt);

    return () => {
      stopAnimation();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', onManualInterrupt);
      window.removeEventListener('keydown', onManualInterrupt);
      window.removeEventListener('touchstart', onManualInterrupt);
      window.removeEventListener('hashchange', onManualInterrupt);
      window.removeEventListener('genovaris:fast-scroll-start', onManualInterrupt);
    };
  }, [location.pathname]);

  return null;
}
