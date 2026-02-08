/**
 * InteractionForm - Form for creating stakeholder interactions
 * Used to log meetings, mentoring sessions, referrals, decisions, and investments
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Star } from 'lucide-react';
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
  FormDescription,
} from '@/design-system/primitives/form';

import { useCreateInteraction } from '../hooks/useStakeholders';
import type { InteractionType, StakeholderInteraction } from '../types/stakeholder.types';
import { INTERACTION_TYPE_LABELS } from '../types/stakeholder.types';
import { DatePicker } from './DatePicker';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const interactionFormSchema = z.object({
  interaction_type: z.enum(['meeting', 'mentoring', 'referral', 'decision', 'investment'], {
    required_error: 'Selecione o tipo de interacao',
  }),
  title: z
    .string()
    .min(2, 'Titulo deve ter pelo menos 2 caracteres')
    .max(200, 'Titulo muito longo'),
  description: z.string().max(1000, 'Descricao muito longa').optional().or(z.literal('')),
  occurred_at: z.date({
    required_error: 'Selecione a data',
  }),
  impact_score: z.number().min(1).max(5).optional(),
});

type InteractionFormValues = z.infer<typeof interactionFormSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface InteractionFormProps {
  /** Stakeholder ID to add the interaction to */
  stakeholderId: string;
  /** Organization ID for the interaction */
  organizationId: string;
  /** Callback when form is successfully submitted */
  onSuccess?: (interaction: StakeholderInteraction) => void;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// IMPACT SCORE SELECTOR
// ============================================================================

interface ImpactScoreSelectorProps {
  value?: number;
  onChange: (value: number) => void;
}

function ImpactScoreSelector({ value, onChange }: ImpactScoreSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={cn(
            'p-1 transition-colors rounded',
            value && score <= value
              ? 'text-yellow-500'
              : 'text-muted-foreground hover:text-yellow-400'
          )}
          aria-label={`Impacto ${score} de 5`}
        >
          <Star
            className="h-5 w-5"
            fill={value && score <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
      {value && (
        <span className="text-xs text-muted-foreground ml-2">
          {value === 1 && 'Baixo'}
          {value === 2 && 'Moderado'}
          {value === 3 && 'Medio'}
          {value === 4 && 'Alto'}
          {value === 5 && 'Muito alto'}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// INTERACTION FORM
// ============================================================================

/**
 * InteractionForm - Create a new stakeholder interaction
 *
 * @example
 * <InteractionForm
 *   stakeholderId="stakeholder-123"
 *   organizationId="org-123"
 *   onSuccess={(interaction) => console.log('Created:', interaction)}
 *   onCancel={() => setOpen(false)}
 * />
 */
export function InteractionForm({
  stakeholderId,
  organizationId,
  onSuccess,
  onCancel,
  className,
}: InteractionFormProps) {
  const createMutation = useCreateInteraction();

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      interaction_type: undefined,
      title: '',
      description: '',
      occurred_at: new Date(),
      impact_score: undefined,
    },
  });

  const onSubmit = async (values: InteractionFormValues) => {
    try {
      const result = await createMutation.mutateAsync({
        stakeholder_id: stakeholderId,
        organization_id: organizationId,
        interaction_type: values.interaction_type,
        title: values.title,
        description: values.description || undefined,
        occurred_at: values.occurred_at.toISOString(),
        impact_score: values.impact_score,
      });

      toast.success('Interacao registrada com sucesso');
      onSuccess?.(result);
    } catch (error) {
      toast.error('Erro ao registrar interacao');
      console.error('InteractionForm error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
      >
        {/* Tipo */}
        <FormField
          control={form.control}
          name="interaction_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de interacao *</FormLabel>
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
                  {(Object.entries(INTERACTION_TYPE_LABELS) as [InteractionType, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Titulo */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titulo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Reuniao de alinhamento Q1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descricao */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descricao</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre a interacao..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data */}
        <FormField
          control={form.control}
          name="occurred_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data *</FormLabel>
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

        {/* Impacto */}
        <FormField
          control={form.control}
          name="impact_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impacto</FormLabel>
              <FormControl>
                <ImpactScoreSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Avalie o impacto desta interacao para a comunidade
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Registrar interacao
          </Button>
        </div>
      </form>
    </Form>
  );
}
