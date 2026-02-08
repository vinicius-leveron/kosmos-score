/**
 * AdminBenchmarkFormPage - Create/Edit benchmark form (multi-step)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Send, Check } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
import { cn } from '@/design-system/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useBenchmark,
  useCreateBenchmark,
  useUpdateBenchmark,
  usePublishBenchmark,
} from '../hooks/useBenchmarks';
import { ClientDataStep } from '../components/admin/steps/ClientDataStep';
import { ScoresStep } from '../components/admin/steps/ScoresStep';
import { FinancialsStep } from '../components/admin/steps/FinancialsStep';
import { InsightsStep } from '../components/admin/steps/InsightsStep';
import type { BenchmarkFormData, BenchmarkInsights } from '../types';

// Form validation schema
const benchmarkSchema = z.object({
  // Step 1
  contact_org_id: z.string().min(1, 'Selecione um cliente'),
  organization_id: z.string().min(1, 'Organização é obrigatória'),
  title: z.string().min(1, 'Título é obrigatório'),
  analysis_date: z.string().min(1, 'Data da análise é obrigatória'),

  // Step 2 - Scores (all optional)
  score_causa: z.number().nullable(),
  score_cultura: z.number().nullable(),
  score_economia: z.number().nullable(),
  score_total: z.number().nullable(),
  market_avg_causa: z.number().nullable(),
  market_avg_cultura: z.number().nullable(),
  market_avg_economia: z.number().nullable(),
  market_avg_total: z.number().nullable(),
  percentile_causa: z.number().nullable(),
  percentile_cultura: z.number().nullable(),
  percentile_economia: z.number().nullable(),
  percentile_total: z.number().nullable(),
  top10_causa: z.number().nullable(),
  top10_cultura: z.number().nullable(),
  top10_economia: z.number().nullable(),
  top10_total: z.number().nullable(),

  // Step 3 - Financials (all optional)
  ticket_medio: z.number().nullable(),
  ticket_medio_benchmark: z.number().nullable(),
  ltv_estimado: z.number().nullable(),
  ltv_benchmark: z.number().nullable(),
  lucro_oculto: z.number().nullable(),
  projecao_crescimento: z.number().nullable(),

  // Step 4 - Insights
  insights: z.object({
    pontos_fortes: z.array(z.string()).optional(),
    oportunidades: z.array(z.string()).optional(),
    riscos: z.array(z.string()).optional(),
    plano_acao: z.array(z.object({
      prioridade: z.number(),
      acao: z.string(),
      impacto: z.enum(['alto', 'medio', 'baixo']),
    })).optional(),
    analise_qualitativa: z.string().optional(),
  }),
});

type FormData = z.infer<typeof benchmarkSchema>;

const STEPS = [
  { id: 1, title: 'Cliente', description: 'Dados do cliente' },
  { id: 2, title: 'Scores', description: 'Scores comparativos' },
  { id: 3, title: 'Financeiro', description: 'Métricas financeiras' },
  { id: 4, title: 'Insights', description: 'Análise qualitativa' },
];

const defaultInsights: BenchmarkInsights = {
  pontos_fortes: [],
  oportunidades: [],
  riscos: [],
  plano_acao: [],
  analise_qualitativa: '',
};

export function AdminBenchmarkFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);

  const { data: existingBenchmark, isLoading: loadingBenchmark } = useBenchmark(id);
  const createBenchmark = useCreateBenchmark();
  const updateBenchmark = useUpdateBenchmark();
  const publishBenchmark = usePublishBenchmark();

  const methods = useForm<FormData>({
    resolver: zodResolver(benchmarkSchema),
    defaultValues: {
      contact_org_id: '',
      organization_id: '',
      title: '',
      analysis_date: new Date().toISOString().split('T')[0],
      score_causa: null,
      score_cultura: null,
      score_economia: null,
      score_total: null,
      market_avg_causa: null,
      market_avg_cultura: null,
      market_avg_economia: null,
      market_avg_total: null,
      percentile_causa: null,
      percentile_cultura: null,
      percentile_economia: null,
      percentile_total: null,
      top10_causa: null,
      top10_cultura: null,
      top10_economia: null,
      top10_total: null,
      ticket_medio: null,
      ticket_medio_benchmark: null,
      ltv_estimado: null,
      ltv_benchmark: null,
      lucro_oculto: null,
      projecao_crescimento: null,
      insights: defaultInsights,
    },
  });

  // Load existing data
  useEffect(() => {
    if (existingBenchmark) {
      methods.reset({
        contact_org_id: existingBenchmark.contact_org_id,
        organization_id: existingBenchmark.organization_id,
        title: existingBenchmark.title,
        analysis_date: existingBenchmark.analysis_date,
        score_causa: existingBenchmark.score_causa,
        score_cultura: existingBenchmark.score_cultura,
        score_economia: existingBenchmark.score_economia,
        score_total: existingBenchmark.score_total,
        market_avg_causa: existingBenchmark.market_avg_causa,
        market_avg_cultura: existingBenchmark.market_avg_cultura,
        market_avg_economia: existingBenchmark.market_avg_economia,
        market_avg_total: existingBenchmark.market_avg_total,
        percentile_causa: existingBenchmark.percentile_causa,
        percentile_cultura: existingBenchmark.percentile_cultura,
        percentile_economia: existingBenchmark.percentile_economia,
        percentile_total: existingBenchmark.percentile_total,
        top10_causa: existingBenchmark.top10_causa,
        top10_cultura: existingBenchmark.top10_cultura,
        top10_economia: existingBenchmark.top10_economia,
        top10_total: existingBenchmark.top10_total,
        ticket_medio: existingBenchmark.ticket_medio,
        ticket_medio_benchmark: existingBenchmark.ticket_medio_benchmark,
        ltv_estimado: existingBenchmark.ltv_estimado,
        ltv_benchmark: existingBenchmark.ltv_benchmark,
        lucro_oculto: existingBenchmark.lucro_oculto,
        projecao_crescimento: existingBenchmark.projecao_crescimento,
        insights: (existingBenchmark.insights as BenchmarkInsights) || defaultInsights,
      });
    }
  }, [existingBenchmark, methods]);

  const handleSave = async (publish = false) => {
    const data = methods.getValues();

    try {
      if (isEditing) {
        await updateBenchmark.mutateAsync({
          id,
          ...data,
        });

        if (publish && existingBenchmark?.status !== 'published') {
          await publishBenchmark.mutateAsync(id);
        }

        toast({
          title: publish ? 'Benchmark publicado' : 'Benchmark salvo',
          description: publish
            ? 'O cliente já pode visualizar o benchmark'
            : 'As alterações foram salvas com sucesso',
        });
      } else {
        const newBenchmark = await createBenchmark.mutateAsync(data);

        if (publish) {
          await publishBenchmark.mutateAsync(newBenchmark.id);
        }

        toast({
          title: publish ? 'Benchmark criado e publicado' : 'Benchmark criado',
          description: publish
            ? 'O cliente já pode visualizar o benchmark'
            : 'Benchmark salvo como rascunho',
        });
      }

      navigate('/admin/benchmarks');
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o benchmark',
        variant: 'destructive',
      });
    }
  };

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await methods.trigger(fieldsToValidate as any);

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ['contact_org_id', 'organization_id', 'title', 'analysis_date'];
      case 2:
        return [
          'score_causa', 'score_cultura', 'score_economia', 'score_total',
          'market_avg_causa', 'market_avg_cultura', 'market_avg_economia', 'market_avg_total',
          'percentile_causa', 'percentile_cultura', 'percentile_economia', 'percentile_total',
          'top10_causa', 'top10_cultura', 'top10_economia', 'top10_total',
        ];
      case 3:
        return [
          'ticket_medio', 'ticket_medio_benchmark',
          'ltv_estimado', 'ltv_benchmark',
          'lucro_oculto', 'projecao_crescimento',
        ];
      case 4:
        return ['insights'];
      default:
        return [];
    }
  };

  if (isEditing && loadingBenchmark) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kosmos-black">
      {/* Header */}
      <header className="border-b border-kosmos-gray-800 bg-kosmos-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin/benchmarks')}
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-kosmos-white">
                  {isEditing ? 'Editar Benchmark' : 'Novo Benchmark'}
                </h1>
                <p className="text-sm text-kosmos-gray-400">
                  Preencha os dados da análise de benchmark
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={createBenchmark.isPending || updateBenchmark.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={createBenchmark.isPending || updateBenchmark.isPending || publishBenchmark.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isEditing && existingBenchmark?.status === 'published' ? 'Salvar' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Steps indicator */}
      <div className="border-b border-kosmos-gray-800 bg-kosmos-gray-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  currentStep >= step.id ? 'text-kosmos-white' : 'text-kosmos-gray-500'
                )}
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-kosmos-orange text-white'
                      : 'bg-kosmos-gray-800 text-kosmos-gray-500'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-kosmos-gray-500">{step.description}</div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'hidden sm:block w-12 h-0.5 mx-2',
                      currentStep > step.id ? 'bg-green-600' : 'bg-kosmos-gray-800'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form content */}
      <main className="container mx-auto px-4 py-8">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Card className="max-w-3xl mx-auto bg-kosmos-gray-900 border-kosmos-gray-800">
              <CardHeader>
                <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && <ClientDataStep />}
                {currentStep === 2 && <ScoresStep />}
                {currentStep === 3 && <FinancialsStep />}
                {currentStep === 4 && <InsightsStep />}
              </CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="flex justify-between max-w-3xl mx-auto mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={createBenchmark.isPending || updateBenchmark.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Benchmark
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
