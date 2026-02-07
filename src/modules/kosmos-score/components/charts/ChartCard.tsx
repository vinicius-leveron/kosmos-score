import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, icon: Icon, children, className }: ChartCardProps) {
  return (
    <div className={cn('card-structural p-6', className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        {Icon && <Icon className="h-5 w-5 text-kosmos-orange" />}
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
