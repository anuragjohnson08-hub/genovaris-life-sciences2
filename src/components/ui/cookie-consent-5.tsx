import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { triggerHaptic } from '@/utils/haptics';
import {
  COOKIE_BITE_SPRINGS,
  buildCookieBiteGeometry,
  computeCookieCardMorph,
  createCrumbPool,
  createInitialFlickState,
  createSpring,
  isSpringSettled,
  spawnCrumbBurst,
  stepCrumbParticle,
  stepFlickPhysics,
  stepSpring,
  tuneSpring,
  type FlickPhysicsState,
  type SpringState,
} from '@/utils/cookieBitePhysics';

const categories = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description: 'Required for the site to function. Always on.',
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how the product is used.',
    required: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Used to personalize ads and measure campaigns.',
    required: false,
  },
] as const;

const CRUMB_COUNT = 18;
const PILL_HEIGHT = 48;

interface SimTimer {
  remaining: number;
  fn: () => void;
}

type ConfirmOutcome = 'accept' | 'save' | 'reject';

export default function CookieConsentBlock() {
  const ctx = useCookieConsent();
  const uid = useId().replace(/:/g, '');
  const doughGradId = `cookie-dough-${uid}`;
  const chipGradId = `cookie-chip-${uid}`;
  const dentGradId = `cookie-dent-${uid}`;
  const biteMaskId = `cookie-bites-${uid}`;

  // Fallback local state if rendered standalone outside CookieConsentProvider
  const [localOpen, setLocalOpen] = useState(true);
  const [localExpanded, setLocalExpanded] = useState(false);
  const [localPrefs, setLocalPrefs] = useState({
    analytics: true,
    marketing: false,
  });

  const open = ctx ? ctx.isOpen : localOpen;
  const expanded = ctx ? ctx.isExpanded : localExpanded;
  const prefs = ctx ? ctx.draftPrefs : localPrefs;

  const setExpanded = ctx ? ctx.setIsExpanded : setLocalExpanded;
  const setPrefs = ctx ? ctx.setDraftPrefs : setLocalPrefs;

  const [isAnimatingOutcome, setIsAnimatingOutcome] = useState(false);
  const [doneState, setDoneState] = useState<{
    message: string;
    positive: boolean;
  }>({
    message: 'Cookies accepted',
    positive: true,
  });

  const biteClusters = useMemo(() => buildCookieBiteGeometry(), []);

  // DOM refs for 60–120fps direct spring rendering (zero React re-renders per frame)
  const cardRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef<HTMLDivElement | null>(null);
  const cookieRef = useRef<SVGSVGElement | null>(null);
  const tickRef = useRef<SVGPathElement | null>(null);
  const acceptBtnRef = useRef<HTMLButtonElement | null>(null);
  const rejectBtnRef = useRef<HTMLButtonElement | null>(null);
  const biteCircleRefs = useRef<Array<SVGCircleElement | null>>([]);
  const crumbElsRef = useRef<Array<HTMLSpanElement | null>>([]);

  // Mutable physics state stored in ref for the active modal lifecycle
  const simRef = useRef<{
    M: SpringState;
    WW: SpringState;
    HH: SpringState;
    CS: SpringState;
    CR: SpringState;
    CY: SpringState;
    PY: SpringState;
    PN: SpringState;
    TK: SpringState;
    biteSprings: SpringState[];
    crumbs: ReturnType<typeof createCrumbPool>;
    crumbCursor: number;
    flick: FlickPhysicsState | null;
    timers: SimTimer[];
    w0: number;
    h0: number;
    w1: number;
    busy: boolean;
    reducedMotion: boolean;
  } | null>(null);

  const commitDecisionRef = useRef<(outcome: ConfirmOutcome) => void>(() => {});
  commitDecisionRef.current = (outcome: ConfirmOutcome) => {
    setIsAnimatingOutcome(false);
    if (ctx) {
      if (outcome === 'accept') {
        ctx.acceptAll();
      } else if (outcome === 'save') {
        ctx.savePreferences();
      } else {
        ctx.rejectAll();
      }
    } else {
      setLocalOpen(false);
    }
  };

  const handleDismiss = useCallback(() => {
    if (simRef.current?.busy) return;
    if (ctx) {
      ctx.dismiss();
    } else {
      setLocalOpen(false);
    }
  }, [ctx]);

  // Escape key closes modal when not mid-bite animation
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleDismiss]);

  const wakeLoopRef = useRef<() => void>(() => {});

  // Helper to measure card body and confirmation pill dimensions
  const syncMeasurements = useCallback((snapInitial = false) => {
    const sim = simRef.current;
    const body = bodyRef.current;
    const done = doneRef.current;
    if (!sim || !body) return;

    const maxW = Math.min(488, Math.max(280, window.innerWidth - 32));
    body.style.width = `${maxW}px`;
    const h0 = body.offsetHeight;
    const w1 = done ? Math.max(done.offsetWidth, 180) : 204;

    sim.w0 = maxW;
    sim.h0 = h0;
    sim.w1 = w1;

    sim.WW.t = sim.M.t > 0.5 ? w1 : maxW;
    sim.HH.t = sim.M.t > 0.5 ? PILL_HEIGHT : h0;

    if (snapInitial || sim.WW.x === 0 || sim.HH.x === 0) {
      sim.WW.x = sim.WW.t;
      sim.WW.v = 0;
      sim.HH.x = sim.HH.t;
      sim.HH.v = 0;
    }

    wakeLoopRef.current();
  }, []);

  // Re-measure when Customize expands or done message changes
  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => syncMeasurements(false));
    return () => window.cancelAnimationFrame(raf);
  }, [open, expanded, doneState.message, syncMeasurements]);

  // Main Cookie Bite spring engine lifecycle while modal is open
  useEffect(() => {
    if (!open) {
      simRef.current = null;
      setIsAnimatingOutcome(false);
      return;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sim = {
      M: createSpring(0, ...COOKIE_BITE_SPRINGS.soft, reducedMotion),
      WW: createSpring(0, ...COOKIE_BITE_SPRINGS.soft, reducedMotion),
      HH: createSpring(0, ...COOKIE_BITE_SPRINGS.height, reducedMotion),
      CS: createSpring(reducedMotion ? 1 : 0.45, ...COOKIE_BITE_SPRINGS.pop, reducedMotion),
      CR: createSpring(0, ...COOKIE_BITE_SPRINGS.wobble, reducedMotion),
      CY: createSpring(reducedMotion ? 0 : -34, ...COOKIE_BITE_SPRINGS.settle, reducedMotion),
      PY: createSpring(1, ...COOKIE_BITE_SPRINGS.pop, reducedMotion),
      PN: createSpring(1, ...COOKIE_BITE_SPRINGS.pop, reducedMotion),
      TK: createSpring(0, ...COOKIE_BITE_SPRINGS.tick, reducedMotion),
      biteSprings: biteClusters.map(() =>
        createSpring(0, ...COOKIE_BITE_SPRINGS.bite, reducedMotion),
      ),
      crumbs: createCrumbPool(CRUMB_COUNT),
      crumbCursor: 0,
      flick: null as FlickPhysicsState | null,
      timers: [] as SimTimer[],
      w0: 0,
      h0: 0,
      w1: 204,
      busy: false,
      reducedMotion,
    };

    // Fresh cookie drops gently onto the plate when modal opens
    sim.CS.t = 1;
    sim.CY.t = 0;
    simRef.current = sim;

    syncMeasurements(true);

    const onResize = () => syncMeasurements(false);
    window.addEventListener('resize', onResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && bodyRef.current) {
      resizeObserver = new ResizeObserver(() => {
        syncMeasurements(false);
      });
      resizeObserver.observe(bodyRef.current);
    }

    let rafId = 0;
    let lastTime = performance.now();

    const renderFrame = () => {
      const card = cardRef.current;
      const body = bodyRef.current;
      const done = doneRef.current;
      const cookie = cookieRef.current;
      const tick = tickRef.current;
      if (!card || !body) return;

      const morph = computeCookieCardMorph(
        sim.M.x,
        sim.M.t,
        sim.HH.x,
        sim.TK.x,
      );

      const isHeightExpanding = !sim.busy && Math.abs(sim.HH.t - sim.HH.x) > 1.5;
      const nextWidth = `${Math.max(120, sim.WW.x).toFixed(1)}px`;
      const nextHeight = `${Math.max(PILL_HEIGHT, sim.HH.x).toFixed(1)}px`;
      const nextRadius = `${morph.borderRadius.toFixed(1)}px`;
      const nextOverflow =
        morph.overflowHidden || isHeightExpanding ? 'hidden' : 'visible';

      if (card.style.width !== nextWidth) card.style.width = nextWidth;
      if (card.style.height !== nextHeight) card.style.height = nextHeight;
      if (card.style.borderRadius !== nextRadius) card.style.borderRadius = nextRadius;
      if (card.style.overflow !== nextOverflow) card.style.overflow = nextOverflow;

      body.style.opacity = morph.bodyOpacity.toFixed(3);
      body.style.transform = `translate(${((sim.WW.x - sim.w0) / 2).toFixed(1)}px, ${((sim.HH.x - sim.h0) / 2).toFixed(1)}px)`;
      body.style.pointerEvents = sim.M.x > 0.1 || sim.busy ? 'none' : 'auto';

      if (done) {
        done.style.opacity = morph.doneOpacity.toFixed(3);
        done.style.transform = `translate(-50%, -50%) translateY(${morph.doneTranslateY.toFixed(2)}px)`;
      }

      if (tick) {
        tick.style.strokeDashoffset = morph.tickDashOffset.toFixed(4);
      }

      // Update scalloped bite SVG mask circles
      let circleIdx = 0;
      biteClusters.forEach((cluster, bIdx) => {
        const scale = Math.max(0, sim.biteSprings[bIdx].x);
        cluster.circles.forEach((circle) => {
          const el = biteCircleRefs.current[circleIdx++];
          if (el) {
            el.setAttribute('cx', circle.cx.toFixed(2));
            el.setAttribute('cy', circle.cy.toFixed(2));
            el.setAttribute('r', (circle.r * scale).toFixed(2));
          }
        });
      });

      if (cookie) {
        const fx = sim.flick ? sim.flick.x : 0;
        const fy = sim.flick ? sim.flick.y : 0;
        const rot = sim.CR.x * 0.012 + fx / 28;
        const sc = Math.max(0, sim.CS.x);
        cookie.style.transform = `translate(${fx.toFixed(1)}px, ${(fy + sim.CY.x).toFixed(1)}px) rotate(${rot.toFixed(4)}rad) scale(${sc.toFixed(4)})`;
      }

      sim.crumbs.forEach((crumb, idx) => {
        const el = crumbElsRef.current[idx];
        if (!el) return;
        const opacity = crumb.life <= 0 ? 0 : Math.min(1, crumb.life * 3);
        el.style.opacity = opacity.toFixed(2);
        if (opacity > 0) {
          el.style.transform = `translate(${(32 + crumb.x).toFixed(1)}px, ${(32 + crumb.y).toFixed(1)}px) rotate(${crumb.r.toFixed(0)}deg)`;
        }
      });

      if (acceptBtnRef.current) {
        acceptBtnRef.current.style.transform = `scale(${sim.PY.x.toFixed(4)})`;
      }
      if (rejectBtnRef.current) {
        rejectBtnRef.current.style.transform = `scale(${sim.PN.x.toFixed(4)})`;
      }
    };

    const allSprings = [
      sim.M,
      sim.WW,
      sim.HH,
      sim.CS,
      sim.CR,
      sim.CY,
      sim.PY,
      sim.PN,
      sim.TK,
      ...sim.biteSprings,
    ];

    const hasActiveMotion = (): boolean => {
      if (sim.timers.length > 0) return true;
      if (sim.flick && sim.flick.y < 600) return true;
      for (let i = 0; i < sim.crumbs.length; i++) {
        if (sim.crumbs[i].life > 0) return true;
      }
      for (let i = 0; i < allSprings.length; i++) {
        if (!isSpringSettled(allSprings[i], 0.015, 0.04)) return true;
      }
      return false;
    };

    const tickLoop = (now: number) => {
      rafId = 0;
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      for (let i = sim.timers.length - 1; i >= 0; i--) {
        sim.timers[i].remaining -= dt;
        if (sim.timers[i].remaining <= 0) {
          const [fired] = sim.timers.splice(i, 1);
          fired.fn();
        }
      }

      const subSteps = 4;
      const subDt = dt / subSteps;
      for (let s = 0; s < subSteps; s++) {
        for (let i = 0; i < allSprings.length; i++) {
          stepSpring(allSprings[i], subDt);
        }

        if (sim.flick && sim.flick.y < 600) {
          stepFlickPhysics(sim.flick, subDt);
        }

        for (let c = 0; c < sim.crumbs.length; c++) {
          stepCrumbParticle(sim.crumbs[c], subDt);
        }
      }

      if (hasActiveMotion()) {
        renderFrame();
        rafId = window.requestAnimationFrame(tickLoop);
      } else {
        for (let i = 0; i < allSprings.length; i++) {
          allSprings[i].x = allSprings[i].t;
          allSprings[i].v = 0;
        }
        renderFrame();
      }
    };

    const wakeLoop = () => {
      if (rafId === 0) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tickLoop);
      }
    };

    wakeLoopRef.current = wakeLoop;
    renderFrame();
    wakeLoop();

    return () => {
      wakeLoopRef.current = () => {};
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
    };
  }, [open, biteClusters, syncMeasurements]);

  const schedule = (delaySec: number, fn: () => void) => {
    simRef.current?.timers.push({ remaining: delaySec, fn });
    wakeLoopRef.current();
  };

  const triggerFoldToConfirmation = (
    message: string,
    positive: boolean,
    outcome: ConfirmOutcome,
  ) => {
    const sim = simRef.current;
    if (!sim) return;

    setDoneState({ message, positive });

    // Measure updated pill width on next paint, then spring-fold card into pill
    window.requestAnimationFrame(() => {
      const activeSim = simRef.current;
      if (!activeSim) return;
      const pillWidth = doneRef.current
        ? Math.max(doneRef.current.offsetWidth, 184)
        : 204;
      activeSim.w1 = pillWidth;
      activeSim.M.t = 1;
      activeSim.WW.t = pillWidth;
      activeSim.HH.t = PILL_HEIGHT;
      activeSim.TK.x = 0;
      activeSim.TK.v = 0;
      activeSim.TK.t = 0;

      schedule(activeSim.reducedMotion ? 0.08 : 0.28, () => {
        if (simRef.current) {
          simRef.current.TK.t = 1;
        }
      });

      schedule(activeSim.reducedMotion ? 0.95 : 1.55, () => {
        commitDecisionRef.current(outcome);
      });
    });
  };

  const runBiteAndConfirm = (outcome: 'accept' | 'save') => {
    const sim = simRef.current;
    if (!sim || sim.busy) return;

    sim.busy = true;
    setIsAnimatingOutcome(true);
    triggerHaptic('light');
    sim.PY.x = 0.93;
    wakeLoopRef.current();

    const confirmationLabel =
      outcome === 'save' ? 'Preferences saved' : 'Cookies accepted';

    if (sim.reducedMotion) {
      sim.CS.t = 0;
      triggerFoldToConfirmation(confirmationLabel, true, outcome);
      return;
    }

    // Three spring-driven bites with wobble and falling crumbs
    [0, 1, 2].forEach((biteIndex) => {
      schedule(0.1 + biteIndex * 0.27, () => {
        const s = simRef.current;
        if (!s) return;
        const cluster = biteClusters[biteIndex];
        s.biteSprings[biteIndex].t = 1;
        s.CR.v += (biteIndex % 2 ? -1 : 1) * 520;
        s.CS.x = 0.86;
        s.crumbCursor = spawnCrumbBurst(
          s.crumbs,
          s.crumbCursor,
          cluster.x,
          cluster.y,
          5,
          150,
        );
        triggerHaptic('selection');
      });
    });

    // Final crumb burst as the last piece vanishes
    schedule(0.1 + 3 * 0.27, () => {
      const s = simRef.current;
      if (!s) return;
      tuneSpring(s.CS, ...COOKIE_BITE_SPRINGS.vanish, s.reducedMotion);
      s.CS.t = 0;
      s.crumbCursor = spawnCrumbBurst(s.crumbs, s.crumbCursor, 32, 32, 6, 110);
    });

    // Morph card down into the confirmation pill with self-drawing green check
    schedule(1.18, () => {
      const s = simRef.current;
      if (!s) return;
      tuneSpring(s.CS, ...COOKIE_BITE_SPRINGS.pop, s.reducedMotion);
      triggerFoldToConfirmation(confirmationLabel, true, outcome);
    });
  };

  const runRejectAndConfirm = () => {
    const sim = simRef.current;
    if (!sim || sim.busy) return;

    sim.busy = true;
    setIsAnimatingOutcome(true);
    triggerHaptic('selection');
    sim.PN.x = 0.93;
    wakeLoopRef.current();

    if (sim.reducedMotion) {
      sim.CS.t = 0;
      triggerFoldToConfirmation('Essentials only', false, 'reject');
      return;
    }

    // Cookie rolls off the left edge of the card and drops
    sim.flick = createInitialFlickState();
    schedule(0.78, () => {
      triggerFoldToConfirmation('Essentials only', false, 'reject');
    });
  };

  const handlePrimaryAction = () => {
    runBiteAndConfirm(expanded ? 'save' : 'accept');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie preferences"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleDismiss();
            }
          }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#133126]/42 px-4 py-6 sm:items-center"
        >
          {/* Morphing Cookie Consent Card */}
          <div
            ref={cardRef}
            className="relative rounded-[24px] border border-[#D9E2D5] bg-[#FEFDF9] text-[#153226] shadow-[0_24px_64px_rgba(19,49,38,0.22)]"
          >
            {/* Interactive Consent Body */}
            <div
              ref={bodyRef}
              className="absolute left-0 top-0"
            >
              <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Crafted SVG Cookie & Physics Crumbs Plate */}
                  <div className="relative h-16 w-16 shrink-0 select-none">
                    <svg
                      ref={cookieRef}
                      viewBox="0 0 64 64"
                      aria-hidden="true"
                      className="absolute inset-0 h-16 w-16 overflow-visible will-change-transform"
                    >
                      <defs>
                        <radialGradient
                          id={doughGradId}
                          cx=".34"
                          cy=".26"
                          r=".86"
                        >
                          <stop offset="0" stopColor="#F5CA7B" />
                          <stop offset=".5" stopColor="#DF9B42" />
                          <stop offset="1" stopColor="#B87128" />
                        </radialGradient>
                        <radialGradient
                          id={chipGradId}
                          cx=".36"
                          cy=".3"
                          r=".8"
                        >
                          <stop offset="0" stopColor="#6C3E22" />
                          <stop offset="1" stopColor="#2F190C" />
                        </radialGradient>
                        <radialGradient
                          id={dentGradId}
                          cx=".5"
                          cy=".62"
                          r=".6"
                        >
                          <stop offset="0" stopColor="#BA752B" />
                          <stop
                            offset="1"
                            stopColor="#BA752B"
                            stopOpacity="0"
                          />
                        </radialGradient>
                        <mask
                          id={biteMaskId}
                          maskUnits="userSpaceOnUse"
                          x="-8"
                          y="-8"
                          width="80"
                          height="80"
                        >
                          <rect
                            x="-8"
                            y="-8"
                            width="80"
                            height="80"
                            fill="#ffffff"
                          />
                          <g>
                            {biteClusters.flatMap((cluster, clusterIndex) =>
                              cluster.circles.map((_, circleIndex) => {
                                const flatIdx = clusterIndex * 4 + circleIndex;
                                return (
                                  <circle
                                    key={`${cluster.angleDeg}-${circleIndex}`}
                                    ref={(el) => {
                                      biteCircleRefs.current[flatIdx] = el;
                                    }}
                                    cx="0"
                                    cy="0"
                                    r="0"
                                    fill="#000000"
                                  />
                                );
                              }),
                            )}
                          </g>
                        </mask>
                      </defs>

                      <g mask={`url(#${biteMaskId})`}>
                        <circle cx="32" cy="32" r="30" fill="#9E5E20" />
                        <circle
                          cx="32"
                          cy="31.2"
                          r="29"
                          fill={`url(#${doughGradId})`}
                        />
                        <ellipse
                          cx="14"
                          cy="27"
                          rx="3.2"
                          ry="2.4"
                          fill={`url(#${dentGradId})`}
                        />
                        <ellipse
                          cx="34"
                          cy="26"
                          rx="2.6"
                          ry="2"
                          fill={`url(#${dentGradId})`}
                        />
                        <ellipse
                          cx="50"
                          cy="42"
                          rx="2.8"
                          ry="2.2"
                          fill={`url(#${dentGradId})`}
                        />
                        <ellipse
                          cx="27"
                          cy="43"
                          rx="2.2"
                          ry="1.7"
                          fill={`url(#${dentGradId})`}
                        />
                        <g>
                          <circle cx="22" cy="19" r="4.4" fill={`url(#${chipGradId})`} />
                          <circle cx="41" cy="16" r="3.3" fill={`url(#${chipGradId})`} />
                          <circle cx="46" cy="31" r="4.2" fill={`url(#${chipGradId})`} />
                          <circle cx="30" cy="34" r="3.5" fill={`url(#${chipGradId})`} />
                          <circle cx="17" cy="38" r="3.1" fill={`url(#${chipGradId})`} />
                          <circle cx="38" cy="48" r="4.4" fill={`url(#${chipGradId})`} />
                          <circle cx="24" cy="51" r="2.7" fill={`url(#${chipGradId})`} />
                        </g>
                      </g>
                    </svg>

                    {/* Physics-driven falling dough & chocolate crumbs */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 h-0 w-0"
                    >
                      {Array.from({ length: CRUMB_COUNT }, (_, idx) => (
                        <span
                          key={idx}
                          ref={(el) => {
                            crumbElsRef.current[idx] = el;
                          }}
                          className={`absolute left-0 top-0 -m-[2.5px] h-[5px] w-[5px] rounded-[2px] opacity-0 will-change-[transform,opacity] ${
                            idx % 3 === 2 ? 'bg-[#4D2A15]' : 'bg-[#DF9B42]'
                          }`}
                        />
                      ))}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <h2 className="font-heading text-[16px] font-semibold tracking-tight text-[#153226]">
                      We value your privacy
                    </h2>
                    <p className="text-[13.5px] leading-relaxed text-[#4C6156]">
                      We use cookies to improve your experience, analyze
                      traffic, and personalize content. Choose which cookies to
                      allow.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isAnimatingOutcome}
                  aria-label="Dismiss"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4C6156] transition-colors hover:bg-[#EAF0E7] hover:text-[#153226] disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              {expanded && (
                <div>
                  <Separator />
                  <div className="flex flex-col gap-4 p-5 sm:px-6">
                    {categories.map((category) => {
                      const switchId = `cookie-switch-${category.id}`;
                      return (
                        <div
                          key={category.id}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="flex flex-col gap-1">
                            <Label
                              htmlFor={switchId}
                              className="cursor-pointer text-sm font-medium text-[#153226]"
                            >
                              {category.label}
                            </Label>
                            <span className="text-xs leading-relaxed text-[#4C6156]">
                              {category.description}
                            </span>
                          </div>
                          {category.required ? (
                            <Switch
                              id={switchId}
                              checked
                              disabled
                              aria-label={category.label}
                            />
                          ) : (
                            <Switch
                              id={switchId}
                              disabled={isAnimatingOutcome}
                              checked={prefs[category.id]}
                              onCheckedChange={(checked) => {
                                triggerHaptic('selection');
                                setPrefs((prev) => ({
                                  ...prev,
                                  [category.id]: checked,
                                }));
                              }}
                              aria-label={category.label}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator />
              <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
                {!expanded && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isAnimatingOutcome}
                    onClick={() => {
                      triggerHaptic('selection');
                      setExpanded(true);
                    }}
                    className="sm:mr-auto cursor-pointer"
                  >
                    Customize
                  </Button>
                )}
                <Button
                  ref={rejectBtnRef}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAnimatingOutcome}
                  onClick={runRejectAndConfirm}
                  className="rounded-full px-4 will-change-transform cursor-pointer"
                >
                  Reject all
                </Button>
                <Button
                  ref={acceptBtnRef}
                  type="button"
                  size="sm"
                  disabled={isAnimatingOutcome}
                  onClick={handlePrimaryAction}
                  className="rounded-full px-5 will-change-transform cursor-pointer"
                >
                  {expanded ? 'Save preferences' : 'Accept all'}
                </Button>
              </div>
            </div>

            {/* Compact Confirmation Pill shown after Cookie Bite / Flick morph */}
            <div
              ref={doneRef}
              aria-live="polite"
              className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 items-center gap-2.5 whitespace-nowrap pl-4 pr-5 text-[14px] font-medium text-[#153226] opacity-0 will-change-[opacity,transform]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 rounded-full ${
                  doneState.positive ? 'bg-[#22B568]' : 'bg-[#DFE7DC]'
                }`}
              >
                <path
                  ref={tickRef}
                  pathLength={1}
                  d="M6 12.5l4 4 8-9"
                  fill="none"
                  stroke={doneState.positive ? '#FFFFFF' : '#173A2C'}
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1 1"
                  strokeDashoffset="1"
                />
              </svg>
              <span>{doneState.message}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
