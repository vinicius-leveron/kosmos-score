/**
 * DatePicker - Date selection component with popover calendar
 * Wrapper around Calendar for form integration
 */

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Calendar } from '@/design-system/primitives/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/primitives/popover';

interface DatePickerProps {
  /** Selected date value */
  value?: Date;
  /** Callback when date changes */
  onChange: (date: Date | undefined) => void;
  /** Placeholder text when no date selected */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
}

/**
 * DatePicker - Allows users to select a date from a calendar popover
 *
 * @example
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   placeholder="Selecionar data..."
 * />
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecionar data...',
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, 'PPP', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
