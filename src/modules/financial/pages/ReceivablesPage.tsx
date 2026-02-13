import { ArrowDownLeft } from 'lucide-react';
import {
  TransactionListPage,
  type TransactionPageConfig,
} from '../components/transactions/TransactionListPage';

const receivablesConfig: TransactionPageConfig = {
  type: 'receivable',
  icon: ArrowDownLeft,
  title: 'Contas a Receber',
  description: 'Gerencie receitas e valores a receber',
  createButtonLabel: 'Nova Receita',
  sheetTitle: 'Nova Receita',
  sheetDescription: 'Preencha os dados para registrar uma nova receita.',
  emptyTitle: 'Nenhuma receita encontrada',
  emptyDescription:
    'Registre receitas e valores a receber para acompanhar suas entradas financeiras.',
};

export function ReceivablesPage() {
  return <TransactionListPage config={receivablesConfig} />;
}
