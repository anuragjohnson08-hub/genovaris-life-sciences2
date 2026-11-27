import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Send } from 'lucide-react';
import {
  CHAR_DROP_STAGGER_MS,
  CHAR_FLY_STAGGER_MS,
  CHAR_NOPE_STAGGER_MS,
  SPRINGY_MORPH_CONFIG,
  SPRINGY_SHAKE_CONFIG,
  computeFlyPhaseMs,
  computeSuccessHoldMs,
  createSpring,
  isSpringSettled,
  splitAnimatedGlyphs,
  stepSpring,
  tuneSpring,
} from '../utils/springSubmitPhysics';

export interface SubmitFeedbackTrigger {
  kind: 'error' | 'success';
  nonce: number;
}

export interface SpringySubmitButtonProps {
  idleLabel?: string;
  successLabel?: string;
  feedback: SubmitFeedbackTrigger | null;
}

type SpringPhase = 'idle' | 'error' | 'flying' | 'done' | 'returning';

export function SpringySubmitButton({
  idleLabel = 'Submit supply inquiry',
  successLabel = 'Inquiry submitted',
  feedback,
}: SpringySubmitButtonProps) {
  const [phase, setPhase] = useState<SpringPhase>('idle');
  const [charAnimKey, setCharAnimKey] = useState(0);
  const [charAnimMode, setCharAnimMode] = useState<
    'none' | 'nope' | 'fly' | 'drop'
  >('none');

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const idleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const doneMeasureRef = useRef<HTMLSpanElement | null>(null);

  const widthSpringRef = useRef(
    createSpring(0, SPRINGY_MORPH_CONFIG.stiffness, SPRINGY_MORPH_CONFIG.damping)
  );
  const shakeSpringRef = useRef(
    createSpring(0, SPRINGY_SHAKE_CONFIG.stiffness, SPRINGY_SHAKE_CONFIG.damping)
  );
  const widthActiveRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const glyphs = useMemo(() => splitAnimatedGlyphs(idleLabel), [idleLabel]);

  const clearScheduledTimers = () => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  };

  const stopRaf = () => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const startPhysicsLoop = () => {
    if (rafIdRef.current !== null) return;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const shake = shakeSpringRef.current;
      const width = widthSpringRef.current;

      stepSpring(shake, dt);
      if (widthActiveRef.current) {
        stepSpring(width, dt);
      }

      const btn = buttonRef.current;
      if (btn) {
        const tx = Math.abs(shake.x) > 0.04 ? shake.x : 0;
        btn.style.transform = tx !== 0 ? `translateX(${tx.toFixed(2)}px)` : '';
        if (widthActiveRef.current && width.x > 1) {
          btn.style.width = `${width.x.toFixed(2)}px`;
        } else {
          btn.style.width = '';
        }
      }

      const shakeDone = isSpringSettled(shake);
      const widthDone = !widthActiveRef.current || isSpringSettled(width);

      if (shakeDone && widthDone) {
        if (btn) {
          btn.style.transform = '';
          if (!widthActiveRef.current) {
            btn.style.width = '';
          }
        }
        shake.x = 0;
        shake.v = 0;
        rafIdRef.current = null;
        return;
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      clearScheduledTimers();
      stopRaf();
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    clearScheduledTimers();

    if (feedback.kind === 'error') {
      widthActiveRef.current = false;
      if (buttonRef.current) {
        buttonRef.current.style.width = '';
      }

      const shake = shakeSpringRef.current;
      tuneSpring(
        shake,
        SPRINGY_SHAKE_CONFIG.stiffness,
        SPRINGY_SHAKE_CONFIG.damping,
        reducedMotion
      );
      shake.t = 0;
      shake.v += reducedMotion ? 0 : SPRINGY_SHAKE_CONFIG.impulseVelocity;

      setPhase('error');
      setCharAnimMode('nope');
      setCharAnimKey((k) => k + 1);
      startPhysicsLoop();

      const clearErrTimer = window.setTimeout(() => {
        setPhase((current) => (current === 'error' ? 'idle' : current));
      }, 950);
      timersRef.current.push(clearErrTimer);
      return;
    }

    // Success sequence:
    // 1) Characters + icon fly upward in a staggered wave
    // 2) Button width springs smoothly (k=300, c=20) & background morphs to crisp green (#34d17a)
    // 3) SVG checkmark draws its stroke next to "Inquiry submitted"
    // 4) After holding ~2.8s, morphs back to resting width and drops characters back in
    const btn = buttonRef.current;
    const restingWidth =
      btn?.getBoundingClientRect().width ??
      idleMeasureRef.current?.getBoundingClientRect().width ??
      244;
    const doneWidth =
      doneMeasureRef.current?.getBoundingClientRect().width ?? 220;

    setPhase('flying');
    setCharAnimMode('fly');
    setCharAnimKey((k) => k + 1);

    const flyMs = reducedMotion ? 20 : computeFlyPhaseMs(glyphs.length);
    const holdMs = reducedMotion ? 1600 : computeSuccessHoldMs(glyphs.length);

    const morphTimer = window.setTimeout(() => {
      const w = widthSpringRef.current;
      w.x = restingWidth;
      w.v = 0;
      tuneSpring(
        w,
        SPRINGY_MORPH_CONFIG.stiffness,
        SPRINGY_MORPH_CONFIG.damping,
        reducedMotion
      );
      w.t = doneWidth;
      widthActiveRef.current = true;
      setPhase('done');
      startPhysicsLoop();
    }, flyMs);
    timersRef.current.push(morphTimer);

    const resetTimer = window.setTimeout(() => {
      const w = widthSpringRef.current;
      tuneSpring(
        w,
        SPRINGY_MORPH_CONFIG.stiffness * 0.8,
        SPRINGY_MORPH_CONFIG.damping,
        reducedMotion
      );
      w.t = restingWidth;
      widthActiveRef.current = true;
      setPhase('returning');
      setCharAnimMode('drop');
      setCharAnimKey((k) => k + 1);
      startPhysicsLoop();

      const settleTimer = window.setTimeout(() => {
        widthActiveRef.current = false;
        w.x = 0;
        w.t = 0;
        w.v = 0;
        if (buttonRef.current) {
          buttonRef.current.style.width = '';
        }
        setPhase('idle');
        setCharAnimMode('none');
      }, 620);
      timersRef.current.push(settleTimer);
    }, holdMs);
    timersRef.current.push(resetTimer);
  }, [feedback, glyphs.length]);

  const isDone = phase === 'done';
  const isError = phase === 'error';
  const isBusy = phase === 'flying' || phase === 'done';

  const getCharClassName = () => {
    if (charAnimMode === 'nope') return 'springy-ch springy-ch-nope';
    if (charAnimMode === 'fly') return 'springy-ch springy-ch-fly';
    if (charAnimMode === 'drop') return 'springy-ch springy-ch-drop';
    return 'springy-ch';
  };

  const getStaggerMs = (index: number) => {
    if (charAnimMode === 'nope') return index * CHAR_NOPE_STAGGER_MS;
    if (charAnimMode === 'fly') return index * CHAR_FLY_STAGGER_MS;
    if (charAnimMode === 'drop') return Math.min(index, 26) * CHAR_DROP_STAGGER_MS;
    return 0;
  };

  const iconClassName =
    charAnimMode === 'fly'
      ? 'springy-ch springy-ch-fly shrink-0'
      : charAnimMode === 'nope'
        ? 'springy-ch springy-ch-nope shrink-0'
        : charAnimMode === 'drop'
          ? 'springy-ch springy-ch-drop shrink-0'
          : 'shrink-0';

  return (
    <button
      ref={buttonRef}
      type="submit"
      disabled={isBusy}
      aria-label={isDone ? successLabel : idleLabel}
      aria-busy={isBusy}
      data-spring-state={phase}
      className={`relative inline-flex min-h-[50px] items-center justify-center overflow-hidden rounded-full px-7 py-3 text-[15px] font-medium transition-[background-color,box-shadow,color] duration-300 select-none will-change-[width,transform] ${
        isDone
          ? 'springy-btn-ok bg-[#34D17A] text-[#04140A] cursor-default'
          : isError
            ? 'bg-[#173A2C] text-white shadow-[inset_0_0_0_2px_#FF9F0A] hover:bg-[#102B20] cursor-pointer'
            : 'bg-[#173A2C] text-white hover:bg-[#102B20] active:scale-[0.98] cursor-pointer'
      }`}
    >
      {/* Hidden intrinsic width probes so spring morph targets exact pill sizes */}
      <span
        ref={idleMeasureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute inline-flex items-center gap-2 whitespace-nowrap px-7"
      >
        <Send size={15} strokeWidth={1.9} />
        <span>{idleLabel}</span>
      </span>
      <span
        ref={doneMeasureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute inline-flex items-center gap-2 whitespace-nowrap px-7 font-semibold"
      >
        <span className="inline-block h-5 w-5" />
        <span>{successLabel}</span>
      </span>

      {/* Idle / Flying / Error / Returning Layer */}
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-opacity duration-200 ${
          isDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <span
          key={`icon-${charAnimKey}`}
          className={iconClassName}
          style={{ '--springy-d': '0ms' } as CSSProperties}
        >
          <Send size={15} strokeWidth={1.9} />
        </span>
        <span className="inline-flex items-center whitespace-pre">
          {glyphs.map((glyph, index) => (
            <span
              key={`${charAnimKey}-${index}`}
              className={getCharClassName()}
              style={
                {
                  '--springy-d': `${getStaggerMs(index)}ms`,
                } as CSSProperties
              }
            >
              {glyph}
            </span>
          ))}
        </span>
      </span>

      {/* Green Morphed Confirmation Layer with SVG Checkmark Draw */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-[#04140A] transition-[opacity,transform] ${
          isDone
            ? 'opacity-100 scale-100 duration-500 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)]'
            : 'opacity-0 scale-90 duration-150'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            className="springy-check-path"
          />
        </svg>
        <span>{successLabel}</span>
      </span>
    </button>
  );
}
