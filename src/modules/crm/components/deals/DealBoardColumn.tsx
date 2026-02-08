import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DollarSign } from 'lucide-react';
import { DealCard } from './DealCard';
import type { DealBoardColumn as DealBoardColumnType } from '../../types';

interface DealBoardColumnProps {
  column: DealBoardColumnType;
  onDealClick?: (dealId: string) => void;
}

export function DealBoardColumn({ column, onDealClick }: DealBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Header */}
      <div
        className="p-3 rounded-t-lg border-b-2"
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
        ref={setNodeRef}
        className={`
          flex-1 p-2 space-y-2 bg-muted/30 rounded-b-lg min-h-[200px]
          transition-colors
          ${isOver ? 'bg-primary/10' : ''}
        `}
      >
        <SortableContext
          items={column.deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick?.(deal.id)}
            />
          ))}
        </SortableContext>

        {column.deals.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Arraste deals aqui
          </div>
        )}
      </div>
    </div>
  );
}
