import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Bookmark, Check, Package, Store } from 'lucide-react';
import type { ProductFormulation } from '../types/medicine';
import { getRetailBoxSpec, type RetailBoxSpec } from '../utils/dosageChartData';
import { useRegimen } from '../context/RegimenContext';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_GENTLE, IOS_SPRING_SNAPPY } from '../utils/motion';
import { handleInPageAnchorClick } from '../utils/sectionNavigation';

interface PharmacyShelfShowcaseProps {
  products: ProductFormulation[];
  heading?: string;
  subheading?: string;
  showHeader?: boolean;
}

interface RetailPackageVisualProps {
  product: ProductFormulation;
  spec: RetailBoxSpec;
  active: boolean;
}

function RetailPackageVisual({
  product,
  spec,
  active,
}: RetailPackageVisualProps) {
  if (spec.packStyle === 'powder-tin') {
    return (
      <motion.div
        animate={{ y: active ? -7 : 0, scale: active ? 1.03 : 1 }}
        transition={IOS_SPRING_SNAPPY}
        className="relative mx-auto flex h-[212px] w-[144px] flex-col items-center justify-end pb-1.5 select-none"
        aria-hidden="true"
      >
        {/* Soft Shelf Contact Shadow strictly beneath canister */}
        <div className="pointer-events-none absolute -bottom-1 z-0 h-3.5 w-[124px] rounded-full bg-[#133126]/22 blur-[4px]" />

        {/* Metallic Rim / Cap */}
        <div className="relative z-20 h-6 w-[126px] shrink-0 rounded-t-[14px] rounded-b-[4px] border border-[#D4C7BA] bg-gradient-to-r from-[#E8E2D8] via-[#FAF7F2] to-[#D6CCC0] shadow-xs">
          <div className="mx-auto mt-1.5 h-1.5 w-20 rounded-full bg-white/70" />
        </div>

        {/* Cylindrical Tin Body */}
        <div
          className="relative z-10 flex h-[168px] w-[122px] flex-col justify-between overflow-hidden rounded-b-[14px] border border-black/10 bg-[#FEFDF9] shadow-[8px_10px_20px_rgba(19,49,38,0.16)]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(255,255,255,0.22) 22%, rgba(255,255,255,0) 56%, rgba(0,0,0,0.12) 100%)',
          }}
        >
          {/* Top Brand Band */}
          <div
            className="shrink-0 px-3 pt-2.5 pb-2 text-white"
            style={{
              background: `linear-gradient(135deg, ${spec.frontAccentHex}, ${spec.spineBgHex})`,
            }}
          >
            <div className="flex items-center justify-between text-[7.5px] font-semibold uppercase tracking-[0.12em] text-white/85">
              <span>Genovaris</span>
              <span className="font-mono">{product.code}</span>
            </div>
            <p className="mt-1 text-[14.5px] font-bold leading-tight tracking-[-0.02em]">
              {product.name}
            </p>
          </div>

          {/* Center Nutrition Label Panel */}
          <div className="flex-1 px-3 py-2 text-left">
            <p
              className="text-[8.5px] font-bold uppercase tracking-[0.05em] leading-snug"
              style={{ color: spec.frontAccentHex }}
            >
              {spec.badgeText}
            </p>
            <p className="mt-1 text-[8.5px] leading-[1.35] text-[#4C6156]">
              Whey + Skimmed Milk Protein · DHA · 21 Vit. &amp; Min.
            </p>
          </div>

          {/* Bottom Flavor & Net Wt Strip */}
          <div
            className="flex shrink-0 items-center justify-between px-3 py-1.5 text-[8px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: spec.secondaryAccentHex }}
          >
            <span>Vanilla · Choc.</span>
            <span className="font-mono">200g</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Pharmaceutical Tablet Retail Box (3D Front + Right Spine + Top Bevel)
  return (
    <motion.div
      animate={{ y: active ? -7 : 0, scale: active ? 1.03 : 1 }}
      transition={IOS_SPRING_SNAPPY}
      className="relative mx-auto flex h-[212px] w-[204px] items-end justify-center pb-1.5 select-none"
      aria-hidden="true"
    >
      {/* Shelf Contact Shadow strictly beneath carton */}
      <div className="pointer-events-none absolute -bottom-1 z-0 h-3.5 w-[184px] rounded-full bg-[#133126]/22 blur-[4px]" />

      {/* 3D Box Assembly */}
      <div className="relative z-10 flex items-end">
        {/* Top Carton Flap Bevel */}
        <div
          className="absolute -top-[14px] left-[9px] h-[14px] w-[160px] rounded-t-[3px] border-t border-l border-r border-black/10"
          style={{
            transform: 'skewX(-42deg)',
            background: `linear-gradient(90deg, #F5F7F2 0%, #E7ECE5 70%, ${spec.secondaryAccentHex}33 100%)`,
          }}
        />

        {/* Front Face of Medicine Box */}
        <div className="relative z-10 flex h-[156px] w-[160px] flex-col justify-between overflow-hidden rounded-l-[5px] rounded-br-[2px] border border-black/10 bg-[#FEFDF9] shadow-[0_10px_22px_rgba(19,49,38,0.16)]">
          {/* Top Accent Header Ribbon */}
          <div
            className="shrink-0 px-3 pt-2 pb-1.5 text-white"
            style={{
              background: `linear-gradient(120deg, ${spec.frontAccentHex} 0%, ${spec.secondaryAccentHex} 100%)`,
            }}
          >
            <div className="flex items-center justify-between gap-1 text-[7.5px] font-semibold uppercase tracking-[0.1em] text-white/90 whitespace-nowrap">
              <span>Genovaris</span>
              <span className="font-mono">{spec.packSizeLabel}</span>
            </div>
            <p className="mt-1 text-[15.5px] font-bold leading-tight tracking-[-0.02em]">
              {product.name}
            </p>
          </div>

          {/* Middle Composition & Clinical Badge */}
          <div className="flex-1 px-3 py-2 text-left">
            <p
              className="text-[8.5px] font-bold uppercase tracking-[0.04em] leading-snug"
              style={{ color: spec.frontAccentHex }}
            >
              {spec.badgeText}
            </p>
            <p className="mt-1 text-[8.5px] leading-[1.35] text-[#42584D] line-clamp-3">
              {spec.shortComposition}
            </p>
          </div>

          {/* Bottom Strip Footer */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#E6ECE3] bg-[#F4F7F2] px-3 py-1.5 text-[8px] font-semibold text-[#153226] whitespace-nowrap">
            <span className="truncate">{product.categoryLabel}</span>
            <span className="font-mono text-[#4C6156] shrink-0">{product.code}</span>
          </div>
        </div>

        {/* Right 3D Box Spine Face */}
        <div
          className="relative z-0 flex h-[156px] w-[26px] flex-col items-center justify-between rounded-r-[4px] border-y border-r border-black/15 py-3 text-white shadow-[6px_8px_14px_rgba(19,49,38,0.14)]"
          style={{
            backgroundColor: spec.spineBgHex,
            transform: 'skewY(-30deg) translateY(-7px)',
          }}
        >
          <span className="font-mono text-[7px] font-semibold tracking-wider text-white/80">
            {product.code}
          </span>
          <span
            className="text-[8.5px] font-bold tracking-[0.08em] uppercase text-white/95 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl' }}
          >
            {product.name}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        </div>
      </div>
    </motion.div>
  );
}

export function PharmacyShelfShowcase({
  products,
  heading = 'Pharmacy retail shelf showcase',
  subheading = 'Preview how Genovaris Lifesciences cartons and nutritional tins display on clinic counters and pharmacy shelves.',
  showHeader = true,
}: PharmacyShelfShowcaseProps) {
  const { isInRegimen, toggleRegimenItem } = useRegimen();
  const location = useLocation();
  const isOnePageHome = !location.pathname.startsWith('/products/');
  const [activeSlug, setActiveSlug] = useState<string>(products[0]?.slug ?? '');

  const activeProduct =
    products.find((p) => p.slug === activeSlug) ?? products[0] ?? null;
  const activeSpec = activeProduct ? getRetailBoxSpec(activeProduct) : null;

  if (products.length === 0) return null;

  return (
    <section
      id="pharmacy-shelf-showcase"
      aria-label="Pharmacy store medicine box showcase"
      className="rounded-[28px] border border-[#DCE5D8] bg-[#EDF3EA] p-5 sm:p-8"
    >
      {showHeader && (
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#4B6658]">
              <Store size={14} strokeWidth={1.9} aria-hidden="true" />
              <span>Retail Dispensary Display</span>
            </div>
            <h2 className="mt-2.5 text-[clamp(1.6rem,2.7vw,2.15rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[#153226]">
              {heading}
            </h2>
            <p className="mt-2 text-[15px] leading-[1.6] text-[#4C6156]">
              {subheading}
            </p>
          </div>

          {isOnePageHome ? (
            <a
              href="#contact"
              onClick={(e) => {
                triggerHaptic('selection');
                handleInPageAnchorClick(e, 'contact');
              }}
              className="inline-flex min-h-[42px] items-center gap-1.5 self-start sm:self-end rounded-full border border-[#C6D5C4] bg-[#FEFDF9] px-4 py-2 text-[13.5px] font-semibold text-[#153226] hover:bg-white transition-colors whitespace-nowrap"
            >
              <Package size={15} strokeWidth={1.9} aria-hidden="true" />
              <span>Order retail stock</span>
            </a>
          ) : (
            <Link
              to="/#contact"
              onClick={() => triggerHaptic('selection')}
              className="inline-flex min-h-[42px] items-center gap-1.5 self-start sm:self-end rounded-full border border-[#C6D5C4] bg-[#FEFDF9] px-4 py-2 text-[13.5px] font-semibold text-[#153226] hover:bg-white transition-colors whitespace-nowrap"
            >
              <Package size={15} strokeWidth={1.9} aria-hidden="true" />
              <span>Order retail stock</span>
            </Link>
          )}
        </div>
      )}

      {/* Architectural Pharmacy Display Cabinet */}
      <div className="overflow-hidden rounded-3xl border border-[#D4DFD1] bg-gradient-to-b from-[#F8FAF5] via-[#F2F6EE] to-[#E6EEE2] shadow-inner">
        {/* Top Recessed Display Lighting Strip */}
        <div className="flex items-center justify-between border-b border-[#DCE5D8] bg-[#153226] px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] uppercase text-[#CFE0D7]">
          <span>Genovaris Lifesciences · Dispensary Showcase</span>
          <span className="font-mono tabular-nums text-white/90">
            {products.length} Retail SKUs
          </span>
        </div>

        {/* Display Bays Grid */}
        <div className="px-4 pt-8 pb-6 sm:px-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-5 items-end">
            {products.map((product) => {
              const spec = getRetailBoxSpec(product);
              const isSelected = activeProduct?.slug === product.slug;
              const saved = isInRegimen(product.slug);

              return (
                <div key={product.slug} className="flex flex-col items-center">
                  {/* Clickable Retail Box Stage */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setActiveSlug(product.slug);
                    }}
                    aria-pressed={isSelected}
                    aria-label={`Inspect ${product.name} retail box (${spec.packSizeLabel})`}
                    className="group relative flex w-full flex-col items-center pt-2 pb-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173A2C] cursor-pointer"
                  >
                    <RetailPackageVisual
                      product={product}
                      spec={spec}
                      active={isSelected}
                    />
                  </button>

                  {/* Pharmacy Glass / Timber Shelf Ledge Rail */}
                  <div className="w-full">
                    <div className="h-3 w-full rounded-t-sm border-t border-white/80 bg-gradient-to-b from-[#DFE8DC] to-[#C8D6C4] shadow-[0_6px_12px_rgba(19,49,38,0.12)]" />

                    {/* Store Shelf Talker Tag */}
                    <div
                      className={`mt-2.5 rounded-2xl border p-3.5 transition-colors ${
                        isSelected
                          ? 'border-[#173A2C] bg-[#FEFDF9] shadow-sm'
                          : 'border-[#DCE5D8] bg-[#FEFDF9]/85 hover:border-[#B9CBB6]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#556B5F]">
                        <span>{product.code}</span>
                        <span>{spec.packSizeLabel}</span>
                      </div>

                      <div className="mt-1 flex items-baseline justify-between gap-2">
                        <Link
                          to={`/products/${product.slug}`}
                          onClick={() => triggerHaptic('selection')}
                          className="font-display text-[16px] font-semibold text-[#153226] hover:text-[#23543F] transition-colors"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <p className="mt-0.5 text-[12px] text-[#556B5F] truncate">
                        {spec.shelfCategory}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EBF0E8] pt-2.5">
                        <Link
                          to={`/products/${product.slug}`}
                          onClick={() => triggerHaptic('selection')}
                          className="group underline-trigger inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors"
                        >
                          <span className="link-underline-center">Details</span>
                          <ArrowRight
                            size={13}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleRegimenItem(product.slug)}
                          aria-pressed={saved}
                          aria-label={
                            saved
                              ? `Remove ${product.name} from Supply List`
                              : `Add ${product.name} to Supply List`
                          }
                          className={`inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                            saved
                              ? 'bg-[#D6E4D8] text-[#153226]'
                              : 'bg-[#173A2C] text-white hover:bg-[#102B20]'
                          }`}
                        >
                          {saved ? (
                            <>
                              <Check size={12} strokeWidth={2.2} aria-hidden="true" />
                              <span>Listed</span>
                            </>
                          ) : (
                            <>
                              <Bookmark size={12} strokeWidth={2} aria-hidden="true" />
                              <span>Stock</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Shelf Box Quick Spec Strip */}
      {activeProduct && activeSpec && (
        <motion.div
          key={activeProduct.slug}
          initial={{ opacity: 0.75, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={IOS_SPRING_GENTLE}
          className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#D4DFD1] bg-[#FEFDF9] p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#556B5F]">
              Selected retail pack · {activeSpec.retailFormat}
            </p>
            <h3 className="mt-1 font-display text-[19px] font-semibold text-[#153226]">
              {activeProduct.name}{' '}
              <span className="font-mono text-[13px] font-medium text-[#556B5F]">
                ({activeSpec.packSizeLabel})
              </span>
            </h3>
            <p className="mt-1 text-[13.5px] text-[#4C6156]">
              {activeProduct.compositionLine}
            </p>
            <p className="mt-1 text-[12.5px] font-medium text-[#3C5649]">
              Shelf storage: {activeSpec.storageTag} · Bay: {activeSpec.shelfCategory}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/products/${activeProduct.slug}`}
              onClick={() => triggerHaptic('selection')}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#173A2C] px-5 py-2 text-[13.5px] font-medium text-white hover:bg-[#102B20] transition-colors whitespace-nowrap"
            >
              <span>Inspect monograph &amp; dosage</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      )}
    </section>
  );
}
