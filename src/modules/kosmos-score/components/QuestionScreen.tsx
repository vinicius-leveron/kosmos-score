import { Button } from '@/design-system/primitives/button';
import { Progress } from '@/design-system/primitives/progress';
import { RadioGroup, RadioGroupItem } from '@/design-system/primitives/radio-group';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Question } from '@/modules/kosmos-score/lib/auditQuestions';
import { cn } from '@/design-system/lib/utils';

interface QuestionScreenProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: { value: string; numericValue: number };
  onAnswer: (value: string, numericValue: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  onPrevious,
  canGoBack,
}: QuestionScreenProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const getPillarLabel = (pillar?: string) => {
    if (!pillar) return null;
    const labels = {
      causa: 'CAUSA',
      cultura: 'CULTURA',
      economia: 'ECONOMIA',
    };
    return labels[pillar as keyof typeof labels];
  };

  const getBlockLabel = (block: 'A' | 'B') => {
    return block === 'A' ? 'DADOS QUANTITATIVOS' : 'DIAGNÓSTICO QUALITATIVO';
  };

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid flex flex-col px-4 py-6 md:py-12 relative">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/20 to-transparent" />

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col relative z-10">
        {/* Header with Progress */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-px bg-kosmos-orange" />
              <span className="text-kosmos-orange font-display font-semibold tracking-[0.2em] text-xs">
                KOSMOS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-kosmos-gray text-sm font-display">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-kosmos-gray/50">/</span>
              <span className="text-kosmos-gray/50 text-sm">
                {String(totalQuestions).padStart(2, '0')}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-1 bg-kosmos-black-light" />
        </div>

        {/* Question Card */}
        <div className="card-structural flex-1 flex flex-col animate-slide-in">
          <div className="p-6 md:p-10 flex-1 flex flex-col">
            {/* Block/Pillar Label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-kosmos-gray text-xs font-display tracking-wider">
                {getBlockLabel(question.block)}
              </span>
              {question.pillar && (
                <>
                  <div className="w-px h-3 bg-border" />
                  <span className="text-kosmos-orange text-xs font-display tracking-wider">
                    {getPillarLabel(question.pillar)}
                  </span>
                </>
              )}
            </div>

            {/* Question */}
            <h2 className="font-display text-xl md:text-2xl font-semibold text-kosmos-white mb-2 leading-tight">
              {question.title}
            </h2>
            {question.subtitle && (
              <p className="text-kosmos-gray text-sm mb-6">
                {question.subtitle}
              </p>
            )}

            {/* Options */}
            <RadioGroup
              value={selectedAnswer?.value || ''}
              onValueChange={(value) => {
                const option = question.options.find((o) => o.value === value);
                if (option) {
                  onAnswer(option.value, option.numericValue);
                }
              }}
              className="space-y-3 mt-4 flex-1"
            >
              {question.options.map((option, index) => (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    'relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200',
                    selectedAnswer?.value === option.value
                      ? 'border-kosmos-orange bg-kosmos-orange/10'
                      : 'border-border bg-kosmos-black-soft hover:border-kosmos-gray/30 hover:bg-kosmos-black-light'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="border-kosmos-gray/50 data-[state=checked]:border-kosmos-orange data-[state=checked]:text-kosmos-orange"
                  />
                  <span className="flex-1 text-kosmos-white font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={onPrevious}
                disabled={!canGoBack}
                className="text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                onClick={onNext}
                disabled={!selectedAnswer}
                className={cn(
                  'min-w-[140px] font-display bg-kosmos-orange hover:bg-kosmos-orange-glow text-white transition-all duration-300',
                  selectedAnswer && 'glow-orange-subtle'
                )}
              >
                {isLastQuestion ? 'Ver Resultado' : 'Próxima'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
