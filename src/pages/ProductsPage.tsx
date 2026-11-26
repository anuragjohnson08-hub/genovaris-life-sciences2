import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, Search, SlidersHorizontal, Store, X } from 'lucide-react';
import { SectionKicker } from '../components/SectionKicker';
import { FormulationCard } from '../components/FormulationCard';
import { PharmacyShelfShowcase } from '../components/PharmacyShelfShowcase';
import { ImportantNoticeCard } from '../components/ImportantNoticeCard';
import { useRegimen } from '../context/RegimenContext';
import type { TherapeuticCategory, TimingWindow } from '../types/medicine';
import { filterFormulations } from '../utils/regimenLogic';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_SNAPPY } from '../utils/motion';

const CATEGORIES: Array<{ value: TherapeuticCategory; label: string }> = [
  { value: 'all', label: 'All medicines' },
  { value: 'bone-skeletal', label: 'Bone & Skeletal' },
  { value: 'hematinic-maternal', label: 'Hematinic & Maternal' },
  { value: 'neuro-cognitive', label: 'Neuro & Cognitive' },
  { value: 'clinical-nutrition', label: 'High-Protein Nutrition' },
];

const TIMINGS: Array<TimingWindow | 'All'> = [
  'All',
  'Morning',
  'With Meals',
  'Daily Nutrition',
];

export function ProductsPage() {
  const { products } = useRegimen();
  const [category, setCategory] = useState<TherapeuticCategory>('all');
  const [timing, setTiming] = useState<TimingWindow | 'All'>('All');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'shelf'>('cards');

  const filtered = useMemo(
    () => filterFormulations(products, { category, timing, query }),
    [products, category, timing, query]
  );

  const hasFilters = category !== 'all' || timing !== 'All' || query.trim() !== '';

  const resetFilters = () => {
    triggerHaptic('light');
    setCategory('all');
    setTiming('All');
    setQuery('');
  };

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
      <header className="max-w-3xl">
        <SectionKicker label="Genovaris Lifesciences Catalog" />
        <h1 className="mt-3.5 text-[clamp(2rem,3.6vw,2.9rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[#153226]">
          Available medicines &amp; formulations
        </h1>
        <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4C6156]">
          Search by brand name, active ingredient (such as Calcium, Ferrous
          Ascorbate, Cerebroprotein, or Whey Protein), or clinical indication.
          Shortlist products into your Supply List for direct distribution or
          pharmacy inquiries.
        </p>
      </header>

      {/* Filter & Search Bar */}
      <section
        aria-label="Filter medicines"
        className="mt-9 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="formulation-search" className="sr-only">
              Search medicines, ingredients, or indications
            </label>
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#627A6E]"
              aria-hidden="true"
            />
            <input
              id="formulation-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Bonebro, RED-XT, Cerebroprotein, DHA..."
              className="min-h-[46px] w-full rounded-full border border-[#DCE4D9] bg-[#F7F8F1] pl-11 pr-10 text-[14.5px] text-[#153226] placeholder:text-[#6B8074] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setQuery('');
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#556B5F] hover:bg-[#E7EEE4] cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal
              size={15}
              className="text-[#556B5F] shrink-0"
              aria-hidden="true"
            />
            <label
              htmlFor="timing-filter"
              className="text-[13px] font-medium text-[#556B5F] whitespace-nowrap"
            >
              Usage timing
            </label>
            <select
              id="timing-filter"
              value={timing}
              onChange={(event) => {
                triggerHaptic('selection');
                setTiming(event.target.value as TimingWindow | 'All');
              }}
              className="min-h-[42px] rounded-full border border-[#DCE4D9] bg-[#F7F8F1] px-4 py-1.5 text-[13.5px] font-medium text-[#153226] focus:border-[#173A2C] focus:outline-none cursor-pointer"
            >
              {TIMINGS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All timings' : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Therapeutic focus filter"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {CATEGORIES.map((item) => {
            const active = category === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  triggerHaptic('selection');
                  setCategory(item.value);
                }}
                className={`relative min-h-[40px] rounded-full px-4 py-2 text-[13.5px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'text-[#4C6156] hover:bg-[#EDF3EA] hover:text-[#153226]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="catalog-category-pill"
                    transition={IOS_SPRING_SNAPPY}
                    className="absolute inset-0 rounded-full bg-[#173A2C]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Header & View Switcher */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#556B5F]">
        <div className="flex flex-wrap items-center gap-4">
          <p className="tabular-nums">
            Showing <span className="font-semibold text-[#153226]">{filtered.length}</span>{' '}
            of <span className="font-semibold text-[#153226]">{products.length}</span>{' '}
            available medicines
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="link-underline-center text-[13.5px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label="Catalog display layout"
          className="inline-flex rounded-full border border-[#DCE5D8] bg-[#EDF3EA] p-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'cards'}
            onClick={() => {
              triggerHaptic('selection');
              setViewMode('cards');
            }}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'text-[#153226]'
                : 'text-[#4C6156] hover:text-[#153226]'
            }`}
          >
            {viewMode === 'cards' && (
              <motion.span
                layoutId="catalog-view-mode"
                transition={IOS_SPRING_SNAPPY}
                className="absolute inset-0 rounded-full bg-[#FEFDF9] shadow-xs"
              />
            )}
            <LayoutGrid size={13.5} className="relative z-10" aria-hidden="true" />
            <span className="relative z-10">Brochure Cards</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'shelf'}
            onClick={() => {
              triggerHaptic('selection');
              setViewMode('shelf');
            }}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              viewMode === 'shelf'
                ? 'text-[#153226]'
                : 'text-[#4C6156] hover:text-[#153226]'
            }`}
          >
            {viewMode === 'shelf' && (
              <motion.span
                layoutId="catalog-view-mode"
                transition={IOS_SPRING_SNAPPY}
                className="absolute inset-0 rounded-full bg-[#FEFDF9] shadow-xs"
              />
            )}
            <Store size={13.5} className="relative z-10" aria-hidden="true" />
            <span className="relative z-10">Store Box Shelf</span>
          </button>
        </div>
      </div>

      {/* Results Grid or Store Box Shelf */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-10 text-center">
          <h2 className="text-[18px] font-bold text-[#153226]">
            No matching medicines found
          </h2>
          <p className="mt-2 text-[15px] text-[#4C6156]">
            Try searching for Bonebro, RED-XT, CEREBRA-CB, or Protizen-HP, or
            clear your active filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#173A2C] px-6 py-2.5 text-[14px] font-medium text-white hover:bg-[#102B20] transition-colors cursor-pointer"
          >
            Show all medicines
          </button>
        </div>
      ) : viewMode === 'shelf' ? (
        <div className="mt-6">
          <PharmacyShelfShowcase products={filtered} showHeader={false} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-7">
          {filtered.map((product, index) => (
            <FormulationCard key={product.slug} product={product} index={index} />
          ))}
        </div>
      )}

      <div className="mt-16">
        <ImportantNoticeCard />
      </div>
    </div>
  );
}
