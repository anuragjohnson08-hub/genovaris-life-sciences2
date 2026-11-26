import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Calculator,
  Clock,
  Info,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { ProductFormulation } from '../types/medicine';
import {
  calculateProductDosage,
  convertWeight,
  getDefaultDosageProfile,
  validateDosageInput,
  type DosageProfileInput,
  type LifeStage,
  type SupportGoal,
  type WeightUnit,
} from '../utils/dosageCalculator';
import {
  detectNutrientUnitKey,
  getPrimaryMeasurementTip,
  getUnitMeasurementTip,
} from '../utils/dosageMeasurementTips';
import { MeasurementTooltip } from './MeasurementTooltip';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_GENTLE, IOS_SPRING_SNAPPY } from '../utils/motion';

interface DosageCalculatorProps {
  product: ProductFormulation;
}

const LIFE_STAGE_OPTIONS: Array<{ value: LifeStage; label: string; hint: string }> = [
  { value: 'standard', label: 'Standard adult', hint: 'General daily wellness' },
  { value: 'pregnancy-lactation', label: 'Pregnancy / Lactation', hint: 'Maternal care' },
  { value: 'senior', label: 'Senior (55+)', hint: 'Healthy aging support' },
  { value: 'recovery', label: 'Recovery / Active', hint: 'Higher daily demand' },
];

const GOAL_OPTIONS: Array<{ value: SupportGoal; label: string; hint: string }> = [
  { value: 'maintenance', label: 'Daily maintenance', hint: 'Routine support' },
  { value: 'targeted', label: 'Targeted support', hint: 'Physician-guided focus' },
];

