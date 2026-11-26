import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
} from 'lucide-react';
import { SectionKicker } from '../components/SectionKicker';
import { ImportantNoticeCard } from '../components/ImportantNoticeCard';
import { useRegimen } from '../context/RegimenContext';
import { INFORMED_CHOICE_CHECKLIST } from '../data/products';
import {
  computeChecklistProgress,
  detectRegimenInteractions,
} from '../utils/regimenLogic';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_GENTLE, IOS_SPRING_SNAPPY } from '../utils/motion';
import { handleInPageAnchorClick } from '../utils/sectionNavigation';

const CLINICIAN_PREP_POINTS = [
  {
    step: '01',
    title: 'List all active prescriptions & OTC products',
    detail:
      'Include daily prescription medicines, topical treatments, herbal teas, and other vitamins so potential pharmacokinetic interactions are easy to spot.',
  },
  {
    step: '02',
    title: 'Note your baseline lab markers & goals',
    detail:
      'Bringing recent serum vitamin D, B12, lipid, or renal panel results allows your clinician to tailor whether supplementation is clinically worthwhile.',
  },
  {
    step: '03',
    title: 'Verify physical container labels upon delivery',
    detail:
      'Always cross-check serving sizes, allergen statements, and lot numbers printed on your physical bottle against our online clinical monograph.',
  },
];

export interface ResponsibleUsePageProps {
  embedded?: boolean;
}

