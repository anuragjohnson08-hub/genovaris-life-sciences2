import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Search, X } from 'lucide-react';
import { SectionKicker } from '../components/SectionKicker';
import { FormulationCard } from '../components/FormulationCard';
import { PharmacyShelfShowcase } from '../components/PharmacyShelfShowcase';
import { ResponsibleUsePage } from './ResponsibleUsePage';
import { ConsultationsPage } from './ConsultationsPage';
import { DisclaimerPage } from './DisclaimerPage';
import { useRegimen } from '../context/RegimenContext';
import type { TherapeuticCategory } from '../types/medicine';
import { filterFormulations } from '../utils/regimenLogic';
import { triggerHaptic } from '../utils/haptics';
import { resolvePublicAssetUrl } from '../utils/assetUrl';
import {
  IOS_EASE_OUT,
  IOS_REVEAL_TRANSITION,
  IOS_SPRING_HOVER,
  IOS_SPRING_SCROLL,
  IOS_SPRING_SNAPPY,
  IOS_VIEWPORT_REVEAL,
} from '../utils/motion';
import {
  fastScrollToSection,
  handleInPageAnchorClick,
  resolveSectionIdFromPathOrHash,
  type HomeSectionId,
} from '../utils/sectionNavigation';

const HOME_FILTER_OPTIONS: Array<{ value: TherapeuticCategory; label: string }> = [
  { value: 'all', label: 'All medicines (4)' },
  { value: 'bone-skeletal', label: 'Bone & Skeletal' },
  { value: 'hematinic-maternal', label: 'Hematinic & Maternal' },
  { value: 'neuro-cognitive', label: 'Neuro & Cognitive' },
  { value: 'clinical-nutrition', label: 'High-Protein Nutrition' },
];

export interface HomePageProps {
  initialSection?: HomeSectionId;
}

