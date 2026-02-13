import { Badge } from '@/design-system/primitives/badge';
import type { FinancialTransactionStatus } from '../../types';

const STATUS_CONFIG: Record<FinancialTransactionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'outline' },
  paid: { label: 'Pago', variant: 'default' },
  overdue: { label: 'Vencido', variant: 'destructive' },
  canceled: { label: 'Cancelado', variant: 'secondary' },
  partially_paid: { label: 'Parcial', variant: 'outline' },
};

interface TransactionStatusBadgeProps {
  status: FinancialTransactionStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
