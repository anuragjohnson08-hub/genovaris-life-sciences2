import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bookmark, Menu, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useRegimen } from '../context/RegimenContext';
import { triggerHaptic } from '../utils/haptics';
import {
  IOS_SPRING_HOVER,
  IOS_SPRING_SHEET,
  IOS_SPRING_SNAPPY,
} from '../utils/motion';
import {
  FAST_SCROLL_EVENT,
  HOME_SECTION_IDS,
  computeActiveHomeSection,
  resolveSectionIdFromPathOrHash,
  scrollToDocumentAnchor,
  type HomeSectionId,
  type SectionOffset,
} from '../utils/sectionNavigation';

const NAV_ITEMS: Array<{
  sectionId: HomeSectionId;
  to: string;
  label: string;
}> = [
  { sectionId: 'products', to: '/#products', label: 'Products' },
  {
    sectionId: 'responsible-use',
    to: '/#responsible-use',
    label: 'Responsible Use',
  },
  { sectionId: 'contact', to: '/#contact', label: 'Supply & Contact' },
  { sectionId: 'disclaimer', to: '/#disclaimer', label: 'Disclaimer' },
];

export function Navbar() {
  const { regimen, isRegimenOpen, openRegimen, closeRegimen } = useRegimen();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<HomeSectionId | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();

  const isDetailPage = location.pathname.startsWith('/products/');
  const isOnePageHome = !isDetailPage;

  // Live Scroll-Spy across the 4 one-page Home sections
  useEffect(() => {
    if (!isOnePageHome) {
      setActiveSection('products');
      return;
    }

    let rafId = 0;

    const updateActive = () => {
      rafId = 0;
      const offsets: SectionOffset[] = [];
      for (const id of HOME_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          offsets.push({
            id,
            top: el.getBoundingClientRect().top + window.scrollY,
          });
        }
      }

      const detected = computeActiveHomeSection(
        offsets,
        window.scrollY,
        132,
        window.innerHeight,
        document.documentElement.scrollHeight,
      );
      setActiveSection(detected);
    };

    const onScrollOrResize = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateActive);
      }
    };

    const onHashChange = () => {
      const hashTarget = resolveSectionIdFromPathOrHash(
        window.location.pathname,
        window.location.hash,
      );
      if (hashTarget) {
        setActiveSection(hashTarget);
      } else if (window.location.hash === '#top') {
        setActiveSection(null);
      }
      onScrollOrResize();
    };

    // Sync immediately on mount or hash/path change
    const initialTarget = resolveSectionIdFromPathOrHash(
      location.pathname,
      window.location.hash || location.hash,
    );
    if (initialTarget) {
      setActiveSection(initialTarget);
    } else {
      updateActive();
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('hashchange', onHashChange, { passive: true });

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [isOnePageHome, location.pathname, location.hash]);

  const handleBrandHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerHaptic('selection');
    setMobileMenuOpen(false);
    if (isRegimenOpen) {
      closeRegimen();
    }
    if (isOnePageHome) {
      window.dispatchEvent(new CustomEvent(FAST_SCROLL_EVENT));
      setActiveSection(null);
      if (window.location.hash === '#top') {
        e.preventDefault();
        scrollToDocumentAnchor('top');
      }
    }
  };

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: HomeSectionId,
  ) => {
    triggerHaptic('selection');
    setMobileMenuOpen(false);
    if (isRegimenOpen) {
      closeRegimen();
    }

    if (isOnePageHome) {
      window.dispatchEvent(new CustomEvent(FAST_SCROLL_EVENT));
      setActiveSection(sectionId);
      if (window.location.hash === `#${sectionId}`) {
        e.preventDefault();
        scrollToDocumentAnchor(sectionId);
      }
    }
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  const renderDesktopNavContent = (
    item: (typeof NAV_ITEMS)[number],
    isActive: boolean,
    isHovered: boolean,
  ): ReactNode => (
    <>
      <motion.span
        animate={prefersReducedMotion ? undefined : { y: isHovered ? -2 : 0 }}
        transition={IOS_SPRING_HOVER}
        className="inline-block will-change-transform"
      >
        {item.label}
      </motion.span>
      {!isActive && (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={
            prefersReducedMotion
              ? {
                  opacity: isHovered ? 0.65 : 0,
                  clipPath:
                    'inset(1px calc(0% + 0px) 1px calc(0% + 0px) round 9999px)',
                  scale: 1,
                }
              : isHovered
                ? {
                    opacity: 0.72,
                    scale: 1,
                    clipPath:
                      'inset(1px calc(0% + 0px) 1px calc(0% + 0px) round 9999px)',
                  }
                : {
                    opacity: 0,
                    scale: 0.35,
                    clipPath:
                      'inset(0px calc(50% - 2px) 0px calc(50% - 2px) round 9999px)',
                  }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.15 }
              : isHovered
                ? {
                    opacity: {
                      duration: 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    scale: {
                      duration: 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    clipPath: {
                      duration: 0.32,
                      delay: 0.085,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }
                : {
                    clipPath: {
                      duration: 0.24,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    scale: {
                      duration: 0.17,
                      delay: 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    opacity: {
                      duration: 0.15,
                      delay: 0.13,
                      ease: 'easeOut',
                    },
                  }
          }
          className="pointer-events-none absolute inset-x-0 -bottom-1 h-[4px] origin-center bg-[#173A2C] will-change-[clip-path,transform,opacity]"
        />
      )}
      {isActive && (
        <motion.span
          layoutId="genovaris-nav-underline"
          transition={IOS_SPRING_SNAPPY}
          className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[#173A2C] will-change-transform"
        />
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E3E9E0]/85 ios-glass-bar">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-5 sm:px-8">
          {/* Zone 1: Clean single-element Brand wordmark */}
          {isOnePageHome ? (
            <a
              href="#top"
              onClick={handleBrandHomeClick}
              title="Return to top of Home page"
              className="inline-flex items-center rounded-lg py-1 cursor-pointer transition-[opacity,transform] duration-200 ease-out hover:opacity-80 active:scale-[0.97] focus-visible:outline-2 will-change-transform"
              aria-label="Genovaris Home"
            >
              <BrandMark tone="dark" />
            </a>
          ) : (
            <Link
              to="/"
              onClick={handleBrandHomeClick}
              title="Return to top of Home page"
              className="inline-flex items-center rounded-lg py-1 cursor-pointer transition-[opacity,transform] duration-200 ease-out hover:opacity-80 active:scale-[0.97] focus-visible:outline-2 will-change-transform"
              aria-label="Genovaris Home"
            >
              <BrandMark tone="dark" />
            </Link>
          )}

          {/* Zone 2: 4 document-anchor section links with live scroll-spy */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.sectionId;
              const isHovered = hoveredNav === item.sectionId;
              const sharedClassName = `relative inline-flex items-center py-1.5 text-[14px] font-medium whitespace-nowrap shrink-0 transition-colors duration-200 ${
                isActive
                  ? 'text-[#153226]'
                  : 'text-[#4C6156] hover:text-[#153226]'
              }`;
              const sharedHandlers = {
                'aria-current': isActive ? ('location' as const) : undefined,
                onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
                  handleSectionClick(e, item.sectionId),
                onMouseEnter: () => setHoveredNav(item.sectionId),
                onMouseLeave: () =>
                  setHoveredNav((prev) =>
                    prev === item.sectionId ? null : prev,
                  ),
                onFocus: () => setHoveredNav(item.sectionId),
                onBlur: () =>
                  setHoveredNav((prev) =>
                    prev === item.sectionId ? null : prev,
                  ),
                className: sharedClassName,
              };

              return isOnePageHome ? (
                <a
                  key={item.sectionId}
                  href={`#${item.sectionId}`}
                  {...sharedHandlers}
                >
                  {renderDesktopNavContent(item, isActive, isHovered)}
                </a>
              ) : (
                <Link key={item.sectionId} to={item.to} {...sharedHandlers}>
                  {renderDesktopNavContent(item, isActive, isHovered)}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary desktop action + mobile menu button */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              transition={IOS_SPRING_SNAPPY}
              onClick={openRegimen}
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#173A2C] px-4 py-2 text-[13px] font-medium text-white whitespace-nowrap shrink-0 hover:bg-[#102B20] transition-colors duration-200 cursor-pointer"
              aria-label={`Open Supply List (${regimen.length} selected)`}
            >
              <Bookmark size={14} strokeWidth={1.9} aria-hidden="true" />
              <span>Supply List</span>
              {regimen.length > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/18 px-1.5 font-mono text-[11px] font-medium tabular-nums text-white">
                  {regimen.length}
                </span>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              transition={IOS_SPRING_SNAPPY}
              onClick={() => {
                triggerHaptic('light');
                setMobileMenuOpen((prev) => !prev);
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#153226] hover:bg-[#E7EEE4] transition-colors md:hidden cursor-pointer"
              aria-label={
                mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={21} strokeWidth={1.85} />
              ) : (
                <Menu size={21} strokeWidth={1.85} />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile iOS Spring Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#133126]/30 backdrop-blur-xs"
              aria-hidden="true"
            />
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={IOS_SPRING_SHEET}
              className="relative mx-3 mt-3 overflow-hidden rounded-3xl border border-[#DCE4D9] bg-[#FEFDF9] p-5 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8EEE5]">
                <BrandMark tone="dark" />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#153226] hover:bg-[#EDF3EA] cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X size={20} strokeWidth={1.85} />
                </button>
              </div>

              <div className="flex flex-col py-3">
                {isOnePageHome ? (
                  <a
                    href="#top"
                    onClick={handleBrandHomeClick}
                    className={`flex min-h-[46px] items-center rounded-2xl px-3.5 text-[16px] font-medium transition-colors ${
                      activeSection === null
                        ? 'bg-[#EDF3EA] text-[#153226]'
                        : 'text-[#4C6156] hover:bg-[#F4F7F1]'
                    }`}
                  >
                    Home
                  </a>
                ) : (
                  <Link
                    to="/"
                    onClick={handleBrandHomeClick}
                    className="flex min-h-[46px] items-center rounded-2xl px-3.5 text-[16px] font-medium text-[#4C6156] hover:bg-[#F4F7F1] transition-colors"
                  >
                    Home
                  </Link>
                )}
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.sectionId;
                  const mobileClassName = `flex min-h-[46px] items-center rounded-2xl px-3.5 text-[16px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EDF3EA] text-[#153226]'
                      : 'text-[#4C6156] hover:bg-[#F4F7F1]'
                  }`;
                  return isOnePageHome ? (
                    <a
                      key={item.sectionId}
                      href={`#${item.sectionId}`}
                      onClick={(e) => handleSectionClick(e, item.sectionId)}
                      className={mobileClassName}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.sectionId}
                      to={item.to}
                      onClick={(e) => handleSectionClick(e, item.sectionId)}
                      className={mobileClassName}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#E8EEE5]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegimen();
                  }}
                  className="flex min-h-[48px] w-full items-center justify-between rounded-full bg-[#173A2C] px-5 py-3 text-[15px] font-medium text-white hover:bg-[#102B20] transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Bookmark size={16} strokeWidth={1.85} aria-hidden="true" />
                    <span>Open Supply List</span>
                  </span>
                  <span className="font-mono text-xs tabular-nums opacity-90">
                    {regimen.length} selected
                  </span>
                </button>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
