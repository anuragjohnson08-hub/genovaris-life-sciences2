import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionKicker } from '../components/SectionKicker';
import { ImportantNoticeCard } from '../components/ImportantNoticeCard';
import { triggerHaptic } from '../utils/haptics';

const DISCLAIMER_SECTIONS = [
  {
    number: '01',
    title: 'General product information only',
    body: 'All monographs, ingredient tables, physiological mechanism summaries, and timing windows published on this website are provided strictly for general educational and product-information purposes. Content on this site does not constitute individualized medical advice, clinical diagnosis, or therapeutic treatment.',
  },
  {
    number: '02',
    title: 'Final container label precedence',
    body: 'Formulation batch updates, excipient refinements, and regional regulatory labeling can occasionally occur ahead of web monograph updates. Always verify ingredient quantities, allergen warnings, storage directions, and lot numbers directly against the printed label on the physical container before consumption.',
  },
  {
    number: '03',
    title: 'Consultation with qualified healthcare professionals',
    body: 'Before adding any supplement, botanical extract, or nutritional formulation to your daily routine—especially if you are pregnant, nursing, managing a chronic condition, scheduled for surgery, or taking prescription medications—consult a licensed physician, clinical pharmacist, or qualified healthcare provider.',
  },
  {
    number: '04',
    title: 'Quality manufacturing & batch traceability',
    body: 'Genovaris formulations are manufactured in audited cGMP facilities and evaluated through independent ISO-17025 accredited laboratories for identity, active concentration, heavy metals, and microbiological purity. Batch Certificates of Analysis may be requested through our Clinical Information Desk.',
  },
];

export interface DisclaimerPageProps {
  embedded?: boolean;
}

export function DisclaimerPage({ embedded = false }: DisclaimerPageProps) {
  const HeadingTag = embedded ? 'h2' : 'h1';

  return (
    <section
      id="disclaimer"
      aria-labelledby="disclaimer-section-heading"
      className={
        embedded
          ? 'border-t border-[#E3E9E0]/80 bg-[#F2F5EC]/65 py-16 sm:py-22'
          : 'py-10 sm:py-16'
      }
    >
      <div
        className={
          embedded
            ? 'mx-auto max-w-6xl px-5 sm:px-8'
            : 'mx-auto max-w-4xl px-5 sm:px-8'
        }
      >
        <header className="max-w-3xl">
          <SectionKicker label="Clinical & Regulatory Transparency" />
          <HeadingTag
            id="disclaimer-section-heading"
            className="mt-3.5 text-[clamp(1.9rem,3.2vw,2.65rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#153226]"
          >
            Important information &amp; disclaimer
          </HeadingTag>
          <p className="mt-4 text-[16px] leading-[1.68] text-[#4C6156]">
            Clear boundaries between general product documentation and personal
            medical care help ensure every decision you make about your
            wellbeing is safe and well-informed.
          </p>
        </header>

        <div className="mt-9">
          <ImportantNoticeCard showDisclaimerLink={false} />
        </div>

        <div
          className={
            embedded
              ? 'mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'
              : 'mt-10 space-y-6'
          }
        >
          {DISCLAIMER_SECTIONS.map((section) => (
            <article
              key={section.number}
              className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-8"
            >
              <span className="font-mono text-[12.5px] font-medium tabular-nums text-[#556B5F]">
                {section.number}.
              </span>
              <h3 className="mt-2 font-display text-[20px] font-semibold tracking-[-0.015em] text-[#153226]">
                {section.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.68] text-[#4C6156]">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        {!embedded && (
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              to="/#products"
              onClick={() => triggerHaptic('selection')}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#173A2C] px-6 py-2.5 text-[14.5px] font-medium text-white hover:bg-[#102B20] transition-colors"
            >
              <span>Explore product monographs</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/#contact"
              onClick={() => triggerHaptic('selection')}
              className="inline-flex min-h-[46px] items-center rounded-full border border-[#C6D5C4] bg-[#FEFDF9] px-6 py-2.5 text-[14.5px] font-medium text-[#153226] hover:bg-[#EDF3EA] transition-colors"
            >
              Contact for medicine supply
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
