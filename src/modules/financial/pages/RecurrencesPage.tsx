import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RefreshCw, Plus, Search, Pencil, Trash2, Play, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Badge } from '@/design-system/primitives/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/primitives/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/design-system/primitives/dialog';
import { useOrganization } from '@/core/auth';
import {
  useRecurrences,
  useCreateRecurrence,
  useUpdateRecurrence,
  useGenerateRecurrence,
  useDeleteRecurrence,
  useCategories,
  useAccounts,
} from '../hooks';
import { EmptyState } from '../components/shared';
import type {
  FinancialRecurrence,
  RecurrenceFormData,
  RecurrenceFrequency,
  FinancialTransactionType,
} from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const TYPE_LABELS: Record<FinancialTransactionType, string> = {
  receivable: 'A Receber',
  payable: 'A Pagar',
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const recurrenceFormSchema = z.object({
  description: z.string().min(1, 'Descricao obrigatoria'),
  type: z.enum(['receivable', 'payable']),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']),
  start_date: z.string().min(1, 'Data inicio obrigatoria'),
  end_date: z.string().optional(),
  day_of_month: z.coerce.number().min(1).max(31).optional().nullable(),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  counterparty_name: z.string().optional(),
});

type RecurrenceFormValues = z.infer<typeof recurrenceFormSchema>;

// ---------------------------------------------------------------------------
// RecurrenceForm
// ---------------------------------------------------------------------------

interface RecurrenceFormProps {
  categories: { id: string; name: string }[];
  accounts: { id: string; name: string }[];
  initialData?: FinancialRecurrence | null;
  onSubmit: (data: RecurrenceFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function RecurrenceForm({ categories, accounts, initialData, onSubmit, onCancel, isSubmitting }: RecurrenceFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RecurrenceFormValues>({
    resolver: zodResolver(recurrenceFormSchema),
    defaultValues: {
      description: initialData?.description ?? '',
      type: initialData?.type ?? 'payable',
      amount: initialData?.amount ?? 0,
      frequency: initialData?.frequency ?? 'monthly',
      start_date: initialData?.start_date ?? '',
      end_date: initialData?.end_date ?? '',
      day_of_month: initialData?.day_of_month ?? undefined,
      category_id: initialData?.category_id ?? '',
      account_id: initialData?.account_id ?? '',
      counterparty_name: initialData?.counterparty_name ?? '',
    },
  });

  const frequency = watch('frequency');
  const showDayOfMonth = ['monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'].includes(frequency);

  const handleFormSubmit = (values: RecurrenceFormValues) => {
    onSubmit({
      ...values,
      end_date: values.end_date || undefined,
      day_of_month: values.day_of_month || undefined,
      category_id: values.category_id || undefined,
      account_id: values.account_id || undefined,
      counterparty_name: values.counterparty_name || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="rec-desc">Descricao</Label>
        <Input id="rec-desc" placeholder="Ex: Pro-labore, Aluguel, Assinatura" {...register('description')} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rec-type">Tipo</Label>
          <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FinancialTransactionType)}>
            <SelectTrigger id="rec-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="payable">A Pagar</SelectItem>
              <SelectItem value="receivable">A Receber</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rec-amount">Valor (R$)</Label>
          <Input id="rec-amount" type="number" step="0.01" placeholder="0,00" {...register('amount')} />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rec-frequency">Frequencia</Label>
          <Select value={watch('frequency')} onValueChange={(v) => setValue('frequency', v as RecurrenceFrequency)}>
            <SelectTrigger id="rec-frequency"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showDayOfMonth && (
          <div className="space-y-2">
            <Label htmlFor="rec-day">Dia do mes</Label>
            <Input id="rec-day" type="number" min={1} max={31} placeholder="10" {...register('day_of_month')} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rec-start">Data inicio</Label>
          <Input id="rec-start" type="date" {...register('start_date')} />
          {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rec-end">Data fim (opcional)</Label>
          <Input id="rec-end" type="date" {...register('end_date')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rec-category">Categoria</Label>
        <Select value={watch('category_id') || 'none'} onValueChange={(v) => setValue('category_id', v === 'none' ? '' : v)}>
          <SelectTrigger id="rec-category"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem categoria</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rec-account">Conta padrao</Label>
        <Select value={watch('account_id') || 'none'} onValueChange={(v) => setValue('account_id', v === 'none' ? '' : v)}>
          <SelectTrigger id="rec-account"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rec-counterparty">Fornecedor/Cliente</Label>
        <Input id="rec-counterparty" placeholder="Nome do fornecedor ou cliente" {...register('counterparty_name')} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// RecurrenceListItem
// ---------------------------------------------------------------------------

interface RecurrenceListItemProps {
  recurrence: FinancialRecurrence;
  onEdit: (r: FinancialRecurrence) => void;
  onGenerate: (r: FinancialRecurrence) => void;
  onDelete: (r: FinancialRecurrence) => void;
}

function RecurrenceListItem({ recurrence, onEdit, onGenerate, onDelete }: RecurrenceListItemProps) {
  const Icon = recurrence.type === 'receivable' ? ArrowDownLeft : ArrowUpRight;
  const iconColor = recurrence.type === 'receivable' ? 'text-green-600' : 'text-red-600';

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{recurrence.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{TYPE_LABELS[recurrence.type]}</span>
            <span>•</span>
            <span>{FREQUENCY_LABELS[recurrence.frequency]}</span>
            {recurrence.day_of_month && (
              <>
                <span>•</span>
                <span>Dia {recurrence.day_of_month}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-semibold ${recurrence.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
            R$ {recurrence.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Proximo: {formatDate(recurrence.next_due_date)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-4">
        <Button variant="outline" size="sm" onClick={() => onGenerate(recurrence)} aria-label={`Gerar transacoes de ${recurrence.description}`}>
          <Play className="h-4 w-4 mr-1" />
          Gerar
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Editar ${recurrence.description}`} onClick={() => onEdit(recurrence)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Desativar ${recurrence.description}`} onClick={() => onDelete(recurrence)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GenerateDialog
// ---------------------------------------------------------------------------

interface GenerateDialogProps {
  recurrence: FinancialRecurrence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (untilDate: string) => void;
  isPending: boolean;
}

function GenerateDialog({ recurrence, open, onOpenChange, onConfirm, isPending }: GenerateDialogProps) {
  const defaultDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [untilDate, setUntilDate] = useState(defaultDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar transacoes</DialogTitle>
          <DialogDescription>
            Gerar transacoes de &quot;{recurrence?.description}&quot; ate a data especificada.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="gen-until">Gerar ate</Label>
          <Input
            id="gen-until"
            type="date"
            value={untilDate}
            onChange={(e) => setUntilDate(e.target.value)}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onConfirm(untilDate)} disabled={isPending}>
            {isPending ? 'Gerando...' : 'Gerar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// RecurrencesPage
// ---------------------------------------------------------------------------

export function RecurrencesPage() {
  const { organizationId } = useOrganization();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FinancialTransactionType | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState<FinancialRecurrence | null>(null);
  const [deletingRecurrence, setDeletingRecurrence] = useState<FinancialRecurrence | null>(null);
  const [generatingRecurrence, setGeneratingRecurrence] = useState<FinancialRecurrence | null>(null);

  const { data: recurrences = [], isLoading } = useRecurrences({
    organizationId: organizationId || undefined,
  });

  const { data: categories = [] } = useCategories({
    organizationId: organizationId || undefined,
    filters: { is_active: true },
  });

  const { data: accounts = [] } = useAccounts({
    organizationId: organizationId || undefined,
  });

  const createMut = useCreateRecurrence();
  const updateMut = useUpdateRecurrence();
  const generateMut = useGenerateRecurrence();
  const deleteMut = useDeleteRecurrence();

  // Filter recurrences
  const filtered = recurrences.filter((r) => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    return true;
  });

  const hasNoResults = !isLoading && filtered.length === 0;
  const hasActiveFilters = !!search || typeFilter !== 'all';

  const handleSubmit = async (data: RecurrenceFormData) => {
    try {
      if (editingRecurrence) {
        await updateMut.mutateAsync({ recurrenceId: editingRecurrence.id, data });
        toast.success('Recorrencia atualizada com sucesso. Transacoes pendentes foram atualizadas.');
      } else {
        await createMut.mutateAsync({ data, organizationId: organizationId || undefined });
        toast.success('Recorrencia criada com sucesso');
      }
      setIsFormOpen(false);
      setEditingRecurrence(null);
    } catch {
      toast.error(editingRecurrence ? 'Erro ao atualizar recorrencia' : 'Erro ao criar recorrencia');
    }
  };

  const handleGenerate = async (untilDate: string) => {
    if (!generatingRecurrence) return;
    try {
      const result = await generateMut.mutateAsync({
        recurrenceId: generatingRecurrence.id,
        untilDate,
      });
      toast.success(`${result.generated_count} transacoes geradas com sucesso`);
      setGeneratingRecurrence(null);
    } catch {
      toast.error('Erro ao gerar transacoes');
    }
  };

  const handleDelete = async () => {
    if (!deletingRecurrence) return;
    try {
      await deleteMut.mutateAsync(deletingRecurrence.id);
      toast.success('Recorrencia desativada com sucesso');
    } catch {
      toast.error('Erro ao desativar recorrencia');
    } finally {
      setDeletingRecurrence(null);
    }
  };

  const openCreate = () => { setEditingRecurrence(null); setIsFormOpen(true); };
  const openEdit = (r: FinancialRecurrence) => { setEditingRecurrence(r); setIsFormOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Lancamentos Recorrentes</h1>
                <p className="text-muted-foreground">Gerencie pro-labore, assinaturas e custos fixos</p>
              </div>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Recorrencia
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar recorrencias..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FinancialTransactionType | 'all')}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="payable">A Pagar</SelectItem>
                <SelectItem value="receivable">A Receber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 pb-8">
        {isLoading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : hasNoResults ? (
          <EmptyState
            icon={RefreshCw}
            title="Nenhuma recorrencia encontrada"
            description={hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Crie recorrencias para automatizar lancamentos fixos como pro-labore, aluguel e assinaturas'}
            actionLabel={!hasActiveFilters ? 'Nova Recorrencia' : undefined}
            onAction={!hasActiveFilters ? openCreate : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((rec) => (
              <RecurrenceListItem
                key={rec.id}
                recurrence={rec}
                onEdit={openEdit}
                onGenerate={setGeneratingRecurrence}
                onDelete={setDeletingRecurrence}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingRecurrence(null); }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingRecurrence ? 'Editar Recorrencia' : 'Nova Recorrencia'}</SheetTitle>
            <SheetDescription>
              {editingRecurrence
                ? 'Atualize os dados. Transacoes pendentes serao atualizadas automaticamente.'
                : 'Configure um lancamento recorrente para automatizar seus custos fixos'}
            </SheetDescription>
          </SheetHeader>
          <RecurrenceForm
            key={editingRecurrence?.id ?? 'new'}
            categories={categories.map(c => ({ id: c.id, name: c.name }))}
            accounts={accounts.map(a => ({ id: a.id, name: a.name }))}
            initialData={editingRecurrence}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={createMut.isPending || updateMut.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Generate Dialog */}
      <GenerateDialog
        recurrence={generatingRecurrence}
        open={!!generatingRecurrence}
        onOpenChange={(open) => { if (!open) setGeneratingRecurrence(null); }}
        onConfirm={handleGenerate}
        isPending={generateMut.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRecurrence} onOpenChange={(open) => { if (!open) setDeletingRecurrence(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar recorrencia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar &quot;{deletingRecurrence?.description}&quot;? Transacoes ja geradas nao serao afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMut.isPending ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
