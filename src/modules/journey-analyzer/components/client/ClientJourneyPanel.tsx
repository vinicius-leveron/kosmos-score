import { useState } from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { cn } from '@/design-system/lib/utils';
import { useClientContext } from '../../contexts/ClientAccessContext';

export function ClientJourneyPanel() {
  const { data } = useClientContext();
  const { stages, problem_statements, personas } = data;
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const selectedStage = stages.find((s) => s.id === selectedStageId);

  const painPoints = stages.flatMap((stage) =>
    (stage.touchpoints || [])
      .filter((tp) => (tp.score !== null && tp.score < 5) || tp.is_critical)
      .map((tp) => ({ ...tp, stageName: stage.display_name }))
  );

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'border-gray-300 bg-gray-50';
    if (score >= 8) return 'border-green-500 bg-green-50';
    if (score >= 6) return 'border-yellow-500 bg-yellow-50';
    if (score >= 4) return 'border-orange-500 bg-orange-50';
    return 'border-red-500 bg-red-50';
  };

  const getScoreTextColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Journey Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mapa da Jornada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-stretch gap-2 min-w-max">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <button
                    onClick={() => setSelectedStageId(
                      selectedStageId === stage.id ? null : stage.id
                    )}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all min-w-[140px]',
                      getScoreColor(stage.score),
                      selectedStageId === stage.id && 'ring-2 ring-primary ring-offset-2',
                      'hover:shadow-md cursor-pointer'
                    )}
                  >
                    <div
                      className="absolute top-2 right-2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color || '#6366f1' }}
                    />
                    <span className="font-medium text-sm text-center mb-1">
                      {stage.display_name}
                    </span>
                    <span className={cn('text-2xl font-bold', getScoreTextColor(stage.score))}>
                      {stage.score !== null ? Number(stage.score).toFixed(1) : '—'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {stage.touchpoints?.length || 0} touchpoints
                    </span>
                  </button>
                  {index < stages.length - 1 && (
                    <ChevronRight className="h-6 w-6 text-muted-foreground mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Detail */}
      {selectedStage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedStage.display_name}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStage.description && (
              <p className="text-sm text-muted-foreground mb-4">{selectedStage.description}</p>
            )}
            {selectedStage.touchpoints?.length ? (
              <div className="space-y-2">
                {selectedStage.touchpoints.map((tp) => (
                  <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{tp.name}</p>
                      {tp.description && (
                        <p className="text-xs text-muted-foreground">{tp.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {tp.is_critical && (
                        <Badge variant="destructive" className="text-xs">Critico</Badge>
                      )}
                      <span className={cn('text-sm font-bold', getScoreTextColor(tp.score))}>
                        {tp.score !== null ? Number(tp.score).toFixed(1) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum touchpoint nesta etapa</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pain Points */}
      {painPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pontos de Dor Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {painPoints.map((tp) => (
                <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50">
                  <div>
                    <p className="text-sm font-medium">{tp.name}</p>
                    <p className="text-xs text-muted-foreground">{tp.stageName}</p>
                  </div>
                  <span className={cn('text-sm font-bold', getScoreTextColor(tp.score))}>
                    {tp.score !== null ? Number(tp.score).toFixed(1) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Statements */}
      {problem_statements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problemas Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problem_statements.map((ps) => {
                const persona = personas.find((p) => p.id === ps.persona_id);
                return (
                  <div key={ps.id} className={cn(
                    'p-4 rounded-lg border',
                    ps.is_primary && 'border-primary bg-primary/5'
                  )}>
                    <p className="text-sm font-medium">{ps.statement}</p>
                    {ps.context && (
                      <p className="text-xs text-muted-foreground mt-1">{ps.context}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {ps.is_primary && <Badge className="text-xs">Principal</Badge>}
                      {persona && <Badge variant="outline" className="text-xs">{persona.name}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
