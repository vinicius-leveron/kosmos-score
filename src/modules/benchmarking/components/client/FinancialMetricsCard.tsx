/**
 * FinancialMetricsCard - Shows financial KPIs comparison
 */

import { TrendingUp, TrendingDown, DollarSign, Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { cn } from '@/design-system/lib/utils';
import type { BenchmarkWithRelations } from '../../types';

interface FinancialMetricsCardProps {
  benchmark: BenchmarkWithRelations;
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricRow({
  label,
  value,
  benchmark,
  icon,
}: {
  label: string;
  value: number | null;
  benchmark: number | null;
  icon: React.ReactNode;
}) {
  const diff = value && benchmark ? ((value - benchmark) / benchmark) * 100 : null;
  const isPositive = diff !== null && diff > 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-kosmos-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kosmos-gray-800">{icon}</div>
        <div>
          <div className="text-sm text-kosmos-gray-400">{label}</div>
          <div className="text-lg font-semibold text-kosmos-white">
            {formatCurrency(value)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-kosmos-gray-500">
          Benchmark: {formatCurrency(benchmark)}
        </div>
        {diff !== null && (
          <div
            className={cn(
              'flex items-center justify-end gap-1 text-sm font-medium',
              isPositive ? 'text-green-400' : 'text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(diff).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

export function FinancialMetricsCard({ benchmark }: FinancialMetricsCardProps) {
  return (
    <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-kosmos-orange" />
          Métricas Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <MetricRow
          label="Ticket Médio"
          value={benchmark.ticket_medio}
          benchmark={benchmark.ticket_medio_benchmark}
          icon={<DollarSign className="h-4 w-4 text-kosmos-orange" />}
        />
        <MetricRow
          label="LTV Estimado"
          value={benchmark.ltv_estimado}
          benchmark={benchmark.ltv_benchmark}
          icon={<Target className="h-4 w-4 text-purple-400" />}
        />

        {/* Lucro Oculto Highlight */}
        {benchmark.lucro_oculto && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Potencial Não Capturado</span>
            </div>
            <div className="text-2xl font-bold text-kosmos-white">
              {formatCurrency(benchmark.lucro_oculto)}
            </div>
            <p className="text-xs text-kosmos-gray-400 mt-1">
              Valor estimado que você pode capturar com as melhorias sugeridas
            </p>
          </div>
        )}

        {/* Projeção de Crescimento */}
        {benchmark.projecao_crescimento && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">Projeção de Crescimento</span>
            </div>
            <div className="text-2xl font-bold text-kosmos-white">
              +{benchmark.projecao_crescimento.toFixed(1)}%
            </div>
            <p className="text-xs text-kosmos-gray-400 mt-1">
              Crescimento estimado com implementação do plano de ação
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
