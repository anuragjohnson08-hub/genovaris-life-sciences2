import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_COOKIE_TOGGLES,
  buildCookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentRecord,
  type CookiePreferenceToggles,
} from '../utils/cookieConsent';
import { triggerHaptic } from '../utils/haptics';

interface CookieConsentContextValue {
  isOpen: boolean;
  isExpanded: boolean;
  consent: CookieConsentRecord | null;
  draftPrefs: CookiePreferenceToggles;
  setIsExpanded: (expanded: boolean) => void;
  setDraftPrefs: (
    updater:
      | CookiePreferenceToggles
      | ((prev: CookiePreferenceToggles) => CookiePreferenceToggles),
  ) => void;
  openPreferences: () => void;
  dismiss: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(() => {
    if (typeof window === 'undefined') return null;
    return readCookieConsent(window.localStorage);
  });

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return readCookieConsent(window.localStorage) === null;
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [draftPrefs, setDraftPrefs] = useState<CookiePreferenceToggles>(() => {
    if (typeof window === 'undefined') return DEFAULT_COOKIE_TOGGLES;
    const saved = readCookieConsent(window.localStorage);
    return saved
      ? { analytics: saved.analytics, marketing: saved.marketing }
      : DEFAULT_COOKIE_TOGGLES;
  });

  useEffect(() => {
    const handleStorage = () => {
      const updated = readCookieConsent(window.localStorage);
      setConsent(updated);
      if (updated) {
        setDraftPrefs({
          analytics: updated.analytics,
          marketing: updated.marketing,
        });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistDecision = useCallback(
    (record: CookieConsentRecord) => {
      writeCookieConsent(window.localStorage, record);
      setConsent(record);
      setDraftPrefs({
        analytics: record.analytics,
        marketing: record.marketing,
      });
      setIsOpen(false);
      setIsExpanded(false);
    },
    [],
  );

  const openPreferences = useCallback(() => {
    triggerHaptic('selection');
    setDraftPrefs(
      consent
        ? { analytics: consent.analytics, marketing: consent.marketing }
        : DEFAULT_COOKIE_TOGGLES,
    );
    setIsExpanded(true);
    setIsOpen(true);
  }, [consent]);

  const dismiss = useCallback(() => {
    triggerHaptic('selection');
    setIsOpen(false);
    setIsExpanded(false);
  }, []);

  const acceptAll = useCallback(() => {
    triggerHaptic('light');
    persistDecision(buildCookieConsentRecord('accepted'));
  }, [persistDecision]);

  const rejectAll = useCallback(() => {
    triggerHaptic('selection');
    persistDecision(buildCookieConsentRecord('rejected'));
  }, [persistDecision]);

  const savePreferences = useCallback(() => {
    triggerHaptic('light');
    persistDecision(buildCookieConsentRecord('custom', draftPrefs));
  }, [draftPrefs, persistDecision]);

  return (
    <CookieConsentContext.Provider
      value={{
        isOpen,
        isExpanded,
        consent,
        draftPrefs,
        setIsExpanded,
        setDraftPrefs,
        openPreferences,
        dismiss,
        acceptAll,
        rejectAll,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
