import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';

import type { FinancialAccount, AccountFormData, FinancialAccountType } from '../types';
import { ACCOUNT_TYPE_LABELS } from '../lib/formatters';
import { accountFormSchema } from '../lib/validators';

interface AccountFormProps {
  /** Account to edit, or null for create mode */
  defaultValues?: FinancialAccount | null;
  /** Called with validated form data on submit */
  onSubmit: (data: AccountFormData) => void;
  /** Disables submit button while saving */
  isPending: boolean;
}

export function AccountForm({ defaultValues, onSubmit, isPending }: AccountFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? 'checking',
      bank_name: defaultValues?.bank_name ?? '',
      bank_branch: defaultValues?.bank_branch ?? '',
      account_number: defaultValues?.account_number ?? '',
      initial_balance: defaultValues?.initial_balance ?? 0,
      color: defaultValues?.color ?? '#3B82F6',
      description: defaultValues?.description ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" {...register('name')} placeholder="Ex: Conta Principal" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo *</Label>
        <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FinancialAccountType)}>
          <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
          <SelectContent>
            {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Banco</Label>
          <Input id="bank_name" {...register('bank_name')} placeholder="Ex: Nubank" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_branch">Agencia</Label>
          <Input id="bank_branch" {...register('bank_branch')} placeholder="0001" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="account_number">Numero da Conta</Label>
          <Input id="account_number" {...register('account_number')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initial_balance">Saldo Inicial</Label>
          <Input id="initial_balance" type="number" step="0.01" {...register('initial_balance', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Cor</Label>
        <Input id="color" type="color" {...register('color')} className="h-10 w-16 p-1 cursor-pointer" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descricao</Label>
        <Textarea id="description" {...register('description')} rows={2} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Salvando...' : defaultValues ? 'Atualizar' : 'Criar Conta'}
      </Button>
    </form>
  );
}
