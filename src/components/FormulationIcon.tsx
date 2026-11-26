import { Activity, Bone, Brain, Droplet } from 'lucide-react';
import type { FormulationIconKey } from '../types/medicine';

interface FormulationIconProps {
  icon: FormulationIconKey;
  medallionBg: string;
  size?: 'md' | 'lg';
}

export function FormulationIcon({
  icon,
  medallionBg,
  size = 'md',
}: FormulationIconProps) {
  const dimension = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const iconSize = size === 'lg' ? 24 : 20;

  const renderGlyph = () => {
    switch (icon) {
      case 'bone':
        return <Bone size={iconSize} strokeWidth={1.7} />;
      case 'droplet':
        return <Droplet size={iconSize} strokeWidth={1.7} />;
      case 'brain':
        return <Brain size={iconSize} strokeWidth={1.7} />;
      case 'nutrition':
        return <Activity size={iconSize} strokeWidth={1.7} />;
    }
  };

  return (
    <span
      className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full text-[#294A3B]`}
      style={{ backgroundColor: medallionBg }}
      aria-hidden="true"
    >
      {renderGlyph()}
    </span>
  );
}
