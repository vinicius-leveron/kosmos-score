import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Question, AuditAnswers } from '@/lib/auditQuestions';
import { cn } from '@/lib/utils';

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
      causa: 'PILAR CAUSA',
      cultura: 'PILAR CULTURA',
      economia: 'PILAR ECONOMIA',
    };
    return labels[pillar as keyof typeof labels];
  };

  const getBlockLabel = (block: 'A' | 'B') => {
    return block === 'A' ? 'DADOS QUANTITATIVOS' : 'DIAGNÓSTICO QUALITATIVO';
  };

  return (
    <div className="min-h-screen gradient-kosmos flex flex-col px-4 py-6 md:py-12">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Header with Progress */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary font-semibold tracking-widest text-xs">
              KOSMOS
            </span>
            <span className="text-muted-foreground text-sm">
              {currentIndex + 1} de {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-1.5 bg-secondary" />
        </div>

        {/* Question Card */}
        <Card className="card-premium border-0 bg-card/50 flex-1 flex flex-col animate-slide-in">
          <CardContent className="p-6 md:p-10 flex-1 flex flex-col">
            {/* Block/Pillar Label */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-muted-foreground text-xs font-medium tracking-wider">
                {getBlockLabel(question.block)}
              </span>
              {question.pillar && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-primary text-xs font-medium tracking-wider">
                    {getPillarLabel(question.pillar)}
                  </span>
                </>
              )}
            </div>

            {/* Question */}
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2 leading-tight">
              {question.title}
            </h2>
            {question.subtitle && (
              <p className="text-muted-foreground text-sm mb-6">
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
                <div
                  key={option.value}
                  className={cn(
                    'relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200',
                    selectedAnswer?.value === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/50'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-foreground font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={onPrevious}
                disabled={!canGoBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                onClick={onNext}
                disabled={!selectedAnswer}
                className={cn(
                  'min-w-[140px]',
                  selectedAnswer && 'glow-orange'
                )}
              >
                {isLastQuestion ? 'Ver Resultado' : 'Próxima'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
