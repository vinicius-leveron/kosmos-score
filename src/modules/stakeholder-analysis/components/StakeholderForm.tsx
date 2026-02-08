/**
 * StakeholderForm - Form for creating and editing stakeholders
 * Follows KOSMOS design patterns with React Hook Form + Zod validation
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/design-system/primitives/form';

import {
  useCreateStakeholder,
  useUpdateStakeholder,
} from '../hooks/useStakeholders';
import type {
  Stakeholder,
  StakeholderType,
} from '../types/stakeholder.types';
import { STAKEHOLDER_TYPE_LABELS } from '../types/stakeholder.types';
import { TagsInput } from './TagsInput';
import { DatePicker } from './DatePicker';
import { CurrencyInput } from './CurrencyInput';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const stakeholderFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .email('Email invalido')
    .optional()
    .or(z.literal('')),
  stakeholder_type: z.enum(['investor', 'partner', 'co_founder', 'advisor'], {
    required_error: 'Selecione o tipo de stakeholder',
  }),
  sector: z.string().max(100, 'Setor muito longo').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio muito longa').optional().or(z.literal('')),
  expertise: z.array(z.string()).optional(),
  linkedin_url: z
    .string()
    .url('URL invalida')
    .optional()
    .or(z.literal('')),
  joined_at: z.date().optional(),
  participation_pct: z
    .number()
    .min(0, 'Participacao deve ser entre 0 e 100')
    .max(100, 'Participacao deve ser entre 0 e 100')
    .optional(),
  investment_amount: z.number().min(0, 'Valor deve ser positivo').optional(),
});

type StakeholderFormValues = z.infer<typeof stakeholderFormSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface StakeholderFormProps {
  /** Organization ID for the stakeholder */
  organizationId: string;
  /** Initial data for editing (optional) */
  initialData?: Stakeholder;
  /** Callback when form is successfully submitted */
  onSuccess?: (stakeholder: Stakeholder) => void;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// FORM SECTIONS
// ============================================================================

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// ============================================================================
// STAKEHOLDER FORM
// ============================================================================

/**
 * StakeholderForm - Create or edit stakeholder information
 *
 * @example
 * <StakeholderForm
 *   organizationId="org-123"
 *   onSuccess={(stakeholder) => console.log('Created:', stakeholder)}
 *   onCancel={() => setOpen(false)}
 * />
 */
export function StakeholderForm({
  organizationId,
  initialData,
  onSuccess,
  onCancel,
  className,
}: StakeholderFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateStakeholder();
  const updateMutation = useUpdateStakeholder();

  const form = useForm<StakeholderFormValues>({
    resolver: zodResolver(stakeholderFormSchema),
    defaultValues: {
      full_name: initialData?.full_name ?? '',
      email: initialData?.email ?? '',
      stakeholder_type: initialData?.stakeholder_type ?? undefined,
      sector: initialData?.sector ?? '',
      bio: initialData?.bio ?? '',
      expertise: initialData?.expertise ?? [],
      linkedin_url: initialData?.linkedin_url ?? '',
      joined_at: initialData?.joined_at
        ? new Date(initialData.joined_at)
        : undefined,
      participation_pct: initialData?.participation_pct ?? undefined,
      investment_amount: initialData?.investment_amount ?? undefined,
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: StakeholderFormValues) => {
    try {
      const payload = {
        ...values,
        organization_id: organizationId,
        email: values.email || undefined,
        sector: values.sector || undefined,
        bio: values.bio || undefined,
        linkedin_url: values.linkedin_url || undefined,
        joined_at: values.joined_at?.toISOString(),
      };

      let result: Stakeholder;

      if (isEditing && initialData) {
        result = await updateMutation.mutateAsync({
          id: initialData.id,
          ...payload,
        });
        toast.success('Stakeholder atualizado com sucesso');
      } else {
        result = await createMutation.mutateAsync(payload);
        toast.success('Stakeholder criado com sucesso');
      }

      onSuccess?.(result);
    } catch (error) {
      toast.error(
        isEditing
          ? 'Erro ao atualizar stakeholder'
          : 'Erro ao criar stakeholder'
      );
      console.error('StakeholderForm error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        {/* Informacoes Basicas */}
        <FormSection title="Informacoes Basicas">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do stakeholder" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stakeholder_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(
                      Object.entries(STAKEHOLDER_TYPE_LABELS) as [
                        StakeholderType,
                        string
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joined_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de entrada</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecionar data..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Perfil Profissional */}
        <FormSection title="Perfil Profissional">
          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Tecnologia, Financas..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expertise"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Expertise</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Adicionar expertise e pressionar Enter..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Breve descricao do stakeholder..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Dados Financeiros */}
        <FormSection title="Dados Financeiros">
          <FormField
            control={form.control}
            name="participation_pct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participacao (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    placeholder="0.00"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val ? parseFloat(val) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="investment_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor investido</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar alteracoes' : 'Criar stakeholder'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
