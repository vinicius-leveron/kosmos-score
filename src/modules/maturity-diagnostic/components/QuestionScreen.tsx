import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { MaturityQuestion, QuestionOption } from '../lib/questions';

interface QuestionScreenProps {
  question: MaturityQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedValue?: string;
  onAnswer: (value: string, score: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
}

export function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  selectedValue,
  onAnswer,
  onPrevious,
  onNext,
  canGoBack,
  isLastQuestion,
}: QuestionScreenProps) {
  const { isEmbed } = useEmbed();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleOptionClick = (option: QuestionOption) => {
    onAnswer(option.value, option.score);
  };

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid flex flex-col items-center justify-center px-4 relative overflow-hidden',
        isEmbed ? 'min-h-0 py-6' : 'min-h-screen py-8'
      )}
    >
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents */}
      {!isEmbed && (
        <>
          <div className="absolute top-6 left-6 w-8 h-8 border-l border-t border-kosmos-orange/20" />
          <div className="absolute top-6 right-6 w-8 h-8 border-r border-t border-kosmos-orange/20" />
        </>
      )}

      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-kosmos-gray text-sm">
              Pergunta {currentIndex + 1} de {totalQuestions}
            </span>
            <span className="text-kosmos-orange text-sm font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-kosmos-orange transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card-structural p-6 md:p-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-kosmos-white mb-2 leading-tight">
              {question.question}
            </h2>
            {question.helperText && (
              <div className="flex items-start gap-2 mt-3">
                <HelpCircle className="w-4 h-4 text-kosmos-gray flex-shrink-0 mt-0.5" />
                <p className="text-kosmos-gray text-sm">{question.helperText}</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedValue === option.value;
              const isHovered = hoveredOption === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHoveredOption(option.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                    isSelected
                      ? 'border-kosmos-orange bg-kosmos-orange/10'
                      : 'border-border hover:border-kosmos-orange/50 bg-kosmos-black/50',
                    'group'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                        isSelected
                          ? 'border-kosmos-orange bg-kosmos-orange'
                          : 'border-kosmos-gray/40 group-hover:border-kosmos-orange/50'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <span
                        className={cn(
                          'font-medium transition-colors',
                          isSelected
                            ? 'text-kosmos-orange'
                            : 'text-kosmos-white group-hover:text-kosmos-orange'
                        )}
                      >
                        {option.label}
                      </span>
                      {(isHovered || isSelected) && (
                        <p className="text-kosmos-gray text-sm mt-1 animate-fade-in">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onPrevious}
              disabled={!canGoBack}
              className={cn(
                'text-kosmos-gray hover:text-kosmos-white',
                !canGoBack && 'opacity-0 pointer-events-none'
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <Button
              type="button"
              onClick={onNext}
              disabled={!selectedValue}
              className={cn(
                'bg-kosmos-orange hover:bg-kosmos-orange-glow text-white font-medium',
                !selectedValue && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLastQuestion ? 'Ver Resultado' : 'Próxima'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
