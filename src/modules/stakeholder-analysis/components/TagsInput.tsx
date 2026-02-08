/**
 * TagsInput - Input component for managing a list of tags/chips
 * Used for expertise array in StakeholderForm
 */

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';

interface TagsInputProps {
  /** Current array of tags */
  value: string[];
  /** Callback when tags change */
  onChange: (tags: string[]) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * TagsInput - Allows users to add and remove tags
 *
 * @example
 * <TagsInput
 *   value={['React', 'TypeScript']}
 *   onChange={setTags}
 *   placeholder="Adicionar expertise..."
 * />
 */
export function TagsInput({
  value,
  onChange,
  placeholder = 'Adicionar tag...',
  className,
  disabled = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-md border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={`Remover ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
        className="h-7 min-w-[120px] flex-1 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