export function HomePage({ initialSection }: HomePageProps) {
  const { products } = useRegimen();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] =
    useState<TherapeuticCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [heroCtaHovered, setHeroCtaHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const heroSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });
  const smoothHeroScroll = useSpring(heroScrollProgress, IOS_SPRING_SCROLL);
  const heroImageY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -20],
  );
  const heroImageScale = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1.03, 1.08],
  );

  // Fast-scroll to the target section when arriving from another route or direct URL
  useEffect(() => {
    const navState = location.state as { scrollHandled?: boolean } | null;
    if (navState?.scrollHandled) return;

    const targetSection =
      resolveSectionIdFromPathOrHash(location.pathname, location.hash) ??
      initialSection ??
      null;

    if (!targetSection) return;

    let innerFrameId = 0;
    const outerFrameId = window.requestAnimationFrame(() => {
      innerFrameId = window.requestAnimationFrame(() => {
        fastScrollToSection(targetSection);
      });
    });

    return () => {
      window.cancelAnimationFrame(outerFrameId);
      if (innerFrameId !== 0) {
        window.cancelAnimationFrame(innerFrameId);
      }
    };
  }, [location.pathname, location.hash, location.state, initialSection]);

  const visibleProducts = useMemo(
    () =>
      filterFormulations(products, {
        category: selectedCategory,
        query: searchQuery,
      }),
    [products, selectedCategory, searchQuery],
  );

  const revealInitial = prefersReducedMotion ? false : { opacity: 0, y: 18 };
  const revealAnimate = { opacity: 1, y: 0 };

  return (
    <div>
      {/* Section 1: Hero Card */}
      <section
        id="top"
        ref={heroSectionRef}
        className="mx-auto max-w-6xl px-5 sm:px-8 pt-6 pb-14 sm:pt-9 sm:pb-20"
      >
        <div className="overflow-hidden rounded-[28px] bg-[#EDF3EA] border border-[#E1EAE0]/80 shadow-[0_8px_30px_rgba(21,50,38,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center px-6 py-10 sm:px-11 sm:py-14 lg:py-16">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: IOS_EASE_OUT }}
              >
                <SectionKicker label="Genovaris Lifesciences" />
              </motion.div>

              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.46, delay: 0.06, ease: IOS_EASE_OUT }}
                className="mt-5 font-display text-[clamp(2.25rem,4.1vw,3.45rem)] font-semibold leading-[1.09] tracking-[-0.02em] text-[#153226]"
              >
                A thoughtful place to explore wellness.
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.46, delay: 0.12, ease: IOS_EASE_OUT }}
                className="mt-5 max-w-lg text-[16.5px] leading-[1.65] text-[#4C6156]"
              >
                Explore our four core formulations—Bonebro™, RED-XT™,
                CEREBRA-CB™, and Protizen-HP™—with plain-language overviews,
                dosage guides, and direct supply access.
              </motion.p>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.46, delay: 0.18, ease: IOS_EASE_OUT }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <motion.div
                  whileHover={
                    prefersReducedMotion ? undefined : { y: -5, scale: 1.015 }
                  }
                  whileTap={{ scale: 0.97 }}
                  transition={IOS_SPRING_HOVER}
                  className="will-change-transform"
                >
                  <a
                    href="#products"
                    onClick={(e) => {
                      triggerHaptic('light');
                      handleInPageAnchorClick(e, 'products');
                    }}
                    onMouseEnter={() => setHeroCtaHovered(true)}
                    onMouseLeave={() => setHeroCtaHovered(false)}
                    onFocus={() => setHeroCtaHovered(true)}
                    onBlur={() => setHeroCtaHovered(false)}
                    className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#173A2C] px-7 py-3 text-[15px] font-medium text-white whitespace-nowrap hover:bg-[#102B20] shadow-[0_6px_18px_rgba(23,58,44,0.16)] hover:shadow-[0_16px_32px_rgba(23,58,44,0.28)] transition-[background-color,box-shadow] duration-300 ease-out"
                  >
                    <span>Explore products</span>
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      animate={
                        prefersReducedMotion || !heroCtaHovered
                          ? { x: 0 }
                          : { x: [0, 7, 0] }
                      }
                      transition={
                        prefersReducedMotion || !heroCtaHovered
                          ? IOS_SPRING_HOVER
                          : {
                              duration: 0.95,
                              repeat: Infinity,
                              repeatType: 'loop',
                              ease: [0.45, 0, 0.55, 1],
                            }
                      }
                      className="shrink-0 will-change-transform"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </motion.svg>
                  </a>
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.97 }}
                  transition={IOS_SPRING_SNAPPY}
                >
                  <a
                    href="#contact"
                    onClick={(e) => {
                      triggerHaptic('selection');
                      handleInPageAnchorClick(e, 'contact');
                    }}
                    className="group underline-trigger inline-flex min-h-[44px] items-center px-2 text-[14.5px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors whitespace-nowrap"
                  >
                    <span className="link-underline-center">
                      Contact for supply
                    </span>
                  </a>
                </motion.div>
              </motion.div>
            </div>

            <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[360px] lg:min-h-[480px] overflow-hidden bg-[#DCE4DA]">
              {!heroImgFailed ? (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0.85 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.65, ease: IOS_EASE_OUT }}
                  className="h-full w-full"
                >
                  <motion.img
                    src={resolvePublicAssetUrl('assets/hero-botanical.webp')}
                    alt="Sunlit eucalyptus leaves and medicinal botanical stems casting gentle shadows against a warm plaster wall"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    style={{ y: heroImageY, scale: heroImageScale }}
                    className="h-full w-full object-cover object-center will-change-transform"
                  />
                </motion.div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#DCE6DA] via-[#E9EFE5] to-[#D4DFD1] p-10 text-center">
                  <p className="text-sm font-medium text-[#4C6156]">
                    Genovaris Lifesciences
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Products Catalog + Retail Shelf Showcase */}
      <section
        id="products"
        aria-labelledby="product-info-heading"
        className="mx-auto max-w-6xl px-5 sm:px-8 pb-20 sm:pb-24"
      >
        <motion.div
          initial={revealInitial}
          whileInView={revealAnimate}
          viewport={IOS_VIEWPORT_REVEAL}
          transition={IOS_REVEAL_TRANSITION}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <SectionKicker label="Explore the Range" />
            <h2
              id="product-info-heading"
              className="mt-3.5 text-[clamp(1.85rem,3.1vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[#153226]"
            >
              Available medicines &amp; nutrition
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[#4C6156]">
              Quick, plain-language highlights for every available Genovaris
              Lifesciences formulation, with full clinical monographs one click
              away.
            </p>
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B7266]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ingredient, or use..."
              aria-label="Search Genovaris medicines"
              className="w-full min-h-[44px] rounded-full border border-[#D4DFD2] bg-[#FEFDF9] pl-10 pr-10 text-[14px] text-[#153226] placeholder:text-[#6E8478] focus:border-[#173A2C] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setSearchQuery('');
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#5B7266] hover:bg-[#EDF3EA] hover:text-[#153226] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Interactive Segmented Filter Bar */}
        <motion.div
          initial={revealInitial}
          whileInView={revealAnimate}
          viewport={IOS_VIEWPORT_REVEAL}
          transition={{ ...IOS_REVEAL_TRANSITION, delay: 0.05 }}
          role="tablist"
          aria-label="Filter medicines by therapeutic focus"
          className="mt-7 flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
        >
          {HOME_FILTER_OPTIONS.map((option) => {
            const active = selectedCategory === option.value;
            return (
              <motion.button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                whileTap={{ scale: 0.96 }}
                transition={IOS_SPRING_SNAPPY}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedCategory(option.value);
                }}
                className={`relative min-h-[40px] rounded-full px-4 py-2 text-[13.5px] font-medium whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'text-[#4C6156] hover:bg-[#EAF0E7] hover:text-[#153226]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="home-category-segment"
                    transition={IOS_SPRING_SNAPPY}
                    className="absolute inset-0 rounded-full bg-[#173A2C]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* 2x2 Showcase Grid for Real Products */}
        {visibleProducts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-10 text-center">
            <p className="text-[17px] font-semibold text-[#153226]">
              No matching medicines found.
            </p>
            <p className="mt-1.5 text-[14.5px] text-[#4C6156]">
              Try clearing your search or switching back to all formulations.
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-5 inline-flex min-h-[42px] items-center rounded-full bg-[#173A2C] px-5 py-2 text-[14px] font-medium text-white hover:bg-[#102B20] transition-colors cursor-pointer"
            >
              Show all 4 medicines
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-7">
            {visibleProducts.map((product, idx) => (
              <FormulationCard key={product.slug} product={product} index={idx} />
            ))}
          </div>
        )}

        {/* Store Medicine Box Shelf Showcase */}
        <motion.div
          initial={revealInitial}
          whileInView={revealAnimate}
          viewport={IOS_VIEWPORT_REVEAL}
          transition={IOS_REVEAL_TRANSITION}
          className="mt-14"
        >
          <PharmacyShelfShowcase products={products} />
        </motion.div>
      </section>

      {/* Section 3: Full Responsible Use Section */}
      <ResponsibleUsePage embedded />

      {/* Section 4: Full Supply & Contact Section */}
      <ConsultationsPage embedded />

      {/* Section 5: Full Clinical & Regulatory Disclaimer Section */}
      <DisclaimerPage embedded />
    </div>
  );
}
