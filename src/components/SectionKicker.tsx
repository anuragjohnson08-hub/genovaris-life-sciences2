interface SectionKickerProps {
  label: string;
}

export function SectionKicker({ label }: SectionKickerProps) {
  return (
    <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#556B5F]">
      <span className="h-px w-5 bg-[#7B9286]" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
