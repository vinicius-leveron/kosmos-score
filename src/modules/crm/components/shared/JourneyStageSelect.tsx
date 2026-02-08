import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { useJourneyStages } from '../../hooks/useJourneyStages';

interface JourneyStageSelectProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function JourneyStageSelect({
  value,
  onValueChange,
  placeholder = 'Selecione o estágio',
  disabled = false,
  className,
}: JourneyStageSelectProps) {
  const { data: stages, isLoading } = useJourneyStages();

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {stages?.map((stage) => (
          <SelectItem key={stage.id} value={stage.id}>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span>{stage.display_name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
