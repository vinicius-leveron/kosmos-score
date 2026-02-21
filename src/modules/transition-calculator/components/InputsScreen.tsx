import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { ArrowRight, ArrowLeft, HelpCircle, Clock, Brain, Users } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { TransitionInputs, StressLevel, DependencyLevel } from '../lib/calculateTransition';
import { FREQUENCIAS } from '../lib/premisas';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/design-system/primitives/tooltip';

interface InputsScreenProps {
  onCalculate: (inputs: TransitionInputs) => void;
  onBack: () => void;
}

const STRESS_LEVELS: { value: StressLevel; label: string; description: string }[] = [
  { value: 1, label: 'Tranquilo', description: 'Lancamentos sao leves' },
  { value: 2, label: 'Gerenciavel', description: 'Algum estresse pontual' },
  { value: 3, label: 'Moderado', description: 'Estresse recorrente' },
  { value: 4, label: 'Alto', description: 'Afeta outras areas' },
  { value: 5, label: 'Critico', description: 'Beira o esgotamento' },
];

const DEPENDENCY_LEVELS: { value: DependencyLevel; label: string; description: string }[] = [
  { value: 1, label: 'Autonomo', description: 'Funciona sem mim' },
  { value: 2, label: 'Delegado', description: 'Equipe executa bem' },
  { value: 3, label: 'Parcial', description: 'Depende em partes' },
  { value: 4, label: 'Central', description: 'Sou necessario' },
  { value: 5, label: 'Total', description: 'Depende 100% de mim' },
];

