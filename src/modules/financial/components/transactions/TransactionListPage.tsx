import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/design-system/lib/utils';
import { useOrganization } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/design-system/primitives/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/design-system/primitives/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';

import {
  useTransactions,
  useCreateTransaction,
  useRegisterPayment,
  useCancelTransaction,
  useCategories,
  useAccounts,
} from '../../hooks';
import type {
  TransactionListItem,
  TransactionFormData,
  TransactionFilters,
  FinancialTransactionType,
  FinancialTransactionStatus,
} from '../../types';
import { TransactionStatusBadge, CurrencyDisplay, EmptyState } from '../shared';
import { formatDate, TRANSACTION_STATUS_LABELS } from '../../lib/formatters';
import { transactionFormSchema, paymentFormSchema } from '../../lib/validators';
import type { TransactionFormValues, PaymentFormValues } from '../../lib/validators';

// ---------------------------------------------------------------------------
// Config type -- each page passes its own config
// ---------------------------------------------------------------------------

export interface TransactionPageConfig {
  type: FinancialTransactionType;
  icon: LucideIcon;
  title: string;
  description: string;
  createButtonLabel: string;
  sheetTitle: string;
  sheetDescription: string;
  emptyTitle: string;
  emptyDescription: string;
}

// ---------------------------------------------------------------------------
// TransactionForm (create)
// ---------------------------------------------------------------------------

interface TransactionFormProps {
  type: FinancialTransactionType;
  categories: { id: string; name: string }[];
  accounts: { id: string; name: string }[];
  onSubmit: (data: TransactionFormData) => void;
  isPending: boolean;
}