export function DosageCalculator({ product }: DosageCalculatorProps) {
  const uid = useId();
  const [profile, setProfile] = useState<DosageProfileInput>(() =>
    getDefaultDosageProfile(product.slug)
  );
  const [ageRaw, setAgeRaw] = useState<string>(() =>
    String(getDefaultDosageProfile(product.slug).age)
  );
  const [weightRaw, setWeightRaw] = useState<string>(() =>
    String(getDefaultDosageProfile(product.slug).weight)
  );

  useEffect(() => {
    const defaults = getDefaultDosageProfile(product.slug);
    setProfile(defaults);
    setAgeRaw(String(defaults.age));
    setWeightRaw(String(defaults.weight));
  }, [product.slug]);

  const parsedInput = useMemo<DosageProfileInput>(
    () => ({
      ...profile,
      age: ageRaw.trim() === '' ? Number.NaN : Number(ageRaw),
      weight: weightRaw.trim() === '' ? Number.NaN : Number(weightRaw),
    }),
    [profile, ageRaw, weightRaw]
  );

  const validation = useMemo(
    () => validateDosageInput(parsedInput),
    [parsedInput]
  );

  const result = useMemo(() => {
    if (!validation.valid) return null;
    return calculateProductDosage(product, parsedInput);
  }, [product, parsedInput, validation.valid]);

  const handleAgeChange = (nextVal: string) => {
    setAgeRaw(nextVal);
    const num = Number(nextVal);
    if (Number.isFinite(num)) {
      setProfile((prev) => ({
        ...prev,
        age: num,
        lifeStage:
          num >= 55 && prev.lifeStage === 'standard'
            ? 'senior'
            : num < 55 && prev.lifeStage === 'senior'
              ? 'standard'
              : prev.lifeStage,
      }));
    }
  };

  const stepAge = (delta: number) => {
    const base = Number.isFinite(parsedInput.age) ? parsedInput.age : 30;
    const clamped = Math.min(110, Math.max(1, Math.round(base + delta)));
    triggerHaptic('selection');
    handleAgeChange(String(clamped));
  };

  const handleWeightChange = (nextVal: string) => {
    setWeightRaw(nextVal);
    const num = Number(nextVal);
    if (Number.isFinite(num)) {
      setProfile((prev) => ({ ...prev, weight: num }));
    }
  };

  const stepWeight = (delta: number) => {
    const fallback = profile.weightUnit === 'kg' ? 65 : 143;
    const base = Number.isFinite(parsedInput.weight) ? parsedInput.weight : fallback;
    const min = profile.weightUnit === 'kg' ? 15 : 33;
    const max = profile.weightUnit === 'kg' ? 250 : 550;
    const clamped = Math.min(max, Math.max(min, Math.round(base + delta)));
    triggerHaptic('selection');
    handleWeightChange(String(clamped));
  };

  const handleUnitSwitch = (nextUnit: WeightUnit) => {
    if (nextUnit === profile.weightUnit) return;
    triggerHaptic('selection');
    const currentNum = Number(weightRaw);
    if (Number.isFinite(currentNum) && currentNum > 0) {
      const converted = convertWeight(currentNum, profile.weightUnit, nextUnit);
      setWeightRaw(String(converted));
      setProfile((prev) => ({ ...prev, weightUnit: nextUnit, weight: converted }));
    } else {
      setProfile((prev) => ({ ...prev, weightUnit: nextUnit }));
    }
  };

  const handleLifeStageSelect = (stage: LifeStage) => {
    triggerHaptic('selection');
    setProfile((prev) => ({ ...prev, lifeStage: stage }));
  };

  const handleGoalSelect = (goal: SupportGoal) => {
    triggerHaptic('selection');
    setProfile((prev) => ({ ...prev, goal }));
  };

  const handleReset = () => {
    triggerHaptic('light');
    const defaults = getDefaultDosageProfile(product.slug);
    setProfile(defaults);
    setAgeRaw(String(defaults.age));
    setWeightRaw(String(defaults.weight));
  };

  const ageId = `${uid}-age`;
  const weightId = `${uid}-weight`;

  return (
    <section
      id="dosage-calculator"
      aria-labelledby={`${uid}-heading`}
      className="mt-8 scroll-mt-20 rounded-[28px] border border-[#E3E9E0] bg-[#FEFDF9] p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8EEE5] pb-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3EA] text-[#173A2C]">
            <Calculator size={19} strokeWidth={1.85} aria-hidden="true" />
          </div>
          <div>
            <h2
              id={`${uid}-heading`}
              className="text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-[#153226]"
            >
              Suggested intake calculator
            </h2>
            <p className="mt-1 text-[14px] leading-[1.55] text-[#556B5F]">
              Estimate a label-based daily reference for {product.name} using your
              age, weight, and care stage.
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={IOS_SPRING_SNAPPY}
          onClick={handleReset}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#D4DFD1] bg-[#F7F8F1] px-3.5 py-1.5 text-[13px] font-medium text-[#3C5649] hover:bg-[#EDF3EA] hover:text-[#153226] transition-colors cursor-pointer"
        >
          <RotateCcw size={13.5} strokeWidth={1.9} aria-hidden="true" />
          <span>Reset</span>
        </motion.button>
      </div>

      {/* Main 2-column grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: User Attribute Inputs */}
        <div className="lg:col-span-5 space-y-5">
          {/* Age & Weight row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age Field */}
            <div>
              <div className="flex min-h-[26px] items-center justify-between gap-2">
                <label
                  htmlFor={ageId}
                  className="block text-[13px] font-semibold text-[#153226]"
                >
                  Age (years)
                </label>
              </div>
              <div className="mt-1.5 flex items-center rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] p-1 focus-within:border-[#173A2C] focus-within:bg-white transition-colors">
                <button
                  type="button"
                  onClick={() => stepAge(-1)}
                  aria-label="Decrease age"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#3C5649] hover:bg-[#E7EEE4] hover:text-[#153226] transition-colors cursor-pointer"
                >
                  <Minus size={15} strokeWidth={2} />
                </button>
                <input
                  id={ageId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={110}
                  value={ageRaw}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  aria-invalid={Boolean(validation.errors.age)}
                  aria-describedby={validation.errors.age ? `${ageId}-error` : undefined}
                  className="w-full min-w-0 bg-transparent px-1.5 text-center font-mono text-[15px] font-semibold tabular-nums text-[#153226] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => stepAge(1)}
                  aria-label="Increase age"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#3C5649] hover:bg-[#E7EEE4] hover:text-[#153226] transition-colors cursor-pointer"
                >
                  <Plus size={15} strokeWidth={2} />
                </button>
              </div>
              {validation.errors.age && (
                <p
                  id={`${ageId}-error`}
                  role="alert"
                  className="mt-1.5 text-[12.5px] font-medium text-[#9A3412]"
                >
                  {validation.errors.age}
                </p>
              )}
            </div>

            {/* Weight Field with Unit Toggle */}
            <div>
              <div className="flex min-h-[26px] items-center justify-between gap-2">
                <label
                  htmlFor={weightId}
                  className="block text-[13px] font-semibold text-[#153226]"
                >
                  Body weight
                </label>
                <div
                  role="radiogroup"
                  aria-label="Weight unit"
                  className="inline-flex rounded-full bg-[#E9EFE6] p-0.5"
                >
                  {(['kg', 'lb'] as const).map((unit) => {
                    const active = profile.weightUnit === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleUnitSwitch(unit)}
                        className={`relative rounded-full px-2.5 py-0.5 text-[11.5px] font-mono font-semibold uppercase transition-colors cursor-pointer ${
                          active ? 'text-[#153226]' : 'text-[#556B5F] hover:text-[#153226]'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId={`${uid}-weight-unit`}
                            transition={IOS_SPRING_SNAPPY}
                            className="absolute inset-0 rounded-full bg-white shadow-xs"
                          />
                        )}
                        <span className="relative z-10">{unit}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-1.5 flex items-center rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] p-1 focus-within:border-[#173A2C] focus-within:bg-white transition-colors">
                <button
                  type="button"
                  onClick={() => stepWeight(profile.weightUnit === 'kg' ? -2 : -5)}
                  aria-label="Decrease weight"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#3C5649] hover:bg-[#E7EEE4] hover:text-[#153226] transition-colors cursor-pointer"
                >
                  <Minus size={15} strokeWidth={2} />
                </button>
                <input
                  id={weightId}
                  type="number"
                  inputMode="decimal"
                  min={profile.weightUnit === 'kg' ? 15 : 33}
                  max={profile.weightUnit === 'kg' ? 250 : 550}
                  step="0.5"
                  value={weightRaw}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  aria-invalid={Boolean(validation.errors.weight)}
                  aria-describedby={validation.errors.weight ? `${weightId}-error` : undefined}
                  className="w-full min-w-0 bg-transparent px-1.5 text-center font-mono text-[15px] font-semibold tabular-nums text-[#153226] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => stepWeight(profile.weightUnit === 'kg' ? 2 : 5)}
                  aria-label="Increase weight"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#3C5649] hover:bg-[#E7EEE4] hover:text-[#153226] transition-colors cursor-pointer"
                >
                  <Plus size={15} strokeWidth={2} />
                </button>
              </div>
              {validation.errors.weight && (
                <p
                  id={`${weightId}-error`}
                  role="alert"
                  className="mt-1.5 text-[12.5px] font-medium text-[#9A3412]"
                >
                  {validation.errors.weight}
                </p>
              )}
            </div>
          </div>

          {/* Life Stage Selector */}
          <fieldset>
            <legend className="text-[13px] font-semibold text-[#153226]">
              Life stage &amp; care context
            </legend>
            <div
              role="radiogroup"
              aria-label="Life stage and care context"
              className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {LIFE_STAGE_OPTIONS.map((option) => {
                const selected = profile.lifeStage === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    whileTap={{ scale: 0.98 }}
                    transition={IOS_SPRING_SNAPPY}
                    onClick={() => handleLifeStageSelect(option.value)}
                    className={`min-h-[54px] rounded-2xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#173A2C] bg-[#173A2C] text-white'
                        : 'border-[#DCE5D8] bg-[#F7F8F1] text-[#153226] hover:border-[#BDCCB9] hover:bg-[#EFF4EC]'
                    }`}
                  >
                    <span className="block text-[13.5px] font-semibold leading-snug">
                      {option.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11.5px] ${
                        selected ? 'text-white/75' : 'text-[#556B5F]'
                      }`}
                    >
                      {option.hint}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </fieldset>

          {/* Support Goal Selector */}
          <fieldset>
            <legend className="text-[13px] font-semibold text-[#153226]">
              Support intensity
            </legend>
            <div
              role="radiogroup"
              aria-label="Support intensity"
              className="mt-2 grid grid-cols-2 gap-2.5"
            >
              {GOAL_OPTIONS.map((option) => {
                const selected = profile.goal === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    whileTap={{ scale: 0.98 }}
                    transition={IOS_SPRING_SNAPPY}
                    onClick={() => handleGoalSelect(option.value)}
                    className={`min-h-[52px] rounded-2xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#173A2C] bg-[#EDF3EA] text-[#153226] ring-1 ring-[#173A2C]/25'
                        : 'border-[#DCE5D8] bg-[#F7F8F1] text-[#3C5649] hover:border-[#BDCCB9] hover:bg-[#EFF4EC]'
                    }`}
                  >
                    <span className="block text-[13.5px] font-semibold leading-snug text-[#153226]">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-[#556B5F]">
                      {option.hint}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Right: Calculated Intake Summary */}
        <div className="lg:col-span-7">
          {!result ? (
            <div
              role="status"
              className="rounded-3xl border border-[#E6D9C6] bg-[#FBF6EE] p-6 text-[#6D4C1D]"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} strokeWidth={1.9} aria-hidden="true" />
                <h3 className="text-[16px] font-bold">
                  Enter valid age and weight values
                </h3>
              </div>
              <p className="mt-2 text-[14px] leading-[1.6]">
                Adjust the highlighted input fields on the left to generate a
                suggested daily intake reference for {product.name}.
              </p>
            </div>
          ) : (
            <motion.div
              key={`${product.slug}-${result.status}-${result.suggestedAmount}`}
              data-tooltip-bounds="true"
              initial={{ opacity: 0.72, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={IOS_SPRING_GENTLE}
              aria-live="polite"
              className={`rounded-3xl border p-6 sm:p-7 ${
                result.status === 'clinician-review'
                  ? 'border-[#E6D5BA] bg-[#FAF4E8]'
                  : 'border-[#D7E3D4] bg-[#EDF3EA]'
              }`}
            >
              {/* Primary Suggested Intake Header */}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    result.status === 'clinician-review'
                      ? 'text-[#7C5318]'
                      : 'text-[#3C5B4B]'
                  }`}
                >
                  {result.statusLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#4C6156]">
                  <Clock size={13.5} strokeWidth={1.9} aria-hidden="true" />
                  <span>{result.schedule}</span>
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5">
                <p className="font-mono text-[clamp(1.38rem,2vw,1.76rem)] font-bold leading-[1.15] tracking-[-0.02em] tabular-nums text-[#153226]">
                  {result.suggestedAmount}
                </p>
                <MeasurementTooltip
                  tip={getPrimaryMeasurementTip(product.slug, result.dailyUnits)}
                  triggerLabel="How to measure"
                  ariaLabel={`How to measure ${result.suggestedAmount} of ${product.name}`}
                  variant="pill"
                  align="auto"
                />
              </div>
              <p className="mt-1.5 text-[14.5px] font-medium text-[#2F4D3E]">
                {result.servingDetail}
              </p>
              <p className="mt-3 text-[14px] leading-[1.62] text-[#4C6156]">
                {result.rationale}
              </p>

              {result.proteinTargetNote && (
                <p className="mt-3 rounded-2xl border border-[#D4E0D0] bg-[#FEFDF9]/85 px-4 py-3 text-[13.5px] leading-[1.55] text-[#2F4D3E]">
                  {result.proteinTargetNote}
                </p>
              )}

              {/* Active Delivery Breakdown */}
              <div className="mt-5 border-t border-[#D6E1D3] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.11em] text-[#556B5F]">
                    {result.dailyUnits > 0
                      ? 'Estimated daily nutrient delivery'
                      : 'Standard adult tablet reference'}
                  </h3>
                  <span className="text-[11.5px] text-[#5B7065]">
                    Tap or hover unit icons for measuring tips
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                  {result.nutrientDeliveries.map((item) => {
                    const unitKey = detectNutrientUnitKey(item.amount);
                    return (
                      <div
                        key={item.label}
                        className="flex items-start justify-between gap-2 border-b border-[#DCE6D8]/80 pb-2 text-[13px] leading-snug"
                      >
                        <dt className="text-[#4C6156] min-w-0">
                          {item.label}
                          {item.note && (
                            <span className="mt-0.5 block text-[11px] text-[#667B70]">
                              {item.note}
                            </span>
                          )}
                        </dt>
                        <dd className="inline-flex items-center gap-1 font-mono text-[12.5px] font-semibold tabular-nums text-[#153226] text-right shrink-0">
                          <span>{item.amount}</span>
                          {unitKey && (
                            <MeasurementTooltip
                              tip={getUnitMeasurementTip(unitKey)}
                              triggerLabel={unitKey.toUpperCase()}
                              ariaLabel={`How to measure ${unitKey.toUpperCase()} for ${item.label}`}
                              variant="icon"
                              align="auto"
                            />
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              {/* Administration & Safety Notes */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#D6E1D3] pt-4 text-[13px] leading-[1.58]">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-[#153226]">
                    <ShieldCheck size={14.5} strokeWidth={1.9} aria-hidden="true" />
                    <span>Administration tips</span>
                  </div>
                  <ul className="mt-1.5 space-y-1.5 text-[#4C6156] list-disc pl-4">
                    {result.administrationTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-[#153226]">
                    <Info size={14.5} strokeWidth={1.9} aria-hidden="true" />
                    <span>Safety considerations</span>
                  </div>
                  <ul className="mt-1.5 space-y-1.5 text-[#4C6156] list-disc pl-4">
                    {result.safetyNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Compact Informational Notice */}
          <p className="mt-3 text-[12px] leading-[1.55] text-[#61756A]">
            For general educational reference only based on published Genovaris
            Lifesciences product composition. Always follow your physician&apos;s
            prescription and the physical container label.
          </p>
        </div>
      </div>
    </section>
  );
}
