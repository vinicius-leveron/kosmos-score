import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Loader2 } from 'lucide-react';
import { useCreateCompany } from '../../hooks/useCompanies';
import type { CompanyFormData, CompanySize, CompanyStatus } from '../../types';

const companySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  domain: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['solo', 'micro', 'small', 'medium', 'large', 'enterprise']).optional(),
  status: z.enum(['prospect', 'customer', 'churned', 'partner', 'competitor']).optional(),
});

type FormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const sizeOptions: { value: CompanySize; label: string }[] = [
  { value: 'solo', label: 'Solo (1 pessoa)' },
  { value: 'micro', label: 'Micro (1-10)' },
  { value: 'small', label: 'Pequena (11-50)' },
  { value: 'medium', label: 'Média (51-200)' },
  { value: 'large', label: 'Grande (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' },
];

const statusOptions: { value: CompanyStatus; label: string }[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Cliente' },
  { value: 'partner', label: 'Parceiro' },
  { value: 'competitor', label: 'Concorrente' },
];

export function CompanyForm({ organizationId, onSuccess, onCancel }: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCompany = useCreateCompany();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      domain: '',
      website: '',
      industry: '',
      size: undefined,
      status: 'prospect',
    },
  });

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const data: CompanyFormData = {
        name: formData.name,
        domain: formData.domain || undefined,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        size: formData.size as CompanySize | undefined,
        status: (formData.status as CompanyStatus) || 'prospect',
      };

      await createCompany.mutateAsync({
        data,
        organizationId,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da empresa *</Label>
        <Input
          id="name"
          placeholder="ACME Corporation"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domínio</Label>
        <Input
          id="domain"
          placeholder="acme.com"
          {...register('domain')}
        />
        <p className="text-xs text-muted-foreground">
          Contatos com este domínio serão vinculados automaticamente
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://acme.com"
          {...register('website')}
        />
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Setor</Label>
        <Input
          id="industry"
          placeholder="Tecnologia, Educação, etc."
          {...register('industry')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Tamanho</Label>
          <Select
            onValueChange={(value) => setValue('size', value as CompanySize)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue="prospect"
            onValueChange={(value) => setValue('status', value as CompanyStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            'Criar Empresa'
          )}
        </Button>
      </div>
    </form>
  );
}
