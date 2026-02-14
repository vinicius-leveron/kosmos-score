import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import type { JourneyProjectStageWithTouchpoints, JourneyTouchpoint } from '../../types';

interface PainPointsListProps {
  stages: JourneyProjectStageWithTouchpoints[];
}

interface PainPoint extends JourneyTouchpoint {
  stageName: string;
}

export function PainPointsList({ stages }: PainPointsListProps) {
  const painPoints: PainPoint[] = stages
    .flatMap((stage) =>
      (stage.touchpoints || [])
        .filter((tp) => (tp.score !== null && Number(tp.score) < 5) || tp.is_critical)
        .map((tp) => ({ ...tp, stageName: stage.display_name }))
    )
    .sort((a, b) => (Number(a.score) || 0) - (Number(b.score) || 0));

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (Number(score) >= 8) return 'text-green-600';
    if (Number(score) >= 6) return 'text-yellow-600';
    if (Number(score) >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Pontos Criticos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {painPoints.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum ponto critico identificado. Avalie os touchpoints na aba Definir.
          </p>
        ) : (
          <div className="space-y-2">
            {painPoints.map((tp) => (
              <div
                key={tp.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-lg font-bold ${getScoreColor(tp.score)}`}>
                    {tp.score !== null ? Number(tp.score).toFixed(1) : '--'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tp.name}</p>
                    {tp.notes && (
                      <p className="text-xs text-muted-foreground truncate">{tp.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{tp.stageName}</Badge>
                  {tp.is_critical && (
                    <Badge variant="destructive" className="text-xs">Critico</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
