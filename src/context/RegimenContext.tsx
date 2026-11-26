import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductFormulation, RegimenEntry } from '../types/medicine';
import { GENOVARIS_PRODUCTS } from '../data/products';
import {
  loadChecklistIds,
  loadSavedShortlist,
  saveChecklistIds,
  saveShortlistItems,
} from '../services/storage';
import { triggerHaptic } from '../utils/haptics';

interface RegimenContextValue {
  products: ProductFormulation[];
  regimen: RegimenEntry[];
  checkedIds: string[];
  isRegimenOpen: boolean;
  openRegimen: () => void;
  closeRegimen: () => void;
  isInRegimen: (slug: string) => boolean;
  toggleRegimenItem: (slug: string, notes?: string) => void;
  removeFromRegimen: (slug: string) => void;
  toggleChecklistItem: (id: string) => void;
}

const RegimenContext = createContext<RegimenContextValue | null>(null);

export function RegimenProvider({ children }: { children: ReactNode }) {
  const [regimen, setRegimen] = useState<RegimenEntry[]>(() =>
    loadSavedShortlist()
  );
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    loadChecklistIds()
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

  const value = useMemo<RegimenContextValue>(
    () => ({
      products: GENOVARIS_PRODUCTS,
      regimen,
      checkedIds,
      isRegimenOpen,
      openRegimen,
      closeRegimen,
      isInRegimen,
      toggleRegimenItem,
      removeFromRegimen,
      toggleChecklistItem,
    }),
    [
      regimen,
      checkedIds,
      isRegimenOpen,
      openRegimen,
      closeRegimen,
      isInRegimen,
      toggleRegimenItem,
      removeFromRegimen,
      toggleChecklistItem,
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
