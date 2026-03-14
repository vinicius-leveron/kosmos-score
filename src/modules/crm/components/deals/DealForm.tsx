import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/design-system/primitives/dialog';
import { Loader2, Plus } from 'lucide-react';
import { useCreateDeal } from '../../hooks/useDeals';
import { useCompanies, useCreateCompany } from '../../hooks/useCompanies';
import { usePipelines, usePipelineStages } from '../../hooks';
import type { DealFormData } from '../../types';

const dealSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  company_id: z.string().min(1, 'Selecione uma empresa'),
  amount: z.coerce.number().min(0).optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  expected_close_date: z.string().optional(),
  pipeline_id: z.string().optional(),
  stage_id: z.string().optional(),
});

type FormData = z.infer<typeof dealSchema>;

// Quick company creation schema - minimal fields
const quickCompanySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  website: z.string().optional(),
});

type QuickCompanyFormData = z.infer<typeof quickCompanySchema>;

interface DealFormProps {
  organizationId: string;
  defaultPipelineId?: string;
  defaultStageId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DealForm({
  organizationId,
  defaultPipelineId,
  defaultStageId,
  onSuccess,
  onCancel,
}: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState(defaultPipelineId || '');
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  const createDeal = useCreateDeal();
  const createCompany = useCreateCompany();
  const { data: companiesData, refetch: refetchCompanies } = useCompanies({ organizationId });
  const { data: pipelines } = usePipelines(organizationId);
  const { data: stages } = usePipelineStages(selectedPipelineId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: '',
      description: '',
      company_id: '',
      amount: undefined,
      probability: undefined,
      expected_close_date: '',
      pipeline_id: defaultPipelineId || '',
      stage_id: defaultStageId || '',
    },
  });

  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    reset: resetCompanyForm,
    formState: { errors: companyErrors },
  } = useForm<QuickCompanyFormData>({
    resolver: zodResolver(quickCompanySchema),
    defaultValues: {
      name: '',
      website: '',
    },
  });

  const watchedPipelineId = watch('pipeline_id');
  const watchedCompanyId = watch('company_id');

  useEffect(() => {
    if (watchedPipelineId && watchedPipelineId !== selectedPipelineId) {
      setSelectedPipelineId(watchedPipelineId);
      setValue('stage_id', '');
    }
  }, [watchedPipelineId, selectedPipelineId, setValue]);

  // Set default stage when stages load
  useEffect(() => {
    if (stages?.length && !watch('stage_id')) {
      const entryStage = stages.find((s) => s.is_entry_stage) || stages[0];
      if (entryStage) {
        setValue('stage_id', entryStage.id);
      }
    }
  }, [stages, setValue, watch]);

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const data: DealFormData = {
        name: formData.name,
        description: formData.description,
        company_id: formData.company_id,
        amount: formData.amount,
        probability: formData.probability,
        expected_close_date: formData.expected_close_date || undefined,
        pipeline_id: formData.pipeline_id || undefined,
        stage_id: formData.stage_id || undefined,
      };

      await createDeal.mutateAsync({
        data,
        organizationId,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateCompany = async (formData: QuickCompanyFormData) => {
    setIsCreatingCompany(true);
    try {
      const newCompany = await createCompany.mutateAsync({
        data: {
          name: formData.name,
          website: formData.website || undefined,
          status: 'prospect',
        },
        organizationId,
      });

      // Refetch companies and select the new one
      await refetchCompanies();
      setValue('company_id', newCompany.id);
      toast.success(`Empresa "${formData.name}" criada`);
      setIsCompanyDialogOpen(false);
      resetCompanyForm();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
    } finally {
      setIsCreatingCompany(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Deal *</Label>
          <Input
            id="name"
            placeholder="Venda Enterprise - ACME Corp"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_id">Empresa *</Label>
          <div className="flex gap-2">
            <Select
              value={watchedCompanyId}
              onValueChange={(value) => setValue('company_id', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companiesData?.data.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsCompanyDialogOpen(true)}
              aria-label="Criar nova empresa"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.company_id && (
            <p className="text-sm text-destructive">{errors.company_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              {...register('amount')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="probability">Probabilidade (%)</Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              placeholder="50"
              {...register('probability')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_close_date">Previsão de Fechamento</Label>
          <Input
            id="expected_close_date"
            type="date"
            {...register('expected_close_date')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pipeline_id">Pipeline</Label>
            <Select
              value={selectedPipelineId}
              onValueChange={(value) => setValue('pipeline_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {pipelines?.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage_id">Estágio</Label>
            <Select
              onValueChange={(value) => setValue('stage_id', value)}
              disabled={!selectedPipelineId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Detalhes sobre o deal..."
            {...register('description')}
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
              'Criar Deal'
            )}
          </Button>
        </div>
      </form>

      {/* Quick Company Creation Dialog */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Crie uma empresa rapidamente para associar ao deal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCompany(onCreateCompany)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa *</Label>
              <Input
                id="company-name"
                placeholder="ACME Corporation"
                {...registerCompany('name')}
              />
              {companyErrors.name && (
                <p className="text-sm text-destructive">{companyErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-website">Website (opcional)</Label>
              <Input
                id="company-website"
                placeholder="https://acme.com"
                {...registerCompany('website')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCompanyDialogOpen(false);
                  resetCompanyForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingCompany}>
                {isCreatingCompany ? (
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
        </DialogContent>
      </Dialog>
    </>
  );
}
