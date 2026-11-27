import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductFormulation, RegimenEntry } from '../types/medicine';
import { GENOVARIS_PRODUCTS, INFORMED_CHOICE_CHECKLIST } from '../data/products';
import {
  loadB2bVerification,
  loadChecklistIds,
  loadSavedShortlist,
  saveB2bVerification,
  saveChecklistIds,
  saveShortlistItems,
} from '../services/storage';
import {
  computeB2bComplianceGate,
  type B2bComplianceGateStatus,
  type B2bStoredVerification,
} from '../utils/b2bVerification';
import { triggerHaptic } from '../utils/haptics';

interface RegimenContextValue {
  products: ProductFormulation[];
  regimen: RegimenEntry[];
  checkedIds: string[];
  b2bVerification: B2bStoredVerification;
  b2bGate: B2bComplianceGateStatus;
  isRegimenOpen: boolean;
  openRegimen: () => void;
  closeRegimen: () => void;
  isInRegimen: (slug: string) => boolean;
  toggleRegimenItem: (slug: string, notes?: string) => void;
  removeFromRegimen: (slug: string) => void;
  toggleChecklistItem: (id: string) => void;
  updateB2bVerification: (next: B2bStoredVerification) => void;
}

const RegimenContext = createContext<RegimenContextValue | null>(null);

const REQUIRED_DECLARATION_IDS = INFORMED_CHOICE_CHECKLIST.map((item) => item.id);

export function RegimenProvider({ children }: { children: ReactNode }) {
  const [regimen, setRegimen] = useState<RegimenEntry[]>(() =>
    loadSavedShortlist()
  );
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    loadChecklistIds()
  );
  const [b2bVerification, setB2bVerification] = useState<B2bStoredVerification>(
    () => loadB2bVerification()
  );
  const [isRegimenOpen, setIsRegimenOpen] = useState(false);

  const openRegimen = useCallback(() => {
    triggerHaptic('light');
    setIsRegimenOpen(true);
  }, []);

  const closeRegimen = useCallback(() => {
    triggerHaptic('selection');
    setIsRegimenOpen(false);
  }, []);

  const regimenSlugs = useMemo(
    () => new Set(regimen.map((entry) => entry.slug)),
    [regimen]
  );

  const isInRegimen = useCallback(
    (slug: string) => regimenSlugs.has(slug),
    [regimenSlugs]
  );

  const toggleRegimenItem = useCallback((slug: string, notes = '') => {
    setRegimen((prev) => {
      const exists = prev.some((item) => item.slug === slug);
      let next: RegimenEntry[];
      if (exists) {
        triggerHaptic('light');
        next = prev.filter((item) => item.slug !== slug);
      } else {
        const formulation = GENOVARIS_PRODUCTS.find((p) => p.slug === slug);
        if (!formulation) return prev;
        triggerHaptic('success');
        next = [
          {
            slug,
            addedAt: new Date().toISOString(),
            notes: notes.trim(),
            formulation,
          },
          ...prev,
        ];
      }
      saveShortlistItems(next);
      return next;
    });
  }, []);

  const removeFromRegimen = useCallback((slug: string) => {
    triggerHaptic('light');
    setRegimen((prev) => {
      const next = prev.filter((item) => item.slug !== slug);
      saveShortlistItems(next);
      return next;
    });
  }, []);

  const toggleChecklistItem = useCallback((id: string) => {
    triggerHaptic('selection');
    setCheckedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      saveChecklistIds(next);
      return next;
    });
  }, []);

  const updateB2bVerification = useCallback((next: B2bStoredVerification) => {
    setB2bVerification(next);
    saveB2bVerification(next);
  }, []);

  const b2bGate = useMemo(
    () =>
      computeB2bComplianceGate(
        b2bVerification.verified,
        checkedIds,
        REQUIRED_DECLARATION_IDS
      ),
    [b2bVerification.verified, checkedIds]
  );

  const value = useMemo<RegimenContextValue>(
    () => ({
      products: GENOVARIS_PRODUCTS,
      regimen,
      checkedIds,
      b2bVerification,
      b2bGate,
      isRegimenOpen,
      openRegimen,
      closeRegimen,
      isInRegimen,
      toggleRegimenItem,
      removeFromRegimen,
      toggleChecklistItem,
      updateB2bVerification,
    }),
    [
      regimen,
      checkedIds,
      b2bVerification,
      b2bGate,
      isRegimenOpen,
      openRegimen,
      closeRegimen,
      isInRegimen,
      toggleRegimenItem,
      removeFromRegimen,
      toggleChecklistItem,
      updateB2bVerification,
    ]
  );

  return (
    <RegimenContext.Provider value={value}>{children}</RegimenContext.Provider>
  );
}

export function useRegimen(): RegimenContextValue {
  const ctx = useContext(RegimenContext);
  if (!ctx) {
    throw new Error('useRegimen must be used inside a RegimenProvider.');
  }
  return ctx;
}
