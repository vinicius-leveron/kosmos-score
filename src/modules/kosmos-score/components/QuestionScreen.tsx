import { Button } from '@/design-system/primitives/button';
import { Progress } from '@/design-system/primitives/progress';
import { RadioGroup, RadioGroupItem } from '@/design-system/primitives/radio-group';
import { Checkbox } from '@/design-system/primitives/checkbox';
import { Textarea } from '@/design-system/primitives/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Question, AuditAnswer, getBlockLabel, getPillarLabel } from '@/modules/kosmos-score/lib/auditQuestionsV2';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';

interface QuestionScreenProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: AuditAnswer;
  onAnswer: (answer: AuditAnswer) => void;
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
  const { isEmbed } = useEmbed();
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Check if answer is valid for proceeding
  const canProceed = (): boolean => {
    if (!question.required) return true;
    if (!selectedAnswer) return false;

    if (selectedAnswer.type === 'single') {
      return !!selectedAnswer.value;
    }
    if (selectedAnswer.type === 'multi') {
      return selectedAnswer.values.length > 0;
    }
    if (selectedAnswer.type === 'text') {
      return selectedAnswer.value.trim().length > 0;
    }
    return false;
  };

  // Render single select (radio)
  const renderSingleSelect = () => {
    const currentValue = selectedAnswer?.type === 'single' ? selectedAnswer.value : '';

    return (
      <RadioGroup
        value={currentValue}
        onValueChange={(value) => {
          const option = question.options?.find((o) => o.value === value);
          if (option) {
            onAnswer({
              type: 'single',
              value: option.value,
              numericValue: option.numericValue,
            });
          }
        }}
        className="space-y-3 mt-4 flex-1"
      >
        {question.options?.map((option, index) => (
          <label
            key={option.value}
            htmlFor={option.value}
            className={cn(
              'relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200',
              currentValue === option.value
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
    );
  };

  // Render multi select (checkboxes)
  const renderMultiSelect = () => {
    const currentValues = selectedAnswer?.type === 'multi' ? selectedAnswer.values : [];

    const toggleValue = (value: string, numericValue: number) => {
      let newValues: string[];
      let newNumericValue: number;

      // If "nenhum" is selected, clear all others
      if (value === 'nenhum') {
        newValues = currentValues.includes('nenhum') ? [] : ['nenhum'];
        newNumericValue = currentValues.includes('nenhum') ? 0 : numericValue;
      } else {
        // Remove "nenhum" if selecting other options
        const filteredValues = currentValues.filter(v => v !== 'nenhum');

        if (filteredValues.includes(value)) {
          newValues = filteredValues.filter(v => v !== value);
        } else {
          newValues = [...filteredValues, value];
        }

        // Calculate total numeric value
        newNumericValue = newValues.reduce((sum, v) => {
          const opt = question.options?.find(o => o.value === v);
          return sum + (opt?.numericValue || 0);
        }, 0);
      }

      onAnswer({
        type: 'multi',
        values: newValues,
        numericValue: Math.min(100, newNumericValue), // Cap at 100
      });
    };

    return (
      <div className="space-y-3 mt-4 flex-1">
        {question.options?.map((option, index) => (
          <label
            key={option.value}
            htmlFor={`checkbox-${option.value}`}
            className={cn(
              'relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200',
              currentValues.includes(option.value)
                ? 'border-kosmos-orange bg-kosmos-orange/10'
                : 'border-border bg-kosmos-black-soft hover:border-kosmos-gray/30 hover:bg-kosmos-black-light'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Checkbox
              id={`checkbox-${option.value}`}
              checked={currentValues.includes(option.value)}
              onCheckedChange={() => toggleValue(option.value, option.numericValue)}
              className="border-kosmos-gray/50 data-[state=checked]:border-kosmos-orange data-[state=checked]:bg-kosmos-orange"
            />
            <span className="flex-1 text-kosmos-white font-medium">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    );
  };

  // Render text input (textarea)
  const renderTextInput = () => {
    const currentValue = selectedAnswer?.type === 'text' ? selectedAnswer.value : '';

    return (
      <div className="mt-4 flex-1">
        <Textarea
          value={currentValue}
          onChange={(e) => {
            onAnswer({
              type: 'text',
              value: e.target.value,
            });
          }}
          placeholder={question.placeholder || 'Digite sua resposta...'}
          className="min-h-[120px] bg-kosmos-black-soft border-border text-kosmos-white placeholder:text-kosmos-gray/50 focus:border-kosmos-orange focus:ring-kosmos-orange/20 resize-none"
          maxLength={280}
        />
        <p className="text-kosmos-gray/50 text-xs mt-2 text-right">
          {currentValue.length}/280 caracteres
        </p>
      </div>
    );
  };

  // Render question content based on type
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single':
        return renderSingleSelect();
      case 'multi':
        return renderMultiSelect();
      case 'text':
        return renderTextInput();
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col px-4 relative",
      isEmbed ? "min-h-0 py-4" : "min-h-screen py-6 md:py-12"
    )}>
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

            {/* Question Content */}
            {renderQuestionContent()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={onPrevious}
                disabled={!canGoBack}
                aria-label="Voltar para pergunta anterior"
                className="text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                onClick={onNext}
                disabled={!canProceed()}
                className={cn(
                  'min-w-[140px] font-display bg-kosmos-orange hover:bg-kosmos-orange-glow text-white transition-all duration-300',
                  canProceed() && 'glow-orange-subtle'
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
