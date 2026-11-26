import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, AlertCircle, BarChart3, Clock, ShieldCheck } from 'lucide-react';
import type { ProductFormulation } from '../types/medicine';
import {
  getDosageGuidelineChartData,
  type ChartDimension,
  type DosageGuidelinePoint,
} from '../utils/dosageChartData';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_GENTLE, IOS_SPRING_SNAPPY } from '../utils/motion';

interface DosageGuidelineChartProps {
  product: ProductFormulation;
}

interface ChartDatum extends DosageGuidelinePoint {
  baselineBar: number;
  upperRangeBar: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

function ClinicalTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="max-w-[260px] rounded-2xl border border-[#D4DFD1] bg-[#FEFDF9]/96 p-3.5 shadow-lg backdrop-blur-xs">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#556B5F]">
        {item.label}
      </p>
      <p className="mt-1 font-mono text-[15px] font-bold tabular-nums text-[#153226]">
        {item.rangeDisplay}
      </p>
      <p className="mt-1 text-[12.5px] font-medium text-[#2F4D3E]">
        {item.activeDelivery}
      </p>
      <p className="mt-1.5 text-[12px] leading-[1.5] text-[#4C6156]">
        {item.timing}
      </p>
    </div>
  );
}

const DIMENSION_OPTIONS: Array<{ value: ChartDimension; label: string }> = [
  { value: 'profile', label: 'By care profile' },
  { value: 'weight', label: 'By weight band' },
];

