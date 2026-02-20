import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { CalculatorInputs, ModeloAtual, TamanhoEquipe } from '../lib/calculatePotential';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/design-system/primitives/tooltip';

interface InputsScreenProps {
  onCalculate: (inputs: CalculatorInputs) => void;
  onBack: () => void;
}

const MODELOS = [
  { value: 'lancamento', label: 'Lançamento', description: 'Vendas em janelas específicas' },
  { value: 'perpetuo', label: 'Perpétuo', description: 'Vendas sempre abertas' },
  { value: 'recorrencia', label: 'Recorrência', description: 'Assinatura mensal/anual' },
] as const;

const EQUIPES = [
  { value: 'sozinho', label: 'Sozinho', description: 'Faço tudo eu mesmo' },
  { value: 'pequena', label: '1-3 pessoas', description: 'Equipe pequena' },
  { value: 'media', label: '4+ pessoas', description: 'Equipe estruturada' },
] as const;

export function InputsScreen({ onCalculate, onBack }: InputsScreenProps) {
  const { isEmbed } = useEmbed();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Partial<CalculatorInputs>>({
    horasTrabalhadas: 40,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const updateInput = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
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
      if (!inputs.faturamentoAtual || inputs.faturamentoAtual <= 0) {
        newErrors.faturamentoAtual = 'Informe seu faturamento atual';
      }
      if (!inputs.modeloAtual) {
        newErrors.modeloAtual = 'Selecione seu modelo de negócio';
      }
    } else if (currentStep === 2) {
      if (!inputs.tamanhoAudiencia || inputs.tamanhoAudiencia <= 0) {
        newErrors.tamanhoAudiencia = 'Informe o tamanho da sua audiência';
      }
      if (!inputs.ticketMedio || inputs.ticketMedio <= 0) {
        newErrors.ticketMedio = 'Informe seu ticket médio';
      }
    } else if (currentStep === 3) {
      if (!inputs.horasTrabalhadas || inputs.horasTrabalhadas <= 0) {
        newErrors.horasTrabalhadas = 'Informe suas horas trabalhadas';
      }
      if (!inputs.equipe) {
        newErrors.equipe = 'Selecione o tamanho da sua equipe';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      // Submit
      if (validateStep(step)) {
        onCalculate(inputs as CalculatorInputs);
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="w-full max-w-xl animate-fade-in relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-kosmos-gray text-sm">
              Passo {step} de {totalSteps}
            </span>
            <span className="text-emerald-500 text-sm font-medium">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-kosmos-black-light rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card-structural p-8">
          <TooltipProvider>
            {/* Step 1: Faturamento e Modelo */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-kosmos-white text-center mb-6">
                  Sobre seu negócio atual
                </h2>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Faturamento mensal atual
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Média dos últimos 3-6 meses</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kosmos-gray">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="50.000"
                      value={formatCurrency(inputs.faturamentoAtual)}
                      onChange={(e) =>
                        updateInput('faturamentoAtual', parseCurrency(e.target.value))
                      }
                      className="h-12 pl-10 bg-kosmos-black border-border focus:border-emerald-500 text-kosmos-white"
                    />
                  </div>
                  {errors.faturamentoAtual && (
                    <p className="text-destructive text-sm mt-1">{errors.faturamentoAtual}</p>
                  )}
                </div>

                <div>
                  <Label className="text-kosmos-white mb-3 block">
                    Modelo de negócio atual
                  </Label>
                  <div className="grid gap-3">
                    {MODELOS.map((modelo) => (
                      <button
                        key={modelo.value}
                        type="button"
                        onClick={() => updateInput('modeloAtual', modelo.value as ModeloAtual)}
                        className={cn(
                          "p-4 rounded-lg border text-left transition-all",
                          inputs.modeloAtual === modelo.value
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border hover:border-kosmos-gray"
                        )}
                      >
                        <p className="font-medium text-kosmos-white">{modelo.label}</p>
                        <p className="text-sm text-kosmos-gray">{modelo.description}</p>
                      </button>
                    ))}
                  </div>
                  {errors.modeloAtual && (
                    <p className="text-destructive text-sm mt-1">{errors.modeloAtual}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Audiência e Ticket */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-kosmos-white text-center mb-6">
                  Sua audiência
                </h2>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Tamanho total da audiência
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Soma de seguidores, lista de email, comunidade, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    placeholder="100.000"
                    value={formatCurrency(inputs.tamanhoAudiencia)}
                    onChange={(e) =>
                      updateInput('tamanhoAudiencia', parseCurrency(e.target.value))
                    }
                    className="h-12 bg-kosmos-black border-border focus:border-emerald-500 text-kosmos-white"
                  />
                  {errors.tamanhoAudiencia && (
                    <p className="text-destructive text-sm mt-1">{errors.tamanhoAudiencia}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Ticket médio atual
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-kosmos-gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Valor médio de venda do seu produto principal</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kosmos-gray">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="997"
                      value={formatCurrency(inputs.ticketMedio)}
                      onChange={(e) =>
                        updateInput('ticketMedio', parseCurrency(e.target.value))
                      }
                      className="h-12 pl-10 bg-kosmos-black border-border focus:border-emerald-500 text-kosmos-white"
                    />
                  </div>
                  {errors.ticketMedio && (
                    <p className="text-destructive text-sm mt-1">{errors.ticketMedio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Horas e Equipe */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-kosmos-white text-center mb-6">
                  Sua operação
                </h2>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-kosmos-white">
                      Horas trabalhadas por semana
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={inputs.horasTrabalhadas || 40}
                      onChange={(e) =>
                        updateInput('horasTrabalhadas', parseInt(e.target.value, 10))
                      }
                      className="w-full h-2 bg-kosmos-black-light rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-kosmos-gray">10h</span>
                      <span className="text-emerald-500 font-medium">
                        {inputs.horasTrabalhadas}h/semana
                      </span>
                      <span className="text-kosmos-gray">80h</span>
                    </div>
                  </div>
                  {errors.horasTrabalhadas && (
                    <p className="text-destructive text-sm mt-1">{errors.horasTrabalhadas}</p>
                  )}
                </div>

                <div>
                  <Label className="text-kosmos-white mb-3 block">
                    Tamanho da equipe
                  </Label>
                  <div className="grid gap-3">
                    {EQUIPES.map((equipe) => (
                      <button
                        key={equipe.value}
                        type="button"
                        onClick={() => updateInput('equipe', equipe.value as TamanhoEquipe)}
                        className={cn(
                          "p-4 rounded-lg border text-left transition-all",
                          inputs.equipe === equipe.value
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border hover:border-kosmos-gray"
                        )}
                      >
                        <p className="font-medium text-kosmos-white">{equipe.label}</p>
                        <p className="text-sm text-kosmos-gray">{equipe.description}</p>
                      </button>
                    ))}
                  </div>
                  {errors.equipe && (
                    <p className="text-destructive text-sm mt-1">{errors.equipe}</p>
                  )}
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
              className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
            >
              {step === totalSteps ? 'Calcular' : 'Próximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