export function InputsScreen({ onCalculate, onBack }: InputsScreenProps) {
  const { isEmbed } = useEmbed();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Partial<TransitionInputs>>({
    frequenciaLancamentos: 4,
    churnEstimado: 5,
    horasPorLancamento: 120,
    nivelEstresse: 3,
    nivelDependencia: 4,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const updateInput = <K extends keyof TransitionInputs>(
    key: K,
    value: TransitionInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!inputs.faturamentoLancamento || inputs.faturamentoLancamento <= 0) {
        newErrors.faturamentoLancamento = 'Informe o faturamento por lancamento';
      }
      if (!inputs.custoLancamento || inputs.custoLancamento < 0) {
        newErrors.custoLancamento = 'Informe o custo por lancamento';
      }
      if (!inputs.frequenciaLancamentos) {
        newErrors.frequenciaLancamentos = 'Selecione a frequencia';
      }
    } else if (currentStep === 2) {
      if (!inputs.tamanhoLista || inputs.tamanhoLista <= 0) {
        newErrors.tamanhoLista = 'Informe o tamanho da lista';
      }
      if (!inputs.ticketRecorrencia || inputs.ticketRecorrencia <= 0) {
        newErrors.ticketRecorrencia = 'Informe o ticket da recorrencia';
      }
    }
    // Step 3 has no required validation (all have defaults)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      if (validateStep(step)) {
        onCalculate(inputs as TransitionInputs);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      onBack();
    }
  };

  const formatCurrency = (value: number | undefined): string => {
    if (!value) return '';
    return value.toLocaleString('pt-BR');
  };

  const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/\D/g, ''), 10) || 0;
  };

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center justify-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-12"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-xl animate-fade-in relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-kosmos-gray text-sm">
              Passo {step} de {totalSteps}
            </span>
            <span className="text-kosmos-orange text-sm font-medium">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-kosmos-black-light rounded-full overflow-hidden">
            <div
              className="h-full bg-kosmos-orange transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card-structural p-8">
          <TooltipProvider>
            {/* Step 1: Dados de Lançamento */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-kosmos-white text-center mb-6">
                  Seus lancamentos atuais
                </h2>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Faturamento medio por lancamento
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Media dos ultimos 3 lancamentos</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kosmos-gray">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="100.000"
                      value={formatCurrency(inputs.faturamentoLancamento)}
                      onChange={(e) =>
                        updateInput('faturamentoLancamento', parseCurrency(e.target.value))
                      }
                      className="h-12 pl-10 bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                    />
                  </div>
                  {errors.faturamentoLancamento && (
                    <p className="text-destructive text-sm mt-1">{errors.faturamentoLancamento}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Custo medio por lancamento
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Trafego, equipe, ferramentas, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kosmos-gray">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="30.000"
                      value={formatCurrency(inputs.custoLancamento)}
                      onChange={(e) =>
                        updateInput('custoLancamento', parseCurrency(e.target.value))
                      }
                      className="h-12 pl-10 bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                    />
                  </div>
                  {errors.custoLancamento && (
                    <p className="text-destructive text-sm mt-1">{errors.custoLancamento}</p>
                  )}
                </div>

                <div>
                  <Label className="text-kosmos-white mb-3 block">
                    Quantos lancamentos por ano?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {FREQUENCIAS.map((freq) => (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => updateInput('frequenciaLancamentos', freq.value)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all text-sm",
                          inputs.frequenciaLancamentos === freq.value
                            ? "border-kosmos-orange bg-kosmos-orange/10"
                            : "border-border hover:border-kosmos-gray"
                        )}
                      >
                        <p className="font-medium text-kosmos-white">{freq.label}</p>
                      </button>
                    ))}
                  </div>
                  {errors.frequenciaLancamentos && (
                    <p className="text-destructive text-sm mt-1">{errors.frequenciaLancamentos}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Dados de Recorrência */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-kosmos-white text-center mb-6">
                  O ecossistema projetado
                </h2>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Tamanho da sua lista de emails
                    </Label>
                  </div>
                  <Input
                    type="text"
                    placeholder="50.000"
                    value={formatCurrency(inputs.tamanhoLista)}
                    onChange={(e) =>
                      updateInput('tamanhoLista', parseCurrency(e.target.value))
                    }
                    className="h-12 bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                  />
                  {errors.tamanhoLista && (
                    <p className="text-destructive text-sm mt-1">{errors.tamanhoLista}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Ticket mensal da assinatura
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quanto voce pretende cobrar por mes</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kosmos-gray">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="97"
                      value={formatCurrency(inputs.ticketRecorrencia)}
                      onChange={(e) =>
                        updateInput('ticketRecorrencia', parseCurrency(e.target.value))
                      }
                      className="h-12 pl-10 bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                    />
                  </div>
                  {errors.ticketRecorrencia && (
                    <p className="text-destructive text-sm mt-1">{errors.ticketRecorrencia}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Churn mensal estimado
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>% de cancelamentos por mes (media: 5%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={inputs.churnEstimado || 5}
                      onChange={(e) =>
                        updateInput('churnEstimado', parseInt(e.target.value, 10))
                      }
                      className="w-full h-2 bg-kosmos-black-light rounded-lg appearance-none cursor-pointer accent-kosmos-orange"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-kosmos-gray">1%</span>
                      <span className="text-kosmos-orange font-medium">
                        {inputs.churnEstimado}% ao mes
                      </span>
                      <span className="text-kosmos-gray">15%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Dados Não-Financeiros (NOVO) */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-kosmos-white text-center mb-2">
                  Alem do dinheiro
                </h2>
                <p className="text-kosmos-gray text-center text-sm mb-6">
                  Para projetar sustentabilidade e qualidade de vida
                </p>

                {/* Horas por lançamento */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-kosmos-orange" />
                    <Label className="text-kosmos-white">
                      Horas trabalhadas por lancamento
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total de horas nas 2-3 semanas de lancamento</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="40"
                      max="200"
                      step="10"
                      value={inputs.horasPorLancamento || 120}
                      onChange={(e) =>
                        updateInput('horasPorLancamento', parseInt(e.target.value, 10))
                      }
                      className="w-full h-2 bg-kosmos-black-light rounded-lg appearance-none cursor-pointer accent-kosmos-orange"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-kosmos-gray">40h</span>
                      <span className="text-kosmos-orange font-medium">
                        {inputs.horasPorLancamento}h por lancamento
                      </span>
                      <span className="text-kosmos-gray">200h</span>
                    </div>
                  </div>
                </div>

                {/* Nível de estresse */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-kosmos-orange" />
                    <Label className="text-kosmos-white">
                      Como voce se sente durante lancamentos?
                    </Label>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {STRESS_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateInput('nivelEstresse', level.value)}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          inputs.nivelEstresse === level.value
                            ? "border-kosmos-orange bg-kosmos-orange/10"
                            : "border-border hover:border-kosmos-gray"
                        )}
                      >
                        <p className="font-medium text-kosmos-white text-xs">{level.value}</p>
                        <p className="text-[10px] text-kosmos-gray mt-0.5">{level.label}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-kosmos-gray text-xs mt-2 text-center">
                    {STRESS_LEVELS.find((l) => l.value === inputs.nivelEstresse)?.description}
                  </p>
                </div>

                {/* Nível de dependência */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-kosmos-orange" />
                    <Label className="text-kosmos-white">
                      Quanto o negocio depende de voce?
                    </Label>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {DEPENDENCY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateInput('nivelDependencia', level.value)}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          inputs.nivelDependencia === level.value
                            ? "border-kosmos-orange bg-kosmos-orange/10"
                            : "border-border hover:border-kosmos-gray"
                        )}
                      >
                        <p className="font-medium text-kosmos-white text-xs">{level.value}</p>
                        <p className="text-[10px] text-kosmos-gray mt-0.5">{level.label}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-kosmos-gray text-xs mt-2 text-center">
                    {DEPENDENCY_LEVELS.find((l) => l.value === inputs.nivelDependencia)?.description}
                  </p>
                </div>
              </div>
            )}
          </TooltipProvider>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="flex-1 h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange"
            >
              {step === totalSteps ? 'Ver Simulacao' : 'Proximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
