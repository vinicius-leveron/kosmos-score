/**
 * CurrencyInput - Input component for currency values
 * Formats input as Brazilian Real (BRL)
 */

import * as React from 'react';
import { cn } from '@/design-system/lib/utils';
import { Input } from '@/design-system/primitives/input';

interface CurrencyInputProps {
  /** Current value in cents */
  value?: number;
  /** Callback when value changes */
  onChange: (value: number | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * Formats a number as BRL currency string
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Parses a currency string to cents (integer)
 */
function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

/**
 * CurrencyInput - Input for monetary values with BRL formatting
 *
 * @example
 * <CurrencyInput
 *   value={150000} // R$ 1.500,00
 *   onChange={setValue}
 *   placeholder="R$ 0,00"
 * />
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder = 'R$ 0,00',
  className,
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() =>
    value ? formatCurrency(value) : ''
  );

  // Sync display value when external value changes
  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatCurrency(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cents = parseCurrency(rawValue);

    if (cents === 0 && rawValue !== '') {
      setDisplayValue('');
      onChange(undefined);
    } else if (cents > 0) {
      setDisplayValue(formatCurrency(cents));
      onChange(cents);
    } else {
      setDisplayValue('');
      onChange(undefined);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all on focus for easy editing
    e.target.select();
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(className)}
    />
  );
}
