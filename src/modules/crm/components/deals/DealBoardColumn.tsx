import { useState } from 'react';
import { cn } from '@/design-system/lib/utils';
import { DollarSign } from 'lucide-react';
import { DealCard } from './DealCard';
import type { DealBoardColumn as DealBoardColumnType } from '../../types';

interface DealBoardColumnProps {
  column: DealBoardColumnType;
  onDealClick?: (dealId: string) => void;
  onDrop?: (dealId: string, stageId: string) => void;
}

export function DealBoardColumn({ column, onDealClick, onDrop }: DealBoardColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId && onDrop) {
      onDrop(dealId, column.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col w-72 shrink-0 h-full">
      {/* Header */}
      <div
        className="p-3 rounded-t-lg border-b-2 shrink-0"
        style={{
          backgroundColor: `${column.color}15`,
          borderColor: column.color,
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-medium text-sm">{column.display_name}</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {column.count}
          </span>
        </div>

        {column.total_value > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            <span>{formatCurrency(column.total_value)}</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex-1 p-2 space-y-2 bg-muted/30 rounded-b-lg min-h-[200px] overflow-y-auto',
          'transition-colors',
          isOver && 'bg-primary/10'
        )}
      >
        {column.deals.map((deal) => (
          <div
            key={deal.id}
            draggable
            onDragStart={(e) => handleDragStart(e, deal.id)}
            className="cursor-grab active:cursor-grabbing"
          >
            <DealCard
              deal={deal}
              onClick={() => onDealClick?.(deal.id)}
            />
          </div>
        ))}

        {column.deals.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Arraste deals aqui
          </div>
        )}
      </div>
    </div>
  );
}
