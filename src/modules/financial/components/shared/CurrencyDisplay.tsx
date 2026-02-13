import { cn } from '@/design-system/lib/utils';
import { formatCurrency } from '../../lib/formatters';

interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencyDisplay({ value, currency = 'BRL', className, showSign, size = 'md' }: CurrencyDisplayProps) {
  const isPositive = value >= 0;
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold',
  };

  return (
    <span
      className={cn(
        sizeClasses[size],
        'font-mono tabular-nums',
        showSign && (isPositive ? 'text-green-600' : 'text-red-600'),
        className
      )}
    >
      {showSign && isPositive ? '+' : ''}
      {formatCurrency(value, currency)}
    </span>
  );
}
