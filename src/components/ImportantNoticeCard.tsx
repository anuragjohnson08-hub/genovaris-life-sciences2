import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ImportantNoticeCardProps {
  showDisclaimerLink?: boolean;
}

export function ImportantNoticeCard({
  showDisclaimerLink = true,
}: ImportantNoticeCardProps) {
  return (
    <section
      aria-labelledby="important-information-heading"
      className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-9"
    >
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <span
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDF3EA] text-[#3B5B4B]"
          aria-hidden="true"
        >
          <Info size={20} strokeWidth={1.75} />
        </span>

        <div className="space-y-3 max-w-3xl">
          <h2
            id="important-information-heading"
            className="text-[20px] font-bold tracking-[-0.02em] text-[#153226]"
          >
            Important information
          </h2>
          <p className="text-[15px] leading-[1.68] text-[#4C6156]">
            This website provides general product information and verified
            clinical monograph summaries, and does not provide medical advice,
            diagnosis, or treatment. Product information should always be checked
            against the final verified container label. Consult a qualified
            healthcare professional with questions about your health or whether a
            product is appropriate for you.
          </p>
          {showDisclaimerLink && (
            <div className="pt-1">
              <Link
                to="/#disclaimer"
                onClick={() => triggerHaptic('selection')}
                className="group underline-trigger inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors"
              >
                <span className="link-underline-center">
                  Read full clinical &amp; regulatory disclaimer
                </span>
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
