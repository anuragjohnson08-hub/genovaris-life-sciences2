import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Bookmark, Check } from 'lucide-react';
import type { ProductFormulation } from '../types/medicine';
import { FormulationIcon } from './FormulationIcon';
import { useRegimen } from '../context/RegimenContext';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_HOVER, IOS_SPRING_SNAPPY } from '../utils/motion';

interface FormulationCardProps {
  product: ProductFormulation;
  index?: number;
}

export function FormulationCard({ product, index = 0 }: FormulationCardProps) {
  const { isInRegimen, toggleRegimenItem } = useRegimen();
  const [imgFailed, setImgFailed] = useState(false);
  const saved = isInRegimen(product.slug);

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.34,
        delay: Math.min(index * 0.055, 0.22),
        ease: [0.22, 1, 0.36, 1],
        layout: IOS_SPRING_SNAPPY,
      }}
      whileHover={{ y: -3, transition: IOS_SPRING_HOVER }}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] transition-[border-color,box-shadow] duration-250 hover:border-[#C2D1BF] hover:shadow-[0_14px_32px_rgba(21,50,38,0.07)] will-change-transform"
    >
      <div>
        {/* Product Card Visual Preview */}
        <Link
          to={`/products/${product.slug}`}
          onClick={() => triggerHaptic('selection')}
          className="block relative aspect-[16/10] w-full overflow-hidden bg-[#EDF3EA] border-b border-[#EAEFE8]"
          aria-label={`Inspect ${product.name} clinical monograph and details`}
        >
          {!imgFailed ? (
            <img
              src={product.cardImage ?? product.brochureImage}
              alt={`${product.name} — ${product.subtitle}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#EDF3EA] p-6 text-center text-sm font-medium text-[#4C6156]">
              {product.name}
            </div>
          )}
        </Link>

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3 min-w-0">
            <FormulationIcon
              icon={product.icon}
              medallionBg={product.medallionBg}
            />
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-medium text-[#556B5F]">
              <span className="font-mono tabular-nums">{product.code}</span>
              <span aria-hidden="true">·</span>
              <span>{product.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{product.dosageForm}</span>
            </p>
          </div>

          <h3 className="mt-4 font-display text-[23px] font-semibold leading-snug tracking-[-0.015em] text-[#153226]">
            <Link
              to={`/products/${product.slug}`}
              onClick={() => triggerHaptic('selection')}
              className="hover:text-[#1D4A38] transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          <ul
            aria-label={`${product.name} quick overview`}
            className="mt-4 space-y-2.5 border-t border-[#EAEFE8] pt-4 text-[14px] leading-[1.5] text-[#4C6156]"
          >
            {product.quickPoints.map((point) => (
              <li key={point.label} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#173A2C]"
                />
                <span>
                  <span className="font-semibold text-[#153226]">
                    {point.label}:{' '}
                  </span>
                  <span>{point.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-6 sm:px-7 pb-6 pt-1 flex items-center justify-between gap-3">
        <Link
          to={`/products/${product.slug}`}
          onClick={() => triggerHaptic('selection')}
          className="underline-trigger inline-flex min-h-[42px] items-center gap-1.5 text-[14px] font-semibold text-[#173A2C] whitespace-nowrap hover:text-[#102B20] transition-colors"
        >
          <span className="link-underline-center">View monograph</span>
          <ArrowRight
            size={15}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          transition={IOS_SPRING_SNAPPY}
          onClick={() => toggleRegimenItem(product.slug)}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${product.name} from Supply List`
              : `Add ${product.name} to Supply List`
          }
          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
            saved
              ? 'bg-[#E3ECE4] text-[#153226] hover:bg-[#D5E3D7]'
              : 'border border-[#D5DFD2] bg-transparent text-[#354E41] hover:bg-[#F1F5EE] hover:text-[#153226]'
          }`}
        >
          {saved ? (
            <>
              <Check size={14} strokeWidth={2.2} aria-hidden="true" />
              <span>In Supply List</span>
            </>
          ) : (
            <>
              <Bookmark size={14} strokeWidth={1.85} aria-hidden="true" />
              <span>Add to Supply</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}
