import { Building2, Calendar, DollarSign, User } from 'lucide-react';
import type { DealBoardCard } from '../../types';

interface DealCardProps {
  deal: DealBoardCard;
  onClick?: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: deal.currency || 'BRL',
      notation: 'compact',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div
      onClick={onClick}
      className="p-3 bg-card border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
    >
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{deal.name}</h4>

      {deal.company_name && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          {deal.company_logo_url ? (
            <img
              src={deal.company_logo_url}
              alt={deal.company_name}
              className="h-4 w-4 rounded object-cover"
            />
          ) : (
            <Building2 className="h-3.5 w-3.5" />
          )}
          <span className="truncate">{deal.company_name}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {deal.amount && (
            <span className="flex items-center gap-1 font-medium text-green-600">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(deal.amount)}
            </span>
          )}

          {deal.probability && (
            <span className="text-muted-foreground">
              {deal.probability}%
            </span>
          )}
        </div>

        {deal.expected_close_date && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(deal.expected_close_date)}
          </span>
        )}
      </div>

      {deal.primary_contact_name && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t">
          <User className="h-3 w-3" />
          <span className="truncate">{deal.primary_contact_name}</span>
        </div>
      )}
    </div>
  );
}
