import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowRight, Bookmark, Trash2, X } from 'lucide-react';
import { useRegimen } from '../context/RegimenContext';
import {
  detectRegimenInteractions,
  groupRegimenByTiming,
} from '../utils/regimenLogic';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_SHEET, IOS_SPRING_SNAPPY } from '../utils/motion';
import { handleInPageAnchorClick } from '../utils/sectionNavigation';
import { FormulationIcon } from './FormulationIcon';

export function RegimenSheet() {
  const { isRegimenOpen, closeRegimen, regimen, removeFromRegimen } = useRegimen();
  const location = useLocation();
  const isOnePageHome = !location.pathname.startsWith('/products/');

  useEffect(() => {
    if (!isRegimenOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeRegimen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRegimenOpen, closeRegimen]);

  const formulations = useMemo(
    () => regimen.map((entry) => entry.formulation),
    [regimen]
  );
  const interactions = useMemo(
    () => detectRegimenInteractions(formulations),
    [formulations]
  );
  const scheduleGroups = useMemo(
    () => groupRegimenByTiming(formulations),
    [formulations]
  );

  return (
    <AnimatePresence>
      {isRegimenOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="regimen-sheet-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeRegimen}
            className="fixed inset-0 bg-[#133126]/32 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={IOS_SPRING_SHEET}
            className="relative flex h-full w-full max-w-md flex-col bg-[#F7F8F1] shadow-2xl border-l border-[#DCE4D9]"
          >
            <div className="flex items-center justify-between border-b border-[#E3E9E0] bg-[#FEFDF9] px-6 py-5">
              <div>
                <h2
                  id="regimen-sheet-title"
                  className="text-[19px] font-bold tracking-[-0.02em] text-[#153226]"
                >
                  Supply &amp; Inquiry List
                </h2>
                <p className="mt-0.5 text-[13px] text-[#556B5F] tabular-nums">
                  {regimen.length === 0
                    ? 'No medicines shortlisted yet'
                    : `${regimen.length} ${regimen.length === 1 ? 'medicine' : 'medicines'} selected for inquiry`}
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                transition={IOS_SPRING_SNAPPY}
                onClick={closeRegimen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#153226] hover:bg-[#EDF3EA] transition-colors cursor-pointer"
                aria-label="Close Supply List"
              >
                <X size={20} strokeWidth={1.85} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {regimen.length === 0 ? (
                <div className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF3EA] text-[#3B5B4B]">
                    <Bookmark size={20} strokeWidth={1.7} />
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold text-[#153226]">
                    Shortlist Genovaris products for supply or review
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#4C6156]">
                    Add Bonebro™, RED-XT™, CEREBRA-CB™, or Protizen-HP™ to bundle
                    them into a wholesale supply request or review overlapping
                    nutrients together.
                  </p>
                  {isOnePageHome ? (
                    <a
                      href="#products"
                      onClick={(e) => {
                        triggerHaptic('selection');
                        closeRegimen();
                        handleInPageAnchorClick(e, 'products');
                      }}
                      className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#173A2C] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#102B20] transition-colors"
                    >
                      <span>Browse medicines</span>
                      <ArrowRight size={15} />
                    </a>
                  ) : (
                    <Link
                      to="/#products"
                      onClick={() => {
                        triggerHaptic('selection');
                        closeRegimen();
                      }}
                      className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#173A2C] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#102B20] transition-colors"
                    >
                      <span>Browse medicines</span>
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {interactions.length > 0 && (
                    <div
                      role="status"
                      className="rounded-2xl border border-[#D8CEAE] bg-[#FAF6E9] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-[#7A5D18]"
                          aria-hidden="true"
                        />
                        <div className="space-y-2 text-[13.5px] leading-relaxed text-[#4A3B14]">
                          <p className="font-semibold text-[#3C2F0E]">
                            Clinical Overlap Note
                          </p>
                          {interactions.map((notice) => (
                            <p key={notice.nutrientGroup}>
                              <span className="font-medium">{notice.nutrientGroup}:</span>{' '}
                              {notice.guidance}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    {scheduleGroups.map((group) => (
                      <section key={group.window} aria-label={`${group.window} products`}>
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#556B5F] mb-2.5">
                          {group.window}
                        </h3>
                        <div className="space-y-3">
                          {group.items.map((item) => (
                            <div
                              key={item.slug}
                              className="flex items-start justify-between gap-3 rounded-2xl border border-[#E3E9E0] bg-[#FEFDF9] p-4"
                            >
                              <div className="flex items-start gap-3.5 min-w-0">
                                <FormulationIcon
                                  icon={item.icon}
                                  medallionBg={item.medallionBg}
                                />
                                <div className="min-w-0">
                                  <Link
                                    to={`/products/${item.slug}`}
                                    onClick={() => {
                                      triggerHaptic('selection');
                                      closeRegimen();
                                    }}
                                    className="link-underline-center max-w-full text-[15px] font-semibold text-[#153226] truncate align-bottom"
                                  >
                                    {item.name}
                                  </Link>
                                  <p className="mt-0.5 text-[12.5px] text-[#556B5F]">
                                    {item.code} · {item.dosageForm}
                                  </p>
                                </div>
                              </div>

                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                transition={IOS_SPRING_SNAPPY}
                                onClick={() => removeFromRegimen(item.slug)}
                                aria-label={`Remove ${item.name} from Supply List`}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#5A6F64] hover:bg-[#EDF3EA] hover:text-[#153226] transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} strokeWidth={1.8} />
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </>
              )}
            </div>

            {regimen.length > 0 && (
              <div className="border-t border-[#E3E9E0] bg-[#FEFDF9] p-6 space-y-3">
                <p className="text-[12.5px] leading-relaxed text-[#556B5F]">
                  Proceed to Supply &amp; Contact to request wholesale supply,
                  distributor pricing, or product detailers for your selected
                  medicines.
                </p>
                {isOnePageHome ? (
                  <a
                    href="#contact"
                    onClick={(e) => {
                      triggerHaptic('light');
                      closeRegimen();
                      handleInPageAnchorClick(e, 'contact');
                    }}
                    className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#173A2C] px-5 py-3 text-[14.5px] font-medium text-white hover:bg-[#102B20] transition-colors"
                  >
                    <span>Request Supply &amp; Contact</span>
                    <ArrowRight size={15} />
                  </a>
                ) : (
                  <Link
                    to="/#contact"
                    onClick={() => {
                      triggerHaptic('light');
                      closeRegimen();
                    }}
                    className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#173A2C] px-5 py-3 text-[14.5px] font-medium text-white hover:bg-[#102B20] transition-colors"
                  >
                    <span>Request Supply &amp; Contact</span>
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
