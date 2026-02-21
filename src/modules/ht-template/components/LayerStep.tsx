import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import { ArrowRight, ArrowLeft, Plus, X, Lightbulb, CheckCircle2 } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { EcosystemLayer, BlueprintData, LayerQuestion } from '../lib/layers';

interface LayerStepProps {
  layer: EcosystemLayer;
  layerIndex: number;
  totalLayers: number;
  data: BlueprintData;
  onUpdate: (layerId: string, questionId: string, value: string | string[] | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export function LayerStep({
  layer,
  layerIndex,
  totalLayers,
  data,
  onUpdate,
  onNext,
  onPrevious,
  canGoBack,
}: LayerStepProps) {
  const { isEmbed } = useEmbed();
  const [showTips, setShowTips] = useState(false);
  const layerData = data[layer.id] || {};

  const progress = ((layerIndex + 1) / totalLayers) * 100;

  const handleListAdd = (questionId: string, maxItems: number) => {
    const current = (layerData[questionId] as string[]) || [];
    if (current.length < maxItems) {
      onUpdate(layer.id, questionId, [...current, '']);
    }
  };

  const handleListUpdate = (questionId: string, index: number, value: string) => {
    const current = (layerData[questionId] as string[]) || [];
    const updated = [...current];
    updated[index] = value;
    onUpdate(layer.id, questionId, updated);
  };

  const handleListRemove = (questionId: string, index: number) => {
    const current = (layerData[questionId] as string[]) || [];
    onUpdate(layer.id, questionId, current.filter((_, i) => i !== index));
  };

  const renderQuestion = (question: LayerQuestion) => {
    const value = layerData[question.id];

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => onUpdate(layer.id, question.id, e.target.value)}
            placeholder={question.placeholder}
            className="bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onUpdate(layer.id, question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white resize-none"
          />
        );

      case 'list':
        return (
          <div className="space-y-2">
            {((value as string[]) || ['']).map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleListUpdate(question.id, index, e.target.value)}
                  placeholder={question.placeholder}
                  className="flex-1 bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                />
                {((value as string[]) || []).length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleListRemove(question.id, index)}
                    className="text-kosmos-gray hover:text-destructive"
                    aria-label="Remover item"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {((value as string[]) || []).length < (question.maxItems || 10) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleListAdd(question.id, question.maxItems || 10)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar item
              </Button>
            )}
          </div>
        );

      case 'assessment':
        return (
          <div className="grid gap-2">
            {question.assessmentOptions?.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onUpdate(layer.id, question.id, option.value)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
                    isSelected
                      ? 'border-kosmos-orange bg-kosmos-orange/10 text-kosmos-white'
                      : 'border-border bg-kosmos-black hover:border-kosmos-orange/50 text-kosmos-gray'
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected ? 'border-kosmos-orange bg-kosmos-orange' : 'border-kosmos-gray/40'
                    )}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <span className={cn('text-sm', isSelected && 'font-medium')}>
                      {option.label}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      isSelected ? 'bg-kosmos-orange/20 text-kosmos-orange' : 'bg-kosmos-black-light text-kosmos-gray'
                    )}
                  >
                    {option.value}/5
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden',
        isEmbed ? 'min-h-0 py-6' : 'min-h-screen py-8'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{layer.emoji}</span>
              <span className="text-kosmos-orange text-xs font-medium uppercase tracking-wider">
                Camada {layerIndex + 1}: {layer.name}
              </span>
            </div>
            <span className="text-kosmos-gray text-sm">
              {layerIndex + 1} / {totalLayers}
            </span>
          </div>
          <div className="h-2 bg-kosmos-black-light rounded-full overflow-hidden">
            <div
              className="h-full bg-kosmos-orange transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card-structural p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="font-display text-xl md:text-2xl font-bold text-kosmos-white mb-1">
                {layer.headline}
              </h2>
              <p className="text-kosmos-gray text-sm">{layer.description}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTips(!showTips)}
              className="text-kosmos-orange ml-4"
              aria-label="Mostrar dicas"
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          </div>

          {/* Focus Areas */}
          <div className="flex flex-wrap gap-2 mb-6">
            {layer.focusAreas.map((area, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-full bg-kosmos-orange/10 text-kosmos-orange border border-kosmos-orange/20"
              >
                {area}
              </span>
            ))}
          </div>

          {/* Tips */}
          {showTips && (
            <div className="mb-6 p-4 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-lg">
              <p className="text-kosmos-orange text-sm font-medium mb-2">Dicas:</p>
              <ul className="space-y-1">
                {layer.tips.map((tip, i) => (
                  <li key={i} className="text-kosmos-gray text-sm flex items-start gap-2">
                    <span className="text-kosmos-orange">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {layer.questions.map((question) => (
              <div key={question.id}>
                <Label className="text-kosmos-white mb-2 block">{question.question}</Label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
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
              className="flex-1 h-12 bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange"
            >
              {layerIndex === totalLayers - 1 ? 'Ver Blueprint' : 'Proxima Camada'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
