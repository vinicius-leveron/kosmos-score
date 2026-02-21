import { cn } from '@/design-system/lib/utils';
import {
  ECOSYSTEM_LAYERS,
  BlueprintData,
  LayerScore,
  calculateLayerScore,
  getLayerStatusColor,
  getLayerStatusBgColor,
} from '../lib/layers';

interface BlueprintVisualizationProps {
  data: BlueprintData;
  layerScores?: LayerScore[];
  compact?: boolean;
}

const STATUS_LABELS: Record<LayerScore['status'], string> = {
  vazio: 'Vazio',
  iniciando: 'Iniciando',
  construindo: 'Construindo',
  maduro: 'Maduro',
  autonomo: 'Autonomo',
};

export function BlueprintVisualization({
  data,
  layerScores: providedScores,
  compact = false,
}: BlueprintVisualizationProps) {
  const layerScores =
    providedScores ||
    ECOSYSTEM_LAYERS.map((layer) => calculateLayerScore(layer.id, data));

  // Reverse to show from bottom (RAIZ) to top (AUTONOMIA) visually
  const reversedLayers = [...ECOSYSTEM_LAYERS].reverse();
  const reversedScores = [...layerScores].reverse();

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1">
        {ECOSYSTEM_LAYERS.map((layer, index) => {
          const score = layerScores[index];
          return (
            <div
              key={layer.id}
              className={cn(
                'w-8 h-8 rounded flex items-center justify-center text-sm',
                getLayerStatusBgColor(score.status),
                getLayerStatusColor(score.status)
              )}
              title={`${layer.name}: ${STATUS_LABELS[score.status]}`}
            >
              {layer.emoji}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Pyramid-style visualization */}
      <div className="relative">
        {reversedLayers.map((layer, index) => {
          const scoreIndex = ECOSYSTEM_LAYERS.length - 1 - index;
          const score = reversedScores[index];
          const widthPercentage = 60 + index * 10; // From 60% at top to 100% at bottom

          return (
            <div
              key={layer.id}
              className="flex justify-center mb-2"
              style={{ width: '100%' }}
            >
              <div
                className={cn(
                  'relative flex items-center gap-3 p-4 rounded-lg border transition-all',
                  getLayerStatusBgColor(score.status),
                  'border-kosmos-gray/20'
                )}
                style={{ width: `${widthPercentage}%` }}
              >
                {/* Score indicator bar */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
                    score.status === 'vazio'
                      ? 'bg-red-500'
                      : score.status === 'iniciando'
                        ? 'bg-orange-500'
                        : score.status === 'construindo'
                          ? 'bg-yellow-500'
                          : score.status === 'maduro'
                            ? 'bg-emerald-500'
                            : 'bg-cyan-500'
                  )}
                />

                {/* Layer info */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{layer.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-kosmos-white font-medium text-sm truncate">
                        {layer.name}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          getLayerStatusBgColor(score.status),
                          getLayerStatusColor(score.status)
                        )}
                      >
                        {STATUS_LABELS[score.status]}
                      </span>
                    </div>
                    <p className="text-kosmos-gray text-xs truncate">{layer.headline}</p>
                  </div>
                </div>

                {/* Score badge */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg border',
                    getLayerStatusBgColor(score.status),
                    'border-kosmos-gray/20'
                  )}
                >
                  <span className={cn('text-lg font-bold', getLayerStatusColor(score.status))}>
                    {score.score}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
        {(['vazio', 'iniciando', 'construindo', 'maduro', 'autonomo'] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className={cn('w-3 h-3 rounded-full', {
                'bg-red-500': status === 'vazio',
                'bg-orange-500': status === 'iniciando',
                'bg-yellow-500': status === 'construindo',
                'bg-emerald-500': status === 'maduro',
                'bg-cyan-500': status === 'autonomo',
              })}
            />
            <span className="text-kosmos-gray">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LayerSummaryProps {
  data: BlueprintData;
}

export function LayerSummary({ data }: LayerSummaryProps) {
  return (
    <div className="space-y-4">
      {ECOSYSTEM_LAYERS.map((layer) => {
        const score = calculateLayerScore(layer.id, data);
        const layerData = data[layer.id] || {};

        // Count filled vs total questions (excluding assessment)
        const contentQuestions = layer.questions.filter((q) => q.type !== 'assessment');
        const filledCount = contentQuestions.filter((q) => {
          const value = layerData[q.id];
          if (q.type === 'list') {
            const list = (value as string[]) || [];
            return list.length > 0 && list.some((item) => item.trim() !== '');
          }
          return value && String(value).trim() !== '';
        }).length;

        return (
          <div
            key={layer.id}
            className={cn(
              'p-4 rounded-lg border',
              getLayerStatusBgColor(score.status),
              'border-kosmos-gray/20'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{layer.emoji}</span>
                <span className="text-kosmos-white font-medium">{layer.name}</span>
              </div>
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  getLayerStatusBgColor(score.status),
                  getLayerStatusColor(score.status)
                )}
              >
                {filledCount}/{contentQuestions.length} preenchido
              </span>
            </div>

            <div className="space-y-2">
              {layer.questions
                .filter((q) => q.type !== 'assessment')
                .map((question) => {
                  const value = layerData[question.id];
                  let hasContent = false;
                  let displayValue = '';

                  if (question.type === 'list') {
                    const list = (value as string[]) || [];
                    hasContent = list.length > 0 && list.some((item) => item.trim() !== '');
                    displayValue = list.filter((item) => item.trim() !== '').join(', ');
                  } else {
                    hasContent = !!value && String(value).trim() !== '';
                    displayValue = String(value || '');
                  }

                  return (
                    <div key={question.id} className="flex items-start gap-2 text-sm">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                          hasContent
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-kosmos-gray/20 text-kosmos-gray'
                        )}
                      >
                        {hasContent ? '✓' : '○'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs',
                            hasContent ? 'text-kosmos-gray' : 'text-kosmos-gray/50'
                          )}
                        >
                          {question.question.replace(/\?$/, '')}
                        </p>
                        {hasContent && (
                          <p className="text-kosmos-white text-xs mt-0.5 line-clamp-2">
                            {displayValue}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
