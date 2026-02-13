import { ArrowUpRight } from 'lucide-react';
import {
  TransactionListPage,
  type TransactionPageConfig,
} from '../components/transactions/TransactionListPage';

const payablesConfig: TransactionPageConfig = {
  type: 'payable',
  icon: ArrowUpRight,
  title: 'Contas a Pagar',
  description: 'Gerencie despesas e valores a pagar',
  createButtonLabel: 'Nova Despesa',
  sheetTitle: 'Nova Despesa',
  sheetDescription: 'Preencha os dados para registrar uma nova despesa.',
  emptyTitle: 'Nenhuma despesa encontrada',
  emptyDescription:
    'Registre despesas e valores a pagar para acompanhar suas saidas financeiras.',
};

export function PayablesPage() {
  return <TransactionListPage config={payablesConfig} />;
}
