import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Loader2 } from 'lucide-react';
import { useCreateContact } from '../../hooks/useContacts';
import { useJourneyStages } from '../../hooks/useJourneyStages';

const contactSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  journey_stage_id: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContactForm({ organizationId, onSuccess, onCancel }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createContact = useCreateContact();
  const { data: stages, isLoading: stagesLoading } = useJourneyStages(organizationId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      journey_stage_id: '',
      notes: '',
    },
  });

  const onSubmit = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await createContact.mutateAsync({
        data: {
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || undefined,
          journey_stage_id: formData.journey_stage_id || undefined,
          notes: formData.notes || undefined,
        },
        organizationId,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar contato:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo *</Label>
        <Input
          id="full_name"
          placeholder="João Silva"
          {...register('full_name')}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="joao@exemplo.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          placeholder="(11) 99999-9999"
          {...register('phone')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journey_stage_id">Estágio da Jornada</Label>
        <Select
          onValueChange={(value) => setValue('journey_stage_id', value)}
          disabled={stagesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um estágio" />
          </SelectTrigger>
          <SelectContent>
            {stages?.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Observações sobre o contato..."
          {...register('notes')}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Contato'
          )}
        </Button>
      </div>
    </form>
  );
}
