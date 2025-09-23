import { Lightbulb, Footprints, HeartHandshake, type LucideProps } from 'lucide-react';
import type { CASCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  category: CASCategory;
  className?: string;
} & LucideProps;

export function CasCategoryIcon({ category, className, ...props }: Props) {
  const iconProps = {
    className: cn('h-5 w-5', className),
    ...props,
  };
  
  switch (category) {
    case 'Creativity':
      return <Lightbulb {...iconProps} />;
    case 'Activity':
      return <Footprints {...iconProps} />;
    case 'Service':
      return <HeartHandshake {...iconProps} />;
    default:
      return null;
  }
}