export function DosageGuidelineChart({ product }: DosageGuidelineChartProps) {
  const uid = useId();
  const chartConfig = useMemo(
    () => getDosageGuidelineChartData(product),
    [product]
  );

  const [dimension, setDimension] = useState<ChartDimension>('profile');

  const rawPoints =
    dimension === 'profile' ? chartConfig.byProfile : chartConfig.byWeight;

  const chartData = useMemo<ChartDatum[]>(
    () =>
      rawPoints.map((point) => {
        if (point.clinicianReview) {
          return { ...point, baselineBar: 0, upperRangeBar: 0 };
        }
        const upperSpan = Math.max(0, Number((point.maxIntake - point.minIntake).toFixed(2)));
        return {
          ...point,
          baselineBar: point.minIntake,
          upperRangeBar: upperSpan,
        };
      }),
    [rawPoints]
  );

  const defaultSelectedId = useMemo(() => {
    const adult = rawPoints.find((p) => p.id === 'adult-maint');
    if (adult) return adult.id;
    const firstStandard = rawPoints.find((p) => !p.clinicianReview);
    return firstStandard?.id ?? rawPoints[0]?.id ?? '';
  }, [rawPoints]);

  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId);

  useEffect(() => {
    setDimension('profile');
  }, [product.slug]);

  useEffect(() => {
    setSelectedId(defaultSelectedId);
  }, [defaultSelectedId]);

  const selectedPoint =
    chartData.find((p) => p.id === selectedId) ?? chartData[0] ?? null;

  const handleDimensionSwitch = (next: ChartDimension) => {
    if (next === dimension) return;
    triggerHaptic('selection');
    setDimension(next);
  };

  const handleSelectPoint = (id: string) => {
    triggerHaptic('selection');
    setSelectedId(id);
  };

  return (
    <section
      id="dosage-guideline-chart"
      aria-labelledby={`${uid}-heading`}
      className="mt-8 scroll-mt-20 rounded-[28px] border border-[#E3E9E0] bg-[#FEFDF9] p-6 sm:p-8"
    >
      {/* Header */}
      <div className="border-b border-[#E8EEE5] pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3EA] text-[#173A2C]">
              <BarChart3 size={19} strokeWidth={1.85} aria-hidden="true" />
            </div>
            <div>
              <h2
                id={`${uid}-heading`}
                className="text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-[#153226]"
              >
                Interactive dosage guideline chart
              </h2>
              <p className="mt-1 text-[14px] leading-[1.55] text-[#556B5F] max-w-2xl">
                {chartConfig.subtitle}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Chart comparison axis"
            className="inline-flex self-start rounded-full bg-[#EDF3EA] p-1 shrink-0"
          >
            {DIMENSION_OPTIONS.map((option) => {
              const active = dimension === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleDimensionSwitch(option.value)}
                  className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'text-[#153226]'
                      : 'text-[#4C6156] hover:text-[#153226]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`${uid}-chart-dimension`}
                      transition={IOS_SPRING_SNAPPY}
                      className="absolute inset-0 rounded-full bg-[#FEFDF9] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content: Recharts Visualization + Selected Profile Readout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Recharts Stacked Range Bar Chart */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-[#E5ECE2] bg-[#F7F9F4] p-4 sm:p-5">
            {/* Compact Legend */}
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#4C6156]">
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-xs bg-[#6E9680]"
                  aria-hidden="true"
                />
                <span>Standard baseline</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-xs bg-[#173A2C]"
                  aria-hidden="true"
                />
                <span>Physician-guided upper range</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-0.5 w-4 border-t-2 border-dashed border-[#8E6A2A]"
                  aria-hidden="true"
                />
                <span>Adult ceiling</span>
              </span>
            </div>

            <div
              className="h-[270px] w-full"
              role="img"
              aria-label={`Interactive dosage range chart for ${product.name} grouped ${dimension === 'profile' ? 'by care profile' : 'by body weight band'}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 18, right: 16, left: 4, bottom: 4 }}
                  barCategoryGap="26%"
                  onClick={(state) => {
                    const clickedIndex =
                      typeof state?.activeTooltipIndex === 'number'
                        ? state.activeTooltipIndex
                        : -1;
                    if (clickedIndex >= 0 && chartData[clickedIndex]) {
                      handleSelectPoint(chartData[clickedIndex].id);
                    }
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#E1E9DF"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="shortLabel"
                    axisLine={{ stroke: '#D5E0D2' }}
                    tickLine={false}
                    tick={{ fill: '#4C6156', fontSize: 12, fontWeight: 500 }}
                    dy={6}
                  />
                  <YAxis
                    domain={[0, chartConfig.maxDomain]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#556B5F', fontSize: 11.5 }}
                    width={52}
                    label={{
                      value: chartConfig.yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 8,
                      style: { fill: '#556B5F', fontSize: 11, fontWeight: 500, textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip
                    content={<ClinicalTooltip />}
                    cursor={{ fill: '#E7EFE5', opacity: 0.5 }}
                  />
                  <ReferenceLine
                    y={chartConfig.upperLimitValue}
                    stroke="#8E6A2A"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                  />
                  <Bar
                    dataKey="baselineBar"
                    stackId="intake"
                    name="Standard baseline"
                    maxBarSize={44}
                    radius={[0, 0, 6, 6]}
                    isAnimationActive={true}
                    animationDuration={420}
                  >
                    {chartData.map((entry) => {
                      const isSelected = entry.id === selectedPoint?.id;
                      const isSingleBar = entry.upperRangeBar === 0;
                      return (
                        <Cell
                          key={`base-${entry.id}`}
                          cursor="pointer"
                          fill={
                            isSelected
                              ? isSingleBar
                                ? '#173A2C'
                                : '#4A7A63'
                              : '#7FA591'
                          }
                        />
                      );
                    })}
                  </Bar>
                  <Bar
                    dataKey="upperRangeBar"
                    stackId="intake"
                    name="Physician-guided upper range"
                    maxBarSize={44}
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={460}
                  >
                    {chartData.map((entry) => {
                      const isSelected = entry.id === selectedPoint?.id;
                      return (
                        <Cell
                          key={`upper-${entry.id}`}
                          cursor="pointer"
                          fill={isSelected ? '#153226' : '#2C5945'}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-2 text-[11.5px] font-medium text-[#6B5A38]">
              Dashed reference line: {chartConfig.upperLimitLabel}
            </p>
          </div>

          {/* Accessible Profile Selector Strip for Keyboard & Touch */}
          <div
            role="radiogroup"
            aria-label="Inspect dosage profile details"
            className="mt-3.5 flex flex-wrap gap-2"
          >
            {chartData.map((item) => {
              const selected = item.id === selectedPoint?.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  whileTap={{ scale: 0.97 }}
                  transition={IOS_SPRING_SNAPPY}
                  onClick={() => handleSelectPoint(item.id)}
                  className={`min-h-[38px] rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer ${
                    selected
                      ? item.clinicianReview
                        ? 'border-[#C59B52] bg-[#FAF4E8] text-[#754D14]'
                        : 'border-[#173A2C] bg-[#173A2C] text-white'
                      : 'border-[#DCE5D8] bg-[#F7F8F1] text-[#3C5649] hover:border-[#BDCCB9] hover:bg-[#EDF3EA]'
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Profile Guideline Breakdown Card */}
        <div className="lg:col-span-5">
          {selectedPoint && (
            <motion.div
              key={`${product.slug}-${dimension}-${selectedPoint.id}`}
              initial={{ opacity: 0.72, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={IOS_SPRING_GENTLE}
              aria-live="polite"
              className={`rounded-3xl border p-6 ${
                selectedPoint.clinicianReview
                  ? 'border-[#E6D5BA] bg-[#FAF4E8]'
                  : 'border-[#D7E3D4] bg-[#EDF3EA]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    selectedPoint.clinicianReview
                      ? 'text-[#7C5318]'
                      : 'text-[#3C5B4B]'
                  }`}
                >
                  {selectedPoint.clinicianReview
                    ? 'Specialist review required'
                    : 'Profile guideline'}
                </span>
                {selectedPoint.clinicianReview ? (
                  <AlertCircle
                    size={16}
                    className="text-[#8E6220]"
                    aria-hidden="true"
                  />
                ) : (
                  <Activity
                    size={16}
                    className="text-[#2F5342]"
                    aria-hidden="true"
                  />
                )}
              </div>

              <h3 className="mt-2 text-[18px] font-bold text-[#153226]">
                {selectedPoint.label}
              </h3>

              <p className="mt-2 font-mono text-[24px] font-bold tracking-[-0.02em] tabular-nums text-[#153226]">
                {selectedPoint.rangeDisplay}
              </p>

              <dl className="mt-4 space-y-3 border-t border-[#D6E1D3] pt-4 text-[13.5px]">
                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                    Active delivery
                  </dt>
                  <dd className="mt-0.5 font-mono text-[13px] font-medium tabular-nums text-[#153226]">
                    {selectedPoint.activeDelivery}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                    <Clock size={12.5} aria-hidden="true" />
                    <span>Typical schedule</span>
                  </dt>
                  <dd className="mt-0.5 font-medium text-[#153226]">
                    {selectedPoint.timing}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                    <ShieldCheck size={12.5} aria-hidden="true" />
                    <span>Clinical context</span>
                  </dt>
                  <dd className="mt-1 leading-[1.6] text-[#4C6156]">
                    {selectedPoint.guidance}
                  </dd>
                </div>
              </dl>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
