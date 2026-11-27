import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Clock,
  FlaskConical,
  Maximize2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useRegimen } from '../context/RegimenContext';
import { FormulationIcon } from '../components/FormulationIcon';
import { SectionKicker } from '../components/SectionKicker';
import { ImportantNoticeCard } from '../components/ImportantNoticeCard';
import { FormulationCard } from '../components/FormulationCard';
import { DosageCalculator } from '../components/DosageCalculator';
import { DosageGuidelineChart } from '../components/DosageGuidelineChart';
import { ProductFaq } from '../components/ProductFaq';
import { MonographReadingProgress } from '../components/MonographReadingProgress';
import { buildMonographSections } from '../utils/readingProgress';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_SHEET, IOS_SPRING_SNAPPY } from '../utils/motion';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, isInRegimen, toggleRegimenItem, openRegimen } = useRegimen();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const monographRef = useRef<HTMLElement>(null);

  const product = useMemo(
    () => products.find((item) => item.slug === slug) ?? null,
    [products, slug]
  );

  const monographSections = useMemo(
    () => (product ? buildMonographSections(product) : []),
    [product]
  );

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((item) => item.slug !== product.slug);
  }, [products, product]);

  useEffect(() => {
    setImgFailed(false);
    setLightboxOpen(false);
  }, [slug]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 text-center">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#153226]">
          Product not found
        </h1>
        <p className="mt-3 text-[16px] text-[#4C6156]">
          The requested Genovaris Lifesciences product page could not be found.
        </p>
        <Link
          to="/#products"
          className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#173A2C] px-6 py-2.5 text-[14.5px] font-medium text-white hover:bg-[#102B20]"
        >
          <ArrowLeft size={16} />
          <span>Return to catalog</span>
        </Link>
      </div>
    );
  }

  const saved = isInRegimen(product.slug);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8 sm:py-12">
      <MonographReadingProgress
        productName={product.name}
        productSlug={product.slug}
        sections={monographSections}
        containerRef={monographRef}
      />

      <Link
        to="/#products"
        onClick={() => triggerHaptic('selection')}
        className="inline-flex min-h-[40px] items-center gap-2 text-[14px] font-medium text-[#4C6156] hover:text-[#153226] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
        <span>All medicines</span>
      </Link>

      <article ref={monographRef} aria-label={`${product.name} clinical monograph`}>
        {/* Monograph Hero Card */}
        <section
          id="monograph-overview"
          className="mt-5 rounded-[28px] bg-[#EDF3EA] border border-[#DFE8DD] p-7 sm:p-10"
        >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              <FormulationIcon
                icon={product.icon}
                medallionBg={product.medallionBg}
                size="lg"
              />
              <div>
                <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] font-medium text-[#556B5F]">
                  <span className="font-mono tabular-nums">{product.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.dosageForm}</span>
                </p>
                <p className="mt-1 text-[13px] font-medium text-[#3C5649]">
                  {product.tagline}
                </p>
              </div>
            </div>

            <h1 className="mt-6 text-[clamp(2rem,3.6vw,2.85rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#153226]">
              {product.name}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-[#2F4D3E]">
              {product.subtitle}
            </p>
            <p className="mt-4 text-[15px] font-semibold leading-[1.6] text-[#153226]">
              {product.compositionLine}
            </p>
            <p className="mt-3 text-[15.5px] leading-[1.68] text-[#4C6156]">
              {product.summary}
            </p>

            {product.dietaryFlags && product.dietaryFlags.length > 0 && (
              <p className="mt-4 text-[13px] font-medium text-[#3D574A]">
                {product.dietaryFlags.join(' · ')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:w-64 shrink-0 pt-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={IOS_SPRING_SNAPPY}
              onClick={() => toggleRegimenItem(product.slug)}
              aria-pressed={saved}
              className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#D6E4D8] text-[#153226] hover:bg-[#C9DCCB]'
                  : 'bg-[#173A2C] text-white hover:bg-[#102B20]'
              }`}
            >
              {saved ? (
                <>
                  <Check size={16} strokeWidth={2.2} aria-hidden="true" />
                  <span>In Supply List</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span>Add to Supply List</span>
                </>
              )}
            </motion.button>

            {saved && (
              <button
                type="button"
                onClick={openRegimen}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#C6D5C4] bg-[#FEFDF9] px-5 py-2.5 text-[14px] font-medium text-[#153226] hover:bg-[#F3F7F0] transition-colors cursor-pointer"
              >
                Open Supply List
              </button>
            )}

            <Link
              to={`/contact?product=${encodeURIComponent(product.slug)}`}
              onClick={() => triggerHaptic('selection')}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-[#C6D5C4] bg-[#FEFDF9] px-5 py-2.5 text-[14px] font-medium text-[#153226] hover:bg-[#F3F7F0] transition-colors"
            >
              <span>Request supply quote</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Indicated Clinical Areas Strip */}
        <div className="mt-8 border-t border-[#D7E2D5] pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13.5px]">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#556B5F]">
            Indicated Clinical Areas
          </span>
          <p className="font-medium text-[#153226]">
            {product.indications.join(' · ')}
          </p>
        </div>
      </section>

      {/* Interactive Dosage & Intake Calculator */}
      <div id="monograph-dosage-calculator">
        <DosageCalculator product={product} />
      </div>

      {/* Interactive Recharts Dosage Guideline Visualization */}
      <div id="monograph-dosage-chart">
        <DosageGuidelineChart product={product} />
      </div>

      {/* Product Visual Aid Brochure Card */}
      <section
        id="monograph-visual-aid"
        aria-labelledby="visual-aid-heading"
        className="mt-8 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="visual-aid-heading"
              className="text-[20px] font-semibold tracking-[-0.015em] text-[#153226]"
            >
              Official product visual aid
            </h2>
            <p className="mt-0.5 text-[14px] text-[#556B5F]">
              Genovaris Lifesciences clinical detailer for {product.name}
            </p>
          </div>
          {!imgFailed && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              transition={IOS_SPRING_SNAPPY}
              onClick={() => {
                triggerHaptic('light');
                setLightboxOpen(true);
              }}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#D4DFD1] bg-[#F7F8F1] px-4 py-2 text-[13.5px] font-medium text-[#153226] hover:bg-[#EDF3EA] transition-colors cursor-pointer"
            >
              <Maximize2 size={14} strokeWidth={1.9} aria-hidden="true" />
              <span>Expand brochure</span>
            </motion.button>
          )}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#E6ECE3] bg-[#F4F7F2]">
          {!imgFailed ? (
            <img
              src={product.brochureImage}
              alt={`${product.name} official Genovaris Lifesciences brochure`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="flex h-64 items-center justify-center p-8 text-sm text-[#556B5F]">
              Product visual aid unavailable
            </div>
          )}
        </div>
      </section>

      {/* Key Clinical Highlights */}
      <section
        id="monograph-highlights"
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {product.keyHighlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-6"
          >
            <h3 className="text-[17px] font-bold text-[#153226]">
              {highlight.title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-[1.65] text-[#4C6156]">
              {highlight.detail}
            </p>
          </article>
        ))}
      </section>

      {/* Active Composition Table */}
      <section
        id="monograph-composition"
        aria-labelledby="ingredients-heading"
        className="mt-8 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-9"
      >
        <div className="flex items-center gap-3">
          <FlaskConical
            size={20}
            strokeWidth={1.75}
            className="text-[#3B5B4B]"
            aria-hidden="true"
          />
          <h2
            id="ingredients-heading"
            className="text-[21px] font-semibold tracking-[-0.015em] text-[#153226]"
          >
            Active composition &amp; therapeutic roles
          </h2>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E9E0] text-[12px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                <th className="py-3 pr-4">Ingredient</th>
                <th className="py-3 px-4 whitespace-nowrap">Strength</th>
                <th className="py-3 pl-4">Clinical role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2EA] text-[14.5px]">
              {product.activeIngredients.map((ingredient) => (
                <tr key={ingredient.name}>
                  <td className="py-4 pr-4 font-semibold text-[#153226]">
                    {ingredient.name}
                    <span className="block text-[12px] font-normal text-[#556B5F] mt-0.5">
                      {ingredient.standardization}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[13.5px] font-medium tabular-nums text-[#153226] whitespace-nowrap">
                    {ingredient.amount}
                  </td>
                  <td className="py-4 pl-4 text-[#4C6156]">
                    {ingredient.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Full Nutritional Profile (Rendered for Protizen-HP) */}
      {product.nutritionalFacts && product.nutritionalFacts.length > 0 && (
        <section
          id="monograph-nutrition-facts"
          aria-labelledby="nutrition-facts-heading"
          className="mt-8 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-9"
        >
          <h2
            id="nutrition-facts-heading"
            className="text-[20px] font-semibold tracking-[-0.015em] text-[#153226]"
          >
            Approximate nutritional profile
          </h2>
          <p className="mt-1 text-[14px] text-[#556B5F]">
            Values as listed on the Protizen-HP™ visual detailer (per 100 g and
            per 30 g serving).
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E3E9E0] text-[12px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                  <th className="py-3 pr-4">Nutrient</th>
                  <th className="py-3 px-4 whitespace-nowrap">Per 100 g</th>
                  <th className="py-3 pl-4 whitespace-nowrap">Per 30 g</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF2EA] text-[14px]">
                {product.nutritionalFacts.map((row) => (
                  <tr key={row.nutrient}>
                    <td className="py-3 pr-4 font-medium text-[#153226]">
                      {row.nutrient}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#4C6156] whitespace-nowrap">
                      {row.per100g}
                    </td>
                    <td className="py-3 pl-4 font-mono tabular-nums text-[#153226] whitespace-nowrap">
                      {row.per30g}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Mechanism & Administration */}
      <div
        id="monograph-synergy-usage"
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <section className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7">
          <div className="flex items-center gap-2.5 text-[#3B5B4B]">
            <ShieldCheck size={19} strokeWidth={1.8} aria-hidden="true" />
            <h2 className="font-ui text-[17.5px] font-semibold text-[#153226]">
              Formulation synergy
            </h2>
          </div>
          <p className="mt-3.5 text-[15px] leading-[1.68] text-[#4C6156]">
            {product.clinicalMechanism}
          </p>
        </section>

        <section className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7">
          <div className="flex items-center gap-2.5 text-[#3B5B4B]">
            <Clock size={19} strokeWidth={1.8} aria-hidden="true" />
            <h2 className="font-ui text-[17.5px] font-semibold text-[#153226]">
              Usage guidance
            </h2>
          </div>
          <p className="mt-3.5 text-[15px] leading-[1.68] text-[#4C6156]">
            {product.directions}
          </p>
          <p className="mt-3 text-[13.5px] font-medium text-[#2F4D3E]">
            Recommended timing: {product.timingWindow}
          </p>
        </section>
      </div>

      {/* Cautions */}
      <section
        id="monograph-cautions"
        aria-labelledby="cautions-heading"
        className="mt-8 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-9"
      >
        <div className="flex items-center gap-2.5 text-[#6D531B]">
          <AlertTriangle size={19} strokeWidth={1.8} aria-hidden="true" />
          <h2
            id="cautions-heading"
            className="text-[20px] font-semibold tracking-[-0.015em] text-[#153226]"
          >
            Cautions &amp; medical guidance
          </h2>
        </div>

        <ul className="mt-4 space-y-3 text-[15px] leading-[1.65] text-[#4C6156] list-disc pl-5">
          {product.cautions.map((caution) => (
            <li key={caution}>{caution}</li>
          ))}
        </ul>

        <div className="mt-6 border-t border-[#EAEFE8] pt-5 text-[14.5px] leading-[1.65] text-[#4C6156]">
          <span className="font-semibold text-[#153226]">Contraindications: </span>
          {product.contraindications}
        </div>
      </section>

      {/* Collapsible Product FAQ (Ingredient Sourcing & Usage Safety) */}
      <div id="monograph-faq">
        <ProductFaq product={product} />
      </div>

      <div className="mt-10">
        <ImportantNoticeCard />
      </div>
      </article>

      {/* Related Medicines */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionKicker label="More from Genovaris Lifesciences" />
          <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.02em] text-[#153226]">
            Other available products
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item, idx) => (
              <FormulationCard key={item.slug} product={item} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Brochure Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} full brochure view`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 bg-[#0F241C]/80 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={IOS_SPRING_SHEET}
              className="relative z-10 max-h-[90vh] max-w-6xl overflow-auto rounded-3xl bg-[#FEFDF9] p-3 sm:p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <p className="text-[15px] font-semibold text-[#153226]">
                  {product.name} — Official Visual Aid
                </p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setLightboxOpen(false);
                  }}
                  aria-label="Close brochure preview"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF3EA] text-[#153226] hover:bg-[#DCE7D9] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <img
                src={product.brochureImage}
                alt={`${product.name} full-resolution brochure`}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto mx-auto rounded-2xl object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
