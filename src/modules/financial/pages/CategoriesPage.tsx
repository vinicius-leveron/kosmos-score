import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FolderTree, Plus, Search, Pencil, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
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
import { useOrganization } from '@/core/auth';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSeedCategories,
} from '../hooks';
import { CATEGORY_TYPE_LABELS, DRE_GROUP_LABELS } from '../lib/formatters';
import { categoryFormSchema } from '../lib/validators';
import { EmptyState } from '../components/shared';
import type {
  FinancialCategory,
  CategoryFormData,
  FinancialCategoryType,
  DreGroup,
} from '../types';

// ---------------------------------------------------------------------------
// CategoryForm
// ---------------------------------------------------------------------------

interface CategoryFormProps {
  categories: FinancialCategory[];
  initialData?: FinancialCategory | null;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function CategoryForm({ categories, initialData, onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      type: initialData?.type ?? 'expense',
      dre_group: initialData?.dre_group ?? 'despesas_administrativas',
      parent_id: initialData?.parent_id ?? '',
      color: initialData?.color ?? '#6B7280',
    },
  });

  const parentOptions = categories.filter((c) => !c.parent_id && (!initialData || c.id !== initialData.id));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Nome</Label>
        <Input id="cat-name" placeholder="Ex: Marketing Digital" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-type">Tipo</Label>
        <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FinancialCategoryType)}>
          <SelectTrigger id="cat-type"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-dre">Grupo DRE</Label>
        <Select value={watch('dre_group')} onValueChange={(v) => setValue('dre_group', v as DreGroup)}>
          <SelectTrigger id="cat-dre"><SelectValue placeholder="Selecione o grupo DRE" /></SelectTrigger>
          <SelectContent>
            {Object.entries(DRE_GROUP_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.dre_group && <p className="text-sm text-destructive">{errors.dre_group.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-parent">Categoria pai (opcional)</Label>
        <Select value={watch('parent_id') || 'none'} onValueChange={(v) => setValue('parent_id', v === 'none' ? '' : v)}>
          <SelectTrigger id="cat-parent"><SelectValue placeholder="Nenhuma (raiz)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma (raiz)</SelectItem>
            {parentOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-color">Cor</Label>
        <div className="flex items-center gap-2">
          <input id="cat-color" type="color" className="h-9 w-9 rounded border cursor-pointer" {...register('color')} />
          <Input className="flex-1" {...register('color')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-desc">Descricao (opcional)</Label>
        <Textarea id="cat-desc" rows={3} placeholder="Descreva a categoria..." {...register('description')} />
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
// CategoryListItem
// ---------------------------------------------------------------------------

interface CategoryListItemProps {
  category: FinancialCategory;
  onEdit: (category: FinancialCategory) => void;
  onDelete: (category: FinancialCategory) => void;
}

function CategoryListItem({ category, onEdit, onDelete }: CategoryListItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-medium truncate">{category.name}</p>
          {category.parent_id && <p className="text-xs text-muted-foreground">Subcategoria</p>}
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {DRE_GROUP_LABELS[category.dre_group] ?? category.dre_group}
        </Badge>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" aria-label={`Editar categoria ${category.name}`} onClick={() => onEdit(category)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Excluir categoria ${category.name}`} onClick={() => onDelete(category)} disabled={category.is_system}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoriesPage
// ---------------------------------------------------------------------------

export function CategoriesPage() {
  const { organizationId } = useOrganization();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FinancialCategoryType | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<FinancialCategory | null>(null);

  const { data: categories = [], isLoading } = useCategories({
    organizationId: organizationId || undefined,
    filters: { search: search || undefined, type: typeFilter !== 'all' ? typeFilter : undefined, is_active: true },
  });

  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const seedMut = useSeedCategories();

  const grouped = useMemo(() => {
    const g: Record<string, FinancialCategory[]> = {};
    for (const c of categories) { (g[c.type] ??= []).push(c); }
    return g;
  }, [categories]);

  const hasNoResults = !isLoading && categories.length === 0;
  const hasActiveFilters = !!search || typeFilter !== 'all';

  const handleSeed = async () => {
    if (!organizationId) return;
    try { await seedMut.mutateAsync(organizationId); toast.success('Categorias padrao criadas com sucesso'); }
    catch { toast.error('Erro ao gerar categorias padrao'); }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateMut.mutateAsync({ categoryId: editingCategory.id, data });
        toast.success('Categoria atualizada com sucesso');
      } else {
        await createMut.mutateAsync({ data, organizationId: organizationId || undefined });
        toast.success('Categoria criada com sucesso');
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch {
      toast.error(editingCategory ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try { await deleteMut.mutateAsync(deletingCategory.id); toast.success('Categoria removida com sucesso'); }
    catch { toast.error('Erro ao remover categoria'); }
    finally { setDeletingCategory(null); }
  };

  const openCreate = () => { setEditingCategory(null); setIsFormOpen(true); };
  const openEdit = (c: FinancialCategory) => { setEditingCategory(c); setIsFormOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Categorias Financeiras</h1>
                <p className="text-muted-foreground">Gerencie as categorias para classificar receitas, despesas e custos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasNoResults && !hasActiveFilters && (
                <Button variant="outline" onClick={handleSeed} disabled={seedMut.isPending}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {seedMut.isPending ? 'Gerando...' : 'Gerar Categorias Padrao'}
                </Button>
              )}
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar categorias..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FinancialCategoryType | 'all')}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(CATEGORY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 pb-8">
        {isLoading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : hasNoResults ? (
          <EmptyState
            icon={FolderTree}
            title="Nenhuma categoria encontrada"
            description={hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Crie categorias para classificar suas movimentacoes financeiras'}
            actionLabel={!hasActiveFilters ? 'Nova Categoria' : undefined}
            onAction={!hasActiveFilters ? openCreate : undefined}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {CATEGORY_TYPE_LABELS[type] ?? type} ({items.length})
                </h2>
                <div className="space-y-2">
                  {items.map((cat) => (
                    <CategoryListItem key={cat.id} category={cat} onEdit={openEdit} onDelete={setDeletingCategory} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingCategory(null); }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</SheetTitle>
            <SheetDescription>
              {editingCategory ? 'Atualize os dados da categoria financeira' : 'Preencha os dados para criar uma nova categoria'}
            </SheetDescription>
          </SheetHeader>
          <CategoryForm
            key={editingCategory?.id ?? 'new'}
            categories={categories}
            initialData={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={createMut.isPending || updateMut.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => { if (!open) setDeletingCategory(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria &quot;{deletingCategory?.name}&quot;? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMut.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
