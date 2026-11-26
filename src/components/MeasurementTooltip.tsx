import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle, Ruler, X } from 'lucide-react';
import type { MeasurementTip } from '../utils/dosageMeasurementTips';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_SNAPPY } from '../utils/motion';

interface MeasurementTooltipProps {
  tip: MeasurementTip;
  triggerLabel: string;
  ariaLabel: string;
  variant?: 'pill' | 'icon';
  align?: 'left' | 'right' | 'auto';
}

export function MeasurementTooltip({
  tip,
  triggerLabel,
  ariaLabel,
  variant = 'icon',
  align = 'right',
}: MeasurementTooltipProps) {
  const tooltipId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [resolvedAlign, setResolvedAlign] = useState<'left' | 'right'>(
    align === 'left' ? 'left' : 'right'
  );
  const [nudgeX, setNudgeX] = useState(0);

  const isOpen = pinned || hovered;

  useEffect(() => {
    if (!isOpen) {
      setNudgeX(0);
      return;
    }

    if (align === 'auto' && containerRef.current) {
      const triggerRect = containerRef.current.getBoundingClientRect();
      const cardEl = containerRef.current.closest('[data-tooltip-bounds]');
      const boundsRight = cardEl
        ? cardEl.getBoundingClientRect().right - 12
        : window.innerWidth - 12;
      const estimatedWidth = Math.min(284, window.innerWidth - 32);
      setResolvedAlign(
        triggerRect.left + estimatedWidth <= boundsRight ? 'left' : 'right'
      );
    } else {
      setResolvedAlign(align === 'left' ? 'left' : 'right');
    }

    const clampToViewport = () => {
      const el = tooltipRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pad = 12;
      let delta = 0;
      if (rect.left < pad) {
        delta = pad - rect.left;
      } else if (rect.right > window.innerWidth - pad) {
        delta = window.innerWidth - pad - rect.right;
      }
      if (delta !== 0) {
        setNudgeX((prev) => Math.round(prev + delta));
      }
    };

    const rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(clampToViewport);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinned(false);
        setHovered(false);
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setPinned(false);
        setHovered(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen, align]);

  const handleToggle = () => {
    triggerHaptic('selection');
    setPinned((prev) => !prev);
  };

  const alignmentClasses =
    resolvedAlign === 'left'
      ? 'left-0 origin-top-left'
      : 'right-0 origin-top-right';

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {variant === 'pill' ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={IOS_SPRING_SNAPPY}
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls={tooltipId}
          aria-label={ariaLabel}
          className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer ${
            isOpen
              ? 'border-[#173A2C] bg-[#173A2C] text-white'
              : 'border-[#C6D5C4] bg-[#FEFDF9] text-[#2F4D3E] hover:border-[#173A2C] hover:text-[#153226]'
          }`}
        >
          <Ruler size={12.5} strokeWidth={2} aria-hidden="true" />
          <span>{triggerLabel}</span>
        </motion.button>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls={tooltipId}
          aria-label={ariaLabel}
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173A2C] cursor-pointer ${
            isOpen
              ? 'bg-[#173A2C] text-white'
              : 'text-[#5C7568] hover:bg-[#DCE7D9] hover:text-[#153226]'
          }`}
        >
          <HelpCircle size={13.5} strokeWidth={2} aria-hidden="true" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 5, scale: 0.97, x: nudgeX }}
            animate={{ opacity: 1, y: 0, scale: 1, x: nudgeX }}
            exit={{ opacity: 0, y: 3, scale: 0.97, x: nudgeX }}
            transition={IOS_SPRING_SNAPPY}
            className={`absolute top-full z-40 mt-2 w-[min(284px,calc(100vw-2rem))] rounded-2xl border border-[#CBD7C8] bg-[#FEFDF9] p-4 text-left shadow-[0_14px_34px_rgba(19,49,38,0.16)] ${alignmentClasses}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.11em] text-[#4B6859]">
                {tip.badge}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  triggerHaptic('selection');
                  setPinned(false);
                  setHovered(false);
                }}
                aria-label="Close measurement guide"
                className="inline-flex h-6 w-6 -mr-1 -mt-1 items-center justify-center rounded-full text-[#556B5F] hover:bg-[#EDF3EA] hover:text-[#153226] cursor-pointer"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>

            <p className="mt-1 text-[13.5px] font-bold leading-snug text-[#153226]">
              {tip.title}
            </p>

            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#4C6156]">
              {tip.howToMeasure}
            </p>

            <div className="mt-2.5 rounded-xl border border-[#E2EAE0] bg-[#EDF3EA]/80 px-3 py-2">
              <p className="font-mono text-[11.5px] font-semibold leading-snug tabular-nums text-[#153226]">
                {tip.practicalEquivalent}
              </p>
            </div>

            <p className="mt-2 text-[11.5px] leading-[1.5] text-[#5B7065]">
              {tip.precisionNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
