import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { RegimenSheet } from './RegimenSheet';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import CookieConsentBlock from '@/components/ui/cookie-consent-5';
import { IOS_TRANSITION_PAGE } from '../utils/motion';

import { resolveSectionIdFromPathOrHash } from '../utils/sectionNavigation';

export function Layout() {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/products/');
  const pageKey = isDetailPage ? location.pathname : 'home-onepage';

  useEffect(() => {
    const targetSection = resolveSectionIdFromPathOrHash(
      location.pathname,
      location.hash,
    );
    if (
      isDetailPage ||
      (!targetSection && !location.hash && location.pathname === '/')
    ) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash, isDetailPage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F1] text-[#153226] scroll-smooth">
      <SmoothScrollProvider />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-[#173A2C] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={IOS_TRANSITION_PAGE}
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />
      <CookieConsentBlock />
      <RegimenSheet />
    </div>
  );
}
