import { Badge } from '@/design-system/primitives/badge';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { FinancialTransactionType } from '../../types';

interface TransactionTypeBadgeProps {
  type: FinancialTransactionType;
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  if (type === 'receivable') {
    return (
      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
        <ArrowDownLeft className="h-3 w-3 mr-1" />
        A Receber
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
      <ArrowUpRight className="h-3 w-3 mr-1" />
      A Pagar
    </Badge>
  );
}
