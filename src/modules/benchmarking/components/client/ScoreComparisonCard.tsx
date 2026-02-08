/**
 * ScoreComparisonCard - Shows score comparison for a single pillar
 */

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { cn } from '@/design-system/lib/utils';

interface ScoreComparisonCardProps {
  pilar: string;
  score: number | null;
  marketAvg: number | null;
  top10: number | null;
  percentile: number | null;
  color: string;
  icon: React.ReactNode;
}

export function ScoreComparisonCard({
  pilar,
  score,
  marketAvg,
  top10,
  percentile,
  color,
  icon,
}: ScoreComparisonCardProps) {
  const diff = score && marketAvg ? score - marketAvg : 0;
  const isAboveAvg = diff > 0;
  const isBelowAvg = diff < 0;

  const getScoreColor = (s: number | null) => {
    if (!s) return 'text-kosmos-gray-400';
    if (s >= 70) return 'text-green-400';
    if (s >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className={cn('text-base flex items-center gap-2', color)}>
          {icon}
          {pilar}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="text-center">
          <div className={cn('text-4xl font-bold', getScoreColor(score))}>
            {score?.toFixed(1) || '-'}
          </div>
          <div className="text-xs text-kosmos-gray-500 mt-1">Seu Score</div>
        </div>

        {/* Comparison */}
        <div className="flex items-center justify-center gap-2">
          {isAboveAvg ? (
            <ArrowUp className="h-4 w-4 text-green-400" />
          ) : isBelowAvg ? (
            <ArrowDown className="h-4 w-4 text-red-400" />
          ) : (
            <Minus className="h-4 w-4 text-kosmos-gray-400" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              isAboveAvg ? 'text-green-400' : isBelowAvg ? 'text-red-400' : 'text-kosmos-gray-400'
            )}
          >
            {Math.abs(diff).toFixed(1)} {isAboveAvg ? 'acima' : isBelowAvg ? 'abaixo' : 'na'} da média
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-kosmos-gray-800">
          <div className="text-center">
            <div className="text-lg font-semibold text-kosmos-gray-300">
              {marketAvg?.toFixed(1) || '-'}
            </div>
            <div className="text-xs text-kosmos-gray-500">Média Mercado</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-400">
              {top10?.toFixed(1) || '-'}
            </div>
            <div className="text-xs text-kosmos-gray-500">Top 10%</div>
          </div>
        </div>

        {/* Percentile */}
        {percentile !== null && (
          <div className="text-center pt-2">
            <span className="px-3 py-1 rounded-full bg-kosmos-orange/20 text-kosmos-orange text-xs font-medium">
              Você está no top {100 - percentile}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
