import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  type: z.enum(['revenue', 'expense', 'cost'], { required_error: 'Tipo é obrigatório' }),
  dre_group: z.enum([
    'receita_bruta', 'deducoes', 'custos',
    'despesas_administrativas', 'despesas_comerciais', 'despesas_pessoal',
    'despesas_outras', 'depreciacao_amortizacao', 'resultado_financeiro',
    'impostos', 'outras_receitas', 'outras_despesas',
  ], { required_error: 'Grupo DRE é obrigatório' }),
  parent_id: z.string().uuid().optional().or(z.literal('')),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const accountFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum(['checking', 'savings', 'cash', 'credit_card', 'investment', 'digital_wallet', 'other'], {
    required_error: 'Tipo é obrigatório',
  }),
  bank_name: z.string().optional(),
  bank_branch: z.string().optional(),
  account_number: z.string().optional(),
  initial_balance: z.number().optional().default(0),
  currency: z.string().optional().default('BRL'),
  color: z.string().optional(),
  description: z.string().optional(),
});

export const transactionFormSchema = z.object({
  type: z.enum(['receivable', 'payable']),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  competence_date: z.string().min(1, 'Data de competência é obrigatória'),
  category_id: z.string().uuid().optional().or(z.literal('')),
  account_id: z.string().uuid().optional().or(z.literal('')),
  cost_center_id: z.string().uuid().optional().or(z.literal('')),
  counterparty_name: z.string().optional(),
  counterparty_document: z.string().optional(),
  document_number: z.string().optional(),
  document_type: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const paymentFormSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  account_id: z.string().uuid('Selecione uma conta'),
});

export const recurrenceFormSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  type: z.enum(['receivable', 'payable']),
  amount: z.number().positive('Valor deve ser positivo'),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().optional(),
  day_of_month: z.number().min(1).max(31).optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  account_id: z.string().uuid().optional().or(z.literal('')),
  cost_center_id: z.string().uuid().optional().or(z.literal('')),
  counterparty_name: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type AccountFormValues = z.infer<typeof accountFormSchema>;
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
export type RecurrenceFormValues = z.infer<typeof recurrenceFormSchema>;