export function ResponsibleUsePage({ embedded = false }: ResponsibleUsePageProps) {
  const { checkedIds, toggleChecklistItem, regimen, openRegimen } = useRegimen();
  const [imgFailed, setImgFailed] = useState(false);

  const validIds = useMemo(
    () => INFORMED_CHOICE_CHECKLIST.map((item) => item.id),
    []
  );
  const progress = useMemo(
    () => computeChecklistProgress(checkedIds, validIds),
    [checkedIds, validIds]
  );

  const regimenInteractions = useMemo(
    () => detectRegimenInteractions(regimen.map((entry) => entry.formulation)),
    [regimen]
  );

  const HeadingTag = embedded ? 'h2' : 'h1';

  return (
    <div id="responsible-use">
      {/* Soft Sage Header Band */}
      <section className="bg-[#EAF0E7] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
            <div className="lg:col-span-6">
              <SectionKicker label="Make Informed Choices" />
              <HeadingTag className="mt-4 text-[clamp(1.95rem,3.4vw,2.85rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[#153226]">
                Responsible use begins with clarity.
              </HeadingTag>
              <p className="mt-4 text-[16px] leading-[1.68] text-[#4C6156]">
                Modern medicine works best when paired with careful label
                review, transparent dosing, and open dialogue with your
                physician or clinical pharmacist. Use this interactive checklist
                before introducing any new formulation into your routine.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                {embedded ? (
                  <a
                    href="#contact"
                    onClick={(e) => {
                      triggerHaptic('light');
                      handleInPageAnchorClick(e, 'contact');
                    }}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#173A2C] px-6 py-2.5 text-[14.5px] font-medium text-white hover:bg-[#102B20] transition-colors whitespace-nowrap"
                  >
                    <span>Contact for supply</span>
                    <ArrowRight size={15} />
                  </a>
                ) : (
                  <Link
                    to="/#contact"
                    onClick={() => triggerHaptic('light')}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#173A2C] px-6 py-2.5 text-[14.5px] font-medium text-white hover:bg-[#102B20] transition-colors whitespace-nowrap"
                  >
                    <span>Contact for supply</span>
                    <ArrowRight size={15} />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={openRegimen}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-[#C6D5C4] bg-[#FEFDF9] px-5 py-2 text-[14px] font-medium text-[#153226] hover:bg-[#F3F7F0] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Review Supply List ({regimen.length})
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-3xl bg-[#D4DFD1] aspect-[16/11]">
                {!imgFailed ? (
                  <img
                    src="/assets/wellbeing-portrait.webp"
                    alt="Woman seated calmly outdoors in natural light"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#DCE6DA] p-8 text-sm text-[#4C6156]">
                    Personal wellbeing
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Readiness Checklist */}
      <section
        aria-labelledby="checklist-heading"
        className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20"
      >
        <div className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-[#3B5B4B]">
                <ClipboardCheck size={20} strokeWidth={1.8} aria-hidden="true" />
                <h2
                  id="checklist-heading"
                  className="text-[22px] font-bold tracking-[-0.02em] text-[#153226]"
                >
                  Pre-routine safety checklist
                </h2>
              </div>
              <p className="mt-1.5 text-[15px] text-[#4C6156]">
                Check each step as you prepare to discuss or begin a Genovaris
                formulation. Your progress is saved automatically.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <p className="font-mono text-[14px] font-medium tabular-nums text-[#153226]">
                {progress.completed} / {progress.total} reviewed ({progress.percentage}%)
              </p>
              <div className="mt-2 h-2 w-44 overflow-hidden rounded-full bg-[#E6EDE4]">
                <motion.div
                  initial={false}
                  animate={{ scaleX: progress.percentage / 100 }}
                  transition={IOS_SPRING_GENTLE}
                  className="h-full w-full origin-left rounded-full bg-[#173A2C] will-change-transform"
                />
              </div>
            </div>
          </div>

          <ul className="mt-8 divide-y divide-[#EAEFE8]">
            {INFORMED_CHOICE_CHECKLIST.map((item) => {
              const checked = checkedIds.includes(item.id);
              return (
                <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.995 }}
                    transition={IOS_SPRING_SNAPPY}
                    onClick={() => toggleChecklistItem(item.id)}
                    aria-pressed={checked}
                    className="flex w-full items-start gap-4 rounded-2xl p-2 -mx-2 text-left transition-colors hover:bg-[#F4F8F2] cursor-pointer"
                  >
                    <span
                      className={`mt-0.5 shrink-0 transition-colors ${
                        checked ? 'text-[#173A2C]' : 'text-[#6A8275]'
                      }`}
                      aria-hidden="true"
                    >
                      {checked ? (
                        <CheckCircle2 size={22} strokeWidth={2} />
                      ) : (
                        <Circle size={22} strokeWidth={1.75} />
                      )}
                    </span>
                    <div>
                      <span className="block text-[16px] font-semibold text-[#153226]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[14.5px] leading-[1.6] text-[#4C6156]">
                        {item.description}
                      </span>
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Live Regimen Overlap Banner if relevant */}
        {regimenInteractions.length > 0 && (
          <div
            role="status"
            className="mt-8 rounded-3xl border border-[#D8CEAE] bg-[#FAF6E9] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-[#7A5D18]"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-[16px] font-bold text-[#3C2F0E]">
                  Active nutrient overlap detected in your saved regimen
                </h3>
                {regimenInteractions.map((notice) => (
                  <p
                    key={notice.nutrientGroup}
                    className="mt-1.5 text-[14.5px] leading-relaxed text-[#4A3B14]"
                  >
                    <span className="font-semibold">{notice.nutrientGroup}:</span>{' '}
                    {notice.guidance}
                  </p>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={openRegimen}
              className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#173A2C] px-5 py-2 text-[13.5px] font-medium text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              Inspect Supply List
            </button>
          </div>
        )}

        {/* 3-Step Clinician Conversation Preparation */}
        <section className="mt-14">
          <SectionKicker label="Preparing for Your Appointment" />
          <h2 className="mt-3.5 text-[26px] font-bold tracking-[-0.025em] text-[#153226]">
            How to partner with your healthcare professional
          </h2>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLINICIAN_PREP_POINTS.map((point) => (
              <article
                key={point.step}
                className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7"
              >
                <span className="font-mono text-[13px] font-medium tabular-nums text-[#556B5F]">
                  {point.step}.
                </span>
                <h3 className="mt-3 text-[18px] font-bold leading-snug text-[#153226]">
                  {point.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[#4C6156]">
                  {point.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        {!embedded && (
          <div className="mt-14">
            <ImportantNoticeCard />
          </div>
        )}
      </section>
    </div>
  );
}
