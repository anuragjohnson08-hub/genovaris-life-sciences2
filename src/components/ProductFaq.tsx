import { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type {
  FaqBulletIcon,
  FaqFilterTopic,
  FaqTopic,
  ProductFormulation,
} from '../types/medicine';
import {
  filterProductFaqs,
  getFaqBulletPoints,
  getProductFaqs,
  toggleFaqExpandedId,
} from '../utils/productFaq';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_GENTLE, IOS_SPRING_SNAPPY } from '../utils/motion';

interface ProductFaqProps {
  product: ProductFormulation;
}

const FILTER_OPTIONS: Array<{ value: FaqFilterTopic; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'dosage', label: 'Dosage & usage' },
  { value: 'sourcing', label: 'Ingredient sourcing' },
  { value: 'safety', label: 'Usage safety' },
];

const TOPIC_LABELS: Record<FaqTopic, string> = {
  dosage: 'Dosage & usage',
  sourcing: 'Ingredient sourcing',
  safety: 'Usage safety',
};

function FaqBulletGlyph({ icon }: { icon: FaqBulletIcon }) {
  const isCaution = icon === 'alert';
  const badgeClasses = isCaution
    ? 'bg-[#FAF0E1] text-[#8A5416] border-[#EAD7BB]'
    : 'bg-[#EDF3EA] text-[#173A2C] border-[#DCE6D8]';

  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${badgeClasses}`}
    >
      {icon === 'dose' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <rect
            x="2.5"
            y="5"
            width="11"
            height="6"
            rx="3"
            transform="rotate(-35 8 8)"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.3 5.9L9.7 10.1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
      {icon === 'clock' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 5.2V8.2L10.1 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {icon === 'check' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M3.6 8.3L6.6 11.2L12.4 5.2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {icon === 'alert' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M8 3.2L13.2 12.2H2.8L8 3.2Z"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
          <path
            d="M8 6.5V9.1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="10.9" r="0.7" fill="currentColor" />
        </svg>
      )}
      {icon === 'leaf' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M12.8 3.4C8.4 3.5 4.4 6 3.7 11.4C3.6 12 4 12.4 4.6 12.3C10 11.6 12.5 7.6 12.8 3.4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M4.2 11.9L8.6 7.5"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
        </svg>
      )}
      {icon === 'shield' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M8 2.6L12.6 4.4V7.8C12.6 10.6 10.6 12.6 8 13.5C5.4 12.6 3.4 10.6 3.4 7.8V4.4L8 2.6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M6.1 8.1L7.4 9.4L10 6.7"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {icon === 'drop' && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M8 2.6C8 2.6 12 7 12 9.8C12 12 10.2 13.6 8 13.6C5.8 13.6 4 12 4 9.8C4 7 8 2.6 8 2.6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

export function ProductFaq({ product }: ProductFaqProps) {
  const uid = useId();
  const allFaqs = useMemo(() => getProductFaqs(product), [product]);
  const [activeTopic, setActiveTopic] = useState<FaqFilterTopic>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    allFaqs.length > 0 ? [allFaqs[0].id] : []
  );

  useEffect(() => {
    setActiveTopic('all');
    setExpandedIds(allFaqs.length > 0 ? [allFaqs[0].id] : []);
  }, [product.slug, allFaqs]);

  const visibleFaqs = useMemo(
    () => filterProductFaqs(allFaqs, activeTopic),
    [allFaqs, activeTopic]
  );

  const allVisibleExpanded =
    visibleFaqs.length > 0 &&
    visibleFaqs.every((item) => expandedIds.includes(item.id));

  const handleToggleItem = (id: string) => {
    triggerHaptic('selection');
    setExpandedIds((prev) => toggleFaqExpandedId(prev, id, true));
  };

  const handleTopicChange = (topic: FaqFilterTopic) => {
    if (topic === activeTopic) return;
    triggerHaptic('selection');
    setActiveTopic(topic);
    const nextVisible = filterProductFaqs(allFaqs, topic);
    setExpandedIds((prev) => {
      const stillVisible = prev.filter((id) =>
        nextVisible.some((item) => item.id === id)
      );
      if (stillVisible.length > 0) return stillVisible;
      return nextVisible.length > 0 ? [nextVisible[0].id] : [];
    });
  };

  const handleToggleAll = () => {
    triggerHaptic('light');
    if (allVisibleExpanded) {
      setExpandedIds((prev) =>
        prev.filter((id) => !visibleFaqs.some((item) => item.id === id))
      );
    } else {
      setExpandedIds((prev) => {
        const merged = new Set(prev);
        for (const item of visibleFaqs) {
          merged.add(item.id);
        }
        return Array.from(merged);
      });
    }
  };

  return (
    <section
      id="product-faq"
      aria-labelledby={`${uid}-heading`}
      className="mt-8 scroll-mt-20 rounded-[28px] border border-[#E3E9E0] bg-[#FEFDF9] p-6 sm:p-8"
    >
      {/* Header Row */}
      <div className="border-b border-[#E8EEE5] pb-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3EA] text-[#173A2C]">
            <HelpCircle size={19} strokeWidth={1.85} aria-hidden="true" />
          </div>
          <div>
            <h2
              id={`${uid}-heading`}
              className="text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-[#153226]"
            >
              Frequently asked questions
            </h2>
            <p className="mt-1 text-[14px] leading-[1.55] text-[#556B5F]">
              Quick answers on daily dosage, usage timing, ingredient sourcing,
              and safety for {product.name}.
            </p>
          </div>
        </div>

        {/* Topic Filter & Expand/Collapse Control */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter FAQ topics"
            className="inline-flex max-w-full overflow-x-auto rounded-full bg-[#EDF3EA] p-1"
          >
            {FILTER_OPTIONS.map((option) => {
              const selected = activeTopic === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleTopicChange(option.value)}
                  className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selected
                      ? 'text-[#153226]'
                      : 'text-[#4C6156] hover:text-[#153226]'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId={`${uid}-faq-filter-pill`}
                      transition={IOS_SPRING_SNAPPY}
                      className="absolute inset-0 rounded-full bg-[#FEFDF9] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={IOS_SPRING_SNAPPY}
            onClick={handleToggleAll}
            className="inline-flex min-h-[36px] items-center rounded-full border border-[#D4DFD1] bg-[#F7F8F1] px-3.5 py-1.5 text-[12.5px] font-medium text-[#3C5649] hover:bg-[#EDF3EA] hover:text-[#153226] transition-colors whitespace-nowrap cursor-pointer"
          >
            {allVisibleExpanded ? 'Collapse all' : 'Expand all'}
          </motion.button>
        </div>
      </div>

      {/* Collapsible Accordion Items */}
      <div className="mt-2 divide-y divide-[#E8EEE5]">
        {visibleFaqs.map((item) => {
          const isOpen = expandedIds.includes(item.id);
          const buttonId = `${uid}-btn-${item.id}`;
          const panelId = `${uid}-panel-${item.id}`;
          const topicLabel = TOPIC_LABELS[item.topic];
          const bulletPoints = getFaqBulletPoints(item);

          return (
            <div key={item.id} className="py-1">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => handleToggleItem(item.id)}
                  className="group flex w-full min-h-[58px] items-center justify-between gap-4 rounded-2xl px-2 py-3.5 text-left transition-colors hover:bg-[#F5F8F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173A2C] cursor-pointer"
                >
                  <span className="min-w-0 pr-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.11em] text-[#556B5F]">
                      {topicLabel}
                    </span>
                    <span className="mt-1 block text-[15.5px] font-semibold leading-[1.42] text-[#153226] group-hover:text-[#0F2A1F]">
                      {item.question}
                    </span>
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={IOS_SPRING_SNAPPY}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? 'bg-[#173A2C] text-white'
                        : 'bg-[#EDF3EA] text-[#3C5649] group-hover:bg-[#E1EAE0]'
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown size={17} strokeWidth={2} />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={IOS_SPRING_GENTLE}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-4 pt-1 pr-3 sm:pr-12">
                      <ul className="space-y-2.5">
                        {bulletPoints.map((point) => (
                          <li
                            key={`${item.id}-${point.lead}`}
                            className="flex items-start gap-3 text-[14px] leading-[1.58] text-[#4C6156]"
                          >
                            <FaqBulletGlyph icon={point.icon} />
                            <span className="min-w-0 pt-0.5">
                              <span className="font-semibold text-[#153226]">
                                {point.lead}:{' '}
                              </span>
                              <span>{point.text}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
