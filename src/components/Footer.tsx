import { Link, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { triggerHaptic } from '../utils/haptics';
import { useCookieConsent } from '../context/CookieConsentContext';
import {
  handleInPageAnchorClick,
  type HomeSectionId,
} from '../utils/sectionNavigation';

const FOOTER_LINKS: Array<{
  sectionId: HomeSectionId;
  to: string;
  label: string;
}> = [
  { sectionId: 'products', to: '/#products', label: 'Products' },
  {
    sectionId: 'responsible-use',
    to: '/#responsible-use',
    label: 'Responsible use',
  },
  { sectionId: 'contact', to: '/#contact', label: 'Supply & Contact' },
  { sectionId: 'disclaimer', to: '/#disclaimer', label: 'Disclaimer' },
];

export function Footer() {
  const cookieConsent = useCookieConsent();
  const location = useLocation();
  const isOnePageHome = !location.pathname.startsWith('/products/');

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerHaptic('selection');
    if (isOnePageHome) {
      handleInPageAnchorClick(e, 'top');
    }
  };

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: HomeSectionId,
  ) => {
    triggerHaptic('selection');
    if (isOnePageHome) {
      handleInPageAnchorClick(e, sectionId);
    }
  };

  return (
    <footer className="bg-[#133126] text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          {isOnePageHome ? (
            <a
              href="#top"
              onClick={handleHomeClick}
              aria-label="Genovaris Home"
              className="w-fit rounded-lg py-1"
            >
              <BrandMark tone="light" />
            </a>
          ) : (
            <Link
              to="/"
              onClick={handleHomeClick}
              aria-label="Genovaris Home"
              className="w-fit rounded-lg py-1"
            >
              <BrandMark tone="light" />
            </Link>
          )}

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[14.5px] font-medium text-[#D6E3DC]"
          >
            {FOOTER_LINKS.map((item) =>
              isOnePageHome ? (
                <a
                  key={item.sectionId}
                  href={`#${item.sectionId}`}
                  onClick={(e) => handleSectionClick(e, item.sectionId)}
                  className="link-underline-center hover:text-white transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.sectionId}
                  to={item.to}
                  onClick={(e) => handleSectionClick(e, item.sectionId)}
                  className="link-underline-center hover:text-white transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ),
            )}
            {cookieConsent && (
              <button
                type="button"
                onClick={cookieConsent.openPreferences}
                className="link-underline-center hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                Cookie preferences
              </button>
            )}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/12 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[13px] leading-relaxed text-[#9EB5A9]">
          <p>
            Genovaris Lifesciences · Innovating Life, Enhancing Tomorrow. Product
            summaries are for informational and supply reference only.
          </p>
          <p className="whitespace-nowrap shrink-0 tabular-nums">
            © 2026 Genovaris Lifesciences
          </p>
        </div>
      </div>
    </footer>
  );
}
