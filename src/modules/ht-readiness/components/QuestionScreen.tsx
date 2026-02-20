import { Button } from '@/design-system/primitives/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { DiagnosticQuestion, CATEGORIES } from '../lib/questions';

interface QuestionScreenProps {
  question: DiagnosticQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswer: (value: string) => void;
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
  const category = CATEGORIES.find((c) => c.id === question.category);

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

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
            <span className="text-kosmos-orange text-xs font-medium uppercase tracking-wider">
              {category?.name}
            </span>
            <span className="text-kosmos-gray text-sm">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="h-2 bg-kosmos-black-light rounded-full overflow-hidden">
            <div
              className="h-full bg-kosmos-orange transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card-structural p-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-kosmos-white mb-2">
            {question.question}
          </h2>

          {question.helperText && (
            <p className="text-kosmos-gray text-sm mb-6">
              {question.helperText}
            </p>
          )}

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onAnswer(option.value)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  selectedAnswer === option.value
                    ? "border-kosmos-orange bg-kosmos-orange/10"
                    : "border-border hover:border-kosmos-gray"
                )}
              >
                <p className="font-medium text-kosmos-white">{option.label}</p>
                {option.description && (
                  <p className="text-sm text-kosmos-gray mt-1">
                    {option.description}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoBack}
              className="flex-1 h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={onNext}
              disabled={!selectedAnswer}
              className="flex-1 h-12 bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange disabled:opacity-50"
            >
              {currentIndex === totalQuestions - 1 ? 'Ver Resultado' : 'Proximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
