import { useState } from 'react';
import { Landmark, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useOrganization } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Card, CardContent, CardHeader } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/design-system/primitives/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/design-system/primitives/dialog';

import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../hooks';
import type { FinancialAccount, AccountFormData } from '../types';
import { ACCOUNT_TYPE_LABELS } from '../lib/formatters';
import { CurrencyDisplay, EmptyState } from '../components/shared';
import { AccountForm } from '../components/AccountForm';

function AccountCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28" />
      </CardContent>
    </Card>
  );
}

export function AccountsPage() {
  const { organizationId } = useOrganization();
  const { data: accounts, isLoading } = useAccounts({ organizationId });
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialAccount | null>(null);
  const [deleting, setDeleting] = useState<FinancialAccount | null>(null);

  function openCreate() { setEditing(null); setSheetOpen(true); }
  function openEdit(account: FinancialAccount) { setEditing(account); setSheetOpen(true); }

  async function handleSubmit(data: AccountFormData) {
    try {
      if (editing) {
        await updateAccount.mutateAsync({ accountId: editing.id, data });
        toast.success('Conta atualizada com sucesso');
      } else {
        await createAccount.mutateAsync({ data, organizationId });
        toast.success('Conta criada com sucesso');
      }
      setSheetOpen(false);
    } catch {
      toast.error('Erro ao salvar conta. Tente novamente.');
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteAccount.mutateAsync(deleting.id);
      toast.success('Conta removida com sucesso');
      setDeleting(null);
    } catch {
      toast.error('Erro ao remover conta. Tente novamente.');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Contas Bancarias</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas contas bancarias, carteiras e caixa
              </p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nova Conta
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <AccountCardSkeleton key={i} />)}
          </div>
        ) : !accounts?.length ? (
          <EmptyState
            icon={Landmark}
            title="Nenhuma conta cadastrada"
            description="Adicione suas contas bancarias, carteiras e caixa para controlar suas financas."
            actionLabel="Nova Conta"
            onAction={openCreate}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className="group relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: account.color }}
                        aria-hidden="true"
                      />
                      <h3 className="font-semibold truncate">{account.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(account)}
                        aria-label={`Editar conta ${account.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleting(account)}
                        aria-label={`Excluir conta ${account.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                    </Badge>
                    {account.bank_name && (
                      <span className="text-xs text-muted-foreground">{account.bank_name}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CurrencyDisplay value={account.current_balance} size="lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Conta' : 'Nova Conta'}</SheetTitle>
            <SheetDescription>
              {editing ? 'Atualize os dados da conta.' : 'Preencha os dados para criar uma nova conta.'}
            </SheetDescription>
          </SheetHeader>
          <AccountForm
            key={editing?.id ?? 'new'}
            defaultValues={editing}
            onSubmit={handleSubmit}
            isPending={createAccount.isPending || updateAccount.isPending}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a conta &ldquo;{deleting?.name}&rdquo;?
              Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
