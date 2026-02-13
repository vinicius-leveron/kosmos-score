export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateStr));
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return (parseInt(digits, 10) || 0) / 100;
}

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  canceled: 'Cancelado',
  partially_paid: 'Parcial',
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  receivable: 'A Receber',
  payable: 'A Pagar',
};

export const CATEGORY_TYPE_LABELS: Record<string, string> = {
  revenue: 'Receita',
  expense: 'Despesa',
  cost: 'Custo',
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  cash: 'Caixa',
  credit_card: 'Cartão de Crédito',
  investment: 'Investimento',
  digital_wallet: 'Carteira Digital',
  other: 'Outro',
};

export const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export const DRE_GROUP_LABELS: Record<string, string> = {
  receita_bruta: 'Receita Bruta',
  deducoes: 'Deduções',
  custos: 'Custos dos Serviços/Produtos',
  despesas_administrativas: 'Despesas Administrativas',
  despesas_comerciais: 'Despesas Comerciais',
  despesas_pessoal: 'Despesas com Pessoal',
  despesas_outras: 'Outras Despesas Operacionais',
  depreciacao_amortizacao: 'Depreciação e Amortização',
  resultado_financeiro: 'Resultado Financeiro',
  impostos: 'Impostos sobre Lucro',
  outras_receitas: 'Outras Receitas',
  outras_despesas: 'Outras Despesas',
};