function TransactionForm({
  type,
  categories,
  accounts,
  onSubmit,
  isPending,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type,
      description: '',
      amount: 0,
      due_date: '',
      competence_date: '',
      category_id: '',
      account_id: '',
      counterparty_name: '',
      notes: '',
    },
  });

  const dueDate = watch('due_date');

  function handleFormSubmit(values: TransactionFormValues) {
    onSubmit({
      ...values,
      competence_date: values.competence_date || values.due_date,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="tx-desc">Descricao *</Label>
        <Input id="tx-desc" placeholder="Ex: Pagamento cliente X" {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tx-amount">Valor *</Label>
          <Input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-due">Vencimento *</Label>
          <Input id="tx-due" type="date" {...register('due_date')} />
          {errors.due_date && (
            <p className="text-sm text-destructive">{errors.due_date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-competence">Data de competencia</Label>
        <Input
          id="tx-competence"
          type="date"
          {...register('competence_date')}
          placeholder={dueDate || 'Igual ao vencimento'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tx-category">Categoria</Label>
          <Select
            value={watch('category_id') || 'none'}
            onValueChange={(v) => setValue('category_id', v === 'none' ? '' : v)}
          >
            <SelectTrigger id="tx-category">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-account">Conta</Label>
          <Select
            value={watch('account_id') || 'none'}
            onValueChange={(v) => setValue('account_id', v === 'none' ? '' : v)}
          >
            <SelectTrigger id="tx-account">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-counterparty">Nome da contraparte</Label>
        <Input id="tx-counterparty" placeholder="Ex: Empresa ABC" {...register('counterparty_name')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-notes">Observacoes</Label>
        <Input id="tx-notes" placeholder="Notas adicionais..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Criar'}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// PaymentDialog
// ---------------------------------------------------------------------------

interface PaymentDialogProps {
  transaction: TransactionListItem | null;
  accounts: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transactionId: string, data: PaymentFormValues) => void;
  isPending: boolean;
}

function PaymentDialog({
  transaction,
  accounts,
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: PaymentDialogProps) {
  const remaining = transaction ? transaction.amount - transaction.paid_amount : 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remaining,
      date: new Date().toISOString().split('T')[0],
      account_id: '',
    },
  });

  function handleFormSubmit(values: PaymentFormValues) {
    if (transaction) {
      onSubmit(transaction.id, values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            {transaction
              ? `Registrar pagamento para "${transaction.description}"`
              : 'Selecione uma transacao'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pay-amount">Valor *</Label>
            <Input
              id="pay-amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-date">Data *</Label>
            <Input id="pay-date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-account">Conta *</Label>
            <Select
              value={watch('account_id') || 'none'}
              onValueChange={(v) => setValue('account_id', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="pay-account">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>
                  Selecione
                </SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_id && (
              <p className="text-sm text-destructive">{errors.account_id.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Table skeleton rows
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main shared page component
// ---------------------------------------------------------------------------

export function TransactionListPage({ config }: { config: TransactionPageConfig }) {
  const { organizationId } = useOrganization();
  const Icon = config.icon;

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FinancialTransactionStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // UI state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [payingTransaction, setPayingTransaction] = useState<TransactionListItem | null>(null);

  // Build filters
  const filters: TransactionFilters = {
    type: config.type,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

  // Data hooks
  const { data: result, isLoading } = useTransactions({
    organizationId: organizationId || undefined,
    filters,
    pagination: { page, per_page: 20 },
  });
  const { data: categories = [] } = useCategories({
    organizationId: organizationId || undefined,
  });
  const { data: accounts = [] } = useAccounts({
    organizationId: organizationId || undefined,
  });

  // Mutations
  const createTransaction = useCreateTransaction();
  const registerPayment = useRegisterPayment();
  const cancelTransaction = useCancelTransaction();

  const items = result?.data ?? [];
  const totalPages = result?.total_pages ?? 1;

  // Handlers
  async function handleCreate(data: TransactionFormData) {
    try {
      await createTransaction.mutateAsync({
        data,
        organizationId: organizationId || undefined,
      });
      toast.success('Lancamento criado com sucesso');
      setSheetOpen(false);
    } catch {
      toast.error('Erro ao criar lancamento. Tente novamente.');
    }
  }

  async function handlePayment(transactionId: string, data: PaymentFormValues) {
    try {
      await registerPayment.mutateAsync({
        transactionId,
        amount: data.amount,
        date: data.date,
        accountId: data.account_id,
      });
      toast.success('Pagamento registrado com sucesso');
      setPayingTransaction(null);
    } catch {
      toast.error('Erro ao registrar pagamento. Tente novamente.');
    }
  }

  async function handleCancel(transaction: TransactionListItem) {
    try {
      await cancelTransaction.mutateAsync(transaction.id);
      toast.success('Lancamento cancelado');
    } catch {
      toast.error('Erro ao cancelar lancamento. Tente novamente.');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {config.createButtonLabel}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descricao..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as FinancialTransactionStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-[150px]"
              aria-label="Data inicial"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-[150px]"
              aria-label="Data final"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="container py-6">
        {!isLoading && items.length === 0 ? (
          <EmptyState
            icon={config.icon}
            title={config.emptyTitle}
            description={config.emptyDescription}
            actionLabel={config.createButtonLabel}
            onAction={() => setSheetOpen(true)}
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[240px] truncate">
                          {item.description}
                          {item.counterparty_name && (
                            <span className="block text-xs text-muted-foreground truncate">
                              {item.counterparty_name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <CurrencyDisplay value={item.amount} size="sm" />
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.due_date)}
                        </TableCell>
                        <TableCell>
                          <TransactionStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.category_name ?? '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.status !== 'paid' && item.status !== 'canceled' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPayingTransaction(item)}
                                  aria-label={`Registrar pagamento de ${item.description}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Pagar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleCancel(item)}
                                  disabled={cancelTransaction.isPending}
                                  aria-label={`Cancelar lancamento ${item.description}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Pagina {result?.page ?? 1} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Pagina anterior"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Proxima pagina"
                >
                  Proxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{config.sheetTitle}</SheetTitle>
            <SheetDescription>{config.sheetDescription}</SheetDescription>
          </SheetHeader>
          <TransactionForm
            key={sheetOpen ? 'open' : 'closed'}
            type={config.type}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
            onSubmit={handleCreate}
            isPending={createTransaction.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      <PaymentDialog
        transaction={payingTransaction}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        open={!!payingTransaction}
        onOpenChange={(open) => {
          if (!open) setPayingTransaction(null);
        }}
        onSubmit={handlePayment}
        isPending={registerPayment.isPending}
      />
    </div>
  );
}
