import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { ArrowUp } from 'lucide-react';
import {
  computeMonographProgress,
  formatReadingProgressPercent,
  getActiveMonographSection,
  type ActiveMonographSection,
  type MonographSectionMeta,
} from '../utils/readingProgress';
import { IOS_EASE_OUT, IOS_SPRING_SNAPPY } from '../utils/motion';
import { triggerHaptic } from '../utils/haptics';

interface MonographReadingProgressProps {
  productName: string;
  productSlug: string;
  sections: MonographSectionMeta[];
  containerRef: RefObject<HTMLElement | null>;
}

const READING_STRIP_THRESHOLD = 180;

export function MonographReadingProgress({
  productName,
  productSlug,
  sections,
  containerRef,
}: MonographReadingProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 280,
    damping: 34,
    mass: 0.35,
    restDelta: 0.0005,
  });

  const [percent, setPercent] = useState(0);
  const [stripVisible, setStripVisible] = useState(false);
  const [activeSection, setActiveSection] =
    useState<ActiveMonographSection | null>(
      sections.length > 0
        ? {
            id: sections[0].id,
            label: sections[0].label,
            index: 0,
            total: sections.length,
          }
        : null
    );

  useEffect(() => {
    rawProgress.set(0);
    setPercent(0);
    setStripVisible(false);

    let rafId = 0;

    const measure = () => {
      rafId = 0;
      const el = containerRef.current;
      if (!el) return;

      const scrollY = window.scrollY;
      const rect = el.getBoundingClientRect();
      const containerTop = rect.top + scrollY;
      const nextProgress = computeMonographProgress(
        scrollY,
        containerTop,
        rect.height,
        window.innerHeight,
        80
      );

      rawProgress.set(nextProgress);
      const nextPercent = formatReadingProgressPercent(nextProgress);
      setPercent((prev) => (prev === nextPercent ? prev : nextPercent));
      setStripVisible((prev) => {
        const shouldShow = scrollY > READING_STRIP_THRESHOLD;
        return prev === shouldShow ? prev : shouldShow;
      });

      const sectionTops: Array<{ id: string; top: number }> = [];
      for (const section of sections) {
        const node = document.getElementById(section.id);
        if (node) {
          sectionTops.push({
            id: section.id,
            top: node.getBoundingClientRect().top + scrollY,
          });
        }
      }

      const nextActive = getActiveMonographSection(
        sections,
        sectionTops,
        scrollY,
        180
      );

      setActiveSection((prev) => {
        if (!nextActive) return null;
        if (
          prev &&
          prev.id === nextActive.id &&
          prev.index === nextActive.index &&
          prev.total === nextActive.total
        ) {
          return prev;
        }
        return nextActive;
      });
    };

    const scheduleMeasure = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && containerRef.current
        ? new ResizeObserver(scheduleMeasure)
        : null;
    if (resizeObserver && containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [containerRef, productSlug, rawProgress, sections]);

  const handleBackToTop = () => {
    triggerHaptic('selection');
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-16 inset-x-0 z-30 pointer-events-none print:hidden"
      data-testid="monograph-reading-progress"
    >
      {/* Full-width hairline progress bar docked flush below the sticky header */}
      <div
        role="progressbar"
        aria-label={`${productName} clinical monograph reading progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="relative h-[3px] w-full bg-[#E3E9E0]/75 overflow-hidden"
      >
        <motion.div
          style={{
            scaleX: prefersReducedMotion ? rawProgress : smoothProgress,
          }}
          className="h-full w-full origin-left bg-[#173A2C] will-change-transform"
        />
      </div>

      {/* Compact reading status strip — reveals smoothly once reader scrolls past hero */}
      <AnimatePresence>
        {stripVisible && (
          <motion.div
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
            }
            transition={{ duration: 0.22, ease: IOS_EASE_OUT }}
            className="pointer-events-auto border-b border-[#E3E9E0]/85 ios-glass-bar"
          >
            <div className="mx-auto flex h-9 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8 text-[12.5px]">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-[#153226] whitespace-nowrap shrink-0">
                  {productName}
                </span>
                {activeSection && (
                  <>
                    <span
                      aria-hidden="true"
                      className="text-[#9AAEA2] shrink-0"
                    >
                      ·
                    </span>
                    <span className="truncate text-[#4C6156]">
                      {activeSection.label}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[11.5px] font-medium tabular-nums text-[#4C6156]">
                  {percent}% read
                </span>

                {percent >= 20 && (
                  <motion.button
                    type="button"
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                    transition={IOS_SPRING_SNAPPY}
                    onClick={handleBackToTop}
                    aria-label="Scroll back to top of monograph"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium text-[#173A2C] hover:bg-[#E7EEE4] transition-colors cursor-pointer"
                  >
                    <ArrowUp size={12} strokeWidth={2.2} aria-hidden="true" />
                    <span className="hidden sm:inline">Top</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
